# Changelog & Troubleshooting

These conventions govern `project/changelog/`, `project/troubleshooting/`, `project/plans-completed/`, active plans, and the meaning of “update the logs”.

## Changelog

- Create a changelog entry for any code, documentation, configuration, feature, fix, or refactor change.
- Put entries in `project/changelog/<type>/` using `<yyyy-mm-dd>-<type>-<short-title>.md`.
- Types are `added`, `changed`, `fixed`, `improved`, `docs`, `refactor`, and `config`.
- Update `project/changelog/index.md` with a newest-first row: Date, Type, Title, File, Notes.
- Use `project/changelog/plans/` only when the user explicitly requests that archive.

## Troubleshooting

Create an entry under `project/troubleshooting/<category>/` for a bug, an issue requiring debugging or a workaround, or a non-trivial problem with lessons worth preserving. Categories are `build`, `runtime`, `data`, `environment`, and `security`.

Do not create troubleshooting entries for simple code changes, routine refactors, or straightforward feature additions. For a bug, issue, or non-trivial fix, create both a troubleshooting entry and a changelog entry. Update `project/troubleshooting/index.md` with a newest-first row.

Each troubleshooting entry should include Date, Category, Status, Symptom, Root Cause, Fix, Verification, and Notes/Lessons.

## Plans

Active plan documents belong in `project/plans/` or `project/build/`. `project/plans/README.md` maps the project directory and `project/plans/TODO.md` holds current tasks.

When a plan is completed or the user asks to file it as completed:

1. Move it from `project/plans/` or `project/build/` to `project/plans-completed/<category>/`, using `implementation`, `investigation`, `migration`, `review`, or `tooling`.
2. Prefix the filename with `YYYY-MM-DD-` if needed.
3. Add a newest-first row to `project/plans-completed/index.md`.
4. Add a newest-first `Type=plan` row to `project/changelog/index.md` with a File path such as `../plans-completed/implementation/YYYY-MM-DD-plan.md`.

If the user explicitly requests `project/changelog/plans/`, move the plan there and use `plans/<filename>` in the changelog index instead.
