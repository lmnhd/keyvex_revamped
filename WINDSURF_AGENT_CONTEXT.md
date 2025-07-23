# WINDSURF AGENT TASK: Implement Option 4 - Minimal Function Constructor

## 🎯 OBJECTIVE
Simplify the dynamic component renderer by removing the complex transpilation chain and implementing a minimal Function constructor approach while maintaining ShadCN component support.

## 🚨 CRITICAL RULES
- **HARD FAILS ONLY** - No fallback logic, no graceful degradation, no retry mechanisms
- **If something fails, it should fail clearly and immediately**
- **Do not implement any try-catch that hides real errors**
- **Remove all misleading error handling**

## 📋 COMPLETE TASK LIST

### Task 1: Simplify Dynamic Component Renderer
**File**: `/src/components/canvas/dynamic-component-renderer.tsx`

**Remove Complex Logic:**
- ✅ Remove entire `transformComponentCode()` call and babel transpilation
- ✅ Remove `validateComponentSyntax()` calls
- ✅ Remove `detectComponentCodeFormat()` analysis
- ✅ Remove complex error boundaries and retry logic
- ✅ Remove `prepareCodeForTranspilation()` and `cleanAndWrapCode()`

**Implement Minimal Function Constructor:**
```typescript
const renderComponent = useCallback(async (code: string) => {
  // 1. Strip TypeScript syntax only (keep this part)
  const cleanCode = stripTypeScript(code);
  
  // 2. Remove imports and exports
  const codeWithoutImports = cleanCode.replace(/import\s+.*?from\s+['"].*?['"];?\s*/g, '');
  const codeWithoutExports = codeWithoutImports.replace(/export\s+default\s+/g, '');
  
  // 3. Create minimal function constructor
  const createComponent = new Function(
    'React', 'useState', 'useEffect', 'useCallback', 'useMemo', // React hooks
    'Button', 'Input', 'Label', 'Card', 'CardContent', 'CardHeader', 'CardTitle', // ShadCN UI
    'Select', 'SelectContent', 'SelectItem', 'SelectTrigger', 'SelectValue',
    'Checkbox', 'Slider', 'Badge',
    `return (${codeWithoutExports})`
  );
  
  // 4. Execute with dependencies
  const Component = createComponent(
    React, React.useState, React.useEffect, React.useCallback, React.useMemo,
    Button, Input, Label, Card, CardContent, CardHeader, CardTitle,
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
    Checkbox, Slider, Badge
  );
  
  // 5. Hard fail if invalid
  if (typeof Component !== 'function') {
    throw new Error('Generated code did not return a React component function');
  }
  
  setRenderState({
    isLoading: false,
    isRendered: true,
    error: null,
    Component: Component
  });
}, []);
```

### Task 2: Remove JSX Transpiler Complexity
**File**: `/src/lib/transpilation/jsx-transpiler.ts`

**Keep Only:**
- ✅ `stripTypeScript()` function (lines 108-132)
- ✅ Basic import/export removal
- ✅ Remove all Babel integration
- ✅ Remove `transformComponentCode()`, `validateComponentSyntax()`, `detectComponentCodeFormat()`
- ✅ Remove `prepareCodeForTranspilation()`, `cleanAndWrapCode()`

**New Simplified File:**
```typescript
/**
 * Simple TypeScript Stripper - No Babel, No Transpilation
 */

export function stripTypeScript(code: string): string {
  let cleanCode = code;
  
  // Remove interface declarations
  cleanCode = cleanCode.replace(/interface\s+\w+\s*{[^}]*}/g, '');
  
  // Remove type annotations from variables
  cleanCode = cleanCode.replace(/:\s*\w+(\[\]|\<[^>]*\>)*(\s*\|\s*\w+(\[\]|\<[^>]*\>)*)*(?=\s*[=;,)])/g, '');
  
  // Remove generic type parameters
  cleanCode = cleanCode.replace(/<[^>]*>/g, '');
  
  // Remove React.FC and similar type annotations
  cleanCode = cleanCode.replace(/:\s*React\.FC\s*/g, '');
  
  // Remove Record and other utility types
  cleanCode = cleanCode.replace(/Record<[^>]*>/g, 'any');
  
  // Clean up multiple spaces and empty lines
  cleanCode = cleanCode.replace(/\s+/g, ' ').replace(/\n\s*\n/g, '\n');
  
  return cleanCode.trim();
}

export function removeImportsAndExports(code: string): string {
  let cleanCode = code;
  
  // Remove imports
  cleanCode = cleanCode.replace(/import\s+.*?from\s+['"].*?['"];?\s*/g, '');
  
  // Remove exports
  cleanCode = cleanCode.replace(/export\s+default\s+/g, '');
  cleanCode = cleanCode.replace(/export\s*{\s*.*?\s*};?\s*/g, '');
  
  return cleanCode.trim();
}
```

### Task 3: Update Code Generation Agent Prompts
**File**: `/src/lib/ai/agents/code-generation/prompt.ts`

**Add to CRITICAL REQUIREMENTS:**
```
8. Generate ONLY the React functional component - no imports, no exports
9. Component must be a complete function that can be wrapped in Function constructor
10. Use only injected dependencies (React hooks and ShadCN components available)
11. Do NOT include: import statements, export statements, TypeScript interfaces outside component
```

**Update COMPONENT STRUCTURE:**
```
- React functional component with hooks (injected as dependencies)
- State management using injected React hooks (useState, useEffect, etc.)
- ShadCN UI components (Button, Input, Card, etc. - all injected)
- NO import/export statements
- Component should be ready for Function constructor execution
```

### Task 4: Remove Babel Dependencies
**File**: `/src/lib/transpilation/babel-loader.ts`

**Action**: Delete this entire file - no longer needed

### Task 5: Update Component Renderer Imports
**File**: `/src/components/canvas/dynamic-component-renderer.tsx`

**Remove Imports:**
- ✅ Remove `import { transformComponentCode, validateComponentSyntax } from '@/lib/transpilation/jsx-transpiler';`

**Add New Import:**
- ✅ `import { stripTypeScript, removeImportsAndExports } from '@/lib/transpilation/jsx-transpiler';`

### Task 6: Test with Wedding Photography Calculator
**File**: Test the simplified renderer with existing generated components

**Verification Steps:**
1. ✅ Generate wedding photography calculator
2. ✅ Verify component renders without transpilation errors
3. ✅ Confirm ShadCN components work correctly
4. ✅ Ensure lead capture functionality works
5. ✅ Test responsive design and styling

## 🎯 SUCCESS CRITERIA

**Before (Complex):**
```
AI Code → TypeScript Strip → Import/Export Removal → Babel Transpile → Function Constructor → Component
```

**After (Simple):**
```
AI Code → TypeScript Strip → Import/Export Removal → Function Constructor → Component  
```

**Verification:**
- ✅ Wedding photography calculator renders successfully
- ✅ All ShadCN components work without imports
- ✅ No Babel dependencies or transpilation errors
- ✅ Hard fails show clear error messages (no hidden fallbacks)
- ✅ Component execution is fast and reliable

## 🚨 ERROR HANDLING RULES
- **NO try-catch blocks that hide errors**
- **NO fallback logic or graceful degradation**  
- **Throw clear, descriptive errors immediately**
- **Let failures bubble up to show real issues**

## 🔧 EXPECTED BENEFITS
1. **Simpler Architecture** - Remove 80% of transpilation complexity
2. **Faster Execution** - No Babel processing overhead
3. **Clearer Errors** - Direct Function constructor errors vs. hidden transpilation issues
4. **Maintain ShadCN** - Keep all UI components working
5. **LLM Friendly** - Simpler code format requirements

Execute these tasks in order and verify each step works before proceeding to the next.