import { promises as fs, appendFileSync } from 'fs';
import path from 'path';
import { z } from 'zod';
import { applyPatch } from 'diff';
import { createHash } from 'crypto';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import type { Tool } from 'ai';
import type { ZodTypeAny } from 'zod';

// ---------------------------------------------------------------------------
// Parameter schema
// ---------------------------------------------------------------------------

const aiPatcherParams = z.object({
  filePath: z.string(),
  editInstruction: z.string(),
  expectedHash: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

function resolveSafePath(userPath: string): string {
  if (!userPath) throw new Error('Path may not be empty');
  const sandboxRoot = process.cwd();
  const resolved = path.resolve(sandboxRoot, userPath);
  if (!resolved.startsWith(sandboxRoot)) throw new Error('Path escapes sandbox root');
  return resolved;
}

function assertAllowedExtension(filePath: string) {
  const allowedExts = ['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.html', '.css', '.txt'];
  const ext = path.extname(filePath);
  if (!allowedExts.includes(ext)) throw new Error(`File type ${ext} is not permitted`);
}

// ---------------------------------------------------------------------------
// Prompt builder
// ---------------------------------------------------------------------------

function buildPrompt(fileContent: string, instruction: string, filename: string): string {
  const lines = fileContent.split('\n');
  return `You are a diff-only assistant.\n` +
    `Return **ONLY** a JSON object of the form {"diff":"<unified diff>"}.\n` +
    `\n` +
    `CRITICAL: The diff must be in proper unified diff format with:\n` +
    `1. Header lines: --- a/${filename} and +++ b/${filename}\n` +
    `2. Hunk header: @@ -start,count +start,count @@\n` +
    `3. Context lines (unchanged): prefixed with space\n` +
    `4. Removed lines: prefixed with -\n` +
    `5. Added lines: prefixed with +\n` +
    `\n` +
    `Example format:\n` +
    `--- a/file.txt\n` +
    `+++ b/file.txt\n` +
    `@@ -1,3 +1,4 @@\n` +
    ` unchanged line\n` +
    ` another unchanged\n` +
    `+new line added\n` +
    `\n` +
    `The file has exactly ${lines.length} lines.\n` +
    `>>>FILE (${lines.length} lines)\n${fileContent}\n<<<END\n` +
    `>>>INSTRUCTION\n${instruction}\n<<<END`;
}

// ---------------------------------------------------------------------------
// Executor
// ---------------------------------------------------------------------------
appendFileSync('c:/temp/ai-patcher.txt', `${new Date().toISOString()} AI_PATCHER_LOADED\n`);

async function executeAiPatcher(args: z.infer<typeof aiPatcherParams>) {
  console.log('>>> AI_PATCHER_FUNCTION_START');
  appendFileSync('c:/temp/ai-patcher.txt', `FUNCTION_CALLED: ${JSON.stringify(args)}\n`);
  
  const { filePath, editInstruction, expectedHash } = aiPatcherParams.parse(args);

  const abs = resolveSafePath(filePath);
  appendFileSync('c:/temp/ai-patcher.txt', `PATH_RESOLVED: ${abs}\n`);
  
  assertAllowedExtension(abs);
  appendFileSync('c:/temp/ai-patcher.txt', `EXTENSION_OK\n`);

  const original = await fs.readFile(abs, 'utf8');
  appendFileSync('c:/temp/ai-patcher.txt', `FILE_READ: ${original.length} chars\n`);

  if (expectedHash) {
    const hash = createHash('sha1').update(original, 'utf8').digest('hex');
    if (hash !== expectedHash) {
      throw new Error('File hash mismatch – file changed since diff was generated');
    }
  }

  const prompt = buildPrompt(original, editInstruction, path.basename(filePath));

  let diff: string | undefined;
  let attempt = 0;
  const maxAttempts = 2;
  
  appendFileSync('c:/temp/ai-patcher.txt', `STARTING_LOOP: attempt=${attempt} max=${maxAttempts}\n`);
  
  while (attempt < maxAttempts) {
    appendFileSync('c:/temp/ai-patcher.txt', `ITERATION: ${attempt + 1}\n`);
    console.log(`[ai-patcher] >>> iteration ${attempt + 1}/${maxAttempts}`);
    
    console.log('>>> ABOUT_TO_CALL_GENERATETEXT');
    console.log('>>> API KEY CHECK:', process.env.OPENAI_API_KEY ? 'EXISTS' : 'MISSING');
    const completion = await generateText({
      model: openai.chat('o3-mini'),
      prompt,
      maxTokens: 2048,
      temperature: 0,
    });

    appendFileSync('c:/temp/ai-patcher.txt', `LLM_RESPONSE_RECEIVED\n`);
    console.log('[ai-patcher] Raw LLM response:', JSON.stringify(completion.text));
    appendFileSync('c:/temp/ai-patcher.txt', `RAW_RESPONSE: ${completion.text}\n`);

    try {
      const parsed = JSON.parse(completion.text.trim());
      diff = parsed.diff;
    } catch (err) {
      console.warn('[ai-patcher] JSON parse failed', err);
      attempt += 1;
      if (attempt >= maxAttempts) throw new Error('LLM returned non-JSON');
      continue;
    }

    if (typeof diff !== 'string') throw new Error('Missing diff in LLM response');
    if (!diff) {
      attempt += 1;
      if (attempt >= maxAttempts) throw new Error('Empty diff from LLM');
      continue;
    }

    console.log('[ai-patcher] generated diff\n', diff);
    appendFileSync('c:/temp/ai-patcher.txt', `APPLYING_PATCH\n`);
    
    const patched = applyPatch(original, diff, { fuzzFactor: 6 });
    if (patched === false) {
      console.warn('[ai-patcher] patch failed – context mismatch');
      console.log('[ai-patcher] Original file lines:', original.split('\n').length);
      console.log('[ai-patcher] Original content:', JSON.stringify(original));
      console.log('[ai-patcher] Failed diff:', diff);
      appendFileSync('c:/temp/ai-patcher.txt', `PATCH_FAILED_ATTEMPT_${attempt + 1}\nORIGINAL_LINES: ${original.split('\n').length}\nDIFF:\n${diff}\n---\n`);
      attempt += 1;
      if (attempt >= maxAttempts) {
        throw new Error('AI_PATCHER_PATCH_FAILED_FINAL');
      }
      continue;
    }

    if (Buffer.byteLength(patched, 'utf8') > 1 * 1024 * 1024) {
      throw new Error('Patched file exceeds size limit');
    }

    await fs.writeFile(abs, patched, 'utf8');
    appendFileSync('c:/temp/ai-patcher.txt', `SUCCESS\n`);
    return { success: true, patchApplied: diff };
  }
  
  console.error('[ai-patcher] loop exhausted, throwing');
  appendFileSync('c:/temp/ai-patcher.txt', `LOOP_EXHAUSTED\n`);
  throw new Error('AI_PATCHER_FAILED_AFTER_RETRIES');
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createAiPatcherTool(): Tool {
  console.log('>>> CREATE_AI_PATCHER_TOOL_CALLED');
  appendFileSync('c:/temp/ai-patcher.txt', `TOOL_FACTORY_CALLED\n`);
  
  return {
    description: 'Generate a unified diff via OpenAI and apply it to a file',
    parameters: aiPatcherParams as unknown as ZodTypeAny,
    execute: (async (args: any) => {
      console.log('>>> AI_PATCHER_EXECUTE_WRAPPER_CALLED:', JSON.stringify(args));
      appendFileSync('c:/temp/ai-patcher.txt', `EXECUTE_WRAPPER_CALLED\n`);
      return await executeAiPatcher(args);
    }) as any,
  } as Tool;
}
