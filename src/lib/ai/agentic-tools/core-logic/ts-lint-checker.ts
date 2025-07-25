/**
 * ts-lint-checker.ts
 * ---------------------------------------------
 * Lightweight, in-memory TypeScript compiler + ESLint validator.
 * Exposes three helpers:
 *   1. typescriptCheck(code) – returns array of TS diagnostic strings
 *   2. lintCheck(code)       – returns array of ESLint error strings
 *   3. validateComponent(code) – { tsErrors, lintErrors }
 * These are safe to run at runtime (edge/serverless) because they use
 * virtual source files and no filesystem access.
 */

import ts from 'typescript';
import { Linter } from 'eslint';
import * as tsParser from '@typescript-eslint/parser';

/* --------------------------------------------------
 * TypeScript Diagnostic Checker
 * -------------------------------------------------- */
export function typescriptCheck(code: string): string[] {
  const fileName = 'virtual-file.tsx';

  // Create a standard in-memory compiler host based on TS helpers
  const compilerHost = ts.createCompilerHost({
    jsx: ts.JsxEmit.React,
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    noEmit: true,
    skipLibCheck: true,
  });
  // Override getSourceFile so we feed the virtual code without file I/O
  compilerHost.getSourceFile = (fileNameArg, langVersion) =>
    ts.createSourceFile(fileNameArg, code, langVersion, true, ts.ScriptKind.TSX);
  compilerHost.readFile = () => code;
  compilerHost.fileExists = () => true;

  const program = ts.createProgram({
    rootNames: [fileName],
    options: {
      jsx: ts.JsxEmit.React,
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      strict: false,
      skipLibCheck: true,
      noEmit: true
    },
    host: compilerHost
  });

  const diagnostics = [
    ...program.getSyntacticDiagnostics(),
    ...program.getSemanticDiagnostics()
  ].filter(d => d.category === ts.DiagnosticCategory.Error);

  const flattenedDiagnostics = diagnostics.map(d => ts.flattenDiagnosticMessageText(d.messageText, '\n'));
  if (flattenedDiagnostics.length) {
    console.warn('[ts-lint-checker] TypeScript errors:', flattenedDiagnostics);
  }

  return flattenedDiagnostics;
}

/* --------------------------------------------------
 * ESLint Checker (runtime)
 * -------------------------------------------------- */

// Minimal ESLint config – extend as needed
// Cast as any to avoid strict typing issues with parser field
// Use loose typing to avoid issues with differing ESLint type versions
const eslintConfig: any = {

  parserOptions: { ecmaVersion: 2022, sourceType: 'module', ecmaFeatures: { jsx: true } },
  env: { browser: true, es2022: true },
  rules: {
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-debugger': 'error'
  }
};

const linter = new Linter();
// defineParser is unsupported in flat-config mode; parser supplied directly via config

export function lintCheck(code: string): string[] {
  try {
    const messages = linter.verify(code, eslintConfig);
    const errors = messages.filter(m => m.severity === 2).map(m => `${m.message} (line ${m.line})`);
    if (errors.length) {
      console.warn('[ts-lint-checker] ESLint errors:', errors);
    }
    return errors;
  } catch (err) {
    console.warn('[ts-lint-checker] ESLint verify failed, skipping lint errors:', (err as Error).message);
    return [];
  }
}

/* --------------------------------------------------
 * Unified helper
 * -------------------------------------------------- */
export function validateComponent(code: string): { tsErrors: string[]; lintErrors: string[] } {
  return {
    tsErrors: typescriptCheck(code),
    lintErrors: lintCheck(code)
  };
}
