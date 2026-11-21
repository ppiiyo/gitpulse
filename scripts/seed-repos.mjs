/**
 * Seed repository snapshots from GitHub Search API.
 * Target: ~200 unique repos (big + mid-tier so smaller projects appear).
 *
 * Usage:
 *   GITHUB_TOKEN=ghp_xxx node scripts/seed-repos.mjs
 */

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const GITHUB_API = "https://api.github.com";
const TOKEN = process.env.GITHUB_TOKEN;
const TARGET = 200;

if (!TOKEN) {
  console.warn(
    "⚠️  No GITHUB_TOKEN — rate limit is 60 req/h. Set GITHUB_TOKEN for 5000/h."
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

async function searchRepos(query, page = 1, perPage = 30) {
  const url = `${GITHUB_API}/search/repositories?q=${encodeURIComponent(
    query
  )}&sort=stars&order=desc&per_page=${perPage}&page=${page}`;
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub ${res.status}: ${text.slice(0, 300)}`);
  }
  return res.json();
}

function mapRepo(r) {
  return {
    id: String(r.id),
    fullName: r.full_name,
    name: r.name,
    ownerLogin: r.owner.login,
    description: r.description,
    htmlUrl: r.html_url,
    language: r.language,
    license: r.license?.spdx_id ?? null,
    topics: r.topics ?? [],
    stars: r.stargazers_count,
    forks: r.forks_count,
    watchers: r.watchers_count,
    openIssues: r.open_issues_count,
    isFork: r.fork,
    isArchived: r.archived,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    pushedAt: r.pushed_at,
    starsGrowth7d: 0,
    starsGrowth30d: 0,
    fetchedAt: new Date().toISOString(),
  };
}

const QUERIES = [
  "stars:>50000",
  "stars:>10000",
  "stars:>1000",
  "language:TypeScript stars:>500",
  "language:Python stars:>800",
  "language:Rust stars:>400",
  "language:Go stars:>500",
  "language:JavaScript stars:>1000",
  "topic:ai stars:>300",
  "topic:llm stars:>100",
  "topic:devtools stars:>200",
  "created:>2024-01-01 stars:>100",
  "created:>2025-01-01 stars:>50",
];

async function main() {
  const seen = new Map();

  for (const q of QUERIES) {
    if (seen.size >= TARGET) break;
    for (const page of [1, 2, 3]) {
      if (seen.size >= TARGET) break;
      process.stdout.write(`Fetching: ${q} p${page} ... `);
      try {
        const data = await searchRepos(q, page, 30);
        let added = 0;
        for (const item of data.items || []) {
          if (item.fork || item.archived) continue;
          if (!seen.has(item.full_name)) {
            seen.set(item.full_name, mapRepo(item));
            added++;
          }
        }
        console.log(`+${added} (total ${seen.size})`);
      } catch (err) {
        console.error(`failed: ${err.message}`);
      }
      await new Promise((r) => setTimeout(r, TOKEN ? 400 : 1200));
    }
  }

  const repos = Array.from(seen.values())
    .sort((a, b) => b.stars - a.stars)
    .slice(0, TARGET);

  const day = new Date().toISOString().slice(0, 10);
  const dir = join(process.cwd(), "data", "snapshots");
  await mkdir(dir, { recursive: true });
  const outPath = join(dir, `repos-${day}.json`);

  const payload = {
    generatedAt: new Date().toISOString(),
    methodologyVersion: "v0.1-mvp",
    count: repos.length,
    repos,
  };

  await writeFile(outPath, JSON.stringify(payload, null, 2), "utf8");
  console.log(`\nWrote ${repos.length} repos → ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
