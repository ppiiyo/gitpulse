/**
 * Build live rankings from snapshots (with mock fallback).
 */

import type {
  RankingView,
  Repository,
  RepositoryMetrics,
  RepositoryRankingEntry,
  Developer,
  DeveloperMetrics,
  DeveloperRankingEntry,
} from "@/types";
import {
  enrichReposWithGrowth,
  loadLatestRepoSnapshot,
  activityFromPushedAt,
  enrichDevelopersWithGrowth,
  loadLatestDeveloperSnapshot,
  type RepoSnapshotRow,
  type DeveloperSnapshotRow,
} from "@/lib/snapshots";
import {
  scoreRepositories,
  scoreDevelopers,
  calcRepoQualityScore,
} from "@/lib/ranking";
import {
  getMockRepositoryRankings,
  getMockDeveloperRankings,
} from "@/data/mock";

function rowToRepository(r: RepoSnapshotRow): Repository {
  return {
    id: r.id,
    fullName: r.fullName,
    name: r.name,
    ownerLogin: r.ownerLogin,
    description: r.description,
    htmlUrl: r.htmlUrl,
    language: r.language,
    license: r.license,
    topics: r.topics || [],
    stars: r.stars,
    forks: r.forks,
    watchers: r.watchers,
    openIssues: r.openIssues,
    isFork: r.isFork,
    isArchived: r.isArchived,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    pushedAt: r.pushedAt,
  };
}

function rowToMetricsInput(
  r: RepoSnapshotRow
): Omit<RepositoryMetrics, "starsGrowthScore" | "repoScore"> {
  return {
    fullName: r.fullName,
    stars: r.stars,
    starsGrowth7d: r.starsGrowth7d ?? 0,
    starsGrowth30d: r.starsGrowth30d ?? 0,
    activityScore: activityFromPushedAt(r.pushedAt),
    qualityScore: calcRepoQualityScore({
      description: r.description,
      license: r.license,
      isArchived: r.isArchived,
      pushedAt: r.pushedAt,
      hasReadme: true,
    }),
  };
}

export async function getRepositoryRankings(
  view: RankingView = "overall"
): Promise<{
  source: "snapshot" | "mock";
  snapshotDate: string | null;
  entries: RepositoryRankingEntry[];
}> {
  const latest = await loadLatestRepoSnapshot();

  if (!latest || latest.data.repos.length === 0) {
    return {
      source: "mock",
      snapshotDate: null,
      entries: getMockRepositoryRankings(view),
    };
  }

  const enriched = await enrichReposWithGrowth(latest.data.repos);
  const metricsInput = enriched.map(rowToMetricsInput);
  const scored = scoreRepositories(metricsInput, view);
  const byName = new Map(enriched.map((r) => [r.fullName, r]));

  const sorted = scored
    .map((m) => {
      const row = byName.get(m.fullName)!;
      return { metrics: m, repository: rowToRepository(row) };
    })
    .sort((a, b) => b.metrics.repoScore - a.metrics.repoScore);

  const entries: RepositoryRankingEntry[] = sorted.map((item, index) => ({
    rank: index + 1,
    previousRank: null,
    rankDelta: null,
    repository: item.repository,
    metrics: item.metrics,
    view,
    insight:
      view === "growth"
        ? item.metrics.starsGrowth30d > 0
          ? `+${item.metrics.starsGrowth30d} stars in 30d`
          : "Limited growth history — run daily seeds to unlock momentum signals"
        : undefined,
  }));

  return {
    source: "snapshot",
    snapshotDate: latest.date,
    entries,
  };
}

export async function getRepositoryByFullName(
  fullName: string
): Promise<RepositoryRankingEntry | null> {
  const { entries } = await getRepositoryRankings("overall");
  return (
    entries.find(
      (e) => e.repository.fullName.toLowerCase() === fullName.toLowerCase()
    ) || null
  );
}

function rowToDeveloper(d: DeveloperSnapshotRow): Developer {
  return {
    id: d.id,
    login: d.login,
    name: d.name,
    avatarUrl: d.avatarUrl,
    bio: d.bio,
    company: d.company,
    location: d.location,
    blog: d.blog,
    twitterUsername: d.twitterUsername,
    followers: d.followers,
    following: d.following,
    publicRepos: d.publicRepos,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  };
}

function rowToDevMetricsInput(
  d: DeveloperSnapshotRow
): Omit<DeveloperMetrics, "starsScore" | "growthScore" | "developerScore"> {
  return {
    login: d.login,
    starsTotal: d.starsTotal,
    starsGrowth7d: d.starsGrowth7d ?? 0,
    starsGrowth30d: d.starsGrowth30d ?? 0,
    followersGrowth7d: d.followersGrowth7d ?? 0,
    followersGrowth30d: d.followersGrowth30d ?? 0,
    activityScore: d.activityScore,
    impactScore: d.impactScore,
    originalReposCount: d.originalReposCount,
    forksReceived: d.forksReceived,
  };
}

export async function getDeveloperRankings(
  view: RankingView = "overall"
): Promise<{
  source: "snapshot" | "mock";
  snapshotDate: string | null;
  entries: DeveloperRankingEntry[];
}> {
  const latest = await loadLatestDeveloperSnapshot();

  if (!latest || latest.data.developers.length === 0) {
    return {
      source: "mock",
      snapshotDate: null,
      entries: getMockDeveloperRankings(view),
    };
  }

  const enriched = await enrichDevelopersWithGrowth(latest.data.developers);
  const metricsInput = enriched.map(rowToDevMetricsInput);
  const scored = scoreDevelopers(metricsInput, view);
  const byLogin = new Map(enriched.map((d) => [d.login, d]));

  const sorted = scored
    .map((m) => {
      const row = byLogin.get(m.login)!;
      return { metrics: m, developer: rowToDeveloper(row) };
    })
    .sort((a, b) => b.metrics.developerScore - a.metrics.developerScore);

  const entries: DeveloperRankingEntry[] = sorted.map((item, index) => ({
    rank: index + 1,
    previousRank: null,
    rankDelta: null,
    developer: item.developer,
    metrics: item.metrics,
    view,
    insight:
      view === "growth"
        ? item.metrics.starsGrowth30d > 0 || item.metrics.followersGrowth30d > 0
          ? `+${item.metrics.starsGrowth30d} stars / +${item.metrics.followersGrowth30d} followers (30d)`
          : "Limited growth history — daily seeds unlock momentum"
        : undefined,
  }));

  return {
    source: "snapshot",
    snapshotDate: latest.date,
    entries,
  };
}

export async function getDeveloperByLogin(
  login: string
): Promise<DeveloperRankingEntry | null> {
  const { entries } = await getDeveloperRankings("overall");
  return (
    entries.find(
      (e) => e.developer.login.toLowerCase() === login.toLowerCase()
    ) || null
  );
}
