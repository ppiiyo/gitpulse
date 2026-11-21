/**
 * Mock data for UI development and ranking engine testing.
 * Replace with real GitHub API data later.
 */

import type {
  Developer,
  DeveloperMetrics,
  DeveloperRankingEntry,
  Repository,
  RepositoryMetrics,
  RepositoryRankingEntry,
} from "@/types";
import { scoreDevelopers, scoreRepositories } from "@/lib/ranking";

const mockDevelopersRaw: Array<{
  developer: Developer;
  metrics: Omit<DeveloperMetrics, "starsScore" | "growthScore" | "developerScore">;
}> = [
  {
    developer: {
      id: "1",
      login: "sindresorhus",
      name: "Sindre Sorhus",
      avatarUrl: "https://avatars.githubusercontent.com/u/170270?v=4",
      bio: "Full-Time Open-Sourcerer. Maker of many npm packages.",
      company: null,
      location: "Earth",
      blog: "https://sindresorhus.com",
      twitterUsername: "sindresorhus",
      followers: 52000,
      following: 50,
      publicRepos: 1200,
      createdAt: "2010-01-01T00:00:00Z",
      updatedAt: "2026-11-20T00:00:00Z",
    },
    metrics: {
      login: "sindresorhus",
      starsTotal: 980000,
      starsGrowth7d: 1200,
      starsGrowth30d: 4800,
      followersGrowth7d: 180,
      followersGrowth30d: 720,
      activityScore: 0.92,
      impactScore: 0.95,
      originalReposCount: 400,
      forksReceived: 120000,
    },
  },
  {
    developer: {
      id: "2",
      login: "gaearon",
      name: "Dan Abramov",
      avatarUrl: "https://avatars.githubusercontent.com/u/810438?v=4",
      bio: "Working on React.",
      company: "React",
      location: null,
      blog: null,
      twitterUsername: "dan_abramov",
      followers: 89000,
      following: 120,
      publicRepos: 80,
      createdAt: "2011-05-01T00:00:00Z",
      updatedAt: "2026-11-18T00:00:00Z",
    },
    metrics: {
      login: "gaearon",
      starsTotal: 310000,
      starsGrowth7d: 400,
      starsGrowth30d: 1600,
      followersGrowth7d: 90,
      followersGrowth30d: 350,
      activityScore: 0.7,
      impactScore: 0.88,
      originalReposCount: 25,
      forksReceived: 45000,
    },
  },
  {
    developer: {
      id: "3",
      login: "yyx990803",
      name: "Evan You",
      avatarUrl: "https://avatars.githubusercontent.com/u/499550?v=4",
      bio: "Creator of Vue.js and Vite.",
      company: "Independent",
      location: null,
      blog: "https://evanyou.me",
      twitterUsername: "youyuxi",
      followers: 98000,
      following: 80,
      publicRepos: 60,
      createdAt: "2010-06-01T00:00:00Z",
      updatedAt: "2026-11-19T00:00:00Z",
    },
    metrics: {
      login: "yyx990803",
      starsTotal: 520000,
      starsGrowth7d: 2100,
      starsGrowth30d: 8500,
      followersGrowth7d: 220,
      followersGrowth30d: 900,
      activityScore: 0.85,
      impactScore: 0.93,
      originalReposCount: 20,
      forksReceived: 90000,
    },
  },
  {
    developer: {
      id: "4",
      login: "shadcn",
      name: "shadcn",
      avatarUrl: "https://avatars.githubusercontent.com/u/124599?v=4",
      bio: "Design engineer.",
      company: null,
      location: null,
      blog: "https://ui.shadcn.com",
      twitterUsername: "shadcn",
      followers: 32000,
      following: 40,
      publicRepos: 40,
      createdAt: "2012-03-01T00:00:00Z",
      updatedAt: "2026-11-20T00:00:00Z",
    },
    metrics: {
      login: "shadcn",
      starsTotal: 95000,
      starsGrowth7d: 3200,
      starsGrowth30d: 14000,
      followersGrowth7d: 450,
      followersGrowth30d: 1800,
      activityScore: 0.88,
      impactScore: 0.78,
      originalReposCount: 12,
      forksReceived: 12000,
    },
  },
];

const mockReposRaw: Array<{
  repository: Repository;
  metrics: Omit<RepositoryMetrics, "starsGrowthScore" | "repoScore">;
}> = [
  {
    repository: {
      id: "r1",
      fullName: "vercel/next.js",
      name: "next.js",
      ownerLogin: "vercel",
      description: "The React Framework",
      htmlUrl: "https://github.com/vercel/next.js",
      language: "JavaScript",
      license: "MIT",
      topics: ["react", "framework", "nextjs"],
      stars: 135000,
      forks: 29000,
      watchers: 135000,
      openIssues: 2100,
      isFork: false,
      isArchived: false,
      createdAt: "2016-10-01T00:00:00Z",
      updatedAt: "2026-11-20T00:00:00Z",
      pushedAt: "2026-11-20T12:00:00Z",
    },
    metrics: {
      fullName: "vercel/next.js",
      stars: 135000,
      starsGrowth7d: 900,
      starsGrowth30d: 3600,
      activityScore: 0.95,
      qualityScore: 0.95,
    },
  },
  {
    repository: {
      id: "r2",
      fullName: "shadcn-ui/ui",
      name: "ui",
      ownerLogin: "shadcn-ui",
      description: "Beautifully designed components that you can copy and paste into your apps.",
      htmlUrl: "https://github.com/shadcn-ui/ui",
      language: "TypeScript",
      license: "MIT",
      topics: ["react", "components", "tailwind"],
      stars: 92000,
      forks: 6200,
      watchers: 92000,
      openIssues: 340,
      isFork: false,
      isArchived: false,
      createdAt: "2023-01-01T00:00:00Z",
      updatedAt: "2026-11-20T00:00:00Z",
      pushedAt: "2026-11-20T09:00:00Z",
    },
    metrics: {
      fullName: "shadcn-ui/ui",
      stars: 92000,
      starsGrowth7d: 2800,
      starsGrowth30d: 11000,
      activityScore: 0.88,
      qualityScore: 0.9,
    },
  },
  {
    repository: {
      id: "r3",
      fullName: "langchain-ai/langchain",
      name: "langchain",
      ownerLogin: "langchain-ai",
      description: "Build context-aware reasoning applications",
      htmlUrl: "https://github.com/langchain-ai/langchain",
      language: "Python",
      license: "MIT",
      topics: ["llm", "ai", "agents"],
      stars: 112000,
      forks: 18000,
      watchers: 112000,
      openIssues: 450,
      isFork: false,
      isArchived: false,
      createdAt: "2022-10-01T00:00:00Z",
      updatedAt: "2026-11-20T00:00:00Z",
      pushedAt: "2026-11-20T11:00:00Z",
    },
    metrics: {
      fullName: "langchain-ai/langchain",
      stars: 112000,
      starsGrowth7d: 1500,
      starsGrowth30d: 6200,
      activityScore: 0.93,
      qualityScore: 0.88,
    },
  },
  {
    repository: {
      id: "r4",
      fullName: "oven-sh/bun",
      name: "bun",
      ownerLogin: "oven-sh",
      description: "Incredibly fast JavaScript runtime, bundler, test runner, and package manager.",
      htmlUrl: "https://github.com/oven-sh/bun",
      language: "Zig",
      license: "MIT",
      topics: ["javascript", "runtime", "bun"],
      stars: 81000,
      forks: 3400,
      watchers: 81000,
      openIssues: 1200,
      isFork: false,
      isArchived: false,
      createdAt: "2021-04-01T00:00:00Z",
      updatedAt: "2026-11-19T00:00:00Z",
      pushedAt: "2026-11-19T20:00:00Z",
    },
    metrics: {
      fullName: "oven-sh/bun",
      stars: 81000,
      starsGrowth7d: 1100,
      starsGrowth30d: 4500,
      activityScore: 0.91,
      qualityScore: 0.85,
    },
  },
];

export function getMockDeveloperRankings(
  view: "overall" | "growth" = "overall"
): DeveloperRankingEntry[] {
  const scored = scoreDevelopers(
    mockDevelopersRaw.map((d) => d.metrics),
    view
  );

  const withDev = scored
    .map((metrics) => {
      const raw = mockDevelopersRaw.find((d) => d.developer.login === metrics.login)!;
      return { metrics, developer: raw.developer };
    })
    .sort((a, b) => b.metrics.developerScore - a.metrics.developerScore);

  return withDev.map((item, index) => ({
    rank: index + 1,
    previousRank: index + 1 + (index % 3) - 1,
    rankDelta: (index % 3) - 1,
    developer: item.developer,
    metrics: item.metrics,
    view,
    insight:
      view === "growth"
        ? "Strong recent momentum relative to peer group."
        : "High overall influence with consistent long-term output.",
  }));
}

export function getMockRepositoryRankings(
  view: "overall" | "growth" = "overall"
): RepositoryRankingEntry[] {
  const scored = scoreRepositories(
    mockReposRaw.map((r) => r.metrics),
    view
  );

  const withRepo = scored
    .map((metrics) => {
      const raw = mockReposRaw.find((r) => r.repository.fullName === metrics.fullName)!;
      return { metrics, repository: raw.repository };
    })
    .sort((a, b) => b.metrics.repoScore - a.metrics.repoScore);

  return withRepo.map((item, index) => ({
    rank: index + 1,
    previousRank: index + 1 + (index % 2 === 0 ? 1 : -1),
    rankDelta: index % 2 === 0 ? -1 : 1,
    repository: item.repository,
    metrics: item.metrics,
    view,
    insight:
      view === "growth"
        ? "Notable star acceleration in the last 30 days."
        : "Established project with solid activity and quality signals.",
  }));
}
