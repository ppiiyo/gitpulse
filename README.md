<p align="center">
  <img src="public/og.svg" alt="GitPulse" width="100%" />
</p>

<h1 align="center">GitPulse</h1>

<p align="center">
  <strong>Who is rising on GitHub — not who already won.</strong>
</p>

<p align="center">
  Transparent, growth-weighted rankings for developers &amp; repositories.<br/>
  Public formula · Stack boards · Share cards · Daily updates
</p>

<p align="center">
  <a href="https://gitpulse-ppiiyo.vercel.app"><img src="https://img.shields.io/badge/Live-Open%20product-10b981?style=for-the-badge" alt="Live" /></a>
  <a href="https://github.com/ppiiyo/gitpulse/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="MIT" /></a>
  <a href="https://github.com/ppiiyo/gitpulse/stargazers"><img src="https://img.shields.io/github/stars/ppiiyo/gitpulse?style=for-the-badge" alt="Stars" /></a>
</p>

<p align="center">
  <a href="https://gitpulse-ppiiyo.vercel.app">→ Try it live</a>
  ·
  <a href="https://gitpulse-ppiiyo.vercel.app/report">Find your rank</a>
  ·
  <a href="./docs/methodology.md">Methodology</a>
</p>

---

## Why GitPulse?

GitHub’s default sort is **lifetime stars**. Legends stay on top forever. New and mid-tier projects never surface.

GitPulse ranks with a **public formula** that prioritizes **recent growth**:

| | GitHub stars sort | GitPulse |
|---|---|---|
| What wins | Old giants | Rising projects |
| Formula | Hidden / none | Fully public |
| Stack boards | No | AI, Web, Security, Mobile… |
| Share cards | No | Yes |
| Personal report | No | Any username |

```
RepoScore ≈ 0.25·Stars + 0.40·Growth + 0.25·Activity + 0.10·Quality
```

Full math → [`docs/methodology.md`](./docs/methodology.md)

---

## Features

- **Fastest Growing** boards for developers & repos
- **Per-stack rankings** (AI/LLM, Web, Backend, DevTools, Systems, Mobile, Data, Security, Learning)
- **Personal report** — look up any GitHub user (`/report?u=username`)
- **Share cards** built for Twitter / LinkedIn / Discord
- **Daily seed** via GitHub Actions (automatic snapshots)
- **Open methodology** — no black box

---

## Quick start

```bash
git clone https://github.com/ppiiyo/gitpulse.git
cd gitpulse
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Seed live data

```bash
export GITHUB_TOKEN=ghp_your_token   # needs public read
npm run seed                         # repos + developers
```

Snapshots land in `data/snapshots/`. Growth (7d/30d) improves after several daily runs.

### Production

- Live: **https://gitpulse-ppiiyo.vercel.app**
- Daily Actions workflow: `.github/workflows/daily-seed.yml` (06:00 UTC)
- Repo secret: `GITPULSE_GITHUB_TOKEN`
- Vercel env: `GITHUB_TOKEN` (for live `/report` lookups)

---

## Stack

- Next.js 16 · TypeScript · Tailwind CSS 4
- GitHub API + JSON snapshots
- Vercel · GitHub Actions

---

## Roadmap

- [x] Transparent ranking engine
- [x] Live site + share cards
- [x] Stack categories
- [x] Personal report
- [x] Daily automated seed
- [ ] Deeper growth history (multi-week)
- [ ] Weekly Pulse newsletter
- [ ] API for third-party clients
- [ ] Self-serve “claim profile”

---

## Contributing

Ideas, formula debates, and PRs welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md).

If GitPulse is useful — **star the repo**. It helps others discover growth-first rankings.

---

## License

[MIT](./LICENSE) · Built in public.
