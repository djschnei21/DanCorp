# DanCorp Dispatch

Internal duty console for one UTC shift. Interface copy is operational: times, counts, and statuses. No slogans and no exclamation points.

Status rules and counts live in `lib/missions.ts`. Components render them.

Do not add auth, a database, or outbound network calls. New API routes get a Vitest.

Do not run `npm run demo:reset` or move the `demo-base` tag unless Dan asks.
