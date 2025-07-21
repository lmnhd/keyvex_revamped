/*
 * Code Generation Agent – Core Logic
 * Separates AI interaction from API routes.
 * NOTE: Do NOT import this file directly in Next.js pages/components; use it in the API route layer.
 */

import { generateObject } from 'ai';
import { z } from 'zod';
import type { CodeGenerationInput, CodeGenerationResult, Tool } from '@/lib/types/tool';
import { SYSTEM_PROMPT } from './prompt';
import { MODELS, DEFAULT_GENERATION_OPTS } from '../../models/model-config';

// Zod schema enforcing exact CodeGenerationResult structure
const ToolSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum(['calculator','quiz','planner','form','diagnostic']),
  componentCode: z.string(),
  leadCapture: z.object({
    emailRequired: z.boolean(),
    trigger: z.enum(['before_results','after_results','manual']),
    incentive: z.string()
  }),
  createdAt: z.number(),
  updatedAt: z.number()
}).partial();

const CodeGenerationSchema = z.object({
  success: z.boolean(),
  customizedTool: ToolSchema.optional(),
  generatedCode: z.string().optional().default(''),
  modificationsApplied: z.number().optional().default(0),
  validationErrors: z.array(z.string()).optional().default([]),
  enhancementsAdded: z.array(z.string()).optional().default([])
});

// Simple input validation instead of Zod schemas
function validateInput(input: CodeGenerationInput): CodeGenerationInput {
  if (!input || typeof input !== 'object') {
    throw new Error('Invalid input: must be an object');
  }
  if (!input.surgicalPlan || !input.researchData) {
    throw new Error('Invalid input: surgicalPlan and researchData required');
  }
  return input;
}

// Utility: Build final prompt string by interpolating the surgical plan and research data
function buildPrompt(input: CodeGenerationInput): string {
  const { surgicalPlan, researchData } = input;
  
  const modificationsContext = surgicalPlan.modifications.map(mod => 
    `${mod.operation} ${mod.type}: ${mod.target} - ${mod.reasoning}`
  ).join('\n');
  
  const researchContext = researchData.modificationData 
    ? Object.entries(researchData.modificationData)
        .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
        .join('\n')
    : 'No modification data available';
  
  return [
    SYSTEM_PROMPT,
    '---\nSurgical Plan:',
    `Source Template: ${surgicalPlan.sourceTemplate}`,
    `Modifications:`,
    modificationsContext,
    '\n---\nResearch Data:',
    researchContext,
    '\n---\nClient Instructions:',
    researchData.clientInstructions.summary,
    `Data Needed: ${researchData.clientInstructions.dataNeeded.join(', ')}`,
    `Format: ${researchData.clientInstructions.format}`,
    '\n\nGenerate a complete React component applying all modifications with the researched data. Respond strictly with valid JSON following the specified schema.',
  ].join('\n');
}

// Decide if we should fall back based on result or thrown error
function shouldFallback(result?: CodeGenerationResult, error?: unknown): boolean {
  if (error) return true;
  if (!result) return true;
  if (!result.success) return true;
  if (!result.generatedCode || result.generatedCode.trim().length === 0) return true;
  return false;
}

export async function runCodeGenerationAgent(
  rawInput: CodeGenerationInput,
): Promise<CodeGenerationResult> {
  // 1. Simple validation instead of Zod schemas
  const input = validateInput(rawInput);
  const systemPrompt = buildPrompt(input);

  // 2. PRIMARY model attempt
  let primaryResult: CodeGenerationResult | undefined;
  let primaryError: unknown;
  try {
    const { object } = await generateObject({
      model: MODELS.PRIMARY,
      prompt: systemPrompt,
      schema: CodeGenerationSchema,
      ...DEFAULT_GENERATION_OPTS,
    });
    // Cast through 'any'
    primaryResult = object as unknown as CodeGenerationResult;
  } catch (err) {
    primaryError = err;
  }

  if (!shouldFallback(primaryResult, primaryError)) {
    return primaryResult as CodeGenerationResult;
  }

  // 3. FALLBACK model attempt
  const { object } = await generateObject({
    model: MODELS.FALLBACK,
    prompt: systemPrompt,
    schema: CodeGenerationSchema,
    ...DEFAULT_GENERATION_OPTS,
  });
  return object as unknown as CodeGenerationResult;
}

// Convenience exported default
export default runCodeGenerationAgent; 