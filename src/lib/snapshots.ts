/**
 * Snapshot storage & growth calculation
 *
 * MVP: JSON files in data/snapshots/
 * Later: PostgreSQL
 *
 * Growth is computed by comparing star counts across dated snapshots.
 */

import { readFile, readdir, access } from "node:fs/promises";
import { join } from "node:path";
import { constants } from "node:fs";

export interface RepoSnapshotRow {
  id: string;
  fullName: string;
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
  starsGrowth7d?: number;
  starsGrowth30d?: number;
  fetchedAt?: string;
}

export interface RepoSnapshotFile {
  generatedAt: string;
  methodologyVersion: string;
  count: number;
  repos: RepoSnapshotRow[];
}

const SNAPSHOTS_DIR = join(process.cwd(), "data", "snapshots");

async function exists(path: string): Promise<boolean> {
  try {
    await access(path, constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

/** List snapshot dates (YYYY-MM-DD) newest first */
export async function listRepoSnapshotDates(): Promise<string[]> {
  if (!(await exists(SNAPSHOTS_DIR))) return [];
  const files = await readdir(SNAPSHOTS_DIR);
  return files
    .filter((f) => /^repos-\d{4}-\d{2}-\d{2}\.json$/.test(f))
    .map((f) => f.replace("repos-", "").replace(".json", ""))
    .sort()
    .reverse();
}

export async function loadRepoSnapshot(
  date: string
): Promise<RepoSnapshotFile | null> {
  const path = join(SNAPSHOTS_DIR, `repos-${date}.json`);
  if (!(await exists(path))) return null;
  const raw = await readFile(path, "utf8");
  return JSON.parse(raw) as RepoSnapshotFile;
}

export async function loadLatestRepoSnapshot(): Promise<{
  date: string;
  data: RepoSnapshotFile;
} | null> {
  const dates = await listRepoSnapshotDates();
  if (dates.length === 0) return null;
  const data = await loadRepoSnapshot(dates[0]);
  if (!data) return null;
  return { date: dates[0], data };
}

export async function loadRepoSnapshotNear(
  targetDate: string
): Promise<{ date: string; data: RepoSnapshotFile } | null> {
  const dates = await listRepoSnapshotDates();
  const match = dates.find((d) => d <= targetDate);
  if (!match) {
    const oldest = dates[dates.length - 1];
    if (!oldest) return null;
    const data = await loadRepoSnapshot(oldest);
    return data ? { date: oldest, data } : null;
  }
  const data = await loadRepoSnapshot(match);
  return data ? { date: match, data } : null;
}

function daysAgoISO(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

/**
 * Attach starsGrowth7d / starsGrowth30d by comparing with older snapshots.
 * If history is missing, growth stays 0.
 */
export async function enrichReposWithGrowth(
  current: RepoSnapshotRow[]
): Promise<RepoSnapshotRow[]> {
  const near7 = await loadRepoSnapshotNear(daysAgoISO(7));
  const near30 = await loadRepoSnapshotNear(daysAgoISO(30));

  const map7 = new Map(
    (near7?.data.repos || []).map((r) => [r.fullName, r.stars])
  );
  const map30 = new Map(
    (near30?.data.repos || []).map((r) => [r.fullName, r.stars])
  );

  return current.map((repo) => {
    const stars7 = map7.get(repo.fullName);
    const stars30 = map30.get(repo.fullName);
    return {
      ...repo,
      starsGrowth7d:
        stars7 !== undefined ? Math.max(0, repo.stars - stars7) : 0,
      starsGrowth30d:
        stars30 !== undefined ? Math.max(0, repo.stars - stars30) : 0,
    };
  });
}

/**
 * Simple activity proxy from recency of push (0–1).
 */
export function activityFromPushedAt(pushedAt: string | null): number {
  if (!pushedAt) return 0.1;
  const days =
    (Date.now() - new Date(pushedAt).getTime()) / (1000 * 60 * 60 * 24);
  if (days < 7) return 1;
  if (days < 30) return 0.85;
  if (days < 90) return 0.65;
  if (days < 180) return 0.4;
  if (days < 365) return 0.25;
  return 0.1;
}
