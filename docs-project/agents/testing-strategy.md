# Testing Strategy

- Name tests `*.test.ts` or `*.test.tsx`.
- Group cases with `describe` and use behavior-focused `it` descriptions.
- Add unit coverage for pure logic and components.
- Add integration coverage for router authorization and validation.
- Add Playwright coverage for critical member and admin flows.
- Add a regression test when fixing a bug if it fits the behavior and test level.
- No repository-wide coverage threshold is configured.
