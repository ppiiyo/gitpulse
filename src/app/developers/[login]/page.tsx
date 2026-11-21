import { getMockDeveloperRankings } from "@/data/mock";
import { formatNumber } from "@/lib/utils";
import { ShareCard } from "@/components/ShareCard";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function DeveloperPage({
  params,
}: {
  params: Promise<{ login: string }>;
}) {
  const { login } = await params;
  const rankings = getMockDeveloperRankings("overall");
  const entry = rankings.find(
    (e) => e.developer.login.toLowerCase() === login.toLowerCase()
  );

  if (!entry) notFound();

  const { developer, metrics, rank, insight } = entry;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link
        href="/developers"
        className="text-sm text-zinc-500 hover:text-zinc-300 mb-8 inline-block"
      >
        ← All developers
      </Link>

      <div className="flex items-start gap-5 mb-10">
        <img
          src={developer.avatarUrl}
          alt=""
          className="w-20 h-20 rounded-full bg-zinc-800"
        />
        <div>
          <h1 className="text-2xl font-semibold text-zinc-50">
            {developer.name || developer.login}
          </h1>
          <p className="text-zinc-400">@{developer.login}</p>
          {developer.bio && (
            <p className="mt-2 text-zinc-300 text-sm max-w-md">{developer.bio}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        {[
          { label: "Rank", value: `#${rank}` },
          { label: "Stars", value: formatNumber(metrics.starsTotal) },
          { label: "Followers", value: formatNumber(developer.followers) },
          {
            label: "30d Stars",
            value: `+${formatNumber(metrics.starsGrowth30d)}`,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4"
          >
            <div className="text-xs text-zinc-500 mb-1">{stat.label}</div>
            <div className="text-lg font-medium text-zinc-100 font-mono">
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {insight && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 mb-8">
          <div className="text-xs text-zinc-500 mb-2">Insight</div>
          <p className="text-zinc-300 text-sm leading-relaxed">{insight}</p>
        </div>
      )}

      <div className="mb-10">
        <div className="text-xs text-zinc-500 mb-3">Share card</div>
        <div className="overflow-x-auto">
          <ShareCard type="developer" entry={entry} />
        </div>
      </div>

      <div className="flex gap-3">
        <a
          href={`https://github.com/${developer.login}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-900 transition-colors"
        >
          View on GitHub
        </a>
      </div>
    </div>
  );
}
