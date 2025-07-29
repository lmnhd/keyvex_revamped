import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';
import { createFilesystemTools } from '@/lib/ai/agentic-tools/filesystem';

// ---------------------------------------------------------------------------
// Simple test cases for smart_diff
// ---------------------------------------------------------------------------

interface TestCase {
  id: string;
  filename: string;           // relative to sandbox root
  initialContent: string;
  editInstruction: string;
}

const TEST_CASES: TestCase[] = [
  {
    id: 'replace-word',
    filename: 'example.txt',
    initialContent: 'Hello World',
    editInstruction: 'Change the word "World" to "Universe"',
  },
  {
    id: 'add-line',
    filename: 'list.txt',
    initialContent: 'apples\nbananas',
    editInstruction: 'Add a new line with the word "cherries" at the end',
  },
  {
    id: 'complex-edit',
    filename: 'script.js',
    initialContent: 'function add(a,b){return a+b};',
    editInstruction: 'Refactor to multiline function with spaces after commas and add semicolon at the end of each line',
  },
];
console.log('🛠  smart-diff route loaded – OPENAI key?', !!process.env.OPENAI_API_KEY);
// GET /api/tests/smart-diff?case=replace-word
export async function GET(req: Request) {
  console.log('>>> ROUTE GET STARTED');
  const url = new URL(req.url);
  const caseId = url.searchParams.get('case') || 'replace-word';
  const test = TEST_CASES.find((t) => t.id === caseId);

  if (!test) {
    return NextResponse.json({ error: `Unknown case: ${caseId}` }, { status: 400 });
  }

  // Prepare sandbox root
  const fsTools = createFilesystemTools();
  const sandboxRoot = '/tmp/smart-diff-tests';
  await (fsTools["set_filesystem_default"].execute as any)({ path: sandboxRoot });

  // Ensure directory exists
  await fs.mkdir(sandboxRoot, { recursive: true });

  const absFile = path.join(sandboxRoot, test.filename);

  // Write initial content fresh each run
  await fs.writeFile(absFile, test.initialContent, 'utf8');

  const smartDiff = fsTools['smart_diff'];

  const maxAttempts = 3;
  let attempt = 0;
  let lastErr: any = null;
  while (attempt < maxAttempts) {
    try {
      console.log('>>> ABOUT TO CALL smartDiff.execute');
      const result = await (smartDiff.execute as any)({
        filePath: test.filename,
        editInstruction: test.editInstruction,
      });
      const finalContent = await fs.readFile(absFile, 'utf8');
      return NextResponse.json({ test: caseId, attempts: attempt + 1, result, finalContent }, { status: 200 });
    } catch (err: any) {
      lastErr = err;
      attempt += 1;
      if (attempt < maxAttempts) {
        // simple backoff 200ms increments
        await new Promise((r) => setTimeout(r, attempt * 200));
      }
    }
  }
  return NextResponse.json({ error: lastErr?.message ?? 'Unknown error', stack: lastErr?.stack, attempts: attempt }, { status: 500 });
}
