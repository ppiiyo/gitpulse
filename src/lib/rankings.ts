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
import {
  classifyRepository,
  type RepoCategoryId,
} from "@/lib/categories";

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
  view: RankingView = "overall",
  category: RepoCategoryId = "all"
): Promise<{
  source: "snapshot" | "mock";
  snapshotDate: string | null;
  category: RepoCategoryId;
  entries: RepositoryRankingEntry[];
}> {
  const latest = await loadLatestRepoSnapshot();

  if (!latest || latest.data.repos.length === 0) {
    let mockEntries = getMockRepositoryRankings(view);
    if (category !== "all") {
      mockEntries = mockEntries
        .filter(
          (e) =>
            classifyRepository({
              language: e.repository.language,
              topics: e.repository.topics,
              description: e.repository.description,
              fullName: e.repository.fullName,
            }) === category
        )
        .map((e, i) => ({ ...e, rank: i + 1 }));
    }
    return {
      source: "mock",
      snapshotDate: null,
      category,
      entries: mockEntries,
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

  const filtered =
    category === "all"
      ? entries
      : entries.filter((e) => {
          const cat = classifyRepository({
            language: e.repository.language,
            topics: e.repository.topics,
            description: e.repository.description,
            fullName: e.repository.fullName,
          });
          return cat === category;
        });

  const ranked = filtered.map((e, index) => ({
    ...e,
    rank: index + 1,
  }));

  return {
    source: "snapshot",
    snapshotDate: latest.date,
    category,
    entries: ranked,
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
  const found = entries.find(
    (e) => e.developer.login.toLowerCase() === login.toLowerCase()
  );
  if (found) return found;

  // Live fallback: score *inside* the cohort so min-max normalize works
  try {
    const { fetchUser, summarizeUserRepos } = await import("@/lib/github");
    const { scoreDevelopers } = await import("@/lib/ranking");
    const user = await fetchUser(login);
    if (!user || user.type === "Organization") return null;
    const summary = await summarizeUserRepos(user.login);
    const impactScore = Math.min(
      1,
      Math.log10(summary.forksReceived + 1) / 5 +
        Math.min(summary.originalReposCount, 50) / 100
    );
    const activityScore = Math.min(
      1,
      0.3 + Math.min(summary.originalReposCount, 40) / 50
    );
    const candidate = {
      login: user.login,
      starsTotal: summary.starsTotal,
      starsGrowth7d: 0,
      starsGrowth30d: 0,
      followersGrowth7d: 0,
      followersGrowth30d: 0,
      activityScore,
      impactScore,
      originalReposCount: summary.originalReposCount,
      forksReceived: summary.forksReceived,
    };

    const cohortInputs = entries.map((e) => ({
      login: e.developer.login,
      starsTotal: e.metrics.starsTotal,
      starsGrowth7d: e.metrics.starsGrowth7d,
      starsGrowth30d: e.metrics.starsGrowth30d,
      followersGrowth7d: e.metrics.followersGrowth7d,
      followersGrowth30d: e.metrics.followersGrowth30d,
      activityScore: e.metrics.activityScore,
      impactScore: e.metrics.impactScore,
      originalReposCount: e.metrics.originalReposCount,
      forksReceived: e.metrics.forksReceived,
    }));
    const scoredAll = scoreDevelopers([...cohortInputs, candidate], "overall");
    const scored = scoredAll.find(
      (m) => m.login.toLowerCase() === user.login.toLowerCase()
    )!;
    const ordered = [...scoredAll].sort(
      (a, b) => b.developerScore - a.developerScore
    );
    const estimatedRank =
      ordered.findIndex(
        (m) => m.login.toLowerCase() === user.login.toLowerCase()
      ) + 1;
    const inTrackedTop = estimatedRank <= entries.length;

    return {
      rank: estimatedRank,
      previousRank: null,
      rankDelta: null,
      developer: {
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
      },
      metrics: scored,
      view: "overall",
      insight: inTrackedTop
        ? `Live lookup vs cohort of ${entries.length}. Estimated rank #${estimatedRank}.`
        : `Outside tracked top ${entries.length}. Live GitHub profile — estimated #${estimatedRank} if the board included everyone scored here.`,
    };
  } catch {
    return null;
  }
}
