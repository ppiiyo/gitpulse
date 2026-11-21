/**
 * GitHub API client (MVP skeleton)
 *
 * Requires GITHUB_TOKEN in environment for higher rate limits.
 * All functions are side-effect free regarding ranking — they only fetch.
 */

const GITHUB_API = "https://api.github.com";

function headers() {
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (process.env.GITHUB_TOKEN) {
    h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return h;
}

export async function fetchUser(login: string) {
  const res = await fetch(`${GITHUB_API}/users/${login}`, {
    headers: headers(),
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`GitHub user ${login}: ${res.status}`);
  return res.json();
}

export async function fetchUserRepos(login: string, perPage = 100) {
  const res = await fetch(
    `${GITHUB_API}/users/${login}/repos?per_page=${perPage}&sort=updated&type=owner`,
    {
      headers: headers(),
      next: { revalidate: 3600 },
    }
  );
  if (!res.ok) throw new Error(`GitHub repos for ${login}: ${res.status}`);
  return res.json();
}

export async function fetchRepo(owner: string, repo: string) {
  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}`, {
    headers: headers(),
    next: { revalidate: 1800 },
  });
  if (!res.ok) throw new Error(`GitHub repo ${owner}/${repo}: ${res.status}`);
  return res.json();
}

/**
 * Search repositories by stars / language (for seeding rankings).
 * Note: Search API has stricter rate limits.
 */
export async function searchRepositories(query: string, perPage = 30) {
  const res = await fetch(
    `${GITHUB_API}/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=${perPage}`,
    {
      headers: headers(),
      next: { revalidate: 3600 },
    }
  );
  if (!res.ok) throw new Error(`GitHub search: ${res.status}`);
  return res.json();
}
