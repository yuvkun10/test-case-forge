# test-case-forge

Generate starter Vitest unit test files from JavaScript and TypeScript function
signatures. The CLI reads a source file, finds supported function signatures, and prints
or writes a Vitest file with imports, suites, placeholder arguments and async-aware
calls. Version 0.1.0; the output is a scaffold you edit, not finished tests.

## Installation

Requires Node.js 20 or newer (CI runs Node.js 24). No environment variables are required.

```bash
npm install
npm run build
```

## Usage

```bash
npm exec test-case-forge -- src/math.ts                  # preview on stdout
npm exec test-case-forge -- src/math.ts --write          # write src/math.test.ts
npm exec test-case-forge -- src/math.ts --write --output tests/math.test.ts
npm exec test-case-forge -- src/math.ts --all            # include non-exported helpers as skipped suites
```

Daily commands:

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm audit --audit-level=moderate
npm outdated
```

Flags are listed in [docs/configuration.md](docs/configuration.md). There is no npm
publish workflow in this repository.

## Project structure

```text
├── src
│   ├── cli.ts
│   ├── generator.ts
│   ├── signatures.ts
│   ├── template.ts
│   └── *.test.ts
├── docs
│   ├── architecture.md
│   └── archive
├── eslint.config.js
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

How the pieces fit together: [docs/architecture.md](docs/architecture.md).

## Coding style

ESLint runs the recommended JavaScript rules and the typescript-eslint `strict` set
(`eslint.config.js`). TypeScript runs in `strict` mode. CI runs lint and typecheck on
pushes to `main` and on pull requests. There is no formatter or commit convention configured.

```bash
npm run lint
npm run typecheck
```

## Test

```bash
npm test
```

Vitest tests sit next to the source in `src/*.test.ts` and cover CLI behavior,
signature extraction, file generation and template output.

## Documentation

- [docs/README.md](docs/README.md): index of all docs
- [docs/architecture.md](docs/architecture.md): parsing, generated output and modules
- [docs/overview.md](docs/overview.md): audience and use cases
- [docs/configuration.md](docs/configuration.md): environment and CLI flags
- [docs/operations.md](docs/operations.md): security, privacy and dependency maintenance

## License

MIT. See [LICENSE](LICENSE).
