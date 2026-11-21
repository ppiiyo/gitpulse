import { RankingTable } from "@/components/RankingTable";
import { getDeveloperRankings } from "@/lib/rankings";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Developer Rankings",
};

export default async function DevelopersPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const params = await searchParams;
  const view = params.view === "overall" ? "overall" : "growth";
  const { entries, source, snapshotDate } = await getDeveloperRankings(view);
  const shown = entries.slice(0, 100);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
          Developer Rankings
        </h1>
        <p className="mt-2 text-zinc-400 text-sm max-w-xl">
          {view === "growth"
            ? "Sorted by growth-weighted score — recent momentum matters more than lifetime stars."
            : "Overall score balances influence, growth, activity, and impact."}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <Link
          href="/developers?view=growth"
          className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
            view === "growth"
              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Fastest Growing
        </Link>
        <Link
          href="/developers?view=overall"
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

      <RankingTable entries={shown} type="developer" />

      <p className="mt-6 text-xs text-zinc-600">
        Methodology v0.1-mvp · Source: {source}
        {snapshotDate ? ` · Snapshot ${snapshotDate}` : " · demo data"}
        {" · "}
        <Link href="/methodology" className="text-zinc-500 hover:text-zinc-300">
          Why this isn’t GitHub stars →
        </Link>
      </p>
    </div>
  );
}
