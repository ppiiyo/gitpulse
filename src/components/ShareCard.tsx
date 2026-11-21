import { formatNumber, formatDelta } from "@/lib/utils";
import type { DeveloperRankingEntry, RepositoryRankingEntry } from "@/types";

type Props =
  | { type: "developer"; entry: DeveloperRankingEntry }
  | { type: "repository"; entry: RepositoryRankingEntry };

/**
 * Visual ranking card designed for screenshots / social share.
 * Keep layout tight, high contrast, minimal text.
 */
export function ShareCard(props: Props) {
  if (props.type === "developer") {
    const { entry } = props;
    const { developer, metrics, rank, rankDelta, view } = entry;

    return (
      <div className="w-[480px] rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-medium tracking-wide text-zinc-400 uppercase">
              GitPulse · {view === "growth" ? "Growth" : "Overall"}
            </span>
          </div>
          <span className="text-xs text-zinc-600">gitpulse.dev</span>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <img
            src={developer.avatarUrl}
            alt=""
            className="w-14 h-14 rounded-full bg-zinc-800 ring-2 ring-zinc-800"
          />
          <div className="min-w-0">
            <div className="text-lg font-semibold text-zinc-50 truncate">
              {developer.name || developer.login}
            </div>
            <div className="text-sm text-zinc-500">@{developer.login}</div>
          </div>
          <div className="ml-auto text-right">
            <div className="text-3xl font-semibold tabular-nums text-zinc-50">
              #{rank}
            </div>
            {rankDelta !== null && rankDelta !== 0 && (
              <div
                className={`text-xs font-mono ${
                  rankDelta > 0 ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {formatDelta(rankDelta)}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Stat label="Stars" value={formatNumber(metrics.starsTotal)} />
          <Stat
            label="30d growth"
            value={`+${formatNumber(metrics.starsGrowth30d)}`}
            accent
          />
          <Stat
            label="Score"
            value={(metrics.developerScore * 100).toFixed(0)}
          />
        </div>
      </div>
    );
  }

  const { entry } = props;
  const { repository, metrics, rank, rankDelta, view } = entry;

  return (
    <div className="w-[480px] rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-xs font-medium tracking-wide text-zinc-400 uppercase">
            GitPulse · {view === "growth" ? "Fastest Growing" : "Overall"}
          </span>
        </div>
        <span className="text-xs text-zinc-600">gitpulse.dev</span>
      </div>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="min-w-0">
          <div className="text-lg font-semibold text-zinc-50 truncate">
            {repository.fullName}
          </div>
          {repository.description && (
            <p className="mt-1 text-sm text-zinc-500 line-clamp-2">
              {repository.description}
            </p>
          )}
          {repository.language && (
            <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded bg-zinc-900 text-zinc-400">
              {repository.language}
            </span>
          )}
        </div>
        <div className="text-right shrink-0">
          <div className="text-3xl font-semibold tabular-nums text-zinc-50">
            #{rank}
          </div>
          {rankDelta !== null && rankDelta !== 0 && (
            <div
              className={`text-xs font-mono ${
                rankDelta > 0 ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {formatDelta(rankDelta)}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat label="Stars" value={formatNumber(metrics.stars)} />
        <Stat
          label="30d growth"
          value={`+${formatNumber(metrics.starsGrowth30d)}`}
          accent
        />
        <Stat label="Score" value={(metrics.repoScore * 100).toFixed(0)} />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-wide text-zinc-500 mb-0.5">
        {label}
      </div>
      <div
        className={`text-sm font-medium font-mono tabular-nums ${
          accent ? "text-emerald-400" : "text-zinc-100"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
