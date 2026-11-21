import { RankingTable } from "@/components/RankingTable";
import { getRepositoryRankings } from "@/lib/rankings";
import Link from "next/link";

export const instant = false;

export const metadata = {
  title: "Repository Rankings",
};

export default async function RepositoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const params = await searchParams;
  const view = params.view === "growth" ? "growth" : "overall";
  const { entries, source, snapshotDate } = await getRepositoryRankings(view);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
          Repository Rankings
        </h1>
        <p className="mt-2 text-zinc-400 text-sm max-w-xl">
          Ranked by stars, recent growth, activity, and basic quality signals.
          Growth view prioritizes momentum.
        </p>
      </div>

      <div className="flex gap-2 mb-6">
        <Link
          href="/repositories"
          className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
            view === "overall"
              ? "bg-zinc-100 text-zinc-900"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Overall
        </Link>
        <Link
          href="/repositories?view=growth"
          className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
            view === "growth"
              ? "bg-zinc-100 text-zinc-900"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Fastest Growing
        </Link>
      </div>

      <RankingTable entries={entries} type="repository" />

      <p className="mt-6 text-xs text-zinc-600">
        Methodology v0.1-mvp · Source: {source}
        {snapshotDate ? ` · Snapshot ${snapshotDate}` : " · using mock data"}
        {source === "mock" && (
          <>
            {" "}· Run <code className="text-zinc-500">npm run seed:repos</code> for
            live data
          </>
        )}
      </p>
    </div>
  );
}
