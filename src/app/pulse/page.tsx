import Link from "next/link";
import { getRepositoryRankings } from "@/lib/rankings";
import { formatNumber } from "@/lib/utils";

export const metadata = {
  title: "Weekly Pulse",
};

export default async function PulsePage() {
  const { entries, source, snapshotDate } = await getRepositoryRankings("growth");
  const topGainers = entries
    .filter((e) => e.metrics.starsGrowth30d > 0)
    .slice(0, 10);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-10">
        <div className="text-xs text-emerald-400/90 font-medium mb-2">
          Weekly Pulse
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-50">
          What moved this week
        </h1>
        <p className="mt-3 text-zinc-400 text-sm max-w-lg leading-relaxed">
          A short, honest look at repository momentum. No hype — just ranked
          signal from public GitHub data.
        </p>
      </div>

      {source === "mock" ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 text-sm text-zinc-400">
          <p className="mb-2">Live pulse needs snapshot history.</p>
          <p>
            Run{" "}
            <code className="text-zinc-300">npm run seed:repos</code> daily for
            a week, then growth and movers will appear here automatically.
          </p>
        </div>
      ) : (
        <p className="text-xs text-zinc-600 mb-6">
          Snapshot {snapshotDate} · {entries.length} repos tracked
        </p>
      )}

      <section className="mt-8">
        <h2 className="text-lg font-medium text-zinc-100 mb-4">
          Top movers (30d growth)
        </h2>
        {topGainers.length === 0 ? (
          <p className="text-sm text-zinc-500">
            No growth data yet. After multiple daily seeds, movers will show up
            here.
          </p>
        ) : (
          <ul className="space-y-2">
            {topGainers.map((e) => (
              <li key={e.repository.fullName}>
                <Link
                  href={`/repositories/${e.repository.fullName}`}
                  className="flex items-center justify-between gap-4 rounded-lg border border-zinc-800/80 bg-zinc-900/30 px-4 py-3 hover:bg-zinc-900/60 transition-colors"
                >
                  <div className="min-w-0">
                    <span className="text-xs text-zinc-500 font-mono mr-2">
                      #{e.rank}
                    </span>
                    <span className="text-sm text-zinc-100 font-medium">
                      {e.repository.fullName}
                    </span>
                  </div>
                  <span className="text-sm font-mono text-emerald-400 shrink-0">
                    +{formatNumber(e.metrics.starsGrowth30d)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-12 text-xs text-zinc-600">
        Pulse is generated from the same public methodology as the rankings.{" "}
        <Link href="/methodology" className="text-zinc-400 hover:text-zinc-200">
          How it works →
        </Link>
      </p>
    </div>
  );
}
