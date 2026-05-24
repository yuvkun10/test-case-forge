#!/usr/bin/env node

import { pathToFileURL } from "node:url";
import { Command, CommanderError } from "commander";
import { generateForSourceFile } from "./generator.js";
import type {
  GenerateForSourceFileOptions,
  GenerateForSourceFileResult
} from "./generator.js";

export interface CliIo {
  stderr: (message: string) => void;
  stdout: (message: string) => void;
}

export type GenerateForSourceFile = (
  options: GenerateForSourceFileOptions
) => Promise<GenerateForSourceFileResult>;

export async function runCli(
  argv: string[],
  io: CliIo = {
    stderr: (message) => process.stderr.write(message),
    stdout: (message) => process.stdout.write(message)
  },
  generate: GenerateForSourceFile = generateForSourceFile
): Promise<number> {
  const program = new Command();

  program
    .name("test-case-forge")
    .description(
      "Generate starter Vitest unit test files from JavaScript and TypeScript function signatures."
    )
    .argument("<source>", "JavaScript or TypeScript source file to inspect")
    .option("-o, --output <path>", "write or preview a specific test file path")
    .option("-w, --write", "write the generated test file instead of previewing")
    .option("--all", "include non-exported top-level helper functions")
    .showHelpAfterError()
    .exitOverride()
    .configureOutput({
      writeErr: io.stderr,
      writeOut: io.stdout
    })
    .action(async (source: string, options: CliOptions) => {
      const result = await generate({
        includeNonExported: Boolean(options.all),
        mode: options.write ? "write" : "preview",
        sourceFilePath: source,
        testFilePath: options.output
      });

      if (result.signatures.length === 0) {
        io.stderr(`No function signatures found in ${result.sourceFilePath}.\n`);
      }

      if (result.mode === "preview") {
        io.stderr(`Preview: ${result.sourceFilePath} -> ${result.testFilePath}\n`);
        io.stdout(result.content);
        return;
      }

      io.stdout(
        `Created ${result.testFilePath} from ${result.sourceFilePath} (${result.signatures.length} ${pluralizeSignature(
          result.signatures.length
        )}).\n`
      );
    });

  try {
    await program.parseAsync(argv, { from: "user" });
    return 0;
  } catch (error) {
    if (error instanceof CommanderError) {
      return error.exitCode;
    }

    const message = error instanceof Error ? error.message : String(error);
    io.stderr(`${message}\n`);
    return 1;
  }
}

interface CliOptions {
  all?: boolean;
  output?: string | undefined;
  write?: boolean;
}

function pluralizeSignature(count: number): string {
  return count === 1 ? "signature" : "signatures";
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const exitCode = await runCli(process.argv.slice(2));
  process.exitCode = exitCode;
}
