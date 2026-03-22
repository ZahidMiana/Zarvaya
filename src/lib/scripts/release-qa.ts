import { spawnSync } from "child_process";

type Step = {
  label: string;
  command: string;
  args: string[];
  optional?: boolean;
};

function runStep(step: Step): { ok: boolean; skipped: boolean } {
  if (step.optional && process.env.SKIP_DATA_READINESS === "1") {
    console.log(`SKIP: ${step.label} (SKIP_DATA_READINESS=1)`);
    return { ok: true, skipped: true };
  }

  console.log(`RUN: ${step.label}`);
  const result = spawnSync(step.command, step.args, { stdio: "inherit", env: process.env });
  const ok = result.status === 0;

  if (!ok) {
    console.error(`FAIL: ${step.label}`);
    return { ok: false, skipped: false };
  }

  console.log(`PASS: ${step.label}`);
  return { ok: true, skipped: false };
}

function main(): void {
  const steps: Step[] = [
    { label: "Lint", command: "npm", args: ["run", "lint"] },
    { label: "Build", command: "npm", args: ["run", "build"] },
    { label: "Data Readiness", command: "npm", args: ["run", "data:readiness"], optional: true },
  ];

  for (const step of steps) {
    const result = runStep(step);
    if (!result.ok) {
      process.exit(1);
    }
  }

  console.log("Release QA checks completed successfully.");
  process.exit(0);
}

main();
