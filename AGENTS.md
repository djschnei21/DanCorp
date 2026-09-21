# DanCorp Dispatch

Internal duty console for one UTC shift. Interface copy is operational: times, counts, and statuses. No slogans and no exclamation points.

Status rules and counts live in `lib/missions.ts`. Components render them.

Do not add auth, a database, or outbound network calls. New API routes get a Vitest.

Do not run `npm run demo:reset` or move the `demo-base` tag unless Dan asks.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
