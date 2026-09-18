# Audience and use cases

`test-case-forge` is a small CLI for developers who want fast, editable test scaffolds
instead of blank files.

## Who it is for

- Application developers adding first-pass unit tests to existing modules.
- Maintainers who want consistent Vitest starter files across a codebase.
- Teams modernizing JavaScript or TypeScript projects and looking for obvious test coverage gaps.
- Educators, reviewers, and onboarding leads who want examples of how exported functions can be exercised.

## Real-world use cases

- Bootstrap tests for a utility module before replacing placeholders with real assertions.
- Preview the shape of generated tests during code review without writing files.
- Create adjacent `*.test.ts` files for exported functions in a refactor branch.
- Include non-exported top-level helpers as skipped suites so teams can decide whether to export, delete, or test through public behavior.
- Standardize Vitest file layout before adding richer fixtures, mocks, and edge cases.
