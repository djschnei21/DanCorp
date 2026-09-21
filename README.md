# DanCorp Dispatch

`npm test` is red on purpose. Delayed missions are counted as on time. Fix `kpiCounts` in `lib/missions.ts`. Do not change the expected count.

The suite should show one failure: `delayed missions are not on time`. Every other test passes. On time on the dispatch board reads 6 until that function counts delivered missions only.

DanCorp Dispatch is the duty console for one UTC shift, 21 Sep 2026. Low Earth orbit, same shift.

## Run

```
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

`/?status=delayed&customer=helios-bio` opens those filters. Scrubbed plus Brine Works is an empty board: "Nothing in this window."

## Reset a demo

The starting state is the git tag `demo-base`. `npm run demo:check` is the preflight. `npm run demo:reset` returns this checkout to that tag.

Reset discards uncommitted work. It does not push, and it does not delete other branches or anything already on the remote. If `main` has commits the tag does not, reset stops until you pass `--force`.

To keep what you just built, commit it on another branch, switch back to `main`, then reset. Prompts and the keep-or-discard steps are in [docs/demo-prompts.md](docs/demo-prompts.md).

`demo:check` expects the current branch to be `main` at `demo-base`. After a merge moves `main`, point the tag at the new baseline and push it:

```
git tag -f demo-base
git push origin demo-base
```
