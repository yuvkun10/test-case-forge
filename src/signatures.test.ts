import { describe, expect, it } from "vitest";
import { extractFunctionSignatures } from "./signatures.js";

describe("extractFunctionSignatures", () => {
  it("extracts exported function declarations, async arrows, and default functions", () => {
    const source = `
      type User = { id: string };

      export function add(a: number, b = 0): number {
        return a + b;
      }

      export const fetchUser = async (
        id: string,
        includePosts = false
      ): Promise<User> => ({ id });

      export default function formatUser(user: User) {
        return user.id;
      }
    `;

    const signatures = extractFunctionSignatures(source, {
      fileName: "sample.ts"
    });

    expect(
      signatures.map((signature) => ({
        exportKind: signature.exportKind,
        isAsync: signature.isAsync,
        name: signature.name,
        parameters: signature.parameters.map((parameter) => parameter.name),
        returnType: signature.returnType
      }))
    ).toEqual([
      {
        exportKind: "named",
        isAsync: false,
        name: "add",
        parameters: ["a", "b"],
        returnType: "number"
      },
      {
        exportKind: "named",
        isAsync: true,
        name: "fetchUser",
        parameters: ["id", "includePosts"],
        returnType: "Promise<User>"
      },
      {
        exportKind: "default",
        isAsync: false,
        name: "formatUser",
        parameters: ["user"],
        returnType: undefined
      }
    ]);
  });

  it("keeps non-exported helpers out by default and includes them when requested", () => {
    const source = `
      function normalizeName(value: string): string {
        return value.trim();
      }

      export const slugify = (value: string): string =>
        normalizeName(value).toLowerCase();
    `;

    expect(
      extractFunctionSignatures(source, {
        fileName: "strings.ts"
      }).map((signature) => signature.name)
    ).toEqual(["slugify"]);

    expect(
      extractFunctionSignatures(source, {
        fileName: "strings.ts",
        includeNonExported: true
      }).map((signature) => ({
        exportKind: signature.exportKind,
        name: signature.name
      }))
    ).toEqual([
      { exportKind: "none", name: "normalizeName" },
      { exportKind: "named", name: "slugify" }
    ]);
  });

  it("recognizes declarations exported by a named export list", () => {
    const source = `
      function trimName(value: string): string {
        return value.trim();
      }

      const createSlug = (value: string): string =>
        trimName(value).toLowerCase();

      export { createSlug, trimName };
    `;

    expect(
      extractFunctionSignatures(source, {
        fileName: "strings.ts"
      }).map((signature) => ({
        exportKind: signature.exportKind,
        name: signature.name,
        parameters: signature.parameters.map((parameter) => parameter.name)
      }))
    ).toEqual([
      {
        exportKind: "named",
        name: "trimName",
        parameters: ["value"]
      },
      {
        exportKind: "named",
        name: "createSlug",
        parameters: ["value"]
      }
    ]);
  });
});
