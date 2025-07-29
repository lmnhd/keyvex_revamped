import { NextResponse } from 'next/server';
import { runFileCoderAgent } from '@/lib/ai/agents/file-coder/core-logic';
import type { CodeGenerationInput } from '@/lib/types/tool';
import { getTemplateByType } from '@/lib/templates/baseline-templates';
import { promises as fs } from 'fs';
import path from 'path';
import json from './code-gen-input.json';

// -------------------------------------------------------------
// VERY SIMPLE TEST ENDPOINT
// GET /api/tests/code-agent
// Runs the code-generation agent with a hard-coded example input so
// you can quickly iterate on prompt tweaks without invoking the full
// surgical pipeline.
// -------------------------------------------------------------

// Configure timeout for smart-diff operations (up to 2 minutes)
export const maxDuration = 120; // 2 minutes in seconds

const savedInput: CodeGenerationInput = json as unknown as CodeGenerationInput;

export async function GET() {
  console.log('🚀 [TEST-AGENT] Starting FileCoder agent...');
  
  try {
    // Create working directory and baseline template file
    const workingDir = '/tmp/agent-fs';
    await fs.mkdir(workingDir, { recursive: true });
    
    // Get baseline template based on surgical plan
    const templateType = savedInput.surgicalPlan.sourceTemplate as 'calculator' | 'quiz' | 'planner' | 'form' | 'diagnostic';
    const baselineTemplate = getTemplateByType(templateType);
    
    if (!baselineTemplate || !baselineTemplate.componentCode) {
      throw new Error(`Baseline template not found for type: ${templateType}`);
    }

    // Create baseline component file
    const baselinePath = path.join(workingDir, 'component.tsx');
    await fs.writeFile(baselinePath, baselineTemplate.componentCode);
    
    console.log('📁 [TEST-AGENT] Created baseline template at:', baselinePath);
    console.log('🚀 [TEST-AGENT] Calling FileCoder agent (timeout: 2 minutes)...');
    
    // Set a timeout for the agent execution
    const agentPromise = runFileCoderAgent(
      savedInput.surgicalPlan,
      savedInput.researchData,
      workingDir
    );
    
    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('FileCoder agent timed out after 2 minutes'));
      }, 120000); // 2 minutes
    });
    
    // Race between agent execution and timeout
    const result = await Promise.race([agentPromise, timeoutPromise]) as string;
    
    console.log('✅ [TEST-AGENT] Agent completed successfully');
    return NextResponse.json({ success: true, result }, { status: 200 });
    
  } catch (error: any) {
    console.error('🚨 [TEST-AGENT] Failed:', error);
    
    // Check if it's a timeout error
    if (error.message.includes('timed out')) {
      return NextResponse.json(
        { 
          error: 'Agent execution timed out. Smart-diff tool operations can take up to 1 minute. Please try again.',
          timeout: true,
          message: error.message 
        },
        { status: 408 } // Request Timeout
      );
    }
    
    return NextResponse.json(
      { error: error?.message ?? 'Unknown error', stack: error?.stack },
      { status: 500 },
    );
  }
}