import { NextResponse } from 'next/server';
import { runFileCoderAgent } from '@/lib/ai/agents/file-coder/core-logic';
import type { CodeGenerationInput } from '@/lib/types/tool';
import json from './code-gen-input.json';

// -------------------------------------------------------------
// VERY SIMPLE TEST ENDPOINT
// GET /api/tests/code-agent
// Runs the code-generation agent with a hard-coded example input so
// you can quickly iterate on prompt tweaks without invoking the full
// surgical pipeline.
// -------------------------------------------------------------

const savedInput: CodeGenerationInput = json as unknown as CodeGenerationInput;

export async function GET() {
  console.log('🚀 [TEST-AGENT] Starting FileCoder agent...');
  
  try {
    console.log('🚀 [TEST-AGENT] Calling FileCoder agent...');
    
    const result = await runFileCoderAgent(
      savedInput.surgicalPlan,
      savedInput.researchData,
      '/tmp'
    );
    
    console.log('✅ [TEST-AGENT] Agent completed successfully');
    return NextResponse.json(result, { status: 200 });
    
  } catch (error: any) {
    console.error('🚨 [TEST-AGENT] Failed:', error);
    return NextResponse.json(
      { error: error?.message ?? 'Unknown error', stack: error?.stack },
      { status: 500 },
    );
  }
}