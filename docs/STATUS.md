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

- **PR #4 `team-bios` is a draft and must not be merged** — the bio text in it is
  an explicit `[BIO PENDING]` placeholder. Layout and CSS are done; copy for
  Brian R. Dillion, Jerome Basile and Shannon Poulsen is outstanding.

## Recent

- **2026-08-20 — Insights reframed to four cards, article Markdown rendered,
  four current articles published** (PR #3 merged).
  - `.insights-grid` is now `repeat(2, 1fr)` and the landing shows 4 rather
    than 6. The count comes from `landing_count` in `posts.json`, set by
    `LANDING_COUNT` in `~/.config/content-desk/env` on SERVER (now 4); the JS
    constant is only the fallback.
  - `article.html` now renders the Markdown the pipeline actually writes.
    Previously it split on blank lines and assigned `textContent`, so every
    published article displayed literal `#` and `**`. Built as DOM nodes, not
    `innerHTML`, so article text still cannot inject markup.
  - Content Desk gained `promote_drafted_headline()`: Module 3 puts the good
    headline on line one of the body while the stored headline is the raw source
    title, which for Federal Register items is always
    "Airworthiness Directives; <manufacturer>". That line is now promoted to the
    title and removed from the body, which also ended the headline being
    repeated under the H1. Applied to the four July articles too.
  - Live now, top four by relevance: FAA 737 MAX structural crack inspections,
    British Airways baggage container fire, IAE V2500 third-stage HPC rotor
    blades, Rolls-Royce Trent 1000 IP compressor VIGVs. The four July articles
    remain reachable by URL but sit below the landing cut.

## Earlier

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
