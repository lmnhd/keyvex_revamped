import { promises as fs } from 'fs';
import path from 'path';
import { z } from 'zod';
import type { Tool } from 'ai';
import { createHash } from 'crypto';
import { applyPatch } from 'diff';

/**
 * Sandbox root directory. All operations must remain within this folder.
 * Defaults to process.cwd() but can be narrowed via set_filesystem_default.
 */
let sandboxRoot = process.cwd();

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------

// Exported so host app can tweak limits if needed
export const ALLOWED_EXTENSIONS = [
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.json',
  '.md',
  '.html',
  '.css',
  '.txt',
];
export const MAX_FILE_SIZE_BYTES = 1 * 1024 * 1024; // 1 MB

// ---------------------------------------------------------------------------
// Logging helper – emits JSON logs if FILESYSTEM_LOG=json, else human-readable
// ---------------------------------------------------------------------------
function logFs(op: string, data: Record<string, any>) {
  if (process.env.FILESYSTEM_LOG === 'json') {
    // Avoid circular structures
    try {
      console.log(JSON.stringify({ ts: Date.now(), op, ...data }));
    } catch {
      console.log(`[fs] ${op}`, data);
    }
  } else {
    console.log(`[fs] ${op}`, data);
  }
}


/** Validate and resolve a user supplied path against the sandbox root */
function resolveSafePath(userPath: string): string {
  if (!userPath)
    throw new Error('Path may not be empty');

  const resolved = path.resolve(sandboxRoot, userPath);
  if (!resolved.startsWith(sandboxRoot)) {
    throw new Error('Path escapes sandbox root');
  }
  return resolved;
}

/** Ensure file extension is allowed */
function assertAllowedExtension(filePath: string) {
  if (ALLOWED_EXTENSIONS.includes('*')) return; // allow-all sentinel
  const ext = path.extname(filePath);
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    throw new Error(`File type ${ext} is not permitted`);
  }
}

// ---------------------------------------------------------------------------
// Zod parameter schemas
// ---------------------------------------------------------------------------

const readFileParams = z.object({
  path: z.string(),
});
const updateFileParams = z.object({
  path: z.string(),
  newContent: z.string(),
});
const setFilesystemParams = z.object({
  path: z.string(),
});
const createDirectoryParams = z.object({
  path: z.string(),
});
const listFilesParams = z.object({
  path: z.string().optional().default('.'),
});
const unifiedDiffParams = z.object({
  filePath: z.string(),
  unifiedDiff: z.string(),
  expectedHash: z.string().optional(),
});

const countLinesParams = z.object({
  filePath: z.string(),
  startLine: z.number().optional(),
  endLine: z.number().optional(),
});

// ---------------------------------------------------------------------------
// Tool executors
// ---------------------------------------------------------------------------

async function readFileExecutor(args: z.infer<typeof readFileParams>) {
  const { path: userPath } = readFileParams.parse(args);
  const abs = resolveSafePath(userPath);
  assertAllowedExtension(abs);
  const stat = await fs.stat(abs);
  if (stat.size > MAX_FILE_SIZE_BYTES) {
    throw new Error('File too large to read');
  }
  const content = await fs.readFile(abs, 'utf8');
  
  // Add line numbers to make it easier for the agent to count lines
  const lines = content.split('\n');
  const numberedContent = lines.map((line, index) => `${index + 1}: ${line}`).join('\n');
  
  return numberedContent;
}

async function updateFileExecutor(args: z.infer<typeof updateFileParams>) {
  const { path: userPath, newContent } = updateFileParams.parse(args);
  const abs = resolveSafePath(userPath);
  assertAllowedExtension(abs);
  if (Buffer.byteLength(newContent, 'utf8') > MAX_FILE_SIZE_BYTES) {
    throw new Error('Content too large to write');
  }
  await fs.writeFile(abs, newContent, 'utf8');
  return 'OK';
}

async function setFilesystemDefaultExecutor(args: z.infer<typeof setFilesystemParams>) {
  const { path: userPath } = setFilesystemParams.parse(args);
  const abs = path.resolve(process.cwd(), userPath);
  try {
    const stat = await fs.stat(abs);
    if (!stat.isDirectory()) {
      throw new Error('Path must be a directory');
    }
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      // Create the directory recursively if it does not exist
      await fs.mkdir(abs, { recursive: true });
    } else {
      throw err;
    }
  }
  sandboxRoot = abs;
  return sandboxRoot;
}

async function createDirectoryExecutor(args: z.infer<typeof createDirectoryParams>) {
  const { path: userPath } = createDirectoryParams.parse(args);
  const abs = resolveSafePath(userPath);
  await fs.mkdir(abs, { recursive: true });
  return 'OK';
}

async function listFilesExecutor(args: z.infer<typeof listFilesParams>) {
  const { path: userPath } = listFilesParams.parse(args);
  const abs = resolveSafePath(userPath);
  const entries = await fs.readdir(abs, { withFileTypes: true });
  return entries.map((dirent) => ({
    name: dirent.name,
    type: dirent.isDirectory() ? 'directory' : 'file',
  }));
}

async function applyUnifiedDiffExecutor(args: z.infer<typeof unifiedDiffParams>) {
  const { filePath, unifiedDiff, expectedHash } = unifiedDiffParams.parse(args);
  const abs = resolveSafePath(filePath);
  assertAllowedExtension(abs);

  const original = await fs.readFile(abs, 'utf8');

  // Optional SHA-1 safety check
  if (expectedHash) {
    const hash = createHash('sha1').update(original, 'utf8').digest('hex');
    if (hash !== expectedHash) {
      throw new Error('File hash mismatch – file changed since diff was generated');
    }
  }

  const patched = applyPatch(original, unifiedDiff);
  if (patched === false) {
    throw new Error('Patch failed to apply – context mismatch');
  }

  if (Buffer.byteLength(patched, 'utf8') > MAX_FILE_SIZE_BYTES) {
    throw new Error('Patched file exceeds size limit');
  }

  await fs.writeFile(abs, patched, 'utf8');
  logFs('apply_unified_diff:applied', { file: filePath, diffBytes: Buffer.byteLength(unifiedDiff, 'utf8'), newSize: Buffer.byteLength(patched, 'utf8') });
  return 'OK';
}

async function countLinesExecutor(args: z.infer<typeof countLinesParams>) {
  const { filePath, startLine, endLine } = countLinesParams.parse(args);
  const abs = resolveSafePath(filePath);
  assertAllowedExtension(abs);
  
  const content = await fs.readFile(abs, 'utf8');
  const lines = content.split('\n');
  
  if (startLine && endLine) {
    const selectedLines = lines.slice(startLine - 1, endLine);
    return {
      totalLines: lines.length,
      selectedLines: selectedLines.length,
      content: selectedLines.map((line, index) => `${startLine + index}: ${line}`).join('\n')
    };
  }
  
  return {
    totalLines: lines.length,
    content: lines.map((line, index) => `${index + 1}: ${line}`).join('\n')
  };
}

// ---------------------------------------------------------------------------
// Tool factory helper
// ---------------------------------------------------------------------------

function makeTool<P extends z.ZodTypeAny>(
  description: string,
  parameters: P,
  execute: (args: z.infer<P>) => Promise<any>,
): Tool {
  return {
    description,
    parameters,
    execute: async (args: unknown) => {
      const start = Date.now();
      logFs(`${description}:start`, { args });
      try {
        const result = await execute(args as any);
        logFs(`${description}:success`, { durationMs: Date.now() - start });
        return result;
      } catch (err: any) {
        logFs(`${description}:error`, { error: String(err) });
        throw err;
      }
    },
  } as Tool;
}

// ---------------------------------------------------------------------------
// Exported toolset
// ---------------------------------------------------------------------------

export function createFilesystemTools(): Record<string, Tool> {
  return {
    read_file: makeTool('Read file contents from filesystem', readFileParams, readFileExecutor),
    update_file: makeTool('Update file contents on filesystem', updateFileParams, updateFileExecutor),
    set_filesystem_default: makeTool('Set default filesystem path', setFilesystemParams, setFilesystemDefaultExecutor),
    create_directory: makeTool('Create a new directory recursively', createDirectoryParams, createDirectoryExecutor),
    list_files: makeTool('List files/directories within a path', listFilesParams, listFilesExecutor),
    apply_unified_diff: makeTool('Apply surgical edits using unified diff', unifiedDiffParams, applyUnifiedDiffExecutor),
    count_lines: makeTool('Count lines and get numbered content for easier diff creation', countLinesParams, countLinesExecutor),
  };
}

// For convenience, export a default instance using the initial sandboxRoot
export const filesystemTools = createFilesystemTools();
