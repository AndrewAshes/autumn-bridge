#!/usr/bin/env node
// Autumn Bridge — one-command update helper.
// Reads ccode-to-app.md, snapshots it to log/<UTC timestamp>.md, commits both, pushes to main.
// No external dependencies — Node built-ins only.  Run:  node scripts/bridge.mjs

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const handoffPath = join(repoRoot, "ccode-to-app.md");
const logDir = join(repoRoot, "log");

const git = (...args) =>
  execFileSync("git", ["-C", repoRoot, ...args], { encoding: "utf8" }).trim();

// UTC timestamps: ISO for the commit message, compact (sortable, collision-resistant) for the filename.
const now = new Date();
const iso = now.toISOString().replace(/\.\d{3}Z$/, "Z"); // e.g. 2026-06-14T16:53:16Z
// Compact, sortable, collision-resistant filename stamp, e.g. 2026-06-14-165316Z
const p = (n) => String(n).padStart(2, "0");
const fileStamp =
  `${now.getUTCFullYear()}-${p(now.getUTCMonth() + 1)}-${p(now.getUTCDate())}` +
  `-${p(now.getUTCHours())}${p(now.getUTCMinutes())}${p(now.getUTCSeconds())}Z`;

// (a) read the live handoff file
let handoff;
try {
  handoff = readFileSync(handoffPath, "utf8");
} catch {
  console.error(`✗ Cannot read ${handoffPath} — nothing to publish.`);
  process.exit(1);
}

// (b) snapshot it into log/
mkdirSync(logDir, { recursive: true });
const snapshotPath = join(logDir, `${fileStamp}.md`);
writeFileSync(snapshotPath, handoff);

// (c) stage + commit both files
git("add", "ccode-to-app.md", `log/${fileStamp}.md`);
try {
  git("commit", "-m", `bridge: ${iso}`);
} catch (e) {
  console.error("✗ git commit failed:\n" + (e.stdout || e.message));
  process.exit(1);
}

// (d) push current branch to origin
let pushOut;
try {
  pushOut = execFileSync("git", ["-C", repoRoot, "push", "origin", "HEAD"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
} catch (e) {
  console.error("✗ git push failed:\n" + (e.stderr || e.stdout || e.message));
  process.exit(1);
}

// confirmation + raw URL for the live handoff file
let rawUrl = "";
try {
  const remote = git("remote", "get-url", "origin");
  const m = remote.match(/github\.com[:/](.+?)(?:\.git)?$/);
  if (m) rawUrl = `https://raw.githubusercontent.com/${m[1]}/main/ccode-to-app.md`;
} catch {}

console.log(`✓ Bridge updated and pushed.`);
console.log(`  snapshot: log/${fileStamp}.md`);
console.log(`  commit:   bridge: ${iso}`);
if (rawUrl) console.log(`  live:     ${rawUrl}`);
