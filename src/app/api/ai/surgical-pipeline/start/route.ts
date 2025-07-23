import { NextRequest, NextResponse } from 'next/server';
import { runPreprocessingAgent } from '@/lib/ai/agents/preprocessing/core-logic';
import { runSurgicalPlanningAgent } from '@/lib/ai/agents/surgical-planning/core-logic';
import { runDataResearchAgent } from '@/lib/ai/agents/data-research/core-logic';
import { runCodeGenerationAgent } from '@/lib/ai/agents/code-generation/core-logic';
import { Tool } from '@/lib/types/tool';

/**
 * Surgical Pipeline API Route - Orchestrates the 4-agent pipeline
 * BASIC IMPLEMENTATION - Focus on process functionality only
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userPrompt, businessType, industry } = body;

    if (!userPrompt || typeof userPrompt !== 'string' || userPrompt.trim().length < 10) {
      return NextResponse.json(
        { error: 'Business description must be at least 10 characters' },
        { status: 400 }
      );
    }

    // STEP 1: Run Preprocessing Agent (the only one implemented so far)
    const preprocessingResult = await runPreprocessingAgent({
      userPrompt: userPrompt.trim(),
      businessType,
      industry
    });

    console.log('=== PREPROCESSING RESULT DEBUG ===');
    console.log('Type:', typeof preprocessingResult);
    console.log('Keys:', Object.keys(preprocessingResult || {}));
    console.log('Full result:', JSON.stringify(preprocessingResult, null, 2));
    console.log('Has selectedTemplate:', 'selectedTemplate' in (preprocessingResult || {}));
    console.log('selectedTemplate value:', preprocessingResult?.selectedTemplate);
    console.log('================================');

    // STEP 2: Run Surgical Planning Agent
    const surgicalPlan = await runSurgicalPlanningAgent({
      preprocessingResult
    });

    // STEP 3: Run Data Research Agent
    const researchData = await runDataResearchAgent({
      surgicalPlan
    });

    console.log('=== DATA RESEARCH RESULT DEBUG ===');
    console.log('Type:', typeof researchData);
    console.log('Keys:', Object.keys(researchData || {}));
    console.log('Has modificationData:', 'modificationData' in (researchData || {}));
    console.log('ModificationData type:', typeof researchData?.modificationData);
    console.log('ModificationData value:', researchData?.modificationData);
    console.log('Full result:', JSON.stringify(researchData, null, 2));
    console.log('===================================');

    // STEP 4: Run Code Generation Agent
    const codeGenerationResult = await runCodeGenerationAgent({
      surgicalPlan,
      researchData
    });

    console.log('=== CODE GENERATION RESULT DEBUG ===');
    console.log('Type:', typeof codeGenerationResult);
    console.log('Keys:', Object.keys(codeGenerationResult || {}));
    console.log('Success:', codeGenerationResult?.success);
    console.log('Has customizedTool:', 'customizedTool' in (codeGenerationResult || {}));
    console.log('CustomizedTool value:', codeGenerationResult?.customizedTool);
    console.log('Validation errors:', codeGenerationResult?.validationErrors);
    console.log('Full result:', JSON.stringify(codeGenerationResult, null, 2));
    console.log('=====================================');

    if (!codeGenerationResult.success || !codeGenerationResult.customizedTool) {
      throw new Error('Code generation failed: ' + (codeGenerationResult.validationErrors?.join(', ') || 'Unknown error'));
    }

    return NextResponse.json({
      success: true,
      tool: codeGenerationResult.customizedTool,
      preprocessingResult,
      surgicalPlan,
      researchData,
      codeGenerationResult,
      message: 'Tool generated successfully through complete AI pipeline'
    });

  } catch (error) {
    console.error('Surgical pipeline error:', error);
    return NextResponse.json(
      { 
        error: 'Pipeline processing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

