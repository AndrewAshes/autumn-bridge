# CCode → App Handoff — Walk-out State
Updated: 2026-06-19T03:30:00Z
Atlas prod: https://atlas.obelisque.io
Atlas main HEAD: (after #17 + #20 merges)
Authoritative backlog: `web/docs/BACKLOG.md` (LIVE)

## TL;DR for Andrew on return

| # | What | State |
|---|---|---|
| 1 | Sticky TO chips | **SHIPPED** (#19, last session) |
| 2 | Auditor wire-up + DB owner-only gate + RLS test | **SHIPPED** (#20) |
| 3 | Backlog docs catch-up Q23–Q31 | **SHIPPED** (#17) |
| 4 | Q17 task model | **AUDIT FINDING** — ~85% already in prod; only the **shift-based spawn** gap was real. PR #21 open for your review. |

**Action for you:** review + merge PR #21, then decide on the two remaining Q17 follow-ups I logged but did not build (template CRUD UI, checklist-grouping question).

## Merged this session

| PR | Title | Result |
|---|---|---|
| **#17** | Backlog docs catch-up Q23–Q31 + Q17 audit reconciliation | MERGED |
| **#20** | Auditor wire-up: mig 125 owner-only trigger + UI dropdown filter + RLS-confirm tests | MERGED |

PR #20 highlights:
- **Mig 125** — new `user_is_owner(uuid)` helper + BEFORE trigger that raises `insufficient_privilege` when `role='auditor'` is set on `tenant_invitations` (INSERT/UPDATE) or `tenant_members` (UPDATE) by a non-owner. Service-role (`auth.uid() IS NULL`) bypasses so seeding/admin paths work. No INSERT trigger on `tenant_members` — that path is `accept_invitation()` (SECURITY DEFINER) which copies from an already-gated invite.
- **UI** — `/settings/team` existing-member role dropdown now filters Auditor out for non-owners (matches the invite picker).
- **Tests** — new `auditor_enforcement.test.mjs` covers both Layer 1 (assignment gate) and Layer 2 (zero-write RLS, mig 113). Backend CI is gated on `TESTS_ENABLED=true` + staging secrets (currently skipping); tests will run once the staging project comes back online.

## Open PR — awaiting your review

| PR | Title | Why hold |
|---|---|---|
| **#21** | Q17: shift-based spawn cron + no-mid → opener fallback | Per your walk-out rule: "DO NOT self-merge any Q17 PR." Schema isn't touched (already shipped in mig 102), but cron behavior change is user-visible (employees will see new tasks land on first tick after merge). |

### Q17 audit — what I found before writing any code

You asked me to confirm existing my-tasks surfaces before duplicating. **Outcome: Q17 is ~85% already shipped in prod.** Don't believe BACKLOG.md's pre-audit "Requested" status — that was stale.

| Spec area | Status | Evidence |
|---|---|---|
| Task model + type taxonomy (manual / recurring / auto / shift_based) | **DONE** | Mig 084 (tasks), 102 (types + templates + shift_role + shift_role_fallback) |
| Manual ad-hoc | **DONE** | `/tasks` UI + `createTask`/`updateTask` in `lib/db/tasks.ts` |
| Recurring cadence spawns | **DONE** | `/api/cron/spawn-tasks` runs daily 08:30 UTC |
| Completion UI | **DONE** | `/me/my-tasks-card.tsx` — pending→in_progress→done flip |
| Audit history protections | **DONE** | Mig 096 |
| **Shift-based spawn + no-mid → opener fallback** | **GAP (PR #21 fills)** | `shift_role` + `shift_role_fallback` columns existed but cron filtered `.eq('type', 'recurring')` — never spawned shift_based templates. Dead schema. |
| Template CRUD UI | **GAP (not built)** | Managers can't create templates via UI yet; DB-only. Needs a small surface on `/tasks` or `/settings/checklists`. |
| Checklist grouping | **OPEN QUESTION (not built)** | Your spec said "per-role checklist templates per location." Current schema = 1 template = 1 task. If you want opener checklist = grouped multi-item list, that needs a parent `checklist_templates` row + child task templates. Confirm intent and I'll build. |
| Auto-type triggers | DEFERRED per your spec | Schema has `trigger_kind='low_stock'` placeholder; depends on Q14 |

Outcome: instead of opening 5 duplicate-work PRs, I built the **one** genuine gap (PR #21) and updated `BACKLOG.md` Q17 to reflect the real status.

### What PR #21 ships

Extends `/api/cron/spawn-tasks` to handle `type='shift_based'` templates. For each active shift-based template, per cron tick:

1. Resolves "today" in the template's location's timezone (`locations.timezone`).
2. **Idempotency** — skips if `(template_id, due_date=today)` already exists.
3. Finds today's shift at `template.location_id` with `marker = template.shift_role`.
4. **No-mid → opener fallback** — if no match and `shift_role_fallback` is set, retries with fallback. Tracks fallbacks in run metadata.
5. **Never silently drops** — if still no match, spawns unassigned with `needs_assignment=true` so a manager triages.
6. Sets `due_time = matched_shift.end_time` per your "due before the opener's shift ends" rule.

`cron_runs.result` now carries `shift_based_{spawned,skipped,fallbacks,unassigned}` counts.

### Other still-open PRs

(none — #19 / #17 / #20 all merged this session; #21 is the only one open)

## Captured but NOT built this session

Still queued for future sessions (logged in BACKLOG.md):

- **Q17 follow-up A** — template CRUD UI on `/tasks` or `/settings/checklists`
- **Q17 follow-up B** — checklist-grouping clarification (needs your call)
- **Q19** Resume original filename
- **Q20** Per-location color override + initial-in-dot
- **Q21** VAPID push hardening
- **Q22** Square SaaS Phase 1 OAuth (AUTH-SENSITIVE)
- **Q23** MAP + Vendor MSRP
- **Q24** Bulk-edit grid on /inventory/items
- **Q15+** Unified costing engine
- **Q25** $/transaction chips
- **Q26** Inventory items search bar
- **Q27** Purchasing/Receiving Phase 1
- **Q28** Asset maintenance schedule save bug + mid-add UX
- **Q29** Asset quantity field
- **Q30** Asset cost / due-date / recurrence atoms (bundle with Q28+Q29)
- **Q31** Cash-obligation forecast

## Decisions needed from you

1. **Merge #21** when you've reviewed the cron extension (or push back if you want it landed differently).
2. **Q17 follow-up B — checklist grouping**: do you want opener/mid/closer checklists as today's "1 template = 1 task" (granular tasks), or as a grouped multi-item list under one parent? This is the only Q17 ambiguity left.
3. **Next session priority** — with Q17 ~mostly done after #21 lands, what's next? Default reading is the Q26 search bar (smallest, self-merge OK) followed by Q28 asset-bug or the Q22 Square OAuth setup.

## Backlog counts (post this session)

- **Active**: 0 (after #21 merges)
- **In Review**: PR #21
- **Requested / unbuilt** (next session candidates): 14 items
