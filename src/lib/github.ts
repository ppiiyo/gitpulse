/**
 * GitHub API client
 *
 * Requires GITHUB_TOKEN for higher rate limits (5000/h vs 60/h).
 * Ranking logic stays pure — this module only fetches.
 */

const GITHUB_API = "https://api.github.com";

export class GitHubError extends Error {
  constructor(
    message: string,
    public status: number,
    public path: string
  ) {
    super(message);
    this.name = "GitHubError";
  }
}

function headers(): HeadersInit {
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "GitPulse/0.1",
  };
  if (process.env.GITHUB_TOKEN) {
    h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return h;
}

async function gh<T>(path: string, init?: RequestInit): Promise<T> {
  const url = path.startsWith("http") ? path : `${GITHUB_API}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: { ...headers(), ...(init?.headers || {}) },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new GitHubError(
      `GitHub ${res.status}: ${body.slice(0, 200)}`,
      res.status,
      path
    );
  }

  return res.json() as Promise<T>;
}

export interface GhUser {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  company: string | null;
  location: string | null;
  blog: string | null;
  twitter_username: string | null;
  followers: number;
  following: number;
  public_repos: number;
  created_at: string;
  updated_at: string;
  type: string;
}

export interface GhRepo {
  id: number;
  full_name: string;
  name: string;
  owner: { login: string; avatar_url?: string };
  description: string | null;
  html_url: string;
  language: string | null;
  license: { spdx_id: string | null } | null;
  topics?: string[];
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  fork: boolean;
  archived: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string | null;
  default_branch?: string;
}

export interface GhSearchRepos {
  total_count: number;
  incomplete_results: boolean;
  items: GhRepo[];
}

export async function fetchUser(login: string): Promise<GhUser> {
  return gh<GhUser>(`/users/${encodeURIComponent(login)}`);
}

export async function fetchUserRepos(
  login: string,
  opts: { perPage?: number; page?: number; type?: "owner" | "all" } = {}
): Promise<GhRepo[]> {
  const perPage = opts.perPage ?? 100;
  const page = opts.page ?? 1;
  const type = opts.type ?? "owner";
  return gh<GhRepo[]>(
    `/users/${encodeURIComponent(login)}/repos?per_page=${perPage}&page=${page}&sort=updated&type=${type}`
  );
}

export async function fetchRepo(owner: string, repo: string): Promise<GhRepo> {
  return gh<GhRepo>(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`
  );
}

export async function searchRepositories(
  query: string,
  opts: { perPage?: number; page?: number; sort?: "stars" | "updated" } = {}
): Promise<GhSearchRepos> {
  const perPage = opts.perPage ?? 30;
  const page = opts.page ?? 1;
  const sort = opts.sort ?? "stars";
  const q = encodeURIComponent(query);
  return gh<GhSearchRepos>(
    `/search/repositories?q=${q}&sort=${sort}&order=desc&per_page=${perPage}&page=${page}`
  );
}

export async function searchUsers(
  query: string,
  opts: { perPage?: number; page?: number } = {}
): Promise<{ total_count: number; items: GhUser[] }> {
  const perPage = opts.perPage ?? 30;
  const page = opts.page ?? 1;
  const q = encodeURIComponent(query);
  return gh(`/search/users?q=${q}&per_page=${perPage}&page=${page}`);
}

export async function summarizeUserRepos(login: string): Promise<{
  starsTotal: number;
  forksReceived: number;
  originalReposCount: number;
  languages: Record<string, number>;
}> {
  const repos = await fetchUserRepos(login, { perPage: 100, type: "owner" });
  const original = repos.filter((r) => !r.fork);

  let starsTotal = 0;
  let forksReceived = 0;
  const languages: Record<string, number> = {};

  for (const r of original) {
    starsTotal += r.stargazers_count;
    forksReceived += r.forks_count;
    if (r.language) {
      languages[r.language] = (languages[r.language] || 0) + 1;
    }
  }

  return {
    starsTotal,
    forksReceived,
    originalReposCount: original.length,
    languages,
  };
}

export async function fetchTopStarredRepos(
  language?: string,
  perPage = 30
): Promise<GhRepo[]> {
  const q = language ? `language:${language} stars:>1000` : "stars:>5000";
  const result = await searchRepositories(q, { perPage, sort: "stars" });
  return result.items.filter((r) => !r.fork && !r.archived);
}

export async function fetchRecentlyUpdatedRepos(
  language: string,
  minStars = 500,
  perPage = 20
): Promise<GhRepo[]> {
  const q = `language:${language} stars:>${minStars}`;
  const result = await searchRepositories(q, { perPage, sort: "updated" });
  return result.items.filter((r) => !r.fork && !r.archived);
}
