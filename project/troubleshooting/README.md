# Troubleshooting System

This directory contains organized troubleshooting entries for issues encountered during development.

## Directory Structure

- `build/` — Build and test issues
- `runtime/` — In-browser or runtime bugs
- `data/` — Data, migrations, and persistence issues
- `environment/` — Local setup, Node, environment, permissions, and OS issues
- `security/` — Security advisories and patches
- `index.md` — Chronological index of all entries

## File Naming Convention

Use `<yyyy-mm-dd>-<category>-<short-title>.md`, for example `2026-07-14-build-failing-typecheck.md`.

## Entry Template

```markdown
# <Short Title>
**Date:** <YYYY-MM-DD>  
**Category:** <build|runtime|data|environment|security>  
**Status:** <RESOLVED|OPEN|WORKAROUND>

---

## Symptom
- What you observed: errors, logs, screenshots, or failing commands.

## Root Cause
- What was actually wrong.

## Fix
- Steps taken to resolve it.

## Verification
- How the fix was proven.

## Notes / Lessons
- Takeaways for future work.
```

Add a row at the top of `index.md` whenever you add an entry.

## For AI Agents

“Update the logs” means update the relevant changelog and, when the work involved a bug, debugging, workaround, or non-trivial problem, add a troubleshooting entry too. Simple code changes, routine refactors, and straightforward feature additions need a changelog entry only.

When filing a completed plan, move it to `project/plans-completed/<category>/`, update that index, and add a `Type=plan` row to `project/changelog/index.md`. See `docs-project/agents/changelog-and-troubleshooting.md` for the full conventions.
