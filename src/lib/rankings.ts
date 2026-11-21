/**
 * Build live rankings from snapshots (with mock fallback).
 */

import type {
  RankingView,
  Repository,
  RepositoryMetrics,
  RepositoryRankingEntry,
} from "@/types";
import {
  enrichReposWithGrowth,
  loadLatestRepoSnapshot,
  activityFromPushedAt,
  type RepoSnapshotRow,
} from "@/lib/snapshots";
import { scoreRepositories, calcRepoQualityScore } from "@/lib/ranking";
import { getMockRepositoryRankings } from "@/data/mock";

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
      return {
        metrics: m,
        repository: rowToRepository(row),
      };
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
