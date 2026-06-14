# Schema: `ccode-to-app.md`

This is the canonical format for the live handoff file. CCode overwrites `ccode-to-app.md` each session; the helper script snapshots the previous-and-new state into `log/<UTC timestamp>.md`. Keep sections in this order. Omit a section's bullets if empty, but keep the heading so the app can rely on the shape.

## Template

```markdown
# CCode → App Handoff
Updated: <ISO 8601 UTC>
Branch/PR: <current>

## Completed this session
- <item> — [LIVE IN PROD | BUILT LOCALLY] (PR #__)

## Status snapshot
- <feature>: <state>

## Blockers
- <what's stuck + what would unblock it>

## Decisions needed from Andrew
- <each framed as yes/no or A/B>

## Notes for the app
- <context the app needs to give good strategic guidance>
```

## Field rules

- **Updated** — ISO 8601 in UTC, e.g. `2026-06-14T14:30:00Z`. Always the real time of the push.
- **Branch/PR** — the Atlas branch and/or open PR the session worked on. `main` if working directly on main.
- **Completed this session** — only things actually finished this session. Each item **must** carry a label:
  - `[LIVE IN PROD]` — merged and deployed; Andrew can use it now.
  - `[BUILT LOCALLY]` — code exists / PR open, not yet deployed.
  - Include the PR number when one exists (`PR #123`); use `PR #__` only as an unfilled placeholder.
- **Status snapshot** — current state of in-flight features, one line each. Descriptive state, not a label.
- **Blockers** — what is stuck *and* what would unblock it. No blocker → write `- None`.
- **Decisions needed from Andrew** — each phrased as a yes/no or A/B so the app can answer crisply. None → write `- None`.
- **Notes for the app** — strategic context the app can't infer from the code: tradeoffs taken, things deferred, why a path was chosen.

## Hard rule (repeated because it's public)

Dev-handoff text only. No secrets, keys, `.env` values, tokens, customer PII, or personnel/legal content. Ever.
