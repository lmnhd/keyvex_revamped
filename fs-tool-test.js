const { createFilesystemTools } = require('./src/lib/ai/agentic-tools/filesystem');
(async () => {
  const tools = createFilesystemTools();
  await tools.set_filesystem_default.execute({ path: './.sandbox' });
  await tools.create_directory.execute({ path: 'demo' });
  await tools.update_file.execute({ path: 'demo/test.txt', newContent: 'hello\n' });
  const diff = [
    '--- test.txt',
    '+++ test.txt',
    '@@ -1 +1 @@',
    '-hello',
    '+world',
    '',
  ].join('\n');
  await tools.apply_unified_diff.execute({ filePath: 'demo/test.txt', unifiedDiff: diff });
  const content = await tools.read_file.execute({ path: 'demo/test.txt' });
  console.log('Final content:', content.trim());
})();
