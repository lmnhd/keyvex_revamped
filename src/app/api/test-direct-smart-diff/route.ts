import { NextResponse } from 'next/server';
import { appendFileSync } from 'fs';

export async function GET() {
  appendFileSync('c:/temp/direct-smart-diff.txt', `ROUTE_CALLED ${new Date().toISOString()}\n`);
  console.log('>>> DIRECT_SMART_DIFF_ROUTE_EXECUTED');
  
  try {
    // Import smart-diff DIRECTLY (same as AI Patcher approach)
    const { createSmartDiffTool } = await import('@/lib/ai/agentic-tools/filesystem/smart-diff');
    appendFileSync('c:/temp/direct-smart-diff.txt', `IMPORT_SUCCESS\n`);
    
    const tool = createSmartDiffTool();
    appendFileSync('c:/temp/direct-smart-diff.txt', `TOOL_CREATED\n`);
    
    if (!tool.execute) {
      throw new Error('Tool execute method is undefined');
    }
    
    const result = await (tool.execute as any)({
      filePath: 'test-simple.txt',
      editInstruction: 'Add "Line 5" at the end',
    });
    
    appendFileSync('c:/temp/direct-smart-diff.txt', `SUCCESS: ${JSON.stringify(result)}\n`);
    return NextResponse.json({ success: true, result });
    
  } catch (error: any) {
    appendFileSync('c:/temp/direct-smart-diff.txt', `ERROR: ${error.message}\n`);
    console.log('>>> DIRECT_SMART_DIFF_ERROR:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
