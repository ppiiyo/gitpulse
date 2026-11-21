import Link from "next/link";
import { RankingTable } from "@/components/RankingTable";
import { getDeveloperRankings, getRepositoryRankings } from "@/lib/rankings";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { entries: devEntries, source: devSource } =
    await getDeveloperRankings("growth");
  const topDevelopers = devEntries.slice(0, 10);
  const { entries: repoEntries, source: repoSource } =
    await getRepositoryRankings("growth");
  const topRepos = repoEntries.slice(0, 10);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <section className="mb-16">
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1 text-xs text-zinc-400 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Not lifetime stars · Growth-weighted rankings
        </div>

        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-zinc-50 max-w-2xl leading-[1.15]">
          Who is rising on GitHub — not who already won
        </h1>

        <p className="mt-5 text-lg text-zinc-400 max-w-xl leading-relaxed">
          GitPulse ranks developers and repositories with a{" "}
          <span className="text-zinc-200">public formula</span> that prioritizes
          recent growth and activity. Different from sorting by total stars.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/developers?view=growth"
            className="inline-flex items-center justify-center rounded-lg bg-zinc-100 text-zinc-900 px-4 py-2.5 text-sm font-medium hover:bg-white transition-colors"
          >
            Fastest Growing Developers
          </Link>
          <Link
            href="/repositories?view=growth"
            className="inline-flex items-center justify-center rounded-lg border border-zinc-700 text-zinc-200 px-4 py-2.5 text-sm font-medium hover:bg-zinc-900 transition-colors"
          >
            Fastest Growing Repos
          </Link>
          <Link
            href="/methodology"
            className="inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            How ranking works →
          </Link>
        </div>
      </section>

      <div className="grid gap-12 lg:grid-cols-2">
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-medium text-zinc-100">
                Fastest Growing Developers
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Top 10 · growth-weighted · {devEntries.length} tracked
              </p>
            </div>
            <Link
              href="/developers?view=growth"
              className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Top 100 →
            </Link>
          </div>
          <RankingTable entries={topDevelopers} type="developer" />
          {devSource === "mock" && (
            <p className="mt-2 text-xs text-zinc-600">
              Demo data · run seed for live cohort
            </p>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-medium text-zinc-100">
                Fastest Growing Repositories
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Top 10 · growth-weighted · {repoEntries.length} tracked
              </p>
            </div>
            <Link
              href="/repositories?view=growth"
              className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Top 100 →
            </Link>
          </div>
          <RankingTable entries={topRepos} type="repository" />
          {repoSource === "mock" && (
            <p className="mt-2 text-xs text-zinc-600">
              Demo data · run seed for live cohort
            </p>
          )}
        </section>
      </div>

      <section className="mt-20 grid gap-6 sm:grid-cols-3">
        {[
          {
            title: "Growth over vanity",
            body: "40% of repo score is recent star growth — legends don’t lock the board forever.",
          },
          {
            title: "Public formula",
            body: "Every weight is documented. No black-box “trending”. Argue with the math, not the magic.",
          },
          {
            title: "Built to share",
            body: "Ranking cards and Weekly Pulse so people post momentum, not just total stars.",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5"
          >
            <h3 className="font-medium text-zinc-100 mb-2">{item.title}</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">{item.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
