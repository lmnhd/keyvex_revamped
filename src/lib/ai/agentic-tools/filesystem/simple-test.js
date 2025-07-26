const fs = require('fs').promises;
const path = require('path');
const { createFilesystemTools } = require('./index');

// Simple test runner
function runTest(name, testFn) {
  console.log(`🧪 Running: ${name}`);
  return testFn()
    .then(() => console.log(`✅ PASS: ${name}`))
    .catch((error) => {
      console.error(`❌ FAIL: ${name}`, error.message);
      throw error;
    });
}

// Mock fs for testing
const originalFs = { ...fs };
const mockFs = {
  readFile: jest.fn(),
  writeFile: jest.fn(),
  mkdir: jest.fn(),
  readdir: jest.fn(),
  stat: jest.fn(),
};

// Replace fs with mocks
Object.assign(fs, mockFs);

// Simple test suite
async function testFilesystemTools() {
  console.log('🚀 Starting Filesystem Tools Tests...\n');
  
  try {
    // Test 1: Tool Structure
    await runTest('Tool Structure', async () => {
      const tools = createFilesystemTools();
      
      // Check that all expected tools exist
      const expectedTools = ['read_file', 'update_file', 'set_filesystem_default', 'create_directory', 'list_files', 'apply_unified_diff'];
      
      for (const toolName of expectedTools) {
        if (!tools[toolName]) {
          throw new Error(`Missing tool: ${toolName}`);
        }
        
        const tool = tools[toolName];
        if (!tool.description || !tool.parameters || !tool.execute) {
          throw new Error(`Tool ${toolName} missing required properties`);
        }
        
        if (typeof tool.execute !== 'function') {
          throw new Error(`Tool ${toolName} execute is not a function`);
        }
      }
    });

    // Test 2: Basic Tool Creation
    await runTest('Basic Tool Creation', async () => {
      const tools = createFilesystemTools();
      
      // Verify tools object is created
      if (!tools || typeof tools !== 'object') {
        throw new Error('createFilesystemTools should return an object');
      }
      
      // Verify it has the expected number of tools
      const toolCount = Object.keys(tools).length;
      if (toolCount !== 6) {
        throw new Error(`Expected 6 tools, got ${toolCount}`);
      }
    });

    // Test 3: Tool Properties
    await runTest('Tool Properties', async () => {
      const tools = createFilesystemTools();
      
      // Check each tool has the right structure
      for (const [toolName, tool] of Object.entries(tools)) {
        if (!tool.description || typeof tool.description !== 'string') {
          throw new Error(`Tool ${toolName} missing or invalid description`);
        }
        
        if (!tool.parameters) {
          throw new Error(`Tool ${toolName} missing parameters`);
        }
        
        if (!tool.execute || typeof tool.execute !== 'function') {
          throw new Error(`Tool ${toolName} missing or invalid execute function`);
        }
      }
    });

    console.log('\n🎉 All tests passed!');
    console.log('\n📝 Note: This is a basic structure test. For full functionality testing,');
    console.log('   install Jest or Vitest and run the comprehensive test suite.');
    
  } catch (error) {
    console.error('\n💥 Tests failed:', error.message);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testFilesystemTools();
}

module.exports = { testFilesystemTools }; 