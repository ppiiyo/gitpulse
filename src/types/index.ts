/** Core domain types for GitPulse */

export type RankingView = "overall" | "growth";

export interface Developer {
  id: string; // GitHub node_id or login
  login: string;
  name: string | null;
  avatarUrl: string;
  bio: string | null;
  company: string | null;
  location: string | null;
  blog: string | null;
  twitterUsername: string | null;
  followers: number;
  following: number;
  publicRepos: number;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface DeveloperMetrics {
  login: string;
  starsTotal: number;
  starsGrowth7d: number;
  starsGrowth30d: number;
  followersGrowth7d: number;
  followersGrowth30d: number;
  activityScore: number; // 0–1
  impactScore: number; // 0–1
  originalReposCount: number;
  forksReceived: number;
  // Computed
  starsScore: number;
  growthScore: number;
  developerScore: number;
}

export interface DeveloperRankingEntry {
  rank: number;
  previousRank: number | null;
  rankDelta: number | null; // positive = moved up
  developer: Developer;
  metrics: DeveloperMetrics;
  view: RankingView;
  insight?: string; // short AI commentary
}

export interface Repository {
  id: string;
  fullName: string; // owner/repo
  name: string;
  ownerLogin: string;
  description: string | null;
  htmlUrl: string;
  language: string | null;
  license: string | null;
  topics: string[];
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  isFork: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  pushedAt: string | null;
}

export interface RepositoryMetrics {
  fullName: string;
  stars: number;
  starsGrowth7d: number;
  starsGrowth30d: number;
  activityScore: number; // 0–1
  qualityScore: number; // 0–1
  // Computed
  starsGrowthScore: number;
  repoScore: number;
}

export interface RepositoryRankingEntry {
  rank: number;
  previousRank: number | null;
  rankDelta: number | null;
  repository: Repository;
  metrics: RepositoryMetrics;
  view: RankingView;
  insight?: string;
}

export interface RankingSnapshot {
  id: string;
  type: "developer" | "repository";
  view: RankingView;
  generatedAt: string;
  methodologyVersion: string;
  entries: (DeveloperRankingEntry | RepositoryRankingEntry)[];
}

export interface WeeklyPulseHighlight {
  type: "developer" | "repository";
  title: string;
  description: string;
  rankChange?: number;
  url: string;
}

export interface WeeklyPulse {
  id: string;
  weekStart: string; // ISO date
  weekEnd: string;
  generatedAt: string;
  summary: string;
  highlights: WeeklyPulseHighlight[];
  topGainersDevelopers: DeveloperRankingEntry[];
  topGainersRepos: RepositoryRankingEntry[];
}
