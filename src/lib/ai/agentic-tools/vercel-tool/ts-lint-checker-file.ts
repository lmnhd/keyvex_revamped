import { z } from 'zod';
import { tool } from 'ai';
import ts from 'typescript';
import { validateComponentFile } from '../core-logic/ts-lint-checker-file';

/**
 * AI SDK tool: ts_lint_checker_file
 * -------------------------------------------------------
 * Validates a file on disk (TS/TSX) using TypeScript compiler + ESLint.
 * Parameters: { filePath: string }
 * Returns: { tsErrors: string[]; lintErrors: string[] }
 */
export const tsLintCheckerFileTool = tool({
  description:
    'Validate a local TypeScript/TSX file using the TypeScript compiler and ESLint. Returns arrays of error messages.',
  parameters: z.object({
    filePath: z.string().min(1).describe('Absolute path to the file to validate'),
  }),
  execute: async ({ filePath }) => {
    const { tsDiagnostics, eslintResults } = await validateComponentFile(filePath);

    const tsErrors = tsDiagnostics.map((d) =>
      ts.flattenDiagnosticMessageText(d.messageText, '\n'),
    );
    const lintErrors = eslintResults.flatMap((res) =>
      res.messages.map((m) => `${m.line}:${m.column} ${m.message} (${m.ruleId ?? 'unknown'})`),
    );

    return { tsErrors, lintErrors };
  },
});

export type TsLintCheckerFileResult = ReturnType<typeof validateComponentFile>;
