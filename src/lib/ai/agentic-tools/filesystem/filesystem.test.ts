import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createFilesystemTools } from './index';

// Mock fs module
vi.mock('fs', () => ({
  promises: {
    readFile: vi.fn(),
    writeFile: vi.fn(),
    mkdir: vi.fn(),
    readdir: vi.fn(),
    stat: vi.fn(),
  },
}));

// Import after mocking
import { promises as fs } from 'fs';

describe('Filesystem Tools', () => {
  let tools: any;
  const testDir = '/tmp/test-sandbox';

  beforeEach(() => {
    tools = createFilesystemTools();
    vi.clearAllMocks();
    
    // Mock process.cwd
    vi.spyOn(process, 'cwd').mockReturnValue(testDir);
  });

  it('should create all required tools', () => {
    expect(tools).toHaveProperty('read_file');
    expect(tools).toHaveProperty('update_file');
    expect(tools).toHaveProperty('set_filesystem_default');
    expect(tools).toHaveProperty('create_directory');
    expect(tools).toHaveProperty('list_files');
    expect(tools).toHaveProperty('apply_unified_diff');
  });

  it('should have proper tool structure', () => {
    Object.values(tools).forEach((tool: any) => {
      expect(tool).toHaveProperty('description');
      expect(tool).toHaveProperty('parameters');
      expect(tool).toHaveProperty('execute');
      expect(typeof tool.execute).toBe('function');
    });
  });

  it('should set filesystem default successfully', async () => {
    // Mock fs.stat to return a directory
    (fs.stat as any).mockResolvedValue({ isDirectory: () => true });
    
    const result = await tools.set_filesystem_default.execute({ path: '/existing/dir' });
    
    // On Windows, paths get normalized to backslashes
    expect(result).toMatch(/[\/\\]existing[\/\\]dir/);
    expect(fs.stat).toHaveBeenCalledWith(expect.stringMatching(/[\/\\]existing[\/\\]dir/));
  });

  it('should create directory for non-existent path', async () => {
    const statError = new Error('ENOENT') as any;
    statError.code = 'ENOENT';
    (fs.stat as any).mockRejectedValueOnce(statError);
    (fs.mkdir as any).mockResolvedValueOnce(undefined);
    
    const result = await tools.set_filesystem_default.execute({ path: '/new/dir' });
    
    // On Windows, paths get normalized to backslashes
    expect(result).toMatch(/[\/\\]new[\/\\]dir/);
    expect(fs.mkdir).toHaveBeenCalledWith(expect.stringMatching(/[\/\\]new[\/\\]dir/), { recursive: true });
  });

  it('should read file successfully', async () => {
    // Set up sandbox
    (fs.stat as any).mockResolvedValue({ isDirectory: () => true });
    await tools.set_filesystem_default.execute({ path: testDir });
    
    const fileContent = 'Hello, World!';
    (fs.readFile as any).mockResolvedValue(fileContent);
    
    const result = await tools.read_file.execute({ path: 'test.txt' });
    
    // Now returns numbered content
    expect(result).toBe('1: Hello, World!');
  });

  it('should update file successfully', async () => {
    // Set up sandbox
    (fs.stat as any).mockResolvedValue({ isDirectory: () => true });
    await tools.set_filesystem_default.execute({ path: testDir });
    
    (fs.writeFile as any).mockResolvedValue(undefined);
    
    const result = await tools.update_file.execute({
      path: 'test.txt',
      newContent: 'Updated content'
    });
    
    expect(result).toBe('OK');
  });

  it('should create directory successfully', async () => {
    // Set up sandbox
    (fs.stat as any).mockResolvedValue({ isDirectory: () => true });
    await tools.set_filesystem_default.execute({ path: testDir });
    
    (fs.mkdir as any).mockResolvedValue(undefined);
    
    const result = await tools.create_directory.execute({ path: 'newdir' });
    
    expect(result).toBe('OK');
  });

  it('should list files successfully', async () => {
    // Set up sandbox
    (fs.stat as any).mockResolvedValue({ isDirectory: () => true });
    await tools.set_filesystem_default.execute({ path: testDir });
    
    const mockEntries = [
      { name: 'file1.txt', isDirectory: () => false },
      { name: 'dir1', isDirectory: () => true },
      { name: 'file2.ts', isDirectory: () => false },
    ];
    (fs.readdir as any).mockResolvedValue(mockEntries);
    
    const result = await tools.list_files.execute({ path: '.' });
    
    expect(result).toEqual([
      { name: 'file1.txt', type: 'file' },
      { name: 'dir1', type: 'directory' },
      { name: 'file2.ts', type: 'file' },
    ]);
  });

  it('should apply unified diff successfully', async () => {
    // Set up sandbox
    (fs.stat as any).mockResolvedValue({ isDirectory: () => true });
    await tools.set_filesystem_default.execute({ path: testDir });
    
    const originalContent = 'Hello\nWorld\nTest';
    const diff = [
      '--- test.txt',
      '+++ test.txt',
      '@@ -2,1 +2,1 @@',
      '-World',
      '+Universe',
      ''
    ].join('\n');
    
    (fs.readFile as any).mockResolvedValue(originalContent);
    (fs.writeFile as any).mockResolvedValue(undefined);
    
    const result = await tools.apply_unified_diff.execute({
      filePath: 'test.txt',
      unifiedDiff: diff
    });
    
    expect(result).toBe('OK');
  });

  it('should prevent path traversal attacks', async () => {
    // Set up sandbox
    (fs.stat as any).mockResolvedValue({ isDirectory: () => true });
    await tools.set_filesystem_default.execute({ path: testDir });
    
    const maliciousPaths = [
      '../../../etc/passwd',
      '..\\..\\..\\windows\\system32\\config\\sam',
    ];
    
    for (const maliciousPath of maliciousPaths) {
      await expect(
        tools.read_file.execute({ path: maliciousPath })
      ).rejects.toThrow('Path escapes sandbox root');
    }
  });

  it('should reject disallowed file extensions', async () => {
    // Set up sandbox
    (fs.stat as any).mockResolvedValue({ isDirectory: () => true });
    await tools.set_filesystem_default.execute({ path: testDir });
    
    await expect(
      tools.read_file.execute({ path: 'test.exe' })
    ).rejects.toThrow('File type .exe is not permitted');
  });

  it('should count lines successfully', async () => {
    // Set up sandbox
    (fs.stat as any).mockResolvedValue({ isDirectory: () => true });
    await tools.set_filesystem_default.execute({ path: testDir });
    
    const fileContent = 'Line 1\nLine 2\nLine 3';
    (fs.readFile as any).mockResolvedValue(fileContent);
    
    const result = await tools.count_lines.execute({ filePath: 'test.txt' });
    
    expect(result).toEqual({
      totalLines: 3,
      content: '1: Line 1\n2: Line 2\n3: Line 3'
    });
  });

  it('should count lines in specific range', async () => {
    // Set up sandbox
    (fs.stat as any).mockResolvedValue({ isDirectory: () => true });
    await tools.set_filesystem_default.execute({ path: testDir });
    
    const fileContent = 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5';
    (fs.readFile as any).mockResolvedValue(fileContent);
    
    const result = await tools.count_lines.execute({ 
      filePath: 'test.txt', 
      startLine: 2, 
      endLine: 4 
    });
    
    expect(result).toEqual({
      totalLines: 5,
      selectedLines: 3,
      content: '2: Line 2\n3: Line 3\n4: Line 4'
    });
  });
}); 