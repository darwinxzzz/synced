# Tracked Repositories

This project contains multiple independent Git repositories. The main repository and the local Workflow-Scripts repository must be synchronized separately.

| # | Name | Directory | Remote URL | Branch | Purpose |
|---|------|-----------|------------|--------|---------|
| 1 | Synced | `.` (project root) | `https://github.com/darwinxzzz/synced` | `main` | Primary Next.js application |
| 2 | Workflow-Scripts | `Workflow-Scripts/` | `https://github.com/Rebooted-Dev/Workflow-Scripts.git` | `v1.7` | Shared workflow documentation |

`Workflow-Scripts/` is a separate repository and is ignored by the main repository.

## Pull and push

Run Git commands from the repository they affect. Pull before starting work and push after meaningful changes.

### Main repository

```bash
cd "/Volumes/Skynet/Software Development Projects/Personal/synced/synced"
git status
git pull
git add .
git commit -m "feat: describe the change"
git push
```

### Workflow-Scripts repository

```bash
cd "/Volumes/Skynet/Software Development Projects/Personal/synced/synced/Workflow-Scripts"
git status
git pull
git add .
git commit -m "docs: describe the workflow change"
git push
```

Pushing from the project root does not push Workflow-Scripts. Changes to one repository do not automatically sync to the other.
