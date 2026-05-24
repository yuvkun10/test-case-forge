import { describe, expect, it } from "vitest";
import type { FunctionSignature } from "./signatures.js";
import { generateTestTemplate } from "./template.js";

describe("generateTestTemplate", () => {
  it("creates Vitest starter tests with imports, placeholders, and async calls", () => {
    const signatures: FunctionSignature[] = [
      {
        exportKind: "named",
        isAsync: false,
        name: "add",
        parameters: [
          { name: "a", placeholder: "a" },
          { name: "b", placeholder: "b" }
        ],
        returnType: "number"
      },
      {
        exportKind: "named",
        isAsync: true,
        name: "fetchUser",
        parameters: [{ name: "id", placeholder: "id" }],
        returnType: "Promise<User>"
      },
      {
        exportKind: "default",
        isAsync: false,
        name: "formatUser",
        parameters: [{ name: "user", placeholder: "user" }]
      }
    ];

    const template = generateTestTemplate({
      signatures,
      sourceFilePath: "src/users.ts",
      testFilePath: "src/users.test.ts"
    });

    expect(template).toContain(
      'import formatUser, { add, fetchUser } from "./users";'
    );
    expect(template).toContain('describe("add", () => {');
    expect(template).toContain(
      "const result = add(/* a */ undefined, /* b */ undefined);"
    );
    expect(template).toContain('it("returns the expected result", async () => {');
    expect(template).toContain(
      "const result = await fetchUser(/* id */ undefined);"
    );
    expect(template).toContain('describe("formatUser", () => {');
    expect(template).toContain("expect(result).toBeDefined();");
  });

  it("emits skipped suites for non-exported functions instead of invalid imports", () => {
    const signatures: FunctionSignature[] = [
      {
        exportKind: "none",
        isAsync: false,
        name: "buildCacheKey",
        parameters: [{ name: "input", placeholder: "input" }]
      }
    ];

    const template = generateTestTemplate({
      signatures,
      sourceFilePath: "src/cache.ts",
      testFilePath: "tests/cache.test.ts"
    });

    expect(template).toContain(
      "// No exported functions were found for automatic imports."
    );
    expect(template).toContain('describe.skip("buildCacheKey", () => {');
    expect(template).toContain("Export this function before enabling the generated test.");
  });
});
