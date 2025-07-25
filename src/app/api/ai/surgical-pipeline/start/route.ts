import { NextRequest, NextResponse } from 'next/server';
import { runPreprocessingAgent } from '@/lib/ai/agents/preprocessing/core-logic';
import { runSurgicalPlanningAgent } from '@/lib/ai/agents/surgical-planning/core-logic';
import { runDataResearchAgent } from '@/lib/ai/agents/data-research/core-logic';
import { runCodeGenerationAgent } from '@/lib/ai/agents/code-generation/core-logic';
import { Tool } from '@/lib/types/tool';

// Utility: sleep helper for back-off
const sleep = (ms: number) => new Promise<void>(res => setTimeout(res, ms));

// Exponential-backoff retry wrapper for model calls
async function withRetry<T>(fn: () => Promise<T>, maxAttempts = 6): Promise<T> {
  let attempt = 0;
  let lastErr: unknown;
  while (attempt < maxAttempts) {
    try {
      if (attempt > 0) {
        console.log(`⏳ [SURGICAL-PIPELINE] Retry attempt #${attempt + 1}`);
      }
      return await fn();
    } catch (err: unknown) {
      lastErr = err;
      const isOverload = typeof err === 'object' && err !== null &&
        ( (err as any).message?.includes('Overloaded') || (err as any).status === 429 );
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
    const body = await request.json();
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
    
    const preprocessingResult = await withRetry(() => runPreprocessingAgent(preprocessingInput));
    console.log('✅ [SURGICAL-PIPELINE] STEP 1 completed successfully');

    console.log('=== PREPROCESSING RESULT DEBUG ===');
    console.log('Type:', typeof preprocessingResult);
    console.log('Keys:', Object.keys(preprocessingResult || {}));
    console.log('Full result:', JSON.stringify(preprocessingResult, null, 2));
    console.log('Has selectedTemplate:', 'selectedTemplate' in (preprocessingResult || {}));
    console.log('selectedTemplate value:', preprocessingResult?.selectedTemplate);
    console.log('================================');

    // STEP 2: Run Surgical Planning Agent
    console.log('🔄 [SURGICAL-PIPELINE] STEP 2: Starting surgical planning agent...');
    const surgicalPlanningInput = { preprocessingResult };
    console.log('🔍 [SURGICAL-PIPELINE] Surgical planning input keys:', Object.keys(surgicalPlanningInput));
    
    const surgicalPlan = await withRetry(() => runSurgicalPlanningAgent(surgicalPlanningInput));
    console.log('✅ [SURGICAL-PIPELINE] STEP 2 completed successfully');
    console.log('🔍 [SURGICAL-PIPELINE] Surgical plan keys:', Object.keys(surgicalPlan || {}));

    // STEP 3: Run Data Research Agent
    console.log('🔄 [SURGICAL-PIPELINE] STEP 3: Starting data research agent...');
    const dataResearchInput = { surgicalPlan };
    console.log('🔍 [SURGICAL-PIPELINE] Data research input keys:', Object.keys(dataResearchInput));
    
    const researchData = await withRetry(() => runDataResearchAgent(dataResearchInput));
    console.log('✅ [SURGICAL-PIPELINE] STEP 3 completed successfully');
    console.log('🔍 [SURGICAL-PIPELINE] Research data keys:', Object.keys(researchData || {}));

    console.log('=== DATA RESEARCH RESULT DEBUG ===');
    console.log('Type:', typeof researchData);
    console.log('Keys:', Object.keys(researchData || {}));
    console.log('Has modificationData:', 'modificationData' in (researchData || {}));
    console.log('ModificationData type:', typeof researchData?.modificationData);
    console.log('ModificationData value:', researchData?.modificationData);
    console.log('Full result:', JSON.stringify(researchData, null, 2));
    console.log('===================================');

    // STEP 4: Run Code Generation Agent
    console.log('🔄 [SURGICAL-PIPELINE] STEP 4: Starting code generation agent...');
    const codeGenerationInput = { surgicalPlan, researchData };
    console.log('🔍 [SURGICAL-PIPELINE] Code generation input keys:', Object.keys(codeGenerationInput));
    console.log('🔍 [SURGICAL-PIPELINE] Input validation - surgicalPlan:', !!surgicalPlan);
    console.log('🔍 [SURGICAL-PIPELINE] Input validation - researchData:', !!researchData);
    
    const codeGenerationResult = await withRetry(() => runCodeGenerationAgent(codeGenerationInput));
    console.log('✅ [SURGICAL-PIPELINE] STEP 4 completed successfully');
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
    
    const response = {
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

    const overload = typeof error === 'object' && error !== null && ((error as any).message?.includes('Overloaded') || (error as any).status === 429);

    const errorResponse = {
      error: 'Pipeline processing failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      step: 'Unknown - check logs for details',
    };

    console.error('💥 [SURGICAL-PIPELINE] Returning error response:', errorResponse);
    return NextResponse.json(errorResponse, { status: overload ? 503 : 500 });
    

  }
}

