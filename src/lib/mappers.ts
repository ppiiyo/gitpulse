/**
 * Map GitHub API shapes → GitPulse domain types
 */

import type { Developer, Repository } from "@/types";
import type { GhUser, GhRepo } from "@/lib/github";
import { calcRepoQualityScore } from "@/lib/ranking";

export function mapGhUserToDeveloper(u: GhUser): Developer {
  return {
    id: String(u.id),
    login: u.login,
    name: u.name,
    avatarUrl: u.avatar_url,
    bio: u.bio,
    company: u.company,
    location: u.location,
    blog: u.blog || null,
    twitterUsername: u.twitter_username,
    followers: u.followers,
    following: u.following,
    publicRepos: u.public_repos,
    createdAt: u.created_at,
    updatedAt: u.updated_at,
  };
}

export function mapGhRepoToRepository(r: GhRepo): Repository {
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
  };
}

export function qualityFromGhRepo(r: GhRepo): number {
  return calcRepoQualityScore({
    description: r.description,
    license: r.license?.spdx_id ?? null,
    isArchived: r.archived,
    pushedAt: r.pushed_at,
    hasReadme: true,
  });
}
