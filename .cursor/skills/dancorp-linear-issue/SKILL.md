---
name: dancorp-linear-issue
description: >
  Create or rewrite a DanCorp Linear issue in the DanCorp team (key prefix DC).
  Use when creating a DanCorp Linear task, rewriting a DanCorp Linear issue,
  or filing Linear work for DanCorp dispatch. One issue, one outcome.
---

# DanCorp Linear issue

Create or rewrite one DanCorp Linear issue. The team is DanCorp. Issue keys use the prefix `DC`.

## Connection

Read the Linear `save_issue` schema, then call it.

When Linear is connected, file the issue with `save_issue`. Pass `team` as `DanCorp`.

When Linear is not connected (the Linear tools are missing, they need auth, or `save_issue` fails because Linear is not connected), write the issue body and stop. Say Linear is not connected. Do not invent an issue key.

Create:

- `team`: `DanCorp`
- `title`: the outcome
- `description`: the body, as markdown with literal newlines
- Omit `id`

Rewrite:

- `id`: the existing key, such as `DC-12`
- Replace `title` and `description`
- Keep one outcome. Do not open a second issue for the same outcome

Leave assignee, priority, project, labels, cycle, and delegate unset unless the request sets them.

## Ask first

Do not invent product scope. If the request is missing the outcome, the surface, or how to tell it is done, ask before creating the issue.

- Outcome: what is true after the change. The title is that outcome, not a status. `Make top-bar clock slightly bigger` is a title. `Clock work in progress` is not.
- Surface: the screen, component, file, or token. Name it when you have read it. If it is not known, ask.
- Done: at least one check that is true or false.

One issue, one outcome. A second issue is only for a second outcome the request names.

Do not set server-side or account sync unless the request says so. Do not expand past the named surface. If a stored preference is required and the request does not say where it lives, ask. Do not pick server sync to fill the gap.

## Body

Use these sections, in this order. Include only the sections the change needs. Omit an empty section.

### Goal

What changes, and the file or surface when it is known.

### Decisions

Choices already made: defaults, persistence, scope, audience. State each choice in a line. Persistence is a decision only when the request makes one.

### Constraints

What must stay the same: behavior, tokens, copy, and nearby controls.

### Acceptance criteria

Testable checks. Each item is true or false. Use `- [ ]` lines. Name the file, token, size, or count when the request or the code gives one.

### Out of scope

What this issue does not change. Nearby screens, timestamps, and tokens stay out unless the request names them.

### Done when

For a code change, include:

- A pull request is open against `main`.
- The pull request body links this Linear issue.
- Do not merge unless this issue says to.

## Tone and files

Match DC-2, DC-3, and DC-4: specific, file-level when possible. No slogans. No exclamation points.

DanCorp interface copy and issue text stay operational: times, counts, and statuses.

Read `AGENTS.md` before naming a file. Open the file and quote the current token or class. Do not invent a path.

- Status rules: `data/day.json`. `lib/shift.ts` resolves them onto the current Eastern day.
- Counts: `lib/missions.ts`. Components render them.
- Theme tokens: `app/globals.css` (`--bg`, `--fg`, `--accent`, `--card` through `--card-04`, `--muted`, `--glow`). Dark `--bg` is set on both `.dark` and `prefers-color-scheme: dark`.

Repo limits, unless the request says otherwise:

- Do not add auth, a database, or outbound network calls.
- A new API route gets a Vitest.
- Do not run `npm run demo:reset` or move the `demo-base` tag unless Dan asks.

## Shape

This is the issue shape, taken from DC-3. It is not a new issue to file.

Title: `Make top-bar clock slightly bigger`

```markdown
## Goal

Increase the sticky top-bar clock from `text-[11px]` to `text-[13px]` in `components/AppShell.tsx`.

## Decisions

- Target size: `text-[13px]`.
- Persistence: none. The size is in code.
- Scope: top-bar clock only.
- Audience: all dispatch users.

## Constraints

- Keep `font-mono`, `tabular-nums`, and `text-muted`.
- Local/UTC toggle behavior stays as shipped.
- Light and dark stay readable.

## Acceptance criteria

- [ ] Clock font size is `13px` (`text-[13px]`), changed from `11px`.
- [ ] Clock keeps mono, tabular nums, and muted styling.
- [ ] On desktop width ≥860px, the clock stays on the header row.

## Out of scope

- Other timestamps.
- User-configurable clock size.
- Server-side or account sync.

## Done when

- A pull request is open against `main`.
- The pull request body links this Linear issue.
- Do not merge unless this issue says to.
```
