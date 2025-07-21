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

// Recursive schema for ComponentElement to avoid `z.any()`
const ComponentElementSchema: z.ZodType<ComponentElement> = z.lazy(() =>
  z.object({
    type: z.string(),
    props: z.record(z.unknown()),
    children: z.array(ComponentElementSchema).optional()
  })
);

const SurgicalModificationSchema = z.object({
  operation: z.enum(['modify', 'add', 'remove', 'replace']),
  type: z.enum(['text', 'calculation', 'input', 'function', 'section', 'styling']),
  target: z.string(),
  details: z.object({
    from: z.string().optional(),
    to: z.string().optional(),
    newElement: ComponentElementSchema.optional(),
    insertPosition: z.enum(['before', 'after', 'inside']).optional(),
    removeTarget: z.string().optional(),
    replaceWith: ComponentElementSchema.optional()
  }),
  reasoning: z.string()
});

const SurgicalPlanSchema = z.object({
  sourceTemplate: z.string(),
  modifications: z.array(SurgicalModificationSchema).optional().default([]),
  dataRequirements: z.object({
    researchQueries: z.array(z.string()).optional(),
    expectedDataTypes: z.array(z.string()).optional()
  }).partial().optional(),
  templateEnhancements: z.array(z.string()).optional()
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
function shouldFallback(result?: SurgicalPlan, error?: unknown): boolean {
  if (error) return true;
  if (!result) return true;
  if (!result.modifications || result.modifications.length === 0) return true;
  return false;
}

export async function runSurgicalPlanningAgent(
  rawInput: SurgicalPlanningInput,
): Promise<SurgicalPlan> {
  // 1. Simple validation instead of Zod schemas
  const input = validateInput(rawInput);
  const systemPrompt = buildPrompt(input);

  // 2. PRIMARY model attempt
  let primaryResult: SurgicalPlan | undefined;
  let primaryError: unknown;
  try {
    const { object } = await generateObject({
      model: MODELS.PRIMARY,
      prompt: systemPrompt,
      schema: SurgicalPlanSchema,
      ...DEFAULT_GENERATION_OPTS,
    });
    // Cast through 'any' before final type
    primaryResult = object as unknown as SurgicalPlan;
  } catch (err) {
    primaryError = err;
  }

  if (!shouldFallback(primaryResult, primaryError)) {
    return primaryResult as SurgicalPlan;
  }

  // 3. FALLBACK model attempt
  const { object } = await generateObject({
    model: MODELS.FALLBACK,
    prompt: systemPrompt,
    schema: SurgicalPlanSchema,
    ...DEFAULT_GENERATION_OPTS,
  });
  return object as unknown as SurgicalPlan;
}

// Convenience exported default
export default runSurgicalPlanningAgent; 