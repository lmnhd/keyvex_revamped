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

    // STEP 2: Run Surgical Planning Agent
    const surgicalPlan = await runSurgicalPlanningAgent({
      preprocessingResult
    });

    // STEP 3: Run Data Research Agent
    const researchData = await runDataResearchAgent({
      surgicalPlan
    });

    // STEP 4: Run Code Generation Agent
    const codeGenerationResult = await runCodeGenerationAgent({
      surgicalPlan,
      researchData
    });

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

