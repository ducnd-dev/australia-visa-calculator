#!/usr/bin/env node
/**
 * Weekly beta ritual — gate status + metrics + week focus.
 * Run: npm run beta:weekly
 *      npm run beta:weekly -- --week=2
 */
import { spawnSync } from "child_process";
import { projectRoot } from "./load-env-local.mjs";

const week = Number(process.argv.find((a) => a.startsWith("--week="))?.split("=")[1] ?? "1");

const FOCUS = {
  1: "G2–G9 production gates OR agency #1 if gates done",
  2: "Agency #2 (CRM) + Agency #3 (compare)",
  3: "Agency #4–#5 (billing, Resend domain)",
  4: "Retrospective + Phase 10 decision",
};

console.log(`=== Beta weekly ritual — Week ${week} ===\n`);
console.log(`Focus: ${FOCUS[week] ?? FOCUS[1]}\n`);

spawnSync("npm", ["run", "beta:gate-status"], { stdio: "inherit", shell: true, cwd: projectRoot });
console.log("");
spawnSync("npm", ["run", "beta:metrics"], { stdio: "inherit", shell: true, cwd: projectRoot });

console.log("\n--- Operator ---");
console.log("1. Update docs/BETA-AGENCY-TRACKER.md");
console.log("2. Paste metrics into docs/BETA-LEARNINGS.md Week", week);
if (week === 4) console.log("3. Fill Phase 8 adoption + Phase 10 decision in BETA-LEARNINGS");
