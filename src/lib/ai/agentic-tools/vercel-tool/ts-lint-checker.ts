import { z } from 'zod';
import { tool } from 'ai';
import { validateComponent } from '../core-logic/ts-lint-checker';

/**
 * AI SDK tool: ts_lint_checker
 * ---------------------------------------------
 * Exposes runtime TypeScript + ESLint validation to the LLM.
 * Parameters: { code: string }
 * Returns: { tsErrors: string[]; lintErrors: string[] }
 */
export const tsLintCheckerTool = tool({
  description: 'Validate a React/TSX code string with the TypeScript compiler and ESLint. Returns arrays of error messages.',
  parameters: z.object({
    code: z.string().min(20).describe('The full TSX/JSX code to validate'),
  }),
  // Execute immediately and synchronously – fast in-memory checks
  execute: async ({ code }) => {
    const { tsErrors, lintErrors } = validateComponent(code);
    return { tsErrors, lintErrors };
  },
});

export type TsLintCheckerResult = ReturnType<typeof validateComponent>;