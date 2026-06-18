# CCode → App Handoff
Updated: 2026-06-18T18:30:00Z
Atlas prod: https://atlas.obelisque.io
Atlas main HEAD: f9cd5d2 (last merged — SS183 PR #19 pending CI)
Authoritative backlog: `web/docs/BACKLOG.md` (LIVE)

## This session — sticky TO chips + auditor-role audit

### PR #19 — SS183: pin TO chips with sticky header on /schedule
Branch: `chips-sticky-with-header`. Status: open, Vercel preview live (pass), build/typecheck/lint check still in flight; will self-merge on green per standing rules.

What changed:
- Sticky-top wrapper on `/schedule` extended to enclose the conflict banner + `TimeOffWarningPanel`. The This-week / Upcoming / Pending chips now pin with the header instead of scrolling away.
- DOM order preserved (header → conflict banner → TO panel), only the wrapper's closing tag moved.
- Same `z-30` + `bg-[#0d0f14]` so the matrix doesn't ghost through and the modal (`z-50`) still floats above.
- Expanded chip drops downward inside the pinned region (grows the pinned area, doesn't escape it) — confirmed via DOM, needs Andrew's visual on preview.

Page-bg CSS var: `globals.css` has `--background` (body-color, `#ffffff` / `#0a0a0a`) but no `--page-bg` matching the app's `#0d0f14` chrome. Left the hex and flagged in the inline comment for a follow-up token introduction so per-tenant theming can drive all the `bg-[#0d0f14]` usages from one place.

### Auditor role — no code change needed

Auditor IS assignable through the UI today. Two paths, both gated owner-only:

| Path | Where | Control |
|---|---|---|
| **New member** | Settings → Team → **"+ Invite teammate"** | Role list includes **"Auditor (read-only)"** — filtered out of the radio group for non-owners via `ROLES.filter((r) => !r.ownerOnly || inviterRole === 'owner')` ([team-client.tsx:476](web/src/app/(app)/settings/team/team-client.tsx#L476)) |
| **Existing member** | Settings → Team → **Active members table** → Role `<select>` next to the member | Includes **"Auditor (read-only)"**; non-owner picking it gets a blocking `alert("Only an owner can assign the Auditor role.")` ([team-client.tsx:87](web/src/app/(app)/settings/team/team-client.tsx#L87)) |

RLS guarantee re-verified: mig 113 ([web/db/113_auditor_role.sql](web/db/113_auditor_role.sql)) adds **SELECT-only** policies for auditor on every tenant-scoped table via `user_is_auditor(tenant_id)`. No write policy ever matches `role='auditor'` — the database denies the write even if an app-side check is missed.

Minor cosmetic note (not blocking): the existing-member dropdown shows "Auditor" to non-owners (alert fires if selected), whereas the invite picker filters it out entirely. Could be tightened to filter in both places — flagging as a small consistency win, not built.

## Decisions needed from Andrew

1. Merge **#17** (docs-only catch-up)
2. Merge **#19** when CI green (sticky-TO chips — already self-merge-authorized; named here so it's visible).
3. **Next-session priority** — Q17 task model still elevated as THE PRIORITY ahead of quick wins. Re-confirm before next session.
4. **Q28 asset bug** — high-confidence root cause (tenant_id RLS, mig 122 template). When do you want it fixed?
5. **Q22 Square OAuth** — when ready, register the Atlas Square app + set env vars first.

## Backlog counts
- **Active**: 0 in code (ACT2/ACT3 status varies — verify against BACKLOG.md on next read)
- **In Review**: #17, #19
- **Captured but unbuilt** (next-session candidates): Q17, Q19, Q20, Q21, Q23-Q31, Q15+
