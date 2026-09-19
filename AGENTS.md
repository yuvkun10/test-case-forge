# AGENTS.md

`test-case-forge` is a TypeScript CLI that reads JavaScript or TypeScript function signatures and writes starter Vitest files. The output is a scaffold, not finished tests.

## Setup

Node.js 20 or newer (CI uses 24). No environment variables are required.

```bash
npm install
npm run build
```

## Commands

```bash
npm run lint       # eslint .
npm run typecheck  # tsc -p tsconfig.json --noEmit
npm test           # vitest run
npm run build      # tsc -p tsconfig.json
npm audit --audit-level=moderate
npm outdated
npm exec test-case-forge -- src/math.ts
```

## Project structure

- `src/cli.ts`: entry and flags.
- `src/signatures.ts`: signature extraction.
- `src/generator.ts`, `src/template.ts`: test file generation and templates.
- Tests sit next to the code as `src/*.test.ts`.

Details are in [docs/architecture.md](docs/architecture.md).

## Conventions

- TypeScript `strict`. ESLint recommended JavaScript rules and the `typescript-eslint` `strict` set.
- No formatter or commit convention is enforced. Do not add attribution trailers.

## Testing

Before a PR run lint, typecheck, test, build, `npm audit --audit-level=moderate` and `npm outdated`. CI runs the same.

## Safety

- Never commit `.env` files or secrets.

## More

- [docs/README.md](docs/README.md): docs index
- [docs/configuration.md](docs/configuration.md): CLI flags
- [docs/operations.md](docs/operations.md): security, privacy and dependency maintenance
