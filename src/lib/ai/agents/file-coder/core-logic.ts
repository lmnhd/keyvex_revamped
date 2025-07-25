import { generateText } from 'ai';
import { FILE_CODER_SYSTEM_PROMPT } from './prompt';

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
  [key: string]: unknown;
}

/**
 * Tools bundle expected by the agent – must include MCP file-system tools and
 * the custom linter. We keep the shape fully open to avoid generic params.
 */
export interface AgentTools {
  [toolName: string]: unknown;
}

/**
 * Run the FileCoder agent and return the raw LLM completion text.
 * The surrounding orchestrator is responsible for JSON-parsing the response
 * and handling success/error states.
 */
export async function runFileCoderAgent(
  surgicalPlan: SurgicalPlanData,
  researchData: ResearchData,
  tools: AgentTools,
  workingDirectory: string,
): Promise<string> {
  // -------------------------------------------------------------------------
  // Build the prompt
  // -------------------------------------------------------------------------
  const modificationsList = surgicalPlan.modifications
    .map((m, idx) => `${idx + 1}. ${m.operation} ${m.type} ${m.target} – ${m.reasoning}`)
    .join('\n');

  const userPrompt = `Surgical Plan:\n${modificationsList}\n\nWorking Directory: ${workingDirectory}`;

  const fullPrompt = `${FILE_CODER_SYSTEM_PROMPT}\n\n${userPrompt}`;

  // -------------------------------------------------------------------------
  // Call the LLM
  // -------------------------------------------------------------------------
  const completion = await generateText({
    model: 'gpt-4o-mini', // engine is selected higher-level; placeholder here
    prompt: fullPrompt,
    tools,
    maxTokens: 1024,
    temperature: 0,
  });

  return completion.text;
}
