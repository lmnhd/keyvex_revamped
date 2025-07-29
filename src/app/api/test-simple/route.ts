import { NextResponse } from 'next/server';
import { appendFileSync } from 'fs';

export async function GET() {
  appendFileSync('c:/temp/simple-test.txt', `SIMPLE ROUTE CALLED ${new Date().toISOString()}\n`);
  console.log('>>> SIMPLE ROUTE EXECUTED');
  
  try {
    // Import and call smart-diff directly
    const { createSmartDiffTool } = await import('@/lib/ai/agentic-tools/filesystem/smart-diff');
    const tool = createSmartDiffTool();
    
    appendFileSync('c:/temp/simple-test.txt', `TOOL CREATED\n`);
    
    const result = await tool.execute({
      filePath: 'test.txt',
      editInstruction: 'Add "Hello World" to the file',
    });
    
    appendFileSync('c:/temp/simple-test.txt', `SUCCESS: ${JSON.stringify(result)}\n`);
    return NextResponse.json({ success: true, result });
    
  } catch (error: any) {
    appendFileSync('c:/temp/simple-test.txt', `ERROR: ${error.message}\n`);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
