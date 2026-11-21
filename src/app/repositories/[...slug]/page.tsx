import { getMockRepositoryRankings } from "@/data/mock";
import { formatNumber } from "@/lib/utils";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function RepositoryPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const fullName = slug.join("/");
  const rankings = getMockRepositoryRankings("overall");
  const entry = rankings.find(
    (e) => e.repository.fullName.toLowerCase() === fullName.toLowerCase()
  );

  if (!entry) notFound();

  const { repository, metrics, rank, insight } = entry;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link
        href="/repositories"
        className="text-sm text-zinc-500 hover:text-zinc-300 mb-8 inline-block"
      >
        ← All repositories
      </Link>

      <div className="mb-10">
        <h1 className="text-2xl font-semibold text-zinc-50">
          {repository.fullName}
        </h1>
        {repository.description && (
          <p className="mt-2 text-zinc-400 text-sm max-w-xl">
            {repository.description}
          </p>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          {repository.language && (
            <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
              {repository.language}
            </span>
          )}
          {repository.license && (
            <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
              {repository.license}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        {[
          { label: "Rank", value: `#${rank}` },
          { label: "Stars", value: formatNumber(metrics.stars) },
          { label: "Forks", value: formatNumber(repository.forks) },
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

      <a
        href={repository.htmlUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-900 transition-colors"
      >
        View on GitHub
      </a>
    </div>
  );
}
