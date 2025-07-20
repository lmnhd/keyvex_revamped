/*
 * Surgical Planning Agent – Core Logic
 * Separates AI interaction from API routes.
 * NOTE: Do NOT import this file directly in Next.js pages/components; use it in the API route layer.
 */

import { generateObject } from 'ai';
import type { SurgicalPlanningInput, SurgicalPlan } from '@/lib/types/tool';
import { SYSTEM_PROMPT } from './prompt';
import { MODELS, DEFAULT_GENERATION_OPTS } from '../../models/model-config';

// Simple input validation instead of Zod schemas
function validateInput(input: any): SurgicalPlanningInput {
  if (!input || typeof input !== 'object' || !('preprocessingResult' in input)) {
    throw new Error('Invalid input: must be an object with preprocessingResult property');
  }
  const typedInput = input as { preprocessingResult: any };
  if (!typedInput.preprocessingResult || typeof typedInput.preprocessingResult !== 'object' || !('selectedTemplate' in typedInput.preprocessingResult)) {
    throw new Error('Invalid input: preprocessingResult with selectedTemplate required');
  }
  return input as SurgicalPlanningInput;
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
  rawInput: any,
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
      output: 'no-schema',
      ...DEFAULT_GENERATION_OPTS,
    });
    // Cast through 'any' before final type
    primaryResult = object as any as SurgicalPlan;
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
    output: 'no-schema',
    ...DEFAULT_GENERATION_OPTS,
  });
  return object as any as SurgicalPlan;
}

// Convenience exported default
export default runSurgicalPlanningAgent; 