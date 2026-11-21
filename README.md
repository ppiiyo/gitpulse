# GitPulse

**Honest rankings for developers and repositories on GitHub.**

Transparent methodology. Growth-focused. Shareable cards. Weekly pulse.

---

## What is GitPulse?

GitPulse ranks GitHub developers and repositories using a clear, public formula that prioritizes **recent growth and real activity** — not just lifetime stars.

- Developer rankings (Overall + Growth)
- Repository rankings (Overall + Fastest Growing)
- Individual profile & repo pages with short insights
- Shareable ranking cards
- Weekly Pulse reports (next)

No black-box scores. No hype. Just signal.

## Core Principles

1. **Transparency** — Every ranking factor is documented.
2. **Growth over vanity** — Recent momentum matters more than historical totals.
3. **Quality signals** — Activity, consistency, and impact are part of the score.
4. **Shareability** — Beautiful cards people actually want to post.
5. **Honesty** — We never inflate numbers or hide methodology.

## Ranking Methodology (MVP)

### Developers

```
DeveloperScore =
  0.35 × StarsScore +
  0.30 × GrowthScore +
  0.20 × ActivityScore +
  0.15 × ImpactScore
```

### Repositories

```
RepoScore =
  0.25 × Stars +
  0.40 × StarsGrowth +
  0.25 × Activity +
  0.10 × QualityScore
```

Full details: [`docs/methodology.md`](./docs/methodology.md)

## Tech Stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS 4**
- GitHub API for data
- JSON snapshots for history (PostgreSQL planned)

## Project Status

**Phase:** Foundation + data layer

- [x] Project scaffold
- [x] Core types & ranking formulas
- [x] Methodology documentation
- [x] Ranking pages (developers / repositories)
- [x] Profile pages + ShareCard
- [x] GitHub API client
- [x] Seed script for repo snapshots
- [ ] Daily snapshots + growth history
- [ ] Live rankings from snapshots
- [ ] Weekly Pulse
- [ ] Personal reports

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Seed repository data (optional)

```bash
export GITHUB_TOKEN=ghp_your_token
npm run seed:repos
```

Writes `data/snapshots/repos-YYYY-MM-DD.json`.

## License

MIT
