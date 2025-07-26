import { generateText } from 'ai';
import { MODELS } from '@/lib/ai/models/model-config';
import type { SurgicalPlan, ResearchData } from '@/lib/types/tool';
import { getTemplateByType } from '@/lib/templates/baseline-templates';
import { createFilesystemTools } from '@/lib/ai/agentic-tools/filesystem';
import { tsLintCheckerFileTool } from '@/lib/ai/agentic-tools/vercel-tool/ts-lint-checker-file';
import type { Tool } from 'ai';
import { FILE_CODER_SYSTEM_PROMPT } from './prompt';

export type AgentTools = Record<string, Tool>;



/**
 * Run the FileCoder agent and return the raw LLM completion text.
 * The surrounding orchestrator is responsible for JSON-parsing the response
 * and handling success/error states.
 * 
 * This version creates MCP and linter tools internally using just-in-time connections.
 */
export async function runFileCoderAgent(
  surgicalPlan: SurgicalPlan,
  researchData: ResearchData,
  workingDirectory: string,
): Promise<string> {
  console.log('🔧 [FILE-CODER] Creating tools just-in-time...');
  
  // Create local filesystem tools scoped to sandbox root
  const fsTools = createFilesystemTools();
  
  // Combine MCP tools with linter tool
  // Set sandbox root to Vercel-writable /tmp directory
  try {
    await (fsTools["set_filesystem_default"].execute as (args: any, opts?: any) => Promise<any>)({ path: '/tmp/agent-fs' });
    console.log('📂 [FILE-CODER] Sandbox root set to /tmp/agent-fs');
  } catch (err) {
    console.warn('⚠️ [FILE-CODER] Failed to set sandbox root:', err);
  }

  const tools: AgentTools = {
    ...fsTools,
    ts_lint_checker_file: tsLintCheckerFileTool,
  };
  
  console.log('🛠️ [FILE-CODER] Tools created:', Object.keys(tools));
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

  console.log('PROMPT/n', fullPrompt)

  console.log(`🤖 [FILE-CODER] Using LLM model: ${JSON.stringify(MODELS.PRIMARY)}`);
  // -------------------------------------------------------------------------
  // Call the LLM with enhanced configuration
  // -------------------------------------------------------------------------
  let completion;
  try {
    completion = await generateText({
    // Expose local filesystem + validation tools so the LLM can call them
    tools,
    model: MODELS.PRIMARY,
    prompt: fullPrompt,
    maxTokens: 3000, // Increased for complex modifications
    temperature: 0.1, // Slight creativity for better modifications
    maxSteps: 24
  });
  } catch (err: any) {
    console.error('❌ [FILE-CODER] LLM call failed', {
      message: err.message,
      toolName: err.toolName,
      toolArgs: err.toolArgs,
      issues: err.issues,
    });
    throw err; // propagate so API returns 500 with stack
  }

  return completion.text;
}
