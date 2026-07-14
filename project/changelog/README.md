# Changelog System

This directory contains organized changelog entries (one file per change) and completed plan documents. **Newest entries are listed first** in `index.md`. One index covers both change entries and archived plans (Type=plan).

## Directory Structure

- `added/` — New features and capabilities
- `changed/` — Changes in existing behavior or APIs
- `fixed/` — Bug fixes
- `improved/` — Performance, UX, or DX improvements
- `docs/` — Documentation-only changes
- `refactor/` — Code refactoring
- `config/` — Configuration, tooling, or environment changes
- `plans/` — Plans archived here only when explicitly requested
- `index.md` — Chronological index of all entries

## File Naming Convention

Use `<yyyy-mm-dd>-<type>-<short-title>.md`, for example `2026-07-14-docs-project-setup.md`.

## Entry Template

```markdown
# <Short Title>
**Date:** <YYYY-MM-DD>
**Type:** <added|changed|fixed|improved|docs|refactor|config>

---

## Summary
- One or two sentences describing the change.

## Scope (optional)
- Component, area, or ticket reference if relevant.
```

Add a row at the top of `index.md` whenever you add an entry or file a completed plan.
