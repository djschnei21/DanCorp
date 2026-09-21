import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { checkDemoBaseline } from "./demo-check.mjs";

function git(args) {
  const result = spawnSync("git", args, { encoding: "utf8" });
  if (result.status !== 0) {
    const message = (result.stderr || result.stdout || "git failed").trim();
    const error = new Error(message);
    error.status = result.status ?? 1;
    throw error;
  }
  return (result.stdout || "").trim();
}

function main() {
  const force = process.argv.includes("--force");
  const root = git(["rev-parse", "--show-toplevel"]);
  process.chdir(root);

  try {
    git(["rev-parse", "--verify", "demo-base"]);
  } catch {
    console.error("demo-base is not in this clone. Fetch it with: git fetch origin tag demo-base");
    process.exit(1);
  }

  // Check this before `switch -f`. That switch discards the worktree, and the
  // abort has to happen while the demo edits are still on disk.
  const ahead = git(["rev-list", "--count", "demo-base..main"]);
  if (ahead !== "0") {
    const log = git(["log", "--oneline", "demo-base..main"]);
    if (!force) {
      console.error("main has commits that demo-base does not:");
      console.error(log);
      console.error("Re-run with --force to drop those commits from local main. This script never pushes.");
      process.exit(2);
    }
    console.log("Dropping commits from local main:");
    console.log(log);
  }

  const branch = git(["branch", "--show-current"]);
  if (branch && branch !== "main") {
    console.log(`Leaving ${branch}. Its commits stay on that branch.`);
  }

  const status = git(["status", "--porcelain"]);
  if (status) {
    console.log("Discarding worktree changes:");
    console.log(status);
  }

  git(["switch", "-f", "main"]);
  git(["reset", "--hard", "demo-base"]);
  git(["clean", "-fd", "-e", "node_modules", "-e", ".cursor", "-e", ".env*"]);
  rmSync(".next", { recursive: true, force: true });

  if (!lockfileMatches()) {
    console.log("Installing dependencies.");
    const install = spawnSync("npm", ["install"], { stdio: "inherit" });
    if (install.status !== 0) {
      process.exit(install.status ?? 1);
    }
  }

  const subject = git(["log", "-1", "--format=%h %s", "demo-base"]);
  console.log(`Reset to ${subject}`);
  process.exit(checkDemoBaseline());
}

function lockfileMatches() {
  const installedPath = "node_modules/.package-lock.json";
  if (!existsSync("package-lock.json") || !existsSync(installedPath)) {
    return false;
  }
  try {
    const lock = JSON.parse(readFileSync("package-lock.json", "utf8"));
    const installed = JSON.parse(readFileSync(installedPath, "utf8"));
    const expected = lock.packages ?? {};
    const present = installed.packages ?? {};
    for (const [name, meta] of Object.entries(present)) {
      const wanted = expected[name];
      if (!wanted || wanted.version !== meta.version) {
        return false;
      }
    }
    for (const [name, meta] of Object.entries(expected)) {
      if (name === "" || meta.optional) {
        continue;
      }
      if (!present[name] || present[name].version !== meta.version) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
