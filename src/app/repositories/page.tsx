import { RankingTable } from "@/components/RankingTable";
import { getRepositoryRankings } from "@/lib/rankings";
import {
  REPO_CATEGORIES,
  classifyRepository,
  type RepoCategoryId,
} from "@/lib/categories";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Repository Rankings",
};

function parseCategory(raw?: string): RepoCategoryId {
  const ids = REPO_CATEGORIES.map((c) => c.id);
  if (raw && (ids as string[]).includes(raw)) return raw as RepoCategoryId;
  return "all";
}

export default async function RepositoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; cat?: string }>;
}) {
  const params = await searchParams;
  const view = params.view === "overall" ? "overall" : "growth";
  const category = parseCategory(params.cat);

  const full = await getRepositoryRankings(view, "all");
  const counts: Record<string, number> = { all: full.entries.length };
  for (const c of REPO_CATEGORIES) {
    if (c.id === "all") continue;
    counts[c.id] = 0;
  }
  for (const e of full.entries) {
    const id = classifyRepository({
      language: e.repository.language,
      topics: e.repository.topics,
      description: e.repository.description,
      fullName: e.repository.fullName,
    });
    counts[id] = (counts[id] || 0) + 1;
  }

  const entries =
    category === "all"
      ? full.entries
      : full.entries
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

  // Top 100 within the active board (All or a single stack)
  const shown = entries.slice(0, 100);
  const catMeta = REPO_CATEGORIES.find((c) => c.id === category)!;
  const { source, snapshotDate } = full;

  const qs = (v: string, c: string) => {
    const p = new URLSearchParams();
    p.set("view", v);
    if (c !== "all") p.set("cat", c);
    return `/repositories?${p.toString()}`;
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
          Repository Rankings
        </h1>
        <p className="mt-2 text-zinc-400 text-sm max-w-xl">
          {category === "all"
            ? "Overall board. Each stack targets ~100 repos after a full daily seed."
            : `${catMeta.label}: ${catMeta.description} · top 100 in this stack`}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {REPO_CATEGORIES.map((c) => {
          const n = counts[c.id] ?? 0;
          const empty = c.id !== "all" && n === 0;
          return (
            <Link
              key={c.id}
              href={qs(view, c.id)}
              className={`px-2.5 py-1 rounded-full text-xs transition-colors border ${
                category === c.id
                  ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                  : empty
                    ? "border-zinc-900 text-zinc-600"
                    : "border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700"
              }`}
            >
              {c.label}
              <span className="ml-1 opacity-60">{n}</span>
            </Link>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <Link
          href={qs("growth", category)}
          className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
            view === "growth"
              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Fastest Growing
        </Link>
        <Link
          href={qs("overall", category)}
          className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
            view === "overall"
              ? "bg-zinc-100 text-zinc-900"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Overall
        </Link>
        <span className="text-xs text-zinc-600 ml-auto">
          Showing {shown.length} of {entries.length}
        </span>
      </div>

      {shown.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-8 text-sm text-zinc-400 text-center">
          No repos in this category yet. After a full Daily seed (with token),
          each stack fills toward ~100.
        </div>
      ) : (
        <RankingTable entries={shown} type="repository" />
      )}

      <p className="mt-6 text-xs text-zinc-600">
        Methodology v0.2 · Source: {source}
        {snapshotDate ? ` · Snapshot ${snapshotDate}` : " · demo data"}
        {" · "}
        <Link href="/methodology" className="text-zinc-500 hover:text-zinc-300">
          Why this isn’t GitHub stars →
        </Link>
      </p>
    </div>
  );
}
