import { promises as fs } from 'fs';
import path from 'path';
import ts from 'typescript';
import { ESLint } from 'eslint';

// -----------------------------------------------------------------------------
// File-Based Linter Core Logic (Phase 1)
// -----------------------------------------------------------------------------
// All log lines MUST start with this prefix so we can easily grep the logs.
const LOG_PREFIX = '[LINTER-FILE]';

export interface LintResult {
  tsDiagnostics: ts.Diagnostic[];
  eslintResults: ESLint.LintResult[];
}

/**
 * Validate a TypeScript/TSX component on disk.
 *
 * 1. Reads the file from disk using the provided `filePath`.
 * 2. Runs TypeScript compiler diagnostics against the file content.
 * 3. Runs ESLint (with project config) against the file.
 *
 * Extensive console logging is performed so that the execution flow can be
 * traced end-to-end when debugging the autonomous agent.
 */
export async function validateComponentFile(filePath: string): Promise<LintResult> {
  console.log(`${LOG_PREFIX} Starting validation for path: ${filePath}`);

  // 1. Read file contents
  let code: string;
  try {
    code = await fs.readFile(filePath, 'utf-8');
    console.log(`${LOG_PREFIX} Read ${code.length} characters from file`);
  } catch (err) {
    console.error(`${LOG_PREFIX} Error reading file`, err);
    throw err;
  }

  // 2. TypeScript diagnostics (syntax / semantic)
  const tsDiagnostics = runTypeScriptDiagnostics(code, filePath);
  console.log(`${LOG_PREFIX} TypeScript diagnostics count: ${tsDiagnostics.length}`);

  // 3. ESLint diagnostics
  const eslintResults = await runESLint(filePath);
  console.log(`${LOG_PREFIX} ESLint diagnostics count: ${eslintResults.reduce((acc, r) => acc + r.errorCount + r.warningCount, 0)}`);

  console.log(`${LOG_PREFIX} Validation complete, returning results.`);
  return { tsDiagnostics, eslintResults };
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function runTypeScriptDiagnostics(sourceText: string, filePath: string): ts.Diagnostic[] {
  const fileName = path.basename(filePath);
  const compilerHost: ts.CompilerHost = {
    fileExists: (f) => f === fileName,
    getCanonicalFileName: (f) => f,
    getCurrentDirectory: () => '',
    getDirectories: () => [],
    getDefaultLibFileName: () => 'lib.d.ts',
    getNewLine: () => '\n',
    getSourceFile: (f) => {
      if (f !== fileName) return undefined;
      return ts.createSourceFile(f, sourceText, ts.ScriptTarget.Latest, true);
    },
    readFile: () => sourceText,
    useCaseSensitiveFileNames: () => true,
    writeFile: () => undefined,
  };

  const program = ts.createProgram([fileName], { jsx: ts.JsxEmit.React, strict: true }, compilerHost);
  const syntactic = program.getSyntacticDiagnostics();
  const semantic = program.getSemanticDiagnostics();
  return [...syntactic, ...semantic];
}

async function runESLint(filePath: string): Promise<ESLint.LintResult[]> {
  const eslint = new ESLint({ cwd: process.cwd() });
  return await eslint.lintFiles([filePath]);
}
