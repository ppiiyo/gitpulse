# GitPulse

**Honest rankings for developers and repositories on GitHub.**

Transparent methodology. Growth-focused. Shareable cards. Weekly pulse.

---

## What is GitPulse?

GitPulse ranks GitHub developers and repositories using a clear, public formula that prioritizes **recent growth and real activity** — not just lifetime stars.

- Developer rankings (Overall + Growth)
- Repository rankings (Overall + Fastest Growing)
- Individual profile & repo pages with short AI insights
- Weekly Pulse reports
- Shareable ranking cards

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

- **StarsScore** — Weighted sum of stars on original repositories (time-decayed)
- **GrowthScore** — Stars + followers gained in the last 7 and 30 days
- **ActivityScore** — Consistency of commits and public events (last 90 days)
- **ImpactScore** — Forks, meaningful repositories, community signals

### Repositories

```
RepoScore =
  0.25 × Stars +
  0.40 × StarsGrowth +
  0.25 × Activity +
  0.10 × QualityScore
```

Full details: [`/docs/methodology.md`](./docs/methodology.md)

## Tech Stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS 4**
- **PostgreSQL** (planned for snapshots & history)
- GitHub API for data
- AI only for short, factual commentary (not for ranking)

## Project Status

**Phase:** Foundation → MVP

- [x] Repository & project scaffold
- [x] Core types & ranking formulas
- [x] Methodology documentation
- [ ] Data collection pipeline
- [ ] Ranking engine
- [ ] Public ranking pages
- [ ] Profile & repository pages
- [ ] Shareable cards
- [ ] Weekly Pulse
- [ ] Personal reports

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## License

MIT
