# CCode → App Handoff — Walk-out State (updated)
Updated: 2026-06-19T20:30:00Z
Atlas prod: https://atlas.obelisque.io
Atlas main HEAD: (after #17 + #20 + #22 merges)
Authoritative backlog: `web/docs/BACKLOG.md` (LIVE)

## TL;DR

**Ready for you to test (A):**
- Apply URL (ACR prod): `https://atlas.obelisque.io/apply/39fdbaf3-22ad-421d-ba57-978492341e99` — HTTP 200, form rendering.
- Test employee creds: `test-employee@autumncoffeeroasting.com`; password in `C:\Users\remem\Desktop\ShiftFlow\web\.test-employee-creds`. Account is live, assigned to Mobile Cafe.
- UI add-employee works in prod (mig 122 verified applied).

**Foundation (B):**
- B5 — mig 125 (auditor owner-only triggers) **APPLIED to prod**, both triggers live.
- B6 — VAPID hardening **MERGED** (PR #22). Bad/missing key never throws from a server action anymore; it captures once to `/audit/errors` and returns a `skipped` sentinel. Your key-regeneration on Vercel still your separate step.
- B4 — dashboard $0 **diagnosed end-to-end**: data + RPC + sync all healthy. Almost certainly a UI-tile bug at a level I can't see without a screenshot. Details below.

**Q17 (C) — opened, NOT merged per your rule:**
- **PR #23** — C1 schema + data layer (mig 126 `checklist_templates` + FK on `task_templates` + `tasks` + data CRUD). CI green.
- **PR #24** — C2 `/settings/checklists` CRUD UI on top of C1. (CI in flight at the moment this bridge was pushed.)

## B4 Dashboard $0 — full diagnosis

| Layer | Verdict | Evidence |
|---|---|---|
| `pos_transactions` data today PT | **PRESENT** | 113 rows / **$1,504.24** today for ACR; 86 rows / $894.26 yesterday |
| `square-sync` cron prod | **HEALTHY** | Last 8 runs `success`, `chunksFailed=0`, every ~15 min |
| `dashboard_sales_rollup` RPC | **WORKING** | With your JWT: 49 rows, $32,634.75 June 1–19; today $1,324.25 across 3 locations |
| `cafe_at_a_glance_today` RPC | **WORKING** | $1,324.25 today across 3 locations, correct first/last timestamps |
| `/audit/errors` for sales/dashboard | **CLEAN** | No dashboard fetch errors in last 7 days |

So $0 must be at the UI-render layer or a browser-cache issue, NOT the data path. **Need a screenshot of the specific tile** so I can trace it to one component → fetch path. Candidates I've already inspected: CAAG per-location cards (RPC returns data), headline "as-of" tile (intentionally shows yesterday-close while business is open per [business-day.ts:90-106](web/src/lib/db/business-day.ts#L90-L106)), YoY chips (may be empty if no last-year data).

## Merged this session

| PR | Title | Result |
|---|---|---|
| **#17** | Backlog docs catch-up Q23–Q31 + Q17 audit reconciliation | MERGED |
| **#20** | Auditor wire-up: mig 125 owner-only trigger + UI dropdown filter + RLS tests | MERGED |
| **#22** | Q21 — VAPID push hardening (non-fatal try/catch + logError + skipped sentinel) | MERGED |
| mig 125 | Auditor owner-only trigger applied to prod DB (verified via psql) | LIVE |

## Open — awaiting your review (DO NOT self-merge)

| PR | Title | Why hold |
|---|---|---|
| **#21** | Q17 shift-based spawn cron + no-mid → opener fallback | Schema-adjacent cron behavior change. Your walk-out rule. |
| **#23** | Q17 / C1 — grouped checklist templates schema + data layer (mig 126) | Touches schema. Your walk-out rule. |
| **#24** | Q17 / C2 — `/settings/checklists` CRUD UI (on top of #23) | Q17 PR per your walk-out rule. Builds on #23 — merge #23 first, then #24 (or merge them in either order; CI will catch the diamond). |

### Q17 follow-up still NOT built (do after review)

After #21, #23, #24 land, ONE small follow-up PR ties them together: extend `/api/cron/spawn-tasks` so `shift_based` templates that belong to a checklist INHERIT the parent's `shift_role` + `shift_role_fallback` at runtime. Deferred here because both #21 and #23 touch the cron / template paths and merging them in any order would create a conflict otherwise.

## Backlog state

- **Active**: 0
- **In Review**: #21, #23, #24
- **Requested / unbuilt** (next-session candidates): 14 items including the Q17 cron-inheritance follow-up above, plus Q22 Square OAuth, Q23 MAP+MSRP, Q24 bulk-edit grid, Q25 $/transaction chips, Q26 inventory search, Q27 purchasing Phase 1, Q28–Q31 asset bug + atoms + cash-obligation forecast.

## Decisions needed from you

1. **Review + merge #21, #23, #24** in your preferred order. Suggested: #23 (schema) → #21 (existing shift-based spawn) → #24 (UI). Then ship the cron-inheritance follow-up.
2. **Dashboard $0 screenshot** so I can pinpoint the specific UI tile that's misbehaving.
3. **Q22 Square OAuth** when ready — needs Atlas Square app registered + env vars first.
