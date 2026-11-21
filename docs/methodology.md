# GitPulse Ranking Methodology

Last updated: 2026-11-21  
Status: MVP (v0.1)

This document describes exactly how GitPulse calculates rankings.  
We keep the formulas public so anyone can understand and critique them.

---

## Design Goals

1. Reward **recent momentum**, not only lifetime accumulation.
2. Prefer consistent activity over one-off spikes.
3. Remain simple enough to explain in one page.
4. Be hard to game in obvious ways (pure star farming, empty repos, etc.).

---

## 1. Developer Ranking

### Signals

| Signal | Weight | Description |
|--------|--------|-------------|
| StarsScore | 0.35 | Time-decayed stars from original (non-fork) repositories |
| GrowthScore | 0.30 | Combined growth of stars + followers over 7d and 30d |
| ActivityScore | 0.20 | Public activity consistency in the last 90 days |
| ImpactScore | 0.15 | Forks received + number of meaningful original repositories |

### Final Score

```text
DeveloperScore = 
  0.35 * norm(StarsScore) +
  0.30 * norm(GrowthScore) +
  0.20 * norm(ActivityScore) +
  0.15 * norm(ImpactScore)
```

All components are min-max normalized within the current ranking cohort (or using a robust percentile-based normalization in later versions).

### StarsScore (details)

- Only **original** repositories (fork = false)
- Each repository contributes `stars * decay(age)`
- Decay is gentle: newer repositories keep more weight
- Very old inactive repositories contribute less

### GrowthScore (details)

```text
GrowthScore = 
  0.6 * (stars_gained_7d + followers_gained_7d) +
  0.4 * (stars_gained_30d + followers_gained_30d)
```

We track daily snapshots to compute gains accurately.

### ActivityScore (details)

Based on public events and push activity over the last 90 days.  
Accounts with long periods of silence score lower even if they have high lifetime stars.

### ImpactScore (details)

- Total forks across original repositories
- Count of original repositories that pass a minimum quality bar (stars + activity)

---

## 2. Repository Ranking

### Signals

| Signal | Weight | Description |
|--------|--------|-------------|
| Stars | 0.25 | Current stargazer count |
| StarsGrowth | 0.40 | Stars gained in last 7 and 30 days |
| Activity | 0.25 | Commits, PRs, issues activity (recent) |
| QualityScore | 0.10 | README, license, recency, basic structure |

### Final Score

```text
RepoScore = 
  0.25 * norm(Stars) +
  0.40 * norm(StarsGrowth) +
  0.25 * norm(Activity) +
  0.10 * QualityScore
```

### StarsGrowth

```text
StarsGrowth = 
  0.65 * stars_gained_7d +
  0.35 * stars_gained_30d
```

This is the main reason “Fastest Growing” feels different from classic star rankings.

### QualityScore (MVP)

Simple deterministic checks (0–1):

- Has non-empty README
- Has a license
- Pushed within the last 12 months
- Not archived
- Description exists

Later versions may add deeper signals.

---

## 3. Ranking Views

We publish at least two views for each entity type:

- **Overall** — full score
- **Growth** / **Fastest Growing** — heavily weighted toward recent gains

This prevents the board from being dominated forever by the same historical giants.

---

## 4. What We Explicitly Do Not Do (MVP)

- We do not use private data
- We do not sell ranking positions
- We do not hide the formula
- We do not let AI decide the numeric rank (AI is used only for short commentary)

---

## 5. Versioning

When we change weights or signals, we:

1. Bump the methodology version
2. Note the change in this file
3. Keep historical rankings reproducible when possible

Current version: **v0.1-mvp**
