import { NextResponse } from 'next/server';
import { runCodeGenerationAgent } from '@/lib/ai/agents/code-generation/core-logic';
import type { CodeGenerationInput } from '@/lib/types/tool';
import json from './code-gen-input.json'

// -------------------------------------------------------------
// VERY SIMPLE TEST ENDPOINT
// GET /api/tests/code-agent
// Runs the code-generation agent with a hard-coded example input so
// you can quickly iterate on prompt tweaks without invoking the full
// surgical pipeline.
// -------------------------------------------------------------

const savedInput: CodeGenerationInput = json as unknown as CodeGenerationInput;

export async function GET() {
  try {
    const result = await runCodeGenerationAgent(savedInput);
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? 'Unknown error', stack: error?.stack },
      { status: 500 },
    );
  }
}
