# CCode → App Handoff — Q17 recovery + E1 + new rule
Updated: 2026-06-21T23:00:00Z
Atlas prod: https://atlas.obelisque.io
Atlas main HEAD: 87400cd (post B+D merge — #28)
Authoritative backlog: `web/docs/BACKLOG.md` (LIVE)

## TL;DR

**Q17 grouped-checklist layer was not usable end-to-end.** Audit found:
- C1 schema (mig 126) was on main since #23 but **never applied to prod DB** until I ran it today.
- PR #24 (C2 UI) + PR #26 (C3 cron-inheritance) were marked MERGED on GitHub but squash-merged into the deleted `q17-c1-checklists-schema` base branch — **content never reached main**. Stacked-PR mishap.
- `/settings/checklists` never existed in prod; cron didn't inherit; assignee `/me` didn't group.

**Recovery in 4 PRs (R1 done in prod, R2-R4 open awaiting your review):**

| # | What | State |
|---|---|---|
| R1 | Apply mig 126 to prod DB | **LIVE** at 2026-06-21T22:24:47Z. Verified: `checklist_templates` table + `checklist_template_id` columns + relaxed constraint all exist. |
| **#30** | R2 — `/settings/checklists` CRUD UI (cherry-picked `fa923fc`) | OPEN, **awaiting review** |
| **#31** | R3 — cron inheritance (re-authored against current main; `a9e334d` couldn't cherry-pick cleanly due to PR #21 conflicts) | OPEN, **awaiting review** |
| **#32** | R4 — `/me` per-item completion grouped by checklist heading + counter | OPEN, **awaiting review** |

Suggested merge order: R2 → R3 → R4 (R3 + R4 work without R2 but R2's UI is what creates the checklists they consume).

## Blast-radius confirmation

Walked every merged PR (#1–#28) via `git branch -r --contains <mergeCommit>`. **Only #24 and #26 are missing from main.** Every other merge landed. Full audit in chat 2026-06-21.

## New standing rule logged

`docs/BACKLOG.md` standing process #7: **"No stacked PRs / every branch off current main."** Every new branch is cut from `git fetch origin && git checkout main && git pull --ff-only` — never from another open PR's branch. The C2/C3 orphaning happened because they used `q17-c1-checklists-schema` as their base; when that branch was deleted post-merge, their content went with it. From now on, if a follow-up genuinely depends on an unmerged change, wait for the dep to merge or duplicate the minimum onto a fresh main-based branch.

## Other open PRs awaiting your review

| PR | Title | Type |
|---|---|---|
| **#29** | E / E1 — `accountability_events` table + auto-record hooks from shift_offers | Schema. Touches employee accountability — your review. |

E1 is the start of the unified attendance/reliability record you specced. Lands the `accountability_events` table (mig 127, additive), data layer, auto-record on shift_offer claim + creation. E2 (manager flag UI) + E3 (profile reliability section) follow as their own PRs after you review the foundation.

## Migration-application hole — proposal (NOT BUILT)

The mig 126 drift was the third migration/code drift this session. Proposed in chat 2026-06-21:
- **A (recommended)** — GitHub Action on push-to-main that runs `node scripts/run-migrations.mjs` against prod, posts back to the PR, fails loudly red on the commit if any pending mig errors.
- **C (recommended pair)** — drift-detection check in the existing 15-min square-sync cron that diffs `web/db/*.sql` filenames in main HEAD vs `_migrations_log`, surfaces via the new audit_errors bell.

A is the enforcement; C is the belt to A's suspenders. Both ~25-50 lines. Need your go before I build.

## Backlog state

- **Done this session**: T1 (#25) mobile auth + nav, A+C+T3.10 (#27) errors-off-dashboard + Auditor-in-modal + TO disclaimer, B+D (#28) sync gesture + OCLT strip, R1 mig 126 applied.
- **In review**: #29 (E1), #30 (R2), #31 (R3), #32 (R4).
- **Other backlog still pending**: T3.9 (Apply setup consolidation), T4.12 (Staging Supabase secrets — needs you to provision staging first), shift-swap rework FUTURE_NOTE (E4), auto-type triggers (depends on Q14).

## Decisions needed from you

1. Review + merge **#30 → #31 → #32** in order (Q17 recovery, full feature usable end-to-end).
2. Review + merge **#29** (E1 schema foundation).
3. Approve building the migration-application enforcement (A+C above) — your call.
4. When ready to provision a staging Supabase project for T4.12, I'll send you the exact list of secret/var names to set.
