import Link from "next/link";
import { getDeveloperByLogin } from "@/lib/rankings";
import { formatNumber } from "@/lib/utils";
import { ShareCard } from "@/components/ShareCard";

// Allow runtime data (searchParams / snapshots)
export const instant = false;

export const metadata = {
  title: "Personal Report",
};

export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<{ u?: string }>;
}) {
  const { u } = await searchParams;
  const login = (u || "").trim().replace(/^@/, "");
  const entry = login ? await getDeveloperByLogin(login) : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-50 mb-2">
        Personal report
      </h1>
      <p className="text-sm text-zinc-400 mb-8 max-w-lg">
        Look up a GitHub username against the current ranking. Free preview —
        deep reports and history come next.
      </p>

      <form className="flex gap-2 mb-10" action="/report" method="get">
        <input
          name="u"
          defaultValue={login}
          placeholder="GitHub username"
          className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
        />
        <button
          type="submit"
          className="rounded-lg bg-zinc-100 text-zinc-900 px-4 py-2 text-sm font-medium hover:bg-white transition-colors"
        >
          Look up
        </button>
      </form>

      {!login && (
        <p className="text-sm text-zinc-500">
          Enter a username to see rank and share card.
        </p>
      )}

      {login && !entry && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 text-sm text-zinc-400">
          <p className="mb-2">
            <span className="text-zinc-200">@{login}</span> is not in the current
            ranking cohort.
          </p>
          <p>
            Seed more developers with{" "}
            <code className="text-zinc-300">npm run seed:developers</code>, or
            try a well-known login from the{" "}
            <Link href="/developers" className="text-zinc-300 hover:text-white">
              leaderboard
            </Link>
            .
          </p>
        </div>
      )}

      {entry && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Rank", value: `#${entry.rank}` },
              {
                label: "Stars",
                value: formatNumber(entry.metrics.starsTotal),
              },
              {
                label: "Followers",
                value: formatNumber(entry.developer.followers),
              },
              {
                label: "Score",
                value: (entry.metrics.developerScore * 100).toFixed(0),
              },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4"
              >
                <div className="text-xs text-zinc-500 mb-1">{s.label}</div>
                <div className="text-lg font-medium text-zinc-100 font-mono">
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          {entry.insight && (
            <p className="text-sm text-zinc-400">{entry.insight}</p>
          )}

          <div>
            <div className="text-xs text-zinc-500 mb-3">Share card</div>
            <ShareCard type="developer" entry={entry} />
          </div>

          <Link
            href={`/developers/${entry.developer.login}`}
            className="text-sm text-zinc-400 hover:text-zinc-200"
          >
            Full profile →
          </Link>
        </div>
      )}
    </div>
  );
}
