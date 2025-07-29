import { NextResponse } from 'next/server';
import { appendFileSync } from 'fs';

export async function GET() {
  appendFileSync('c:/temp/ai-patcher-route.txt', `ROUTE_CALLED ${new Date().toISOString()}\n`);
  console.log('>>> AI_PATCHER_ROUTE_EXECUTED');
  
  try {
    // Import and call ai-patcher directly
    const { createAiPatcherTool } = await import('@/lib/ai/agentic-tools/filesystem/ai-patcher');
    appendFileSync('c:/temp/ai-patcher-route.txt', `IMPORT_SUCCESS\n`);
    
    const tool = createAiPatcherTool();
    appendFileSync('c:/temp/ai-patcher-route.txt', `TOOL_CREATED\n`);
    
    if (!tool.execute) {
      throw new Error('Tool execute method is undefined');
    }
    
    const result = await (tool.execute as any)({
      filePath: 'test-simple.txt',
      editInstruction: 'Add "Line 4" at the end',
    });
    
    appendFileSync('c:/temp/ai-patcher-route.txt', `SUCCESS: ${JSON.stringify(result)}\n`);
    return NextResponse.json({ success: true, result });
    
  } catch (error: any) {
    appendFileSync('c:/temp/ai-patcher-route.txt', `ERROR: ${error.message}\n`);
    console.log('>>> AI_PATCHER_ERROR:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
