import { promises as fs, appendFileSync } from 'fs';
import path from 'path';
import { z } from 'zod';
import { applyPatch } from 'diff';
import { createHash } from 'crypto';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import type { Tool } from 'ai';
import type { ZodTypeAny } from 'zod';

// Import shared filesystem utilities
import { __sandboxRoot, ALLOWED_EXTENSIONS } from './index';

// ---------------------------------------------------------------------------
// Parameter schema
// ---------------------------------------------------------------------------

const smartDiffParams = z.object({
  filePath: z.string(),
  editInstruction: z.string(),
  expectedHash: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

function resolveSafePath(userPath: string): string {
  if (!userPath) throw new Error('Path may not be empty');
  
  // Get the current sandbox root (could be process.cwd() or a custom path)
  const sandboxRoot = __sandboxRoot();
  console.log('>>> SMART_DIFF_DEBUG: Using sandbox root:', sandboxRoot);
  appendFileSync('c:/temp/smart-diff-fresh.txt', `SMART_DIFF_DEBUG: Using sandbox root: ${sandboxRoot}\n`);
  
  const resolved = path.resolve(sandboxRoot, userPath);
  console.log('>>> SMART_DIFF_DEBUG: Resolved path:', resolved);
  appendFileSync('c:/temp/smart-diff-fresh.txt', `SMART_DIFF_DEBUG: Resolved path: ${resolved}\n`);
  
  if (!resolved.startsWith(sandboxRoot)) throw new Error('Path escapes sandbox root');
  return resolved;
}

function assertAllowedExtension(filePath: string) {
  const ext = path.extname(filePath);
  if (!ALLOWED_EXTENSIONS.includes(ext)) throw new Error(`File type ${ext} is not permitted`);
}

// ---------------------------------------------------------------------------
// Prompt builder
// ---------------------------------------------------------------------------

function buildPrompt(fileContent: string, instruction: string, filename: string): string {
  const lines = fileContent.split('\n');
  
  return `You are a code modification assistant. Generate a unified diff to make the requested change.\n` +
    `\n` +
    `Return ONLY a JSON object: {"diff":"<unified diff>"}\n` +
    `\n` +
    `File: ${filename} (${lines.length} lines)\n` +
    `Request: ${instruction}\n` +
    `\n` +
    `Make the requested change using unified diff format:\n` +
    `--- a/${filename}\n` +
    `+++ b/${filename}\n` +
    `@@ -line,count +line,count @@\n` +
    ` unchanged line\n` +
    `-removed line\n` +
    `+added line\n` +
    `\n` +
    `File content:\n${fileContent}`;
}

// ---------------------------------------------------------------------------
// Executor
// ---------------------------------------------------------------------------
appendFileSync('c:/temp/smart-diff-fresh.txt', `${new Date().toISOString()} FRESH_SMART_DIFF_LOADED\n`);

async function executeSmartDiff(args: z.infer<typeof smartDiffParams>) {
  console.log('>>> FRESH_SMART_DIFF_FUNCTION_CALLED');
  appendFileSync('c:/temp/smart-diff-fresh.txt', `FUNCTION_CALLED: ${JSON.stringify(args)}\n`);
  
  try {
    console.log('>>> STEP 1: Parsing parameters');
    appendFileSync('c:/temp/smart-diff-fresh.txt', `STEP 1: Parsing parameters\n`);
    const { filePath, editInstruction, expectedHash } = smartDiffParams.parse(args);
    console.log('>>> STEP 1 COMPLETE: Parameters parsed successfully');
    appendFileSync('c:/temp/smart-diff-fresh.txt', `STEP 1 COMPLETE: Parameters parsed successfully\n`);

    console.log('>>> STEP 2: Resolving safe path');
    appendFileSync('c:/temp/smart-diff-fresh.txt', `STEP 2: Resolving safe path for ${filePath}\n`);
    const abs = resolveSafePath(filePath);
    console.log('>>> STEP 2 COMPLETE: Resolved path:', abs);
    appendFileSync('c:/temp/smart-diff-fresh.txt', `STEP 2 COMPLETE: Resolved path: ${abs}\n`);

    console.log('>>> STEP 3: Asserting allowed extension');
    appendFileSync('c:/temp/smart-diff-fresh.txt', `STEP 3: Asserting allowed extension\n`);
    assertAllowedExtension(abs);
    console.log('>>> STEP 3 COMPLETE: Extension allowed');
    appendFileSync('c:/temp/smart-diff-fresh.txt', `STEP 3 COMPLETE: Extension allowed\n`);

    console.log('>>> STEP 4: Reading original file');
    appendFileSync('c:/temp/smart-diff-fresh.txt', `STEP 4: Reading original file\n`);
    const original = await fs.readFile(abs, 'utf8');
    console.log('>>> STEP 4 COMPLETE: File read, length:', original.length);
    appendFileSync('c:/temp/smart-diff-fresh.txt', `STEP 4 COMPLETE: File read, length: ${original.length}\n`);

    if (expectedHash) {
      console.log('>>> STEP 5: Checking file hash');
      appendFileSync('c:/temp/smart-diff-fresh.txt', `STEP 5: Checking file hash\n`);
      const hash = createHash('sha1').update(original, 'utf8').digest('hex');
      if (hash !== expectedHash) {
        throw new Error('File hash mismatch – file changed since diff was generated');
      }
      console.log('>>> STEP 5 COMPLETE: Hash verified');
      appendFileSync('c:/temp/smart-diff-fresh.txt', `STEP 5 COMPLETE: Hash verified\n`);
    } else {
      console.log('>>> STEP 5: Skipping hash check (no expectedHash)');
      appendFileSync('c:/temp/smart-diff-fresh.txt', `STEP 5: Skipping hash check (no expectedHash)\n`);
    }

    console.log('>>> STEP 6: Building prompt');
    appendFileSync('c:/temp/smart-diff-fresh.txt', `STEP 6: Building prompt\n`);
    const prompt = buildPrompt(original, editInstruction, path.basename(filePath));
    console.log('>>> STEP 6 COMPLETE: Prompt built, length:', prompt.length);
    appendFileSync('c:/temp/smart-diff-fresh.txt', `STEP 6 COMPLETE: Prompt built, length: ${prompt.length}\n`);

    let diff: string | undefined;
    let attempt = 0;
    const maxAttempts = 2;
    
    while (attempt < maxAttempts) {
      console.log(`>>> STEP 7.${attempt + 1}: LLM generation attempt ${attempt + 1}/${maxAttempts}`);
      appendFileSync('c:/temp/smart-diff-fresh.txt', `STEP 7.${attempt + 1}: LLM generation attempt ${attempt + 1}/${maxAttempts}\n`);
      
      console.log('>>> ABOUT_TO_CALL_GENERATETEXT');
      appendFileSync('c:/temp/smart-diff-fresh.txt', `ABOUT_TO_CALL_GENERATETEXT\n`);
      
      try {
        const completion = await generateText({
          model: openai.chat('gpt-4o'), // Switched from o3-mini
          prompt,
          maxTokens: 2048,
          temperature: 0,
        });
        
        console.log('[fresh-smart-diff] Raw LLM response received, length:', completion.text.length);
        appendFileSync('c:/temp/smart-diff-fresh.txt', `LLM_RESPONSE_RECEIVED: ${completion.text.length} chars\n`);

        console.log('[fresh-smart-diff] Raw LLM response:', JSON.stringify(completion.text));
        appendFileSync('c:/temp/smart-diff-fresh.txt', `LLM_RAW_RESPONSE: ${JSON.stringify(completion.text)}\n`);

        console.log('>>> STEP 7.${attempt + 1}.1: Parsing JSON response');
        appendFileSync('c:/temp/smart-diff-fresh.txt', `STEP 7.${attempt + 1}.1: Parsing JSON response\n`);
        
        try {
          const parsed = JSON.parse(completion.text.trim());
          diff = parsed.diff;
          console.log('>>> STEP 7.${attempt + 1}.1 COMPLETE: JSON parsed successfully');
          appendFileSync('c:/temp/smart-diff-fresh.txt', `STEP 7.${attempt + 1}.1 COMPLETE: JSON parsed successfully\n`);
        } catch (err) {
          console.warn('[fresh-smart-diff] JSON parse failed', err);
          appendFileSync('c:/temp/smart-diff-fresh.txt', `JSON_PARSE_FAILED: ${err}\n`);
          attempt += 1;
          if (attempt >= maxAttempts) throw new Error('LLM returned non-JSON');
          continue;
        }

        if (typeof diff !== 'string') {
          console.log('>>> STEP 7.${attempt + 1}.2: Diff type check failed');
          appendFileSync('c:/temp/smart-diff-fresh.txt', `DIFF_TYPE_CHECK_FAILED: ${typeof diff}\n`);
          throw new Error('Missing diff in LLM response');
        }
        
        if (!diff) {
          console.log('>>> STEP 7.${attempt + 1}.2: Empty diff received');
          appendFileSync('c:/temp/smart-diff-fresh.txt', `EMPTY_DIFF_RECEIVED\n`);
          attempt += 1;
          if (attempt >= maxAttempts) throw new Error('Empty diff from LLM');
          continue;
        }

        console.log('>>> STEP 7.${attempt + 1}.2 COMPLETE: Diff validation passed');
        appendFileSync('c:/temp/smart-diff-fresh.txt', `STEP 7.${attempt + 1}.2 COMPLETE: Diff validation passed\n`);

        console.log('[fresh-smart-diff] generated diff\n', diff);
        appendFileSync('c:/temp/smart-diff-fresh.txt', `GENERATED_DIFF: ${diff}\n`);

        console.log('>>> STEP 8: Applying patch');
        appendFileSync('c:/temp/smart-diff-fresh.txt', `STEP 8: Applying patch\n`);
        
        const patched = applyPatch(original, diff, { fuzzFactor: 10 }); // Increased from 6 to 10
        if (patched === false) {
          console.warn('[fresh-smart-diff] patch failed – context mismatch');
          appendFileSync('c:/temp/smart-diff-fresh.txt', `PATCH_FAILED: context mismatch\n`);
          
          // Log more details about the failure
          console.log('[fresh-smart-diff] Original file length:', original.length);
          console.log('[fresh-smart-diff] Original file first 200 chars:', original.substring(0, 200));
          console.log('[fresh-smart-diff] Generated diff:', diff);
          
          attempt += 1;
          if (attempt >= maxAttempts) {
            throw new Error(`FRESH_SMART_DIFF_PATCH_FAILED: Context mismatch after ${maxAttempts} attempts. The LLM generated a diff that doesn't match the current file content.`);
          }
          // Exponential backoff to avoid rate limiting
          const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, etc.
          console.log(`[fresh-smart-diff] Waiting ${delay}ms before retry to avoid rate limiting...`);
          appendFileSync('c:/temp/smart-diff-fresh.txt', `WAITING_BEFORE_RETRY: ${delay}ms\n`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        console.log('>>> STEP 8 COMPLETE: Patch applied successfully');
        appendFileSync('c:/temp/smart-diff-fresh.txt', `STEP 8 COMPLETE: Patch applied successfully\n`);

        console.log('>>> STEP 9: Checking file size');
        appendFileSync('c:/temp/smart-diff-fresh.txt', `STEP 9: Checking file size\n`);
        
        if (Buffer.byteLength(patched, 'utf8') > 1 * 1024 * 1024) {
          throw new Error('Patched file exceeds size limit');
        }

        console.log('>>> STEP 9 COMPLETE: File size check passed');
        appendFileSync('c:/temp/smart-diff-fresh.txt', `STEP 9 COMPLETE: File size check passed\n`);

        console.log('>>> STEP 10: Writing file');
        appendFileSync('c:/temp/smart-diff-fresh.txt', `STEP 10: Writing file\n`);
        
        await fs.writeFile(abs, patched, 'utf8');
        
        console.log('>>> STEP 10 COMPLETE: File written successfully');
        appendFileSync('c:/temp/smart-diff-fresh.txt', `STEP 10 COMPLETE: File written successfully\n`);
        
        console.log('>>> ALL STEPS COMPLETE: Returning success');
        appendFileSync('c:/temp/smart-diff-fresh.txt', `ALL_STEPS_COMPLETE: Returning success\n`);
        
        return { success: true, patchApplied: diff };
        
      } catch (llmError: any) {
        console.error('>>> LLM ERROR:', llmError);
        appendFileSync('c:/temp/smart-diff-fresh.txt', `LLM_ERROR: ${llmError.message}\n`);
        throw llmError;
      }
    }

    throw new Error('FRESH_SMART_DIFF_FAILED_AFTER_RETRIES');
    
  } catch (error: any) {
    console.error('>>> SMART_DIFF_ERROR:', error);
    appendFileSync('c:/temp/smart-diff-fresh.txt', `SMART_DIFF_ERROR: ${error.message}\n`);
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createSmartDiffTool(): Tool {
  console.log('>>> FRESH_SMART_DIFF_TOOL_CREATED');
  appendFileSync('c:/temp/smart-diff-fresh.txt', `TOOL_CREATED\n`);
  
  return {
    description: 'Generate a unified diff via OpenAI and apply it to a file',
    parameters: smartDiffParams as unknown as ZodTypeAny,
    execute: (async (args: any) => {
      console.log('>>> FRESH_SMART_DIFF_EXECUTE_CALLED:', JSON.stringify(args));
      appendFileSync('c:/temp/smart-diff-fresh.txt', `EXECUTE_CALLED\n`);
      return await executeSmartDiff(args);
    }) as any,
  } as Tool;
}
