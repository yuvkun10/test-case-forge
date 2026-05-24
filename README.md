# test-case-forge

Generate starter Vitest unit test files from JavaScript and TypeScript function signatures.

## Features

- Parses TypeScript, TSX, JavaScript, and JSX with the TypeScript compiler API.
- Detects exported function declarations, exported arrow functions, default functions, and opt-in non-exported top-level helpers.
- Generates Vitest starter suites with import statements, parameter placeholders, and async call handling.
- Supports preview mode by default and write mode when you are ready to create the file.

## Install

```bash
npm install
npm run build
```

## Usage

Preview a generated test file:

```bash
npm exec test-case-forge -- src/math.ts
```

Write the default `*.test.ts` file next to the source:

```bash
npm exec test-case-forge -- src/math.ts --write
```

Write to a custom output path:

```bash
npm exec test-case-forge -- src/math.ts --write --output tests/math.test.ts
```

Include non-exported top-level helpers as skipped suites:

```bash
npm exec test-case-forge -- src/math.ts --all
```

## Development

```bash
npm run lint
npm test
npm run build
```
