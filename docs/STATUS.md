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

## Notes

Content arriving here is generated upstream. When something looks wrong on the
live site, check `news-content-pipeline` before editing files in this repo — a
manual fix here is overwritten by the next automated publish.

## How this file is used

Update at session end, then run `python3 ~/dev/_estate/tools/fi_status_rollup.py`.

---

Dated history for this module lives in [`HISTORY.md`](HISTORY.md).
