/**
 * GitPulse Ranking Engine (MVP v0.1)
 *
 * Pure functions. No side effects.
 * All weights and formulas match docs/methodology.md
 */

import type {
  DeveloperMetrics,
  RepositoryMetrics,
  RankingView,
} from "@/types";

/** Weights — keep in sync with methodology.md */
export const DEVELOPER_WEIGHTS = {
  stars: 0.35,
  growth: 0.3,
  activity: 0.2,
  impact: 0.15,
} as const;

export const REPO_WEIGHTS = {
  stars: 0.25,
  starsGrowth: 0.4,
  activity: 0.25,
  quality: 0.1,
} as const;

export const METHODOLOGY_VERSION = "v0.1-mvp";

/**
 * Min-max normalization.
 * Returns 0 if max === min to avoid division by zero.
 */
export function normalize(value: number, min: number, max: number): number {
  if (max === min) return 0;
  return (value - min) / (max - min);
}

/**
 * Robust percentile-style clamp helper (used later for outliers).
 */
export function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Calculate raw GrowthScore for a developer.
 */
export function calcDeveloperGrowthScore(m: {
  starsGrowth7d: number;
  starsGrowth30d: number;
  followersGrowth7d: number;
  followersGrowth30d: number;
}): number {
  const short =
    Math.max(0, m.starsGrowth7d) + Math.max(0, m.followersGrowth7d);
  const medium =
    Math.max(0, m.starsGrowth30d) + Math.max(0, m.followersGrowth30d);

  return 0.6 * short + 0.4 * medium;
}

/**
 * Calculate raw StarsGrowth for a repository.
 */
export function calcRepoStarsGrowthScore(m: {
  starsGrowth7d: number;
  starsGrowth30d: number;
}): number {
  return (
    0.65 * Math.max(0, m.starsGrowth7d) +
    0.35 * Math.max(0, m.starsGrowth30d)
  );
}

/**
 * Compute final DeveloperScore given already-normalized components.
 */
export function calcDeveloperScore(components: {
  starsNorm: number;
  growthNorm: number;
  activityNorm: number;
  impactNorm: number;
}): number {
  return (
    DEVELOPER_WEIGHTS.stars * components.starsNorm +
    DEVELOPER_WEIGHTS.growth * components.growthNorm +
    DEVELOPER_WEIGHTS.activity * components.activityNorm +
    DEVELOPER_WEIGHTS.impact * components.impactNorm
  );
}

/**
 * Compute final RepoScore given already-normalized components.
 */
export function calcRepoScore(components: {
  starsNorm: number;
  starsGrowthNorm: number;
  activityNorm: number;
  qualityScore: number; // already 0–1
}): number {
  return (
    REPO_WEIGHTS.stars * components.starsNorm +
    REPO_WEIGHTS.starsGrowth * components.starsGrowthNorm +
    REPO_WEIGHTS.activity * components.activityNorm +
    REPO_WEIGHTS.quality * clamp(components.qualityScore)
  );
}

/**
 * Batch-score developers.
 * Accepts raw metrics, normalizes within the provided cohort, returns scored metrics.
 */
export function scoreDevelopers(
  items: Array<Omit<DeveloperMetrics, "starsScore" | "growthScore" | "developerScore">>,
  view: RankingView = "overall"
): DeveloperMetrics[] {
  if (items.length === 0) return [];

  const growthRaw = items.map((i) =>
    calcDeveloperGrowthScore({
      starsGrowth7d: i.starsGrowth7d,
      starsGrowth30d: i.starsGrowth30d,
      followersGrowth7d: i.followersGrowth7d,
      followersGrowth30d: i.followersGrowth30d,
    })
  );

  const starsMin = Math.min(...items.map((i) => i.starsTotal));
  const starsMax = Math.max(...items.map((i) => i.starsTotal));
  const growthMin = Math.min(...growthRaw);
  const growthMax = Math.max(...growthRaw);
  const activityMin = Math.min(...items.map((i) => i.activityScore));
  const activityMax = Math.max(...items.map((i) => i.activityScore));
  const impactMin = Math.min(...items.map((i) => i.impactScore));
  const impactMax = Math.max(...items.map((i) => i.impactScore));

  return items.map((item, idx) => {
    const starsNorm = normalize(item.starsTotal, starsMin, starsMax);
    const growthNorm = normalize(growthRaw[idx], growthMin, growthMax);
    const activityNorm = normalize(item.activityScore, activityMin, activityMax);
    const impactNorm = normalize(item.impactScore, impactMin, impactMax);

    // Growth view heavily emphasizes recent momentum
    const score =
      view === "growth"
        ? calcDeveloperScore({
            starsNorm: starsNorm * 0.4,
            growthNorm: growthNorm,
            activityNorm: activityNorm * 0.7,
            impactNorm: impactNorm * 0.5,
          })
        : calcDeveloperScore({
            starsNorm,
            growthNorm,
            activityNorm,
            impactNorm,
          });

    return {
      ...item,
      starsScore: starsNorm,
      growthScore: growthNorm,
      developerScore: score,
    };
  });
}

/**
 * Batch-score repositories.
 */
export function scoreRepositories(
  items: Array<
    Omit<RepositoryMetrics, "starsGrowthScore" | "repoScore">
  >,
  view: RankingView = "overall"
): RepositoryMetrics[] {
  if (items.length === 0) return [];

  const growthRaw = items.map((i) =>
    calcRepoStarsGrowthScore({
      starsGrowth7d: i.starsGrowth7d,
      starsGrowth30d: i.starsGrowth30d,
    })
  );

  const starsMin = Math.min(...items.map((i) => i.stars));
  const starsMax = Math.max(...items.map((i) => i.stars));
  const growthMin = Math.min(...growthRaw);
  const growthMax = Math.max(...growthRaw);
  const activityMin = Math.min(...items.map((i) => i.activityScore));
  const activityMax = Math.max(...items.map((i) => i.activityScore));

  return items.map((item, idx) => {
    const starsNorm = normalize(item.stars, starsMin, starsMax);
    const starsGrowthNorm = normalize(growthRaw[idx], growthMin, growthMax);
    const activityNorm = normalize(item.activityScore, activityMin, activityMax);

    const score =
      view === "growth"
        ? calcRepoScore({
            starsNorm: starsNorm * 0.3,
            starsGrowthNorm,
            activityNorm: activityNorm * 0.7,
            qualityScore: item.qualityScore,
          })
        : calcRepoScore({
            starsNorm,
            starsGrowthNorm,
            activityNorm,
            qualityScore: item.qualityScore,
          });

    return {
      ...item,
      starsGrowthScore: starsGrowthNorm,
      repoScore: score,
    };
  });
}

/**
 * Simple quality score for a repository (0–1).
 * Deterministic checks only.
 */
export function calcRepoQualityScore(repo: {
  description: string | null;
  license: string | null;
  isArchived: boolean;
  pushedAt: string | null;
  hasReadme?: boolean;
}): number {
  let score = 0;

  if (repo.description && repo.description.trim().length > 10) score += 0.25;
  if (repo.license) score += 0.25;
  if (!repo.isArchived) score += 0.2;
  if (repo.hasReadme !== false) score += 0.15; // optimistic default for MVP

  if (repo.pushedAt) {
    const daysSincePush =
      (Date.now() - new Date(repo.pushedAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSincePush < 365) score += 0.15;
  }

  return clamp(score);
}
