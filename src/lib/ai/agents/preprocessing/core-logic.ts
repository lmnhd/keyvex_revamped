/*
 * Enhanced Preprocessing Agent – Core Logic
 * Separates AI interaction from API routes.
 * NOTE: Do NOT import this file directly in Next.js pages/components; use it in the API route layer.
 */

import { generateObject, type LanguageModelV1 } from 'ai';
import type { PreprocessingResult, ToolRequest as PreprocessingInput } from '@/lib/types/tool';
import { SYSTEM_PROMPT } from './prompt';
import { MODELS, DEFAULT_GENERATION_OPTS } from '../../models/model-config';

// Simple input validation instead of Zod schemas
function validateInput(input: any): PreprocessingInput {
  if (!input.userPrompt || input.userPrompt.length < 10) {
    throw new Error('Invalid input: userPrompt required and must be at least 10 characters');
  }
  return input as PreprocessingInput;
}

// Utility: Build final prompt string by interpolating the user description
function buildPrompt(input: PreprocessingInput): string {
  return [
    SYSTEM_PROMPT,
    '---\nRaw Business Description:',
    input.userPrompt.trim(),
    input.businessType ? `\nBusiness Type: ${input.businessType}` : '',
    input.industry ? `\nIndustry: ${input.industry}` : '',
    '\n\nRespond strictly with valid JSON following the specified schema.',
  ].join('');
}

// Decide if we should fall back based on result score or thrown error
function shouldFallback(result?: PreprocessingResult, error?: unknown): boolean {
  if (error) return true;
  if (!result) return true;
  return result.templateFitScore < 80; // low-confidence threshold per spec
}

export async function runPreprocessingAgent(
  rawInput: any,
): Promise<PreprocessingResult> {
  // 1. Simple validation instead of Zod schemas
  const input = validateInput(rawInput);
  const systemPrompt = buildPrompt(input);

  // 2. PRIMARY model attempt
  let primaryResult: PreprocessingResult | undefined;
  let primaryError: unknown;
  try {
    const { object } = await generateObject({
      model: MODELS.PRIMARY,
      prompt: systemPrompt,
      output: 'no-schema',
      ...DEFAULT_GENERATION_OPTS,
    });
    primaryResult = object as unknown as PreprocessingResult;
  } catch (err) {
    primaryError = err;
  }

  if (!shouldFallback(primaryResult, primaryError)) {
    return primaryResult as PreprocessingResult;
  }

  // 3. FALLBACK model attempt
  const { object } = await generateObject({
    model: MODELS.FALLBACK,
    prompt: systemPrompt,
    output: 'no-schema',
    ...DEFAULT_GENERATION_OPTS,
  });
  return object as unknown as PreprocessingResult;
}

// Convenience exported default
export default runPreprocessingAgent;
