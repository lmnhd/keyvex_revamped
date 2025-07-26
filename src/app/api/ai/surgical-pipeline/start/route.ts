import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs/promises';
import { experimental_createMCPClient as createMCPClient } from 'ai';
import { z } from 'zod';
import { runPreprocessingAgent } from '@/lib/ai/agents/preprocessing/core-logic';
import { runSurgicalPlanningAgent } from '@/lib/ai/agents/surgical-planning/core-logic';
import { runDataResearchAgent } from '@/lib/ai/agents/data-research/core-logic';
import { runFileCoderAgent } from '@/lib/ai/agents/file-coder/core-logic';
import { tsLintCheckerFileTool } from '@/lib/ai/agentic-tools/vercel-tool/ts-lint-checker-file';
import { PreprocessingResult, SurgicalPlan, ResearchData } from '@/lib/types/tool';
import type { Tool as AiTool } from 'ai';
import { getTemplateByType } from '@/lib/templates/baseline-templates';

// ----------------- Local simple types (avoid generics) -----------------
interface CustomizedTool {
  id: string;
  title: string;
  type: string;
  componentCode: string;
  leadCapture: {
    emailRequired: boolean;
    trigger: string;
    incentive: string;
  };
  createdAt: number;
  updatedAt: number;
}

interface CodeGenerationResult {
  success: boolean;
  customizedTool: CustomizedTool;
  validationErrors?: string[];
}

interface PipelineRequest {
  userPrompt: string;
  businessType?: string;
  industry?: string;
}

interface PipelineResponse {
  success: boolean;
  tool: CustomizedTool;
  preprocessingResult: PreprocessingResult;
  surgicalPlan: SurgicalPlan;
  researchData: ResearchData;
  codeGenerationResult: CodeGenerationResult;
  message: string;
}

interface PipelineError {
  error: string;
  details: string;
  step: string;
}

interface RetryableError {
  message: string;
  status?: number;
}

interface MCPTools {
  [toolName: string]: {
    invoke?: (params: Record<string, unknown>) => Promise<Record<string, unknown>>;
    execute?: (args: Record<string, unknown>, options?: Record<string, unknown>) => Promise<Record<string, unknown>>;
    [key: string]: unknown;
  };
}
// -----------------------------------------------------------------------

// Utility: sleep helper for back-off
const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

// Exponential-backoff retry wrapper for model calls
async function withRetry<T>(fn: () => Promise<T>, maxAttempts = 6): Promise<T> {
  let attempt = 0;
  let lastErr: Error = new Error('Unknown error');
  while (attempt < maxAttempts) {
    try {
      if (attempt > 0) {
        console.log(`⏳ [SURGICAL-PIPELINE] Retry attempt #${attempt + 1}`);
      }
      return await fn();
    } catch (err: unknown) {
      lastErr = err instanceof Error ? err : new Error(String(err));
      const isOverload = err instanceof Error && 
        (err.message?.includes('Overloaded') || (err as RetryableError).status === 429);
      if (!isOverload) throw err; // non-retryable
      const backoff = Math.pow(2, attempt) * 1000; // 1s,2s,4s,8s,...
      console.warn(`⚠️  [SURGICAL-PIPELINE] Overloaded error – backing off for ${backoff} ms`);
      await sleep(backoff);
      attempt += 1;
    }
  }
  throw lastErr;
}

/**
 * Surgical Pipeline API Route - Orchestrates the 4-agent pipeline
 * BASIC IMPLEMENTATION - Focus on process functionality only
 */
export async function POST(request: NextRequest) {
  console.log('🚀 [SURGICAL-PIPELINE] Starting surgical pipeline...');
  
  try {
    console.log('🔄 [SURGICAL-PIPELINE] Parsing request body...');
    const body = await request.json() as PipelineRequest;
    console.log('🔍 [SURGICAL-PIPELINE] Request body keys:', Object.keys(body));
    console.log('🔍 [SURGICAL-PIPELINE] Request body:', JSON.stringify(body, null, 2));
    
    const { userPrompt, businessType, industry } = body;
    console.log('🔍 [SURGICAL-PIPELINE] Extracted values:', {
      userPrompt: userPrompt?.substring(0, 100) + '...',
      businessType,
      industry
    });

    if (!userPrompt || typeof userPrompt !== 'string' || userPrompt.trim().length < 10) {
      console.error('❌ [SURGICAL-PIPELINE] Invalid userPrompt');
      return NextResponse.json(
        { error: 'Business description must be at least 10 characters' },
        { status: 400 }
      );
    }

    // STEP 1: Run Preprocessing Agent
    console.log('🔄 [SURGICAL-PIPELINE] STEP 1: Starting preprocessing agent...');
    const preprocessingInput = {
      userPrompt: userPrompt.trim(),
      businessType,
      industry
    };
    console.log('🔍 [SURGICAL-PIPELINE] Preprocessing input:', preprocessingInput);
    
    const preprocessingResult: PreprocessingResult = await withRetry(() => runPreprocessingAgent(preprocessingInput));
    console.log('✅ [SURGICAL-PIPELINE] STEP 1 completed successfully');

    console.log('=== PREPROCESSING RESULT DEBUG ===');
    console.log('Type:', typeof preprocessingResult);
    console.log('Keys:', Object.keys(preprocessingResult || {}));
    console.log('Full result:', JSON.stringify(preprocessingResult, null, 2));
    console.log('Has selectedTemplate:', Object.prototype.hasOwnProperty.call(preprocessingResult ?? {}, 'selectedTemplate'));
    console.log('selectedTemplate value:', preprocessingResult?.selectedTemplate);
    console.log('================================');

    // STEP 2: Run Surgical Planning Agent
    console.log('🔄 [SURGICAL-PIPELINE] STEP 2: Starting surgical planning agent...');
    const surgicalPlanningInput = { preprocessingResult };
    console.log('🔍 [SURGICAL-PIPELINE] Surgical planning input keys:', Object.keys(surgicalPlanningInput));
    
    const surgicalPlan: SurgicalPlan = await withRetry(() => runSurgicalPlanningAgent(surgicalPlanningInput));
    console.log('✅ [SURGICAL-PIPELINE] STEP 2 completed successfully');
    console.log('🔍 [SURGICAL-PIPELINE] Surgical plan keys:', Object.keys(surgicalPlan || {}));

    // STEP 3: Run Data Research Agent
    console.log('🔄 [SURGICAL-PIPELINE] STEP 3: Starting data research agent...');
    const dataResearchInput = { surgicalPlan };
    console.log('🔍 [SURGICAL-PIPELINE] Data research input keys:', Object.keys(dataResearchInput));
    
    const researchData: ResearchData = await withRetry(() => runDataResearchAgent(dataResearchInput));
    console.log('✅ [SURGICAL-PIPELINE] STEP 3 completed successfully');
    console.log('🔍 [SURGICAL-PIPELINE] Research data keys:', Object.keys(researchData || {}));

    console.log('=== DATA RESEARCH RESULT DEBUG ===');
    console.log('Type:', typeof researchData);
    console.log('Keys:', Object.keys(researchData || {}));
    console.log('Has modificationData:', researchData && 'modificationData' in researchData);
    console.log('ModificationData type:', typeof researchData?.modificationData);
    console.log('ModificationData value:', researchData?.modificationData);
    console.log('Full result:', JSON.stringify(researchData, null, 2));
    console.log('===================================');

    // STEP 4: Run FileCoder Agent
    console.log('🔄 [SURGICAL-PIPELINE] STEP 4: Starting FileCoder agent...');

    // Workspace setup
    const sessionId = crypto.randomUUID();
    const tempDir = path.join('/tmp', sessionId);
    await fs.mkdir(tempDir, { recursive: true });

    // Get baseline template based on surgical plan
    const templateType = surgicalPlan.sourceTemplate as 'calculator' | 'quiz' | 'planner' | 'form' | 'diagnostic';
    const baselineTemplate = getTemplateByType(templateType);
    
    if (!baselineTemplate || !baselineTemplate.componentCode) {
      throw new Error(`Baseline template not found for type: ${templateType}`);
    }

    // Create baseline component file
    const baselinePath = path.join(tempDir, 'component.tsx');
    await fs.writeFile(baselinePath, baselineTemplate.componentCode);

    // ---------------------------------------------------------------------
    // MCP Client + tools
    // ---------------------------------------------------------------------
    const mcpServerUrl = process.env.FILESYSTEM_MCP_SERVER;
    if (!mcpServerUrl) throw new Error('FILESYSTEM_MCP_SERVER env missing');

    const mcpClient = await createMCPClient({
      transport: {
        type: 'sse',
        url: mcpServerUrl,
      },
    });

    const fsTools = await mcpClient.tools({
      schemas: {
        set_filesystem_default: { parameters: z.object({ path: z.string() }) },
        read_file: { parameters: z.object({ path: z.string() }) },
        update_file: { parameters: z.object({ path: z.string(), new_content: z.string() }) },
      },
    });

    // Build Tool map expected by FileCoder Agent
    const allTools = {
      ...fsTools,
      tsLintCheckerFileTool,
    } satisfies Record<string, AiTool>;

    // Run the agent (tools are created internally now)
    const agentRaw = await withRetry(() =>
      runFileCoderAgent(surgicalPlan, researchData, tempDir),
    );

    let agentResponse: { success?: boolean; message?: string } = {};
    try {
      agentResponse = JSON.parse(agentRaw);
    } catch (err) {
      console.error('Failed to parse FileCoder response', agentRaw);
    }

    console.log('✅ [SURGICAL-PIPELINE] STEP 4 completed successfully');

    // Read final code from tempDir
    const finalCode = await fs.readFile(path.join(tempDir, 'component.tsx'), 'utf-8');

    const codeGenerationResult: CodeGenerationResult = {
      success: !!agentResponse.success,
      customizedTool: {
        id: sessionId,
        title: 'Generated Tool',
        type: 'form',
        componentCode: finalCode,
        leadCapture: { emailRequired: false, trigger: 'after_results', incentive: '' },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      validationErrors: [],
    };

    // Close MCP and clean up
    await mcpClient.close();
    await fs.rm(tempDir, { recursive: true, force: true });
    console.log('🔍 [SURGICAL-PIPELINE] Code generation result keys:', Object.keys(codeGenerationResult || {}));

    console.log('=== CODE GENERATION RESULT DEBUG ===');
    console.log('Type:', typeof codeGenerationResult);
    console.log('Keys:', Object.keys(codeGenerationResult || {}));
    console.log('Success:', codeGenerationResult?.success);
    console.log('Has customizedTool:', 'customizedTool' in (codeGenerationResult || {}));
    console.log('CustomizedTool value:', codeGenerationResult?.customizedTool);
    console.log('Validation errors:', codeGenerationResult?.validationErrors);
    console.log('Full result:', JSON.stringify(codeGenerationResult, null, 2));
    console.log('=====================================');

    console.log('🔍 [SURGICAL-PIPELINE] Final validation...');
    if (!codeGenerationResult.success || !codeGenerationResult.customizedTool) {
      console.error('❌ [SURGICAL-PIPELINE] Code generation validation failed');
      console.error('❌ [SURGICAL-PIPELINE] Success:', codeGenerationResult.success);
      console.error('❌ [SURGICAL-PIPELINE] Has customizedTool:', !!codeGenerationResult.customizedTool);
      console.error('❌ [SURGICAL-PIPELINE] Validation errors:', codeGenerationResult.validationErrors);
      throw new Error('Code generation failed: ' + (codeGenerationResult.validationErrors?.join(', ') || 'Unknown error'));
    }

    console.log('✅ [SURGICAL-PIPELINE] All steps completed successfully!');
    console.log('🔍 [SURGICAL-PIPELINE] Final tool title:', codeGenerationResult.customizedTool.title);
    console.log('🔍 [SURGICAL-PIPELINE] Final tool type:', codeGenerationResult.customizedTool.type);
    
    const response: PipelineResponse = {
      success: true,
      tool: codeGenerationResult.customizedTool,
      preprocessingResult,
      surgicalPlan,
      researchData,
      codeGenerationResult,
      message: 'Tool generated successfully through complete AI pipeline'
    };
    
    console.log('🚀 [SURGICAL-PIPELINE] Returning successful response');
    return NextResponse.json(response);

  } catch (error: unknown) {
    console.error('💥 [SURGICAL-PIPELINE] Pipeline error occurred:');

    if (error instanceof Error) {
      console.error('💥 [SURGICAL-PIPELINE] Error type:', error.name);
      console.error('💥 [SURGICAL-PIPELINE] Error message:', error.message);
      console.error('💥 [SURGICAL-PIPELINE] Error stack:', error.stack);
    } else {
      console.error('💥 [SURGICAL-PIPELINE] Non-Error value thrown:', error);
    }

    // Additional structured details if available
    if (typeof error === 'object' && error !== null) {
      const e = error as Record<string, unknown>;
      console.error('💥 [SURGICAL-PIPELINE] Additional error details:', {
        cause: e.cause,
        url: e.url,
        statusCode: e.statusCode,
        responseBody: e.responseBody,
        isRetryable: e.isRetryable,
      });
    }

    const overload = typeof error === 'object' && error !== null && ((error as RetryableError).message?.includes('Overloaded') || (error as RetryableError).status === 429);

    const errorResponse: PipelineError = {
      error: 'Pipeline processing failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      step: 'Unknown - check logs for details',
    };

    console.error('💥 [SURGICAL-PIPELINE] Returning error response:', errorResponse);
    return NextResponse.json(errorResponse, { status: overload ? 503 : 500 });
    

  }
}

