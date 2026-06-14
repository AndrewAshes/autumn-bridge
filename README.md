# Autumn Bridge

A lightweight, git-backed handoff channel between the **Claude app** (where Andrew works) and **CCode** (Claude Code, the build agent). CCode publishes its status, blockers, and questions to [`ccode-to-app.md`](ccode-to-app.md) at the end of each session; the app pulls that file on demand to give strategic guidance. The flow is one-way by design — app→CCode stays manual (Andrew pastes prompts), so there is no write path from the app side.

> **HARD RULE — this repo is PUBLIC.** It holds **only** dev-handoff text. **Never** commit secrets, API keys, `.env` values, tokens, customer PII, or personnel/legal content here. If it shouldn't be on a billboard, it doesn't go in this repo.
