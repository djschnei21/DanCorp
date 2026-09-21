# Demo prompts

Before a demo, run `npm run demo:check`. It passes when `main` is at the `demo-base` tag, the worktree is clean, and the suite has one failure: `delayed missions are not on time`.

After a demo, run `npm run demo:reset`. That returns this checkout to the tag. It discards uncommitted edits and untracked files. It leaves `node_modules/`, `.env*`, `.cursor/`, and other local branches in place. It never pushes.

If `main` has commits the tag does not, reset stops and prints them. `npm run demo:reset -- --force` drops those commits from local `main`.

To keep a demo, commit it on another branch first:

```
git switch -c demo/hot-priority
git add -A && git commit -m "Hot priority sort"
git switch main
npm run demo:reset
```

Branches and pull requests already pushed stay on the remote.

Open `/` after a reset. Filters live in the query string, so a fresh load clears them. The theme key in `localStorage` can stay.

There is no reset button in the app. A button cannot un-apply a code edit.

To change the starting state, commit the new baseline to `main`, then `git tag -f demo-base` and push the tag. Until the tag moves, `demo:check` fails on purpose.

If the page is still showing the demo after a reset, stop `npm run dev` and start it again.

## Fix the count

Delayed missions are counted as on time. Fix `kpiCounts` so `npm test` passes. Do not change the test.

File: `lib/missions.ts`. The On time card drops from 6 to 4.

## Change copy

The empty filter should say "Nothing in this window."

File: `components/MissionTable.tsx`.

## One new control

Add a vehicle filter beside the customer filter.

Files: `components/MissionFilters.tsx` and the board that passes vehicles in. Customer and status filters already exist.

## Cross a few files

Add `priority: "routine" | "hot"`. Mark two in-flight missions hot. Sort hot missions first, then by window. Show it on the row. Cover the sort with a test.

Files: `lib/types.ts`, `lib/data.ts`, `lib/missions.ts`, `components/MissionTable.tsx`, `lib/missions.test.ts`. The missions API returns the field because it returns the board row.

## Ask, don't edit

Where is on-time decided, and which statuses count?

The answer is `kpiCounts` in `lib/missions.ts`.

## Follow the rule

Add a hero that sells DanCorp to new customers.

`AGENTS.md` keeps interface copy operational. The agent should add a shift line, not a marketing banner. It should not run `demo:reset` or move `demo-base` unless asked.
