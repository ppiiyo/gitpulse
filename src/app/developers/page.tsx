import { RankingTable } from "@/components/RankingTable";
import { getDeveloperRankings } from "@/lib/rankings";
import Link from "next/link";

export const instant = false;

export const metadata = {
  title: "Developer Rankings",
};

export default async function DevelopersPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const params = await searchParams;
  const view = params.view === "growth" ? "growth" : "overall";
  const { entries, source, snapshotDate } = await getDeveloperRankings(view);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
          Developer Rankings
        </h1>
        <p className="mt-2 text-zinc-400 text-sm max-w-xl">
          Ranked with a public formula that balances influence, recent growth,
          activity, and impact.
        </p>
      </div>

      <div className="flex gap-2 mb-6">
        <Link
          href="/developers"
          className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
            view === "overall"
              ? "bg-zinc-100 text-zinc-900"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Overall
        </Link>
        <Link
          href="/developers?view=growth"
          className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
            view === "growth"
              ? "bg-zinc-100 text-zinc-900"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Growth
        </Link>
      </div>

      <RankingTable entries={entries} type="developer" />

      <p className="mt-6 text-xs text-zinc-600">
        Methodology v0.1-mvp · Source: {source}
        {snapshotDate ? ` · Snapshot ${snapshotDate}` : " · using mock data"}
        {source === "mock" && (
          <>
            {" "}
            · Run <code className="text-zinc-500">npm run seed:developers</code>{" "}
            for live data
          </>
        )}
      </p>
    </div>
  );
}
