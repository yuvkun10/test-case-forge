import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { FunctionSignature } from "./signatures.js";
import { extractFunctionSignatures } from "./signatures.js";
import { generateTestTemplate } from "./template.js";

export type GenerationMode = "preview" | "write";

export interface GenerateForSourceFileOptions {
  includeNonExported?: boolean | undefined;
  mode: GenerationMode;
  sourceFilePath: string;
  testFilePath?: string | undefined;
}

export interface GenerateForSourceFileResult {
  content: string;
  mode: GenerationMode;
  signatures: FunctionSignature[];
  sourceFilePath: string;
  testFilePath: string;
}

export async function generateForSourceFile(
  options: GenerateForSourceFileOptions
): Promise<GenerateForSourceFileResult> {
  const sourceFilePath = path.resolve(options.sourceFilePath);
  const testFilePath = path.resolve(
    options.testFilePath ?? defaultTestFilePath(sourceFilePath)
  );
  const source = await readFile(sourceFilePath, "utf8");
  const signatures = extractFunctionSignatures(source, {
    fileName: sourceFilePath,
    includeNonExported: options.includeNonExported
  });
  const content = generateTestTemplate({
    signatures,
    sourceFilePath,
    testFilePath
  });

  if (options.mode === "write") {
    await mkdir(path.dirname(testFilePath), { recursive: true });
    await writeFile(testFilePath, content, "utf8");
  }

  return {
    content,
    mode: options.mode,
    signatures,
    sourceFilePath,
    testFilePath
  };
}

function defaultTestFilePath(sourceFilePath: string): string {
  const extension = path.extname(sourceFilePath);
  const baseName = path.basename(sourceFilePath, extension);

  return path.join(path.dirname(sourceFilePath), `${baseName}.test.ts`);
}
