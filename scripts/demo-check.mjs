import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

export const KNOWN_FAILURE = "delayed missions are not on time";

export function evaluateReport(report) {
  const assertions = [];
  for (const file of report?.testResults ?? []) {
    for (const assertion of file.assertionResults ?? []) {
      assertions.push(assertion);
    }
  }
  const failed = assertions.filter((item) => item.status === "failed");
  const passed = assertions.filter((item) => item.status === "passed");
  const ok =
    failed.length === 1 &&
    failed[0].title === KNOWN_FAILURE &&
    passed.length > 0 &&
    passed.length + failed.length === assertions.length;
  return {
    ok,
    failed: failed.map((item) => item.title),
    passed: passed.length,
    total: assertions.length,
  };
}

function git(args) {
  const result = spawnSync("git", args, { encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error((result.stderr || result.stdout || "git failed").trim());
  }
  return (result.stdout || "").trim();
}

function fail(message) {
  console.error(message);
  return 1;
}

export function checkGitBaseline() {
  let tag;
  try {
    tag = git(["rev-parse", "demo-base^{commit}"]);
  } catch {
    return fail("demo-base is not in this clone. Fetch it with: git fetch origin tag demo-base");
  }

  const branch = git(["branch", "--show-current"]);
  if (branch !== "main") {
    return fail(`Not on main (on ${branch || "a detached HEAD"}).`);
  }

  const head = git(["rev-parse", "HEAD"]);
  if (head !== tag) {
    return fail(`HEAD ${head.slice(0, 7)} is not demo-base ${tag.slice(0, 7)}.`);
  }

  const status = git(["status", "--porcelain"]);
  if (status) {
    return fail(`Worktree is dirty.\n${status}`);
  }

  return 0;
}

function runSuite() {
  const directory = mkdtempSync(join(tmpdir(), "dancorp-vitest-"));
  const output = join(directory, "results.json");
  const vitest = join(process.cwd(), "node_modules", "vitest", "vitest.mjs");
  const result = spawnSync(process.execPath, [vitest, "run", "--reporter=json", `--outputFile=${output}`], {
    encoding: "utf8",
  });
  let report;
  try {
    report = JSON.parse(readFileSync(output, "utf8"));
  } catch {
    rmSync(directory, { recursive: true, force: true });
    console.error(result.stdout);
    console.error(result.stderr);
    console.error("Vitest did not write a JSON report.");
    return 1;
  }
  rmSync(directory, { recursive: true, force: true });
  const summary = evaluateReport(report);
  if (!summary.ok) {
    const failed = summary.failed.length > 0 ? summary.failed.join(", ") : "none";
    console.error(
      `Expected one failure (${KNOWN_FAILURE}). Failed: ${failed}. Passed ${summary.passed} of ${summary.total}.`,
    );
    return 1;
  }
  console.log(`Baseline is ready. One known failure: ${KNOWN_FAILURE}.`);
  return 0;
}

export function checkDemoBaseline() {
  const root = git(["rev-parse", "--show-toplevel"]);
  process.chdir(root);
  const gitStatus = checkGitBaseline();
  if (gitStatus !== 0) {
    return gitStatus;
  }
  return runSuite();
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(checkDemoBaseline());
}
