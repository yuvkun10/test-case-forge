# Operations

## Security and privacy

- Source analysis runs locally. The CLI does not upload source code or generated tests.
- Generated test files may contain function names, import paths, and parameter names from your codebase. Review output before committing.
- Do not place secrets in source files, generated tests, commit history, or README examples.
- Keep `.env` local. Commit only `.env.example` with placeholder or non-sensitive values.
- Dependency hygiene is checked with `npm audit --audit-level=moderate`, `npm outdated`, Dependabot for npm, and Dependabot for GitHub Actions.

## Dependency maintenance

The project uses:

- `npm audit --audit-level=moderate` to fail on moderate-or-higher known vulnerabilities.
- `npm outdated` to surface dependency drift. It exits with a non-zero status when direct dependencies are behind the registry. That is intentional for dependency hygiene checks.
- Dependabot weekly updates for npm packages and GitHub Actions ([.github/dependabot.yml](../.github/dependabot.yml)).
- CI checks for install, audit, outdated dependencies, lint, typecheck, tests, and build ([.github/workflows/ci.yml](../.github/workflows/ci.yml)).
