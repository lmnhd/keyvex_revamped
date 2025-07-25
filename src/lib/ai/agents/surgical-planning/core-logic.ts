/*
 * Surgical Planning Agent – Core Logic
 * Separates AI interaction from API routes.
 * NOTE: Do NOT import this file directly in Next.js pages/components; use it in the API route layer.
 */

import { generateObject } from 'ai';
import { z } from 'zod';
import type { SurgicalPlanningInput, SurgicalPlan, ComponentElement } from '@/lib/types/tool';
import { SYSTEM_PROMPT } from './prompt';
import { MODELS, DEFAULT_GENERATION_OPTS } from '../../models/model-config';

// Concrete interface for surgical modification details
interface SurgicalModificationDetails {
  from?: string;
  to?: string;
  newElement?: ComponentElement;
  insertPosition?: 'before' | 'after' | 'inside';
  removeTarget?: string;
  replaceWith?: ComponentElement;
  [key: string]: unknown; // Allow additional properties
}

// Concrete interface for data requirements
interface DataRequirements {
  researchQueries: string[];
  expectedDataTypes: string[];
  [key: string]: unknown; // Allow additional properties
}

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

// Ultra-flexible schema to prevent AI validation failures
const SurgicalModificationSchema = z.object({
  operation: z.enum(['modify', 'add', 'remove', 'replace']),
  type: z.enum(['text', 'calculation', 'input', 'function', 'section', 'styling']),
  target: z.string(),
  details: z.record(z.unknown()).optional().default({}),
  reasoning: z.string().optional().default('AI-generated modification')
});

const SurgicalPlanSchema = z.object({
  sourceTemplate: z.string().optional().default('calculator'),
  modifications: z.array(SurgicalModificationSchema).optional().default([]),
  dataRequirements: z.record(z.unknown()).optional().default({}), // Completely flexible
  templateEnhancements: z.array(z.string()).optional().default([])
});

// Simple input validation instead of Zod schemas
function validateInput(input: SurgicalPlanningInput): SurgicalPlanningInput {
  if (!input || typeof input !== 'object' || !('preprocessingResult' in input)) {
    throw new Error('Invalid input: must be an object with preprocessingResult property');
  }
  if (!input.preprocessingResult || typeof input.preprocessingResult !== 'object' || !('selectedTemplate' in input.preprocessingResult)) {
    throw new Error('Invalid input: preprocessingResult with selectedTemplate required');
  }
  return input;
}

// Utility: Build final prompt string by interpolating the preprocessing result
function buildPrompt(input: SurgicalPlanningInput): string {
  const { preprocessingResult } = input;
  
  return [
    SYSTEM_PROMPT,
    '---\nPreprocessing Analysis:',
    `Selected Template: ${preprocessingResult.selectedTemplate}`,
    `Template Fit Score: ${preprocessingResult.templateFitScore}%`,
    `Target Audience: ${preprocessingResult.targetAudience}`,
    `Industry: ${preprocessingResult.businessAnalysis.industry}`,
    `Value Proposition: ${preprocessingResult.businessAnalysis.valueProposition}`,
    `Services: ${preprocessingResult.businessAnalysis.services.join(', ')}`,
    `Lead Goals: ${preprocessingResult.businessAnalysis.leadGoals.join(', ')}`,
    `Modification Signals: ${preprocessingResult.modificationSignals.join(', ')}`,
    `Lead Capture: ${preprocessingResult.recommendedLeadCapture.trigger} - ${preprocessingResult.recommendedLeadCapture.incentive}`,
    '\n\nCreate a detailed surgical modification plan. Respond strictly with valid JSON following the specified schema.',
  ].join('\n');
}

// Decide if we should fall back based on result or thrown error
function shouldFallback(result?: SurgicalPlan, error?: AIResponseError): FallbackDecision {
  if (error) {
    return { shouldFallback: true, reason: `Error occurred: ${error.message}` };
  }
  if (!result) {
    return { shouldFallback: true, reason: 'No result received' };
  }
  if (!result.modifications || result.modifications.length === 0) {
    return { shouldFallback: true, reason: 'No modifications specified' };
  }
  return { shouldFallback: false };
}

export async function runSurgicalPlanningAgent(
  rawInput: SurgicalPlanningInput,
): Promise<SurgicalPlan> {
  // 1. Simple validation instead of Zod schemas
  const input = validateInput(rawInput);
  const systemPrompt = buildPrompt(input);

  // 2. PRIMARY model attempt
  let primaryResult: SurgicalPlan | undefined;
  let primaryError: AIResponseError | undefined;
  try {
    const { object } = await generateObject({
      model: MODELS.PRIMARY,
      prompt: systemPrompt,
      schema: SurgicalPlanSchema,
      ...DEFAULT_GENERATION_OPTS,
    });
    // Cast through concrete type
    primaryResult = object as SurgicalPlan;
  } catch (err) {
    primaryError = {
      message: err instanceof Error ? err.message : 'Unknown error occurred',
      code: err instanceof Error && 'code' in err ? String(err.code) : undefined,
      details: err instanceof Error ? err.stack : undefined
    };
  }

  const fallbackDecision = shouldFallback(primaryResult, primaryError);
  if (!fallbackDecision.shouldFallback) {
    return primaryResult as SurgicalPlan;
  }

  // 3. FALLBACK model attempt
  const { object } = await generateObject({
    model: MODELS.FALLBACK,
    prompt: systemPrompt,
    schema: SurgicalPlanSchema,
    ...DEFAULT_GENERATION_OPTS,
  });
  return object as SurgicalPlan;
}

// Convenience exported default
export default runSurgicalPlanningAgent; 