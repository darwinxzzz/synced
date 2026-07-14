# Coding Standards

- Use strict TypeScript, two-space indentation, double-quoted strings, and Prettier formatting with Tailwind class sorting.
- Prefer `~/` imports for `src` paths.
- Use `PascalCase` for React components and `camelCase` for functions and variables.
- Use kebab-case route directories.
- Keep tRPC routers thin; place shared domain logic in services.
- Validate tRPC inputs with Zod.
- Keep secrets out of source control and browser bundles.
