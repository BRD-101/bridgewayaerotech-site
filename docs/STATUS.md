---
module: bridgewayaerotech-site
prefix: —
status: active
updated: 2026-08-02
vault_note: MASTER_PROJECT_SUMMARY
---

# bridgewayaerotech-site — status

Public marketing site for Bridgeway Aero Tech, `bridgewayaerotech.com`. Static site, deployed via Cloudflare Pages on commit. **BAT tenant** — client-facing material for the regulated entity, kept separate from anything aeroAI.

Also the publishing target of `news-content-pipeline`: articles are committed here by the automated loop and go live in roughly 30 seconds.

## Open

- (none recorded — add items as they arise)

## Recent

- **2026-07-25 — Insights section live** (PR #2, `insights-editorial`, merged).
  Landing page shows the top 6 published news items by `relevance_score`, plus a
  featured weekly editorial slot ("The Bridgeway Position ·
  Favorable/Caution/Concern"). First 4 automated articles published the same day.
- 14 commits on `main`, 98 files.

## Notes

Content arriving here is generated upstream. When something looks wrong on the
live site, check `news-content-pipeline` before editing files in this repo — a
manual fix here is overwritten by the next automated publish.

## How this file is used

Update at session end, then run `python3 ~/dev/_estate/tools/fi_status_rollup.py`.
