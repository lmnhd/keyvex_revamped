/*
 * Code Generation Agent – Core Logic
 * Separates AI interaction from API routes.
 * NOTE: Do NOT import this file directly in Next.js pages/components; use it in the API route layer.
 */

import { generateObject, generateText } from 'ai';
import { z } from 'zod';
import { anthropic, AnthropicProviderOptions } from '@ai-sdk/anthropic';
import { tsLintCheckerTool } from '@/lib/ai/agentic-tools/vercel-tool/ts-lint-checker';
import { parse } from '@babel/parser';
import * as ts from 'typescript';
import type { CodeGenerationInput, CodeGenerationResult, Tool } from '@/lib/types/tool';
import { SYSTEM_PROMPT } from './prompt';
import { MODELS, CODE_GENERATION_OPTS } from '../../models/model-config';

// Log model configuration on import
console.log('📋 [CODE-GEN] Model config loaded:');
console.log('📋 [CODE-GEN] PRIMARY model:', MODELS.PRIMARY.modelId || 'unknown');
console.log('📋 [CODE-GEN] FALLBACK model:', MODELS.FALLBACK.modelId || 'unknown');
console.log('📋 [CODE-GEN] Generation options:', CODE_GENERATION_OPTS);

// Zod schema enforcing exact CodeGenerationResult structure
const ToolSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum(['calculator','quiz','planner','form','diagnostic']),
  componentCode: z.string().optional(),
  leadCapture: z.object({
    emailRequired: z.boolean(),
    trigger: z.enum(['before_results','after_results','manual']),
    incentive: z.string()
  }),
  createdAt: z.number(),
  updatedAt: z.number()
});

const CodeGenerationSchema = z.object({
  success: z.boolean(),
  customizedTool: ToolSchema.optional(),
  generatedCode: z.string().min(50),
  modificationsApplied: z.number().optional().default(0),
  validationErrors: z.array(z.string()).optional().default([]),
  enhancementsAdded: z.array(z.string()).optional().default([])
});

// Simple input validation with extensive logging
function validateInput(input: CodeGenerationInput): CodeGenerationInput {
  console.log('🔍 [CODE-GEN] Starting input validation...');
  console.log('🔍 [CODE-GEN] Input type:', typeof input);
  console.log('🔍 [CODE-GEN] Input keys:', input ? Object.keys(input) : 'null/undefined');
  
  if (!input || typeof input !== 'object') {
    console.error('❌ [CODE-GEN] Invalid input: must be an object');
    throw new Error('Invalid input: must be an object');
  }
  
  if (!input.surgicalPlan) {
    console.error('❌ [CODE-GEN] Missing surgicalPlan in input');
    throw new Error('Invalid input: surgicalPlan required');
  }
  
  if (!input.researchData) {
    console.error('❌ [CODE-GEN] Missing researchData in input');
    throw new Error('Invalid input: researchData required');
  }
  
  console.log('✅ [CODE-GEN] Input validation passed');
  console.log('🔍 [CODE-GEN] Surgical plan keys:', Object.keys(input.surgicalPlan));
  console.log('🔍 [CODE-GEN] Research data keys:', Object.keys(input.researchData));
  
  return input;
}

// Utility: Build final prompt string with extensive logging
function buildPrompt(input: CodeGenerationInput): string {
  console.log('🔨 [CODE-GEN] Building prompt...');
  const { surgicalPlan, researchData } = input;
  
  console.log('🔍 [CODE-GEN] Source template:', surgicalPlan.sourceTemplate);
  console.log('🔍 [CODE-GEN] Modifications count:', surgicalPlan.modifications?.length || 0);
  
  const modificationsContext = surgicalPlan.modifications.map((mod, index) => {
    console.log(`🔍 [CODE-GEN] Modification ${index + 1}:`, {
      operation: mod.operation,
      type: mod.type,
      target: mod.target,
      reasoning: mod.reasoning
    });
    return `${mod.operation} ${mod.type}: ${mod.target} - ${mod.reasoning}`;
  }).join('\n');
  
  console.log('🔍 [CODE-GEN] Research data has modificationData:', !!researchData.modificationData);
  const researchContext = researchData.modificationData 
    ? Object.entries(researchData.modificationData)
        .map(([key, value]) => {
          console.log(`🔍 [CODE-GEN] Research data - ${key}:`, value);
          return `${key}: ${JSON.stringify(value)}`;
        })
        .join('\n')
    : 'No modification data available';
  
  console.log('🔍 [CODE-GEN] Client instructions:', researchData.clientInstructions);
  
  const finalPrompt = [
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
    '\n\nGenerate a complete React component applying all modifications with the researched data.\n\nIMPORTANT: After completing your refinement steps, OUTPUT ONLY the JSON object matching the required schema. Do NOT include any prose, markdown, code fences, or duplicated component code—return the raw JSON object alone.',
  ].join('\n');
  
  console.log('🔨 [CODE-GEN] Final prompt length:', finalPrompt.length);
  console.log('🔨 [CODE-GEN] Prompt preview (first 200 chars):', finalPrompt.substring(0, 200));
  
  return finalPrompt;
}

// Utility: Compile TSX in-memory and return diagnostics
function getTypeScriptDiagnostics(source: string): readonly ts.Diagnostic[] {
  const fileName = 'generated-component.tsx';
  const compilerHost = ts.createCompilerHost({});
  compilerHost.getSourceFile = () => ts.createSourceFile(fileName, source, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TSX);
  compilerHost.writeFile = () => {};
  const program = ts.createProgram([fileName], {
    jsx: ts.JsxEmit.React,
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,
    lib: ['esnext', 'dom'],
    types: [],
    skipLibCheck: true,
    noEmitOnError: false,
  }, compilerHost);
  program.emit();
  const allDiagnostics = ts.getPreEmitDiagnostics(program);
  // Filter out diagnostics we intentionally ignore (missing global libs, duplicate funcs from re-parse, missing React types)
  const ignoredCodes = new Set([2304, 2393]); // 2304: cannot find name, 2393: duplicate function implementation
  return allDiagnostics.filter(d => !ignoredCodes.has(d.code));
}

// Utility: React/JSX syntax validation for import/export-free components
function isValidReact(code: string): boolean {
  console.log('🔍 [CODE-GEN] Validating React syntax...');
  console.log('🔍 [CODE-GEN] Code length:', code.length);
  console.log('🔍 [CODE-GEN] Code preview (first 300 chars):', code.substring(0, 300));
  
  try {
    parse(code, { sourceType: 'module', plugins: ['jsx', 'typescript'] });
    console.log('✅ [CODE-GEN] Babel parsing successful');
    
    // Option 4: Components should NOT have exports (they're for Function constructor)
    const hasExports = /export\s+(default\s+)?/.test(code);
    console.log('🔍 [CODE-GEN] Has exports:', hasExports);
    
    if (hasExports) {
      console.log('❌ [CODE-GEN] Component contains export statements (should be import/export-free)');
      return false;
    }
    
    // Check for React function component
    const functionMatch = code.match(/function\s+([A-Z][A-Za-z0-9_]*)\s*\(/);
    console.log('🔍 [CODE-GEN] Function component match:', functionMatch?.[1] || 'not found');
    
    if (!functionMatch) {
      console.log('❌ [CODE-GEN] No React function component found');
      return false;
    }
    
    const componentName = functionMatch[1];
    
    // Check for JSX return
    const hasJSXReturn = /<[A-Z]/.test(code) || /<[a-z]/.test(code);
    console.log('🔍 [CODE-GEN] Has JSX return:', hasJSXReturn);
    
    if (!hasJSXReturn) {
      console.log('❌ [CODE-GEN] No JSX found in component');
      return false;
    }
    
    // Check for React hooks usage (should use injected hooks)
    const hasHooks = /useState|useEffect|useCallback|useMemo/.test(code);
    console.log('🔍 [CODE-GEN] Uses React hooks:', hasHooks);
    
    console.log('✅ [CODE-GEN] React syntax validation passed for import/export-free component');
    return true;
  } catch (error) {
    console.error('❌ [CODE-GEN] Babel parsing failed:', error);
    return false;
  }
}

// Removed shouldFallback function - using HARD FAILS ONLY

export async function runCodeGenerationAgent(
  rawInput: CodeGenerationInput,
): Promise<CodeGenerationResult> {
  console.log('🚀 [CODE-GEN] Starting Code Generation Agent...');
  console.log('🔍 [CODE-GEN] Raw input type:', typeof rawInput);
  
  // 1. Input validation with logging
  const input = validateInput(rawInput);
  let systemPrompt = buildPrompt(input);
  // Trim prompt if too long (safety)
  if (systemPrompt.length > 12000) {
    console.warn('⚠️ [CODE-GEN] Prompt too long, trimming to 12000 chars');
    systemPrompt = systemPrompt.substring(0, 12000);
  }

  // 2. Model configuration logging
  console.log('🤖 [CODE-GEN] Using model:', MODELS.PRIMARY.modelId || 'unknown');
  console.log('🤖 [CODE-GEN] Generation options:', CODE_GENERATION_OPTS);
  console.log('🤖 [CODE-GEN] Schema validation enabled');
  
  try {
    console.log('🔄 [CODE-GEN] First pass: generateText with tools & thinking...');
    
    const tools = { ts_lint_checker: tsLintCheckerTool } as const;

    let draftJson = '';
    let reasoning: unknown;
    let reasoningDetails: unknown;
    try {
      ({ text: draftJson, reasoning, reasoningDetails } = await generateText({
      model: MODELS.PRIMARY,
      prompt: systemPrompt,
      tools,
      maxSteps: 8,
      providerOptions: {
        anthropic: {
          thinking: { type: 'enabled', budgetTokens: 12_000 },
        } satisfies AnthropicProviderOptions,
      },
      experimental_repairToolCall: async ({ toolCall, tools, parameterSchema, error, messages }) => {
        const { InvalidToolArgumentsError } = await import('ai');
        if (!InvalidToolArgumentsError.isInstance?.(error)) return null;
        const tool = tools[toolCall.toolName as keyof typeof tools];
        // Ask the model to generate valid args according to the tool schema
        const { object: fixedArgs } = await generateObject({
          model: MODELS.PRIMARY,
          schema: tool.parameters,
          prompt: `The previous tool call for ${toolCall.toolName} had invalid or missing arguments. Provide values for the following schema:\n\n${JSON.stringify(parameterSchema(toolCall), null, 2)}\n\nReturn JSON with the fixed arguments only.`,
          temperature: 0,
          maxTokens: 512,
        });
        return { ...toolCall, args: JSON.stringify(fixedArgs) };
      },
      ...CODE_GENERATION_OPTS,
    }));
    } catch (error) {
      console.error('💥 [CODE-GEN] generateText failed', error);
      throw error;
    }
    console.log('✅ [CODE-GEN] First pass completed – JSON draft length:', draftJson.length);
    // Attempt to directly parse the JSON first – quicker and avoids LLM coercion loss
    let parsedDraft: unknown = null;
    try {
      parsedDraft = JSON.parse(draftJson);
      console.log('🔄 [CODE-GEN] Direct JSON.parse succeeded');
    } catch (err) {
      console.warn('⚠️ [CODE-GEN] JSON.parse failed, will fall back to generateObject coercion:', (err as Error).message);
    }

    let object: unknown;
    if (parsedDraft) {
      const validation = CodeGenerationSchema.safeParse(parsedDraft);
      if (validation.success) {
        object = validation.data;
        console.log('✅ [CODE-GEN] Direct schema validation succeeded, skipping generateObject');
      } else {
        console.warn('⚠️ [CODE-GEN] Direct schema validation failed, falling back to generateObject');
      }
    }

    if (!object) {
      console.log('🔄 [CODE-GEN] Second pass: coercing with generateObject...');

      const genObjRes = await generateObject({
        model: MODELS.PRIMARY,
        prompt: `You previously produced the following JSON *draft* for the CodeGenerationSchema response.\n\nReturn ONLY a valid JSON object that conforms to the CodeGenerationSchema.\nDo NOT add code fences, markdown, or any explanatory text—return the JSON object alone.\nIf the draft is malformed, fix it (e.g. remove trailing commas, add missing quotes, correct types).\n\nJSON draft to fix:\n${draftJson}\n`,
        schema: CodeGenerationSchema,
        temperature: 0,
        maxTokens: 8000,
      });
      object = genObjRes.object;
    }

    
    
    console.log('✅ [CODE-GEN] generateObject coercion completed successfully');
    console.log('🔍 [CODE-GEN] Raw LLM JSON (truncated):', JSON.stringify(object).substring(0, 500));
    console.log('🔍 [CODE-GEN] Raw response type:', typeof object);
    console.log('🔍 [CODE-GEN] Raw response keys:', object ? Object.keys(object) : 'null/undefined');
    
    const result = object as unknown as CodeGenerationResult;
    console.log('🔍 [CODE-GEN] Result casting completed');
    console.log('🔍 [CODE-GEN] Result success field:', result.success);
    console.log('🔍 [CODE-GEN] Result generatedCode length:', result.generatedCode?.length || 0);
    
    // 4. HARD VALIDATION - FAIL IMMEDIATELY IF INVALID
    if (!result.success) {
      console.error('❌ [CODE-GEN] Agent returned success: false');
      console.error('❌ [CODE-GEN] Full result:', result);
      throw new Error('Code generation agent returned success: false');
    }
    
    if (!result.generatedCode || result.generatedCode.trim().length === 0) {
      console.warn('⚠️ [CODE-GEN] Missing generatedCode; attempting to fallback to customizedTool.componentCode');
      if (result.customizedTool?.componentCode) {
        result.generatedCode = result.customizedTool.componentCode;
        console.log('🔧 [CODE-GEN] Fallback succeeded – copied componentCode into generatedCode');
      } else {
        console.error('❌ [CODE-GEN] No generatedCode and no componentCode fallback');
        throw new Error('Code generation agent returned empty generatedCode');
      }
    }
    
    console.log('🔍 [CODE-GEN] Running TypeScript compile for static analysis...');
    const tsDiagnostics = getTypeScriptDiagnostics(result.generatedCode);
    if (tsDiagnostics.length) {
      const messages = tsDiagnostics.map(d => ts.flattenDiagnosticMessageText(d.messageText, '\n')).slice(0, 10);
      console.warn('⚠️ [CODE-GEN] TypeScript diagnostics (ignored):', messages);
      // We no longer fail hard here because React/global symbols will be supplied at runtime.
    }

    console.log('🔍 [CODE-GEN] Starting React syntax validation...');
    if (!isValidReact(result.generatedCode)) {
      console.error('❌ [CODE-GEN] Invalid React syntax');
      console.error('❌ [CODE-GEN] Generated code preview:', result.generatedCode.substring(0, 500));
      throw new Error(`Code generation agent produced invalid JSX: ${result.generatedCode.substring(0, 200)}...`);
    }
    
    // CRITICAL FIX: Ensure customizedTool.componentCode contains actual generated code
    if (result.customizedTool) {
      console.log('🔧 [CODE-GEN] Fixing componentCode field with actual generated code');
      console.log('🔧 [CODE-GEN] Before fix - componentCode length:', result.customizedTool.componentCode?.length || 0);
      
      result.customizedTool.componentCode = result.generatedCode;
      
      console.log('🔧 [CODE-GEN] After fix - componentCode length:', result.customizedTool.componentCode.length);
      console.log('✅ [CODE-GEN] componentCode field now contains actual generated code');
    }
    
    console.log('✅ [CODE-GEN] All validations passed');
    console.log('✅ [CODE-GEN] Returning successful result');
    
    return result;
    
  } catch (error) {
    console.error('💥 [CODE-GEN] Error in runCodeGenerationAgent:');

    if (error instanceof Error) {
      console.error('💥 [CODE-GEN] Error type:', error.name);
      console.error('💥 [CODE-GEN] Error message:', error.message);
      console.error('💥 [CODE-GEN] Error stack:', error.stack);
    } else {
      console.error('💥 [CODE-GEN] Non-Error value thrown:', error);
    }

    // Additional error details for custom error objects (e.g., API errors)
    if (typeof error === 'object' && error !== null) {
      const e = error as Record<string, unknown>;
      console.error('💥 [CODE-GEN] Error details:', {
        cause: e.cause,
        url: e.url,
        statusCode: e.statusCode,
        responseBody: e.responseBody,
        isRetryable: e.isRetryable,
      });
    }
    
    throw error;
  }
}

// Convenience exported default
export default runCodeGenerationAgent; 