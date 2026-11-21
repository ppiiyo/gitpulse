/**
 * Seed developer snapshots from GitHub.
 *
 * Usage:
 *   GITHUB_TOKEN=ghp_xxx node scripts/seed-developers.mjs
 *
 * Writes data/snapshots/developers-YYYY-MM-DD.json
 */

import { mkdir, writeFile, readFile, readdir, access } from "node:fs/promises";
import { join } from "node:path";
import { constants } from "node:fs";

const GITHUB_API = "https://api.github.com";
const TOKEN = process.env.GITHUB_TOKEN;

if (!TOKEN) {
  console.warn(
    "⚠️  No GITHUB_TOKEN — rate limit is 60 req/h. Prefer a token."
  );
}

function headers() {
  const h = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "GitPulse-Seed/0.1",
  };
  if (TOKEN) h.Authorization = `Bearer ${TOKEN}`;
  return h;
}

async function gh(path) {
  const url = path.startsWith("http") ? path : `${GITHUB_API}${path}`;
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

async function exists(p) {
  try {
    await access(p, constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function loginsFromLatestRepoSnapshot() {
  const dir = join(process.cwd(), "data", "snapshots");
  if (!(await exists(dir))) return [];
  const files = (await readdir(dir))
    .filter((f) => /^repos-\d{4}-\d{2}-\d{2}\.json$/.test(f))
    .sort()
    .reverse();
  if (!files.length) return [];
  const raw = JSON.parse(await readFile(join(dir, files[0]), "utf8"));
  const counts = new Map();
  for (const r of raw.repos || []) {
    counts.set(r.ownerLogin, (counts.get(r.ownerLogin) || 0) + r.stars);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 40)
    .map(([login]) => login);
}

async function searchHighFollowers(limit = 20) {
  try {
    const data = await gh(
      `/search/users?q=${encodeURIComponent("followers:>5000")}&per_page=${limit}`
    );
    return (data.items || []).map((u) => u.login);
  } catch (e) {
    console.warn("user search failed:", e.message);
    return [];
  }
}

async function fetchDeveloper(login) {
  const user = await gh(`/users/${encodeURIComponent(login)}`);
  if (user.type === "Organization") return null;

  const repos = await gh(
    `/users/${encodeURIComponent(login)}/repos?per_page=100&type=owner&sort=updated`
  );
  const original = (repos || []).filter((r) => !r.fork);

  let starsTotal = 0;
  let forksReceived = 0;
  for (const r of original) {
    starsTotal += r.stargazers_count || 0;
    forksReceived += r.forks_count || 0;
  }

  const now = Date.now();
  const recent = original.filter((r) => {
    if (!r.pushed_at) return false;
    const days = (now - new Date(r.pushed_at).getTime()) / 86400000;
    return days < 90;
  }).length;
  const activityScore =
    original.length === 0 ? 0.1 : Math.min(1, 0.2 + (recent / original.length) * 0.8);

  const impactScore = Math.min(
    1,
    Math.log10(forksReceived + 1) / 5 + Math.min(original.length, 50) / 100
  );

  return {
    id: String(user.id),
    login: user.login,
    name: user.name,
    avatarUrl: user.avatar_url,
    bio: user.bio,
    company: user.company,
    location: user.location,
    blog: user.blog || null,
    twitterUsername: user.twitter_username,
    followers: user.followers,
    following: user.following,
    publicRepos: user.public_repos,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
    starsTotal,
    forksReceived,
    originalReposCount: original.length,
    activityScore: Number(activityScore.toFixed(3)),
    impactScore: Number(impactScore.toFixed(3)),
    starsGrowth7d: 0,
    starsGrowth30d: 0,
    followersGrowth7d: 0,
    followersGrowth30d: 0,
    fetchedAt: new Date().toISOString(),
  };
}

async function main() {
  const fromRepos = await loginsFromLatestRepoSnapshot();
  const fromSearch = await searchHighFollowers(15);
  const seedLogins = [
    "sindresorhus",
    "gaearon",
    "yyx990803",
    "shadcn",
    "tj",
    "torvalds",
    "karpathy",
  ];

  const logins = [
    ...new Set([...seedLogins, ...fromRepos, ...fromSearch]),
  ].slice(0, 50);

  console.log(`Fetching ${logins.length} developers...`);

  const developers = [];
  for (const login of logins) {
    process.stdout.write(`  ${login} ... `);
    try {
      const d = await fetchDeveloper(login);
      if (d) {
        developers.push(d);
        console.log(`★${d.starsTotal} followers:${d.followers}`);
      } else {
        console.log("skip (org)");
      }
    } catch (e) {
      console.log(`fail: ${e.message}`);
    }
    await sleep(TOKEN ? 200 : 1200);
  }

  developers.sort((a, b) => b.starsTotal - a.starsTotal);

  const day = new Date().toISOString().slice(0, 10);
  const dir = join(process.cwd(), "data", "snapshots");
  await mkdir(dir, { recursive: true });
  const outPath = join(dir, `developers-${day}.json`);

  const payload = {
    generatedAt: new Date().toISOString(),
    methodologyVersion: "v0.1-mvp",
    count: developers.length,
    developers,
  };

  await writeFile(outPath, JSON.stringify(payload, null, 2), "utf8");
  console.log(`\nWrote ${developers.length} developers → ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
