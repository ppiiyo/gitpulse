import { DEVELOPER_WEIGHTS, REPO_WEIGHTS, METHODOLOGY_VERSION } from "@/lib/ranking";

export const metadata = {
  title: "Methodology",
};

export default function MethodologyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-50 mb-2">
        Ranking Methodology
      </h1>
      <p className="text-zinc-400 mb-10">
        Version {METHODOLOGY_VERSION}. Everything that affects rank is described
        here.
      </p>

      <section className="mb-12">
        <h2 className="text-xl font-medium text-zinc-100 mb-4">Principles</h2>
        <ul className="space-y-2 text-zinc-300 text-[15px] leading-relaxed">
          <li>• Reward recent momentum, not only lifetime accumulation.</li>
          <li>• Prefer consistent activity over one-off spikes.</li>
          <li>• Keep the formula simple enough to explain on one page.</li>
          <li>• Never sell positions or hide the weights.</li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-medium text-zinc-100 mb-4">
          Developer Score
        </h2>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 font-mono text-sm text-zinc-300 mb-4 overflow-x-auto">
          DeveloperScore =<br />
          &nbsp;&nbsp;{DEVELOPER_WEIGHTS.stars} × StarsScore +<br />
          &nbsp;&nbsp;{DEVELOPER_WEIGHTS.growth} × GrowthScore +<br />
          &nbsp;&nbsp;{DEVELOPER_WEIGHTS.activity} × ActivityScore +<br />
          &nbsp;&nbsp;{DEVELOPER_WEIGHTS.impact} × ImpactScore
        </div>
        <div className="space-y-3 text-sm text-zinc-400 leading-relaxed">
          <p>
            <strong className="text-zinc-200">StarsScore</strong> — time-decayed
            stars from original repositories.
          </p>
          <p>
            <strong className="text-zinc-200">GrowthScore</strong> — stars +
            followers gained over 7 and 30 days (weighted toward the last week).
          </p>
          <p>
            <strong className="text-zinc-200">ActivityScore</strong> — consistency
            of public activity in the last 90 days.
          </p>
          <p>
            <strong className="text-zinc-200">ImpactScore</strong> — forks received
            and meaningful original repositories.
          </p>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-medium text-zinc-100 mb-4">
          Repository Score
        </h2>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 font-mono text-sm text-zinc-300 mb-4 overflow-x-auto">
          RepoScore =<br />
          &nbsp;&nbsp;{REPO_WEIGHTS.stars} × Stars +<br />
          &nbsp;&nbsp;{REPO_WEIGHTS.starsGrowth} × StarsGrowth +<br />
          &nbsp;&nbsp;{REPO_WEIGHTS.activity} × Activity +<br />
          &nbsp;&nbsp;{REPO_WEIGHTS.quality} × QualityScore
        </div>
        <div className="space-y-3 text-sm text-zinc-400 leading-relaxed">
          <p>
            <strong className="text-zinc-200">StarsGrowth</strong> is weighted
            more heavily in the “Fastest Growing” view. This is the main reason
            the growth board looks different from classic star rankings.
          </p>
          <p>
            <strong className="text-zinc-200">QualityScore</strong> is a simple
            deterministic check (README, license, recent push, not archived,
            description).
          </p>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-medium text-zinc-100 mb-4">
          What we do not do
        </h2>
        <ul className="space-y-2 text-zinc-300 text-[15px]">
          <li>• We do not use private data.</li>
          <li>• We do not let AI decide the numeric rank.</li>
          <li>• We do not sell or auction ranking positions.</li>
          <li>• We do not hide changes to the formula.</li>
        </ul>
      </section>

      <p className="text-xs text-zinc-600">
        Full technical details live in{" "}
        <code className="text-zinc-400">docs/methodology.md</code> in the
        repository.
      </p>
    </div>
  );
}
