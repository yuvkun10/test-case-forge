import type { FunctionSignature } from "./signatures.js";
import path from "node:path";

export interface GenerateTestTemplateOptions {
  signatures: FunctionSignature[];
  sourceFilePath: string;
  testFilePath: string;
}

export function generateTestTemplate(
  options: GenerateTestTemplateOptions
): string {
  const lines: string[] = [
    'import { describe, expect, it } from "vitest";'
  ];
  const importLine = createImportLine(options);

  if (importLine) {
    lines.push(importLine);
  } else {
    lines.push("// No exported functions were found for automatic imports.");
  }

  lines.push("");

  for (const signature of options.signatures) {
    lines.push(...createSuite(signature), "");
  }

  return `${lines.join("\n").trimEnd()}\n`;
}

function createImportLine(options: GenerateTestTemplateOptions): string | null {
  const exportedSignatures = options.signatures.filter(
    (signature) => signature.exportKind !== "none"
  );

  if (exportedSignatures.length === 0) {
    return null;
  }

  const defaultImport = exportedSignatures.find(
    (signature) => signature.exportKind === "default"
  )?.name;
  const namedImports = exportedSignatures
    .filter((signature) => signature.exportKind === "named")
    .map((signature) => signature.name)
    .sort((left, right) => left.localeCompare(right));
  const importPath = toImportPath(options.sourceFilePath, options.testFilePath);

  if (defaultImport && namedImports.length > 0) {
    return `import ${defaultImport}, { ${namedImports.join(
      ", "
    )} } from "${importPath}";`;
  }

  if (defaultImport) {
    return `import ${defaultImport} from "${importPath}";`;
  }

  return `import { ${namedImports.join(", ")} } from "${importPath}";`;
}

function createSuite(signature: FunctionSignature): string[] {
  const describeCall =
    signature.exportKind === "none"
      ? `describe.skip("${signature.name}", () => {`
      : `describe("${signature.name}", () => {`;
  const lines = [describeCall];

  if (signature.exportKind === "none") {
    lines.push(
      '  it("can be enabled after the function is exported", () => {',
      '    throw new Error("Export this function before enabling the generated test.");',
      "  });",
      "});"
    );
    return lines;
  }

  const args = signature.parameters
    .map((parameter) => `/* ${parameter.placeholder} */ undefined`)
    .join(", ");
  const callExpression = `${signature.name}(${args})`;

  if (signature.isAsync) {
    lines.push(
      '  it("returns the expected result", async () => {',
      `    const result = await ${callExpression};`,
      "    expect(result).toBeDefined();",
      "  });",
      "});"
    );
    return lines;
  }

  lines.push(
    '  it("returns the expected result", () => {',
    `    const result = ${callExpression};`,
    "    expect(result).toBeDefined();",
    "  });",
    "});"
  );
  return lines;
}

function toImportPath(sourceFilePath: string, testFilePath: string): string {
  const testDirectory = path.dirname(testFilePath);
  const sourceWithoutExtension = sourceFilePath.replace(
    /\.(c|m)?[jt]sx?$/,
    ""
  );
  let relativePath = path
    .relative(testDirectory, sourceWithoutExtension)
    .replaceAll(path.sep, "/");

  if (!relativePath.startsWith(".")) {
    relativePath = `./${relativePath}`;
  }

  return relativePath;
}
