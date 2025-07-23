/*
 * Data Research Agent – Core Logic
 * Separates AI interaction from API routes.
 * NOTE: Do NOT import this file directly in Next.js pages/components; use it in the API route layer.
 */

import { generateObject } from 'ai';
import { z } from 'zod';
import type { DataResearchInput, ResearchData, ComponentElement } from '@/lib/types/tool';
import { SYSTEM_PROMPT } from './prompt';
import { MODELS, DEFAULT_GENERATION_OPTS } from '../../models/model-config';

// Ultra-flexible schema to prevent AI validation failures
const SurgicalModificationSchema = z.object({
  operation: z.enum(['modify', 'add', 'remove', 'replace']),
  type: z.enum(['text', 'calculation', 'input', 'function', 'section', 'styling']),
  target: z.string(),
  details: z.record(z.unknown()).optional().default({}),
  reasoning: z.string().optional().default('AI-generated modification')
});

const ResearchDataSchema = z.object({
  modificationData: z.record(z.unknown()).optional().default({}),
  populatedModifications: z.array(SurgicalModificationSchema).optional().default([]),
  clientInstructions: z.object({
    summary: z.string().optional().default('Data research completed'),
    dataNeeded: z.array(z.string()).optional().default([]),
    format: z.string().optional().default('JSON')
  }).optional().default({})
});

// Simple input validation instead of Zod schemas
function validateInput(input: DataResearchInput): DataResearchInput {
  if (!input || typeof input !== 'object' || !('surgicalPlan' in input)) {
    throw new Error('Invalid input: must be an object with surgicalPlan property');
  }
  if (!input.surgicalPlan || typeof input.surgicalPlan !== 'object' || !('sourceTemplate' in input.surgicalPlan)) {
    throw new Error('Invalid input: surgicalPlan with sourceTemplate required');
  }
  return input;
}

// Mock web search function for now
async function webSearch({ query, model }: { query: string; model: string }) {
  return { query, answer: `Mock search result for: ${query}` };
}

// Utility: Build final prompt string by interpolating the surgical plan and research results
async function buildPrompt(input: DataResearchInput): Promise<string> {
  const { surgicalPlan } = input;
  
  // Safely extract research queries with fallbacks
  const dataRequirements = surgicalPlan.dataRequirements || {};
  const researchQueries = Array.isArray(dataRequirements.researchQueries) 
    ? dataRequirements.researchQueries 
    : ['wedding photography pricing', 'photography package options', 'travel fees photography'];
  
  const expectedDataTypes = Array.isArray(dataRequirements.expectedDataTypes)
    ? dataRequirements.expectedDataTypes
    : ['package_tiers', 'pricing_data', 'service_options'];
  
  // Perform web searches for data requirements
  const searchResults = await Promise.all(
    researchQueries.map(async (query) => {
      try {
        return await webSearch({ query, model: 'sonar-pro' });
      } catch (error) {
        return { query, answer: `Search failed: ${error}` };
      }
    })
  );
  
  const researchContext = searchResults.map((result: { query: string; answer: string }) => 
    `Query: ${result.query}\nAnswer: ${result.answer}`
  ).join('\n\n');
  
  return [
    SYSTEM_PROMPT,
    '---\nSurgical Plan:',
    `Source Template: ${surgicalPlan.sourceTemplate || 'calculator'}`,
    `Modifications Count: ${surgicalPlan.modifications?.length || 0}`,
    `Data Requirements: ${expectedDataTypes.join(', ')}`,
    `Research Queries: ${researchQueries.join(', ')}`,
    '\n---\nWeb Research Results:',
    researchContext,
    '\n\nAnalyze the research results and populate the surgical modifications with realistic data. Respond strictly with valid JSON following the specified schema.',
  ].join('\n');
}

// Decide if we should fall back based on result or thrown error
function shouldFallback(result?: ResearchData, error?: unknown): boolean {
  if (error) return true;
  if (!result) return true;
  if (!result.modificationData || Object.keys(result.modificationData).length === 0) return true;
  return false;
}

export async function runDataResearchAgent(
  rawInput: DataResearchInput,
): Promise<ResearchData> {
  // 1. Simple validation instead of Zod schemas
  const input = validateInput(rawInput);
  const systemPrompt = await buildPrompt(input);

  // 2. PRIMARY model attempt
  let primaryResult: ResearchData | undefined;
  let primaryError: unknown;
  try {
    const { object } = await generateObject({
      model: MODELS.PRIMARY,
      prompt: systemPrompt,
      schema: ResearchDataSchema,
      ...DEFAULT_GENERATION_OPTS,
    });
    // Cast through 'any'
    primaryResult = object as unknown as ResearchData;
  } catch (err) {
    primaryError = err;
  }

  if (!shouldFallback(primaryResult, primaryError)) {
    return primaryResult as ResearchData;
  }

  // 3. FALLBACK model attempt
  const { object } = await generateObject({
    model: MODELS.FALLBACK,
    prompt: systemPrompt,
    schema: ResearchDataSchema,
    ...DEFAULT_GENERATION_OPTS,
  });
  return object as unknown as ResearchData;
}

// Convenience exported default
export default runDataResearchAgent; 