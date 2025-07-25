/*
 * Enhanced Preprocessing Agent – Core Logic
 * Separates AI interaction from API routes.
 * NOTE: Do NOT import this file directly in Next.js pages/components; use it in the API route layer.
 */

import { generateObject } from 'ai';
import { z } from 'zod';
import type { PreprocessingResult, ToolRequest as PreprocessingInput } from '@/lib/types/tool';
import { SYSTEM_PROMPT } from './prompt';
import { MODELS, DEFAULT_GENERATION_OPTS } from '../../models/model-config';

// Concrete interface for AI response validation
interface AIResponseError {
  message: string;
  code?: string;
  details?: string;
}

// Concrete interface for fallback decision
interface FallbackDecision {
  shouldFallback: boolean;
  reason?: string;
}

// Zod schema to enforce exact AI output structure
const PreprocessingResultSchema = z.object({
  selectedTemplate: z.enum(['calculator', 'quiz', 'planner', 'form', 'diagnostic']),
  templateFitScore: z.number().min(0).max(100).optional().default(0),
  targetAudience: z.string().min(1).optional().default('General audience'),
  modificationSignals: z.array(z.string()).optional().default([]),
  businessAnalysis: z.object({
    industry: z.string().min(1),
    services: z.array(z.string()),
    valueProposition: z.string().min(1),
    leadGoals: z.array(z.string())
  }).partial().optional(),
  recommendedLeadCapture: z.object({
    trigger: z.enum(['before_results', 'after_results']),
    incentive: z.string().min(1),
    additionalFields: z.array(z.string())
  }).optional()
});

// Simple input validation instead of Zod schemas
function validateInput(input: PreprocessingInput): PreprocessingInput {
  if (!input || typeof input !== 'object' || !('userPrompt' in input)) {
    throw new Error('Invalid input: must be an object with userPrompt property');
  }
  if (!input.userPrompt || typeof input.userPrompt !== 'string' || input.userPrompt.length < 10) {
    throw new Error('Invalid input: userPrompt required and must be at least 10 characters');
  }
  return input;
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
function shouldFallback(result?: PreprocessingResult, error?: AIResponseError): FallbackDecision {
  if (error) {
    return { shouldFallback: true, reason: `Error occurred: ${error.message}` };
  }
  if (!result) {
    return { shouldFallback: true, reason: 'No result received' };
  }
  if (result.templateFitScore < 80) {
    return { shouldFallback: true, reason: `Low confidence score: ${result.templateFitScore}` };
  }
  return { shouldFallback: false };
}

// Transform AI response to match our TypeScript interface
function transformAIResponse(aiResponse: PreprocessingResult): PreprocessingResult {
  // Ensure recommendedLeadCapture exists with sensible defaults
  if (!aiResponse.recommendedLeadCapture) {
    aiResponse = {
      ...aiResponse,
      recommendedLeadCapture: {
        trigger: 'after_results',
        incentive: '',
        additionalFields: []
      }
    } as PreprocessingResult;
  }
  return aiResponse;
}

export async function runPreprocessingAgent(
  rawInput: PreprocessingInput,
): Promise<PreprocessingResult> {
  // 1. Simple validation instead of Zod schemas
  const input = validateInput(rawInput);
  const systemPrompt = buildPrompt(input);

  // 2. PRIMARY model attempt
  let primaryResult: PreprocessingResult | undefined;
  let primaryError: AIResponseError | undefined;
  try {
    const { object } = await generateObject({
      model: MODELS.PRIMARY,
      prompt: systemPrompt,
      schema: PreprocessingResultSchema,
      ...DEFAULT_GENERATION_OPTS,
    });
    // Transform AI response to match our TypeScript interface
    primaryResult = transformAIResponse(object as PreprocessingResult);
  } catch (err) {
    primaryError = {
      message: err instanceof Error ? err.message : 'Unknown error occurred',
      code: err instanceof Error && 'code' in err ? String(err.code) : undefined,
      details: err instanceof Error ? err.stack : undefined
    };
  }

  const fallbackDecision = shouldFallback(primaryResult, primaryError);
  if (!fallbackDecision.shouldFallback) {
    return primaryResult as PreprocessingResult;
  }

  // 3. FALLBACK model attempt
  const { object } = await generateObject({
    model: MODELS.FALLBACK,
    prompt: systemPrompt,
    schema: PreprocessingResultSchema,
    ...DEFAULT_GENERATION_OPTS,
  });
  return transformAIResponse(object as PreprocessingResult);
}

// Convenience exported default
export default runPreprocessingAgent;
