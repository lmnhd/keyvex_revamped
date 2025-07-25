import { generateText, Tool } from 'ai';
import { FILE_CODER_SYSTEM_PROMPT } from './prompt';
import type { ResearchData as MainResearchData, SurgicalPlan } from '@/lib/types/tool';
import { MODELS } from '../../models/model-config';
import { getTemplateByType } from '@/lib/templates/baseline-templates';

// -----------------------------------------------------------------------------
// Core Logic – FileCoder Agent (Phase 2)
// -----------------------------------------------------------------------------
// NOTE:  "Avoid generic types"  → we do not introduce custom type parameters.
// Only built-in Promise<T> remains, which is required for async.

/**
 * Minimal, concrete representation of the surgical plan. The real plan may hold
 * more fields, but we only rely on these here to build the LLM prompt.
 */
export interface SurgicalPlanData {
  sourceTemplate: string;
  modifications: Array<{
    operation: string;
    type: string;
    target: string;
    reasoning: string;
  }>;
}

/**
 * Minimal research data interface. Extend as needed.
 */
export interface ResearchData {
  modificationData: Record<string, string | number | boolean | object>;
  populatedModifications: Array<{
    operation: string;
    type: string;
    target: string;
    reasoning: string;
  }>;
  clientInstructions: {
    summary: string;
    dataNeeded: string[];
    format: string;
  };
}

/**
 * Concrete interface for tool execution
 */
/**
 * Tools array expected by generateText – each entry already conforms to the
 * AI SDK `Tool` type. Keeping it as a simple alias avoids generics or `any`.
 */
export type AgentTools = Record<string, Tool>;



/**
 * Run the FileCoder agent and return the raw LLM completion text.
 * The surrounding orchestrator is responsible for JSON-parsing the response
 * and handling success/error states.
 */
export async function runFileCoderAgent(
  surgicalPlan: SurgicalPlan,
  researchData: MainResearchData,
  tools: AgentTools,
  workingDirectory: string,
): Promise<string> {
  // -------------------------------------------------------------------------
  // Get baseline template
  // -------------------------------------------------------------------------
  const templateType = surgicalPlan.sourceTemplate as 'calculator' | 'quiz' | 'planner' | 'form' | 'diagnostic';
  const baselineTemplate = getTemplateByType(templateType);
  
  if (!baselineTemplate || !baselineTemplate.componentCode) {
    throw new Error(`Baseline template not found for type: ${templateType}`);
  }

  // -------------------------------------------------------------------------
  // Build the enhanced prompt with template context
  // -------------------------------------------------------------------------
  const modificationsList = surgicalPlan.modifications
    .map((m, idx) => `${idx + 1}. ${m.operation} ${m.type} ${m.target} – ${m.reasoning}`)
    .join('\n');

  const researchContext = researchData.modificationData ? 
    `Research Data Available:\n${JSON.stringify(researchData.modificationData, null, 2)}` : 
    'No research data available';

  const userPrompt = `
Surgical Plan:
${modificationsList}

Working Directory: ${workingDirectory}

Baseline Template: ${baselineTemplate.title} (${baselineTemplate.type})
Template Industry: ${baselineTemplate.industry}

${researchContext}
`;

  const fullPrompt = `${FILE_CODER_SYSTEM_PROMPT}\n\n${userPrompt}`;

  // -------------------------------------------------------------------------
  // Call the LLM with enhanced configuration
  // -------------------------------------------------------------------------
  const completion = await generateText({
    // Expose MCP + custom tools so the LLM can call them
    tools,
    model: MODELS.PRIMARY,
    prompt: fullPrompt,
    maxTokens: 3000, // Increased for complex modifications
    temperature: 0.1, // Slight creativity for better modifications
  });

  return completion.text;
}
