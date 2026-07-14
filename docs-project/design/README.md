# Design

## Overview
Synced's UI is built with Tailwind v4, Radix UI primitives, and colocated feature components. Reusable controls follow a shadcn-style pattern with `cva` for variants and `tailwind-merge` for class deduplication.

## Current State
The design system is implicit: semantic CSS variables, utility classes, and feature-specific components define the visual language. This folder captures the patterns already present in the codebase.

## Key Documents
- [UI/UX Specifications](./ui-ux-specifications.md) — Component library, tokens, interaction patterns, and layout rules

## See Also
- [Code Modules](../code/modules.md) — Component module organization
- [File Map](../architecture/file-map.md) — Component file locations
