import Link from "next/link";
import { formatNumber, formatDelta, cn } from "@/lib/utils";
import type { DeveloperRankingEntry, RepositoryRankingEntry } from "@/types";

type Entry = DeveloperRankingEntry | RepositoryRankingEntry;

function isDeveloper(entry: Entry): entry is DeveloperRankingEntry {
  return "developer" in entry;
}

interface RankingTableProps {
  entries: Entry[];
  type: "developer" | "repository";
}

export function RankingTable({ entries, type }: RankingTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-800 text-left text-zinc-500">
            <th className="px-4 py-3 font-medium w-16">#</th>
            <th className="px-4 py-3 font-medium">
              {type === "developer" ? "Developer" : "Repository"}
            </th>
            <th className="px-4 py-3 font-medium text-right hidden sm:table-cell">
              Score
            </th>
            <th className="px-4 py-3 font-medium text-right">
              {type === "developer" ? "Stars" : "Stars"}
            </th>
            <th className="px-4 py-3 font-medium text-right hidden md:table-cell">
              30d Δ
            </th>
            <th className="px-4 py-3 font-medium text-right w-20">Δ Rank</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const href = isDeveloper(entry)
              ? `/developers/${entry.developer.login}`
              : `/repositories/${entry.repository.fullName}`;

            const name = isDeveloper(entry)
              ? entry.developer.name || entry.developer.login
              : entry.repository.fullName;

            const avatar = isDeveloper(entry)
              ? entry.developer.avatarUrl
              : null;

            const score = isDeveloper(entry)
              ? entry.metrics.developerScore
              : entry.metrics.repoScore;

            const stars = isDeveloper(entry)
              ? entry.metrics.starsTotal
              : entry.metrics.stars;

            const growth30 = isDeveloper(entry)
              ? entry.metrics.starsGrowth30d
              : entry.metrics.starsGrowth30d;

            return (
              <tr
                key={isDeveloper(entry) ? entry.developer.login : entry.repository.fullName}
                className="border-b border-zinc-800/60 last:border-0 hover:bg-zinc-800/30 transition-colors"
              >
                <td className="px-4 py-3 text-zinc-500 font-mono text-xs">
                  {entry.rank}
                </td>
                <td className="px-4 py-3">
                  <Link href={href} className="flex items-center gap-3 group">
                    {avatar && (
                      <img
                        src={avatar}
                        alt=""
                        className="w-8 h-8 rounded-full bg-zinc-800"
                      />
                    )}
                    <div className="min-w-0">
                      <div className="font-medium text-zinc-100 group-hover:text-emerald-400 transition-colors truncate">
                        {name}
                      </div>
                      {isDeveloper(entry) && (
                        <div className="text-xs text-zinc-500 truncate">
                          @{entry.developer.login}
                        </div>
                      )}
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-3 text-right font-mono text-xs text-zinc-400 hidden sm:table-cell">
                  {(score * 100).toFixed(1)}
                </td>
                <td className="px-4 py-3 text-right font-mono text-zinc-300">
                  {formatNumber(stars)}
                </td>
                <td className="px-4 py-3 text-right font-mono text-xs text-emerald-400/90 hidden md:table-cell">
                  +{formatNumber(growth30)}
                </td>
                <td
                  className={cn(
                    "px-4 py-3 text-right font-mono text-xs",
                    entry.rankDelta && entry.rankDelta > 0
                      ? "text-emerald-400"
                      : entry.rankDelta && entry.rankDelta < 0
                      ? "text-red-400"
                      : "text-zinc-600"
                  )}
                >
                  {formatDelta(entry.rankDelta)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
