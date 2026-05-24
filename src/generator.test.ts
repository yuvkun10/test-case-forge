import { mkdtemp, readFile, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { generateForSourceFile } from "./generator.js";

describe("generateForSourceFile", () => {
  it("previews a generated test file without writing it", async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), "forge-preview-"));
    const sourceFilePath = path.join(directory, "math.ts");
    const expectedTestFilePath = path.join(directory, "math.test.ts");

    await writeFile(
      sourceFilePath,
      "export function add(a: number, b: number): number { return a + b; }\n",
      "utf8"
    );

    const result = await generateForSourceFile({
      mode: "preview",
      sourceFilePath
    });

    expect(result.mode).toBe("preview");
    expect(result.sourceFilePath).toBe(sourceFilePath);
    expect(result.testFilePath).toBe(expectedTestFilePath);
    expect(result.signatures.map((signature) => signature.name)).toEqual(["add"]);
    expect(result.content).toContain('import { add } from "./math";');
    await expect(stat(expectedTestFilePath)).rejects.toMatchObject({
      code: "ENOENT"
    });
  });

  it("writes a generated test file when write mode is requested", async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), "forge-write-"));
    const sourceFilePath = path.join(directory, "users.ts");
    const testFilePath = path.join(directory, "__tests__", "users.spec.ts");

    await writeFile(
      sourceFilePath,
      "export const fetchUser = async (id: string) => ({ id });\n",
      "utf8"
    );

    const result = await generateForSourceFile({
      mode: "write",
      sourceFilePath,
      testFilePath
    });

    expect(result.mode).toBe("write");
    expect(result.testFilePath).toBe(testFilePath);
    await expect(readFile(testFilePath, "utf8")).resolves.toBe(result.content);
    expect(result.content).toContain('import { fetchUser } from "../users";');
    expect(result.content).toContain("const result = await fetchUser");
  });
});
