import ts from "typescript";

export type ExportKind = "default" | "named" | "none";

export interface ParameterSignature {
  name: string;
  placeholder: string;
}

export interface FunctionSignature {
  exportKind: ExportKind;
  isAsync: boolean;
  name: string;
  parameters: ParameterSignature[];
  returnType?: string;
}

export interface ExtractFunctionSignaturesOptions {
  fileName: string;
  includeNonExported?: boolean | undefined;
}

export function extractFunctionSignatures(
  source: string,
  options: ExtractFunctionSignaturesOptions
): FunctionSignature[] {
  const sourceFile = ts.createSourceFile(
    options.fileName,
    source,
    ts.ScriptTarget.Latest,
    true,
    scriptKindForFileName(options.fileName)
  );
  const namedExportNames = collectNamedExportNames(sourceFile);
  const signatures: FunctionSignature[] = [];

  for (const statement of sourceFile.statements) {
    if (ts.isFunctionDeclaration(statement)) {
      const listedExportName = statement.name
        ? namedExportNames.get(statement.name.text)
        : undefined;
      const directExportKind = exportKindForNode(statement);
      const exportKind =
        directExportKind === "none" && listedExportName
          ? "named"
          : directExportKind;

      addSignature(
        signatures,
        createSignature({
          exportKind,
          fallbackName: "defaultExport",
          nameOverride: listedExportName,
          node: statement,
          sourceFile
        }),
        options.includeNonExported
      );
      continue;
    }

    if (ts.isVariableStatement(statement)) {
      const exportKind = hasModifier(statement, ts.SyntaxKind.ExportKeyword)
        ? "named"
        : "none";

      for (const declaration of statement.declarationList.declarations) {
        if (!ts.isIdentifier(declaration.name)) {
          continue;
        }

        if (!isSupportedFunctionExpression(declaration.initializer)) {
          continue;
        }

        const listedExportName = namedExportNames.get(declaration.name.text);
        const declarationExportKind =
          exportKind === "none" && listedExportName ? "named" : exportKind;

        addSignature(
          signatures,
          createSignature({
            exportKind: declarationExportKind,
            fallbackName: declaration.name.text,
            nameOverride: listedExportName,
            node: declaration.initializer,
            sourceFile
          }),
          options.includeNonExported
        );
      }
      continue;
    }

    if (ts.isExportAssignment(statement) && !statement.isExportEquals) {
      const expression = statement.expression;

      if (!isSupportedFunctionExpression(expression)) {
        continue;
      }

      addSignature(
        signatures,
        createSignature({
          exportKind: "default",
          fallbackName: "defaultExport",
          nameOverride: undefined,
          node: expression,
          sourceFile
        }),
        options.includeNonExported
      );
    }
  }

  return signatures;
}

function addSignature(
  signatures: FunctionSignature[],
  signature: FunctionSignature,
  includeNonExported = false
): void {
  if (signature.exportKind !== "none" || includeNonExported) {
    signatures.push(signature);
  }
}

function createSignature(options: {
  exportKind: ExportKind;
  fallbackName: string;
  nameOverride: string | undefined;
  node: ts.ArrowFunction | ts.FunctionDeclaration | ts.FunctionExpression;
  sourceFile: ts.SourceFile;
}): FunctionSignature {
  const name =
    options.nameOverride ?? getFunctionName(options.node) ?? options.fallbackName;
  const signature: FunctionSignature = {
    exportKind: options.exportKind,
    isAsync: hasModifier(options.node, ts.SyntaxKind.AsyncKeyword),
    name,
    parameters: options.node.parameters.map((parameter, index) =>
      createParameterSignature(parameter, index)
    )
  };

  if (options.node.type) {
    signature.returnType = options.node.type.getText(options.sourceFile);
  }

  return signature;
}

function createParameterSignature(
  parameter: ts.ParameterDeclaration,
  index: number
): ParameterSignature {
  const name = ts.isIdentifier(parameter.name)
    ? parameter.name.text
    : `arg${index + 1}`;

  return {
    name,
    placeholder: name
  };
}

function exportKindForNode(node: ts.Node): ExportKind {
  if (hasModifier(node, ts.SyntaxKind.DefaultKeyword)) {
    return "default";
  }

  if (hasModifier(node, ts.SyntaxKind.ExportKeyword)) {
    return "named";
  }

  return "none";
}

function getFunctionName(
  node: ts.ArrowFunction | ts.FunctionDeclaration | ts.FunctionExpression
): string | undefined {
  if ("name" in node && node.name && ts.isIdentifier(node.name)) {
    return node.name.text;
  }

  return undefined;
}

function hasModifier(node: ts.Node, kind: ts.SyntaxKind): boolean {
  return Boolean(
    ts.canHaveModifiers(node) &&
      ts.getModifiers(node)?.some((modifier) => modifier.kind === kind)
  );
}

function isSupportedFunctionExpression(
  node: ts.Expression | undefined
): node is ts.ArrowFunction | ts.FunctionExpression {
  return Boolean(
    node && (ts.isArrowFunction(node) || ts.isFunctionExpression(node))
  );
}

function scriptKindForFileName(fileName: string): ts.ScriptKind {
  if (fileName.endsWith(".tsx")) {
    return ts.ScriptKind.TSX;
  }

  if (fileName.endsWith(".jsx")) {
    return ts.ScriptKind.JSX;
  }

  if (
    fileName.endsWith(".js") ||
    fileName.endsWith(".mjs") ||
    fileName.endsWith(".cjs")
  ) {
    return ts.ScriptKind.JS;
  }

  return ts.ScriptKind.TS;
}

function collectNamedExportNames(sourceFile: ts.SourceFile): Map<string, string> {
  const namedExportNames = new Map<string, string>();

  for (const statement of sourceFile.statements) {
    if (
      !ts.isExportDeclaration(statement) ||
      !statement.exportClause ||
      !ts.isNamedExports(statement.exportClause)
    ) {
      continue;
    }

    for (const element of statement.exportClause.elements) {
      const localName = element.propertyName?.text ?? element.name.text;
      namedExportNames.set(localName, element.name.text);
    }
  }

  return namedExportNames;
}
