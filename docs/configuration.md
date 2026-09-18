# Configuration

No environment variables are required to use `test-case-forge`.

The repository includes [`.env.example`](../.env.example) only as a safe placeholder for
future wrapper scripts or local automation. Put machine-specific values in `.env`; `.env`
and `.env.*` are ignored by git, while `.env.example` stays safe to commit.

## CLI flags

CLI configuration is passed through command flags:

- `<source>`: source file to inspect.
- `--write`: write the generated file instead of previewing it.
- `--output <path>`: choose a custom output path.
- `--all`: include non-exported top-level helper functions as skipped suites.
