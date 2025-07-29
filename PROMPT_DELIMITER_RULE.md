# PROMPT DELIMITER RULE

## 🚨 CRITICAL RULE: Never Use Backticks in Template Literal Prompts

### Problem:
When creating prompts that are wrapped in template literals (backticks), using backticks within the prompt content causes JavaScript syntax errors.

### Example of BAD:
```typescript
export const PROMPT = `Use the 'read_file' tool to read files.
Use the \`smart_diff\` tool for small changes.  // ❌ This breaks!
Use the \`update_file\` tool for big changes.   // ❌ This breaks!
`;
```

### Example of GOOD:
```typescript
export const PROMPT = `Use the 'read_file' tool to read files.
Use the 'smart_diff' tool for small changes.   // ✅ Use single quotes
Use the 'update_file' tool for big changes.    // ✅ Use single quotes
`;
```

### Alternative Solutions:
1. **Single quotes**: `'tool_name'` - Most readable
2. **Double quotes**: `"tool_name"` - Also works
3. **No quotes**: `tool_name` - Simple but less clear
4. **Code blocks**: Use \`\`\` for multi-line code examples

### Memory:
- **ALWAYS** use single quotes for tool names in prompts
- **NEVER** use backticks within template literal prompts
- **TEST** the prompt syntax before committing
- **REMEMBER** this rule when creating any new prompts

### Files Affected:
- `src/lib/ai/agents/file-coder/prompt.ts` - Fixed ✅
- Any future prompt files - Apply this rule 