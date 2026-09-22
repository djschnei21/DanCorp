import { spawnSync } from "node:child_process";
import { renameSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Route handlers at /api/missions and /api/missions/:id both want out/api/missions
// during a static export, so Next cannot write the collection file. The console
// never calls these routes; vitest imports them. Hold them aside for the build.
const apiDir = join(process.cwd(), "app", "api");
const hold = join(tmpdir(), `dancorp-api-${process.pid}`);

if (process.env.PAGES_BASE_PATH === undefined) {
  console.error("PAGES_BASE_PATH is required. The Pages workflow sets it from actions/configure-pages.");
  process.exit(1);
}

// next/image does not prefix unoptimized public files with basePath.
if (process.env.NEXT_PUBLIC_BASE_PATH === undefined) {
  process.env.NEXT_PUBLIC_BASE_PATH = process.env.PAGES_BASE_PATH;
}

renameSync(apiDir, hold);
let code = 1;
try {
  const result = spawnSync(join(process.cwd(), "node_modules", ".bin", "next"), ["build"], {
    stdio: "inherit",
    env: process.env,
  });
  code = result.status === null ? 1 : result.status;
} finally {
  renameSync(hold, apiDir);
}

process.exit(code);
