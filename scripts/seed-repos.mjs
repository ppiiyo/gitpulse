/**
 * Seed repository snapshots — aim for ~100 repos per stack category.
 *
 * Usage:
 *   GITHUB_TOKEN=ghp_xxx node scripts/seed-repos.mjs
 *
 * Requires token for ~5000 req/h (unauthenticated is too slow for full fill).
 */

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const GITHUB_API = "https://api.github.com";
const TOKEN = process.env.GITHUB_TOKEN;
const PER_CATEGORY = 100;
const HARD_CAP = 1200;

if (!TOKEN) {
  console.warn(
    "⚠️  No GITHUB_TOKEN — rate limit 60/h. Full per-stack seed needs a token."
  );
}

function headers() {
  const h = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "GitPulse-Seed/0.2",
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

function classify(repo) {
  const topics = (repo.topics || []).map((t) => t.toLowerCase());
  const blob = [repo.fullName, repo.description || "", ...topics, repo.language || ""]
    .join(" ")
    .toLowerCase();

  const rules = [
    ["ai", ["ai", "llm", "gpt", "openai", "langchain", "agent", "transformers", "rag", "deep-learning", "machine-learning"]],
    ["security", ["security", "crypto", "cryptography", "auth", "authentication", "vulnerability", "pentest", "oauth", "cve"]],
    ["mobile", ["android", "ios", "mobile", "react-native", "flutter", "swift", "kotlin"]],
    ["devtools", ["cli", "devtools", "developer-tools", "bundler", "linter", "vscode", "ide", "eslint", "prettier"]],
    ["learning", ["awesome", "awesome-list", "tutorial", "education", "learning", "books", "interview", "algorithm"]],
    ["data", ["data", "etl", "analytics", "pandas", "spark", "data-science", "dataset"]],
    ["backend", ["api", "backend", "server", "database", "graphql", "fastapi", "django", "spring"]],
    ["systems", ["kernel", "compiler", "operating-system", "runtime", "wasm", "embedded"]],
    ["web", ["react", "vue", "nextjs", "frontend", "css", "tailwind", "svelte", "angular"]],
  ];

  let best = "other";
  let bestScore = 0;
  for (const [cat, keys] of rules) {
    let s = 0;
    for (const k of keys) {
      if (topics.includes(k)) s += 3;
      else if (blob.includes(k)) s += 1;
    }
    if (s > bestScore) {
      bestScore = s;
      best = cat;
    }
  }
  if (bestScore === 0 && repo.language) {
    const lang = {
      TypeScript: "web",
      JavaScript: "web",
      Python: "data",
      Go: "backend",
      Rust: "systems",
      C: "systems",
      "C++": "systems",
      Swift: "mobile",
      Kotlin: "mobile",
      Dart: "mobile",
      Shell: "devtools",
    };
    if (lang[repo.language]) best = lang[repo.language];
  }
  return bestScore > 0 || best !== "other" ? best : "other";
}

const CATEGORY_QUERIES = {
  ai: [
    "topic:ai stars:>50",
    "topic:llm stars:>30",
    "topic:openai stars:>50",
    "topic:langchain stars:>30",
    "topic:transformers stars:>100",
    "gpt stars:>100",
  ],
  web: [
    "topic:react stars:>200",
    "topic:nextjs stars:>50",
    "topic:vue stars:>100",
    "topic:tailwind stars:>50",
    "topic:frontend stars:>100",
    "language:TypeScript stars:>500",
  ],
  backend: [
    "topic:backend stars:>100",
    "topic:api stars:>200",
    "topic:graphql stars:>100",
    "topic:database stars:>200",
    "language:Go stars:>500",
    "fastapi stars:>50",
  ],
  devtools: [
    "topic:cli stars:>100",
    "topic:devtools stars:>50",
    "topic:vscode stars:>100",
    "eslint stars:>200",
    "topic:bundler stars:>50",
    "language:Shell stars:>500",
  ],
  systems: [
    "topic:rust stars:>200",
    "language:Rust stars:>500",
    "topic:wasm stars:>50",
    "kernel stars:>200",
    "language:C stars:>1000",
    "topic:compiler stars:>50",
  ],
  mobile: [
    "topic:android stars:>200",
    "topic:ios stars:>200",
    "topic:flutter stars:>100",
    "topic:react-native stars:>100",
    "language:Swift stars:>500",
    "language:Kotlin stars:>500",
  ],
  data: [
    "topic:data-science stars:>100",
    "topic:pandas stars:>50",
    "topic:spark stars:>100",
    "topic:etl stars:>50",
    "topic:analytics stars:>100",
    "language:Python stars:>2000",
  ],
  security: [
    "topic:security stars:>100",
    "topic:cryptography stars:>50",
    "topic:authentication stars:>50",
    "topic:oauth stars:>50",
    "cve stars:>50",
    "topic:pentest stars:>30",
  ],
  learning: [
    "topic:awesome stars:>200",
    "topic:tutorial stars:>100",
    "topic:interview stars:>100",
    "topic:algorithm stars:>200",
    "awesome-list stars:>100",
    "topic:education stars:>50",
  ],
};

async function fillCategory(cat, queries, seen, counts) {
  for (const q of queries) {
    if ((counts[cat] || 0) >= PER_CATEGORY) break;
    if (seen.size >= HARD_CAP) break;
    for (let page = 1; page <= 4; page++) {
      if ((counts[cat] || 0) >= PER_CATEGORY) break;
      if (seen.size >= HARD_CAP) break;
      process.stdout.write(`[${cat}] ${q} p${page} ... `);
      try {
        const data = await searchRepos(q, page, 30);
        let added = 0;
        for (const item of data.items || []) {
          if (item.fork || item.archived) continue;
          if (seen.has(item.full_name)) continue;
          const repo = mapRepo(item);
          const assigned = classify(repo);
          seen.set(item.full_name, repo);
          counts[assigned] = (counts[assigned] || 0) + 1;
          if (assigned === cat) added++;
        }
        console.log(`+${added} (${cat}=${counts[cat] || 0}, total=${seen.size})`);
        if (!(data.items && data.items.length)) break;
      } catch (err) {
        console.error(`failed: ${err.message}`);
        break;
      }
      await new Promise((r) => setTimeout(r, TOKEN ? 350 : 1500));
    }
  }
}

async function main() {
  const seen = new Map();
  const counts = {};

  for (const [cat, queries] of Object.entries(CATEGORY_QUERIES)) {
    await fillCategory(cat, queries, seen, counts);
  }

  const repos = Array.from(seen.values()).sort((a, b) => b.stars - a.stars);

  const day = new Date().toISOString().slice(0, 10);
  const dir = join(process.cwd(), "data", "snapshots");
  await mkdir(dir, { recursive: true });
  const outPath = join(dir, `repos-${day}.json`);

  const payload = {
    generatedAt: new Date().toISOString(),
    methodologyVersion: "v0.2-per-stack",
    count: repos.length,
    perCategoryTarget: PER_CATEGORY,
    categoryCounts: counts,
    repos,
  };

  await writeFile(outPath, JSON.stringify(payload, null, 2), "utf8");
  console.log(`\nWrote ${repos.length} repos → ${outPath}`);
  console.log("Category counts:", counts);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
