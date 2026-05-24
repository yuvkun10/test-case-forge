import { describe, expect, it } from "vitest";
import type {
  GenerateForSourceFileOptions,
  GenerateForSourceFileResult
} from "./generator.js";
import { runCli } from "./cli.js";

describe("runCli", () => {
  it("prints generated content in preview mode", async () => {
    const calls: GenerateForSourceFileOptions[] = [];
    const stdout: string[] = [];
    const stderr: string[] = [];

    const exitCode = await runCli(
      ["src/math.ts", "--all"],
      {
        stderr: (message) => stderr.push(message),
        stdout: (message) => stdout.push(message)
      },
      async (options): Promise<GenerateForSourceFileResult> => {
        calls.push(options);
        return {
          content: "generated preview\n",
          mode: "preview",
          signatures: [
            {
              exportKind: "named",
              isAsync: false,
              name: "add",
              parameters: []
            }
          ],
          sourceFilePath: "src/math.ts",
          testFilePath: "src/math.test.ts"
        };
      }
    );

    expect(exitCode).toBe(0);
    expect(calls).toEqual([
      {
        includeNonExported: true,
        mode: "preview",
        sourceFilePath: "src/math.ts",
        testFilePath: undefined
      }
    ]);
    expect(stdout.join("")).toBe("generated preview\n");
    expect(stderr.join("")).toContain("Preview: src/math.ts -> src/math.test.ts");
  });

  it("writes to a requested output path in write mode", async () => {
    const calls: GenerateForSourceFileOptions[] = [];
    const stdout: string[] = [];

    const exitCode = await runCli(
      ["src/users.ts", "--write", "--output", "tests/users.test.ts"],
      {
        stderr: () => undefined,
        stdout: (message) => stdout.push(message)
      },
      async (options): Promise<GenerateForSourceFileResult> => {
        calls.push(options);
        return {
          content: "written content\n",
          mode: "write",
          signatures: [
            {
              exportKind: "named",
              isAsync: true,
              name: "fetchUser",
              parameters: []
            }
          ],
          sourceFilePath: "src/users.ts",
          testFilePath: "tests/users.test.ts"
        };
      }
    );

    expect(exitCode).toBe(0);
    expect(calls).toEqual([
      {
        includeNonExported: false,
        mode: "write",
        sourceFilePath: "src/users.ts",
        testFilePath: "tests/users.test.ts"
      }
    ]);
    expect(stdout.join("")).toContain(
      "Created tests/users.test.ts from src/users.ts (1 signature)."
    );
  });
});
