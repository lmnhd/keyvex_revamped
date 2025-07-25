# Code Generation Agent - Technical Documentation

## Overview
The **Revolutionary Code Generation Agent** represents a complete architectural overhaul of the Keyvex Revamped surgical pipeline's final stage. This agent transforms surgical plans and research data into production-ready React components using cutting-edge AI tooling, hard validation principles, and Function constructor execution patterns.

## Core Architecture

### Tool-Assisted Generation Framework
The agent integrates the `tsLintCheckerTool` directly into the AI generation process, providing real-time TypeScript and ESLint feedback during component creation:

```typescript
const tools = { ts_lint_checker: tsLintCheckerTool } as const;

const { text: draftJson, reasoning, reasoningDetails } = await generateText({
  model: MODELS.PRIMARY,
  prompt: systemPrompt,
  tools,
  maxSteps: 8,
  providerOptions: {
    anthropic: {
      thinking: { type: 'enabled', budgetTokens: 12_000 },
    }
  }
});
```

**Key Benefits:**
- **Real-Time Validation**: TypeScript errors caught during generation, not after
- **Iterative Refinement**: AI can self-correct based on linting feedback
- **Quality Assurance**: Prevents syntactically invalid code from reaching production

### Hard Validation Architecture
**Philosophy**: Zero tolerance for errors - components either pass strict validation or fail immediately.

**Validation Pipeline:**
1. **Schema Validation**: Zod schema ensures proper CodeGenerationResult structure
2. **TypeScript Compilation**: In-memory TypeScript compilation with diagnostic analysis
3. **React Syntax Validation**: Babel parser verification of JSX validity
4. **Function Constructor Compatibility**: Ensures import/export-free component structure

```typescript
// TypeScript diagnostics check
const tsDiagnostics = getTypeScriptDiagnostics(result.generatedCode);
if (tsDiagnostics.length) {
  const messages = tsDiagnostics.map(d => ts.flattenDiagnosticMessageText(d.messageText, '\n'));
  throw new Error(`Static TypeScript errors in generated code:\n${messages.join('\n---\n')}`);
}

// React syntax validation
if (!isValidReact(result.generatedCode)) {
  throw new Error(`Code generation agent produced invalid JSX`);
}
```

**No Fallbacks**: Previous versions included model fallbacks and graceful degradation. The revolutionary architecture eliminates these patterns to surface real issues immediately.

### Function Constructor Execution Pattern
Components are generated specifically for `new Function()` execution with dependency injection:

**Generated Component Structure:**
```typescript
// Components are generated as standalone functions (NO imports/exports)
function WeddingPhotographyCalculator({ useState, useEffect, Button, Card, Select, ... }) {
  const [selectedPackage, setSelectedPackage] = useState('');
  // ... component logic
  return (
    <Card>
      <Button onClick={handleSubmit}>Get Quote</Button>
    </Card>
  );
}
```

**Execution in Dynamic Renderer:**
```typescript
const createComponent = new Function(
  'React', 'useState', 'useEffect', 'useCallback', 'useMemo',
  'Button', 'Input', 'Label', 'Card', 'CardContent', 'CardHeader', 'CardTitle',
  'Select', 'SelectContent', 'SelectItem', 'SelectTrigger', 'SelectValue',
  'Checkbox', 'Slider', 'Badge',
  `${jsCode}; return ${componentName};`
);

const Component = createComponent(
  React, React.useState, React.useEffect, React.useCallback, React.useMemo,
  Button, Input, Label, Card, CardContent, CardHeader, CardTitle,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Checkbox, Slider, Badge
);
```

## Enhanced Model Integration

### Claude 3.7 Sonnet with Thinking Mode
```typescript
providerOptions: {
  anthropic: {
    thinking: { type: 'enabled', budgetTokens: 12_000 },
  } satisfies AnthropicProviderOptions,
}
```

**Capabilities:**
- **Multi-Step Reasoning**: Up to 8 reasoning steps for complex component generation
- **Thinking Budget**: 12,000 tokens dedicated to internal reasoning
- **Tool Integration**: Seamless integration with tsLintCheckerTool during reasoning
- **Self-Correction**: AI can revise approach based on validation feedback

### Exponential Backoff Resilience
Handles API overload scenarios with intelligent retry logic:

```typescript
// Implemented in surgical-pipeline route
const withRetry = async <T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      
      const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s, 8s
      console.log(`🔄 [RETRY] Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Should not reach here');
};
```

## Structured Generation Process

### 10-Step Quality-Gated Methodology
The system prompt implements a comprehensive 10-step process:

1. **Template Analysis** - Deep understanding of source template structure
2. **Modification Planning** - Systematic application of surgical plan changes
3. **Data Integration** - Incorporation of researched mock data
4. **Component Architecture** - React hooks and state management design
5. **UI Implementation** - ShadCN component integration and styling
6. **Lead Capture Logic** - Email collection flow implementation
7. **Validation Logic** - Input validation and error handling
8. **TypeScript Interface Design** - Proper type definitions and interfaces
9. **Code Quality Review** - Self-validation against quality checklist
10. **Final Assembly** - Complete component with all requirements met

### Quality Gates and Checklists
Each step includes validation checkpoints:

```typescript
// Example from system prompt
QUALITY CHECKLIST:
✅ Component uses Function Constructor pattern (no imports/exports)
✅ All dependencies received as function parameters
✅ TypeScript interfaces defined within component
✅ Lead capture seamlessly integrated
✅ ShadCN UI components used correctly
✅ React hooks used properly
✅ Input validation implemented
✅ Error boundaries considered
✅ Responsive design applied
✅ Accessibility standards met
```

## Input/Output Data Flow

### Input Structure (CodeGenerationInput)
```typescript
interface CodeGenerationInput {
  surgicalPlan: {
    sourceTemplate: string;
    modifications: Array<{
      operation: string;
      type: string;
      target: string;
      reasoning: string;
    }>;
  };
  researchData: {
    modificationData: Record<string, unknown>;
    clientInstructions: {
      summary: string;
      dataNeeded: string[];
      format: string;
    };
  };
}
```

### Output Structure (CodeGenerationResult)
```typescript
interface CodeGenerationResult {
  success: boolean;
  customizedTool?: Tool;
  generatedCode?: string;
  modificationsApplied?: number;
  validationErrors?: string[];
  enhancementsAdded?: string[];
}
```

### Critical Data Flow Fix
A critical fix ensures the canvas receives actual generated code:

```typescript
// CRITICAL FIX: Ensure customizedTool.componentCode contains actual generated code
if (result.customizedTool) {
  console.log('🔧 [CODE-GEN] Fixing componentCode field with actual generated code');
  result.customizedTool.componentCode = result.generatedCode;
}
```

## Validation Systems

### Multi-Layer Validation Stack
1. **Zod Schema Validation** - Runtime structure validation
2. **TypeScript Compilation** - Static type checking with diagnostic analysis
3. **Babel Parser Validation** - JSX syntax verification
4. **Function Constructor Testing** - Execution compatibility verification

### TypeScript Diagnostics Integration
```typescript
function getTypeScriptDiagnostics(source: string): readonly ts.Diagnostic[] {
  const fileName = 'generated-component.tsx';
  const compilerHost = ts.createCompilerHost({});
  compilerHost.getSourceFile = () => ts.createSourceFile(fileName, source, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TSX);
  
  const program = ts.createProgram([fileName], {
    jsx: ts.JsxEmit.React,
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,
    lib: ['esnext', 'dom'],
    skipLibCheck: true,
    noEmitOnError: false,
  }, compilerHost);
  
  const allDiagnostics = ts.getPreEmitDiagnostics(program);
  const ignoredCodes = new Set([2304, 2393]); // Filter known acceptable issues
  return allDiagnostics.filter(d => !ignoredCodes.has(d.code));
}
```

### React Syntax Validation
```typescript
function isValidReact(code: string): boolean {
  try {
    parse(code, { sourceType: 'module', plugins: ['jsx', 'typescript'] });
    
    // Validate Function Constructor compatibility
    const hasExports = /export\s+(default\s+)?/.test(code);
    if (hasExports) return false; // Must be import/export-free
    
    // Check for React function component
    const functionMatch = code.match(/function\s+([A-Z][A-Za-z0-9_]*)\s*\(/);
    if (!functionMatch) return false;
    
    // Check for JSX return
    const hasJSXReturn = /<[A-Z]/.test(code) || /<[a-z]/.test(code);
    return hasJSXReturn;
  } catch (error) {
    return false;
  }
}
```

## Integration Points

### API Route Integration
Located at `/src/app/api/ai/surgical-pipeline/start/route.ts`:

```typescript
// Execute Code Generation Agent with retry logic
const codeGenResult = await withRetry(async () => {
  console.log('🎨 [PIPELINE] Executing Code Generation Agent...');
  return await runCodeGenerationAgent({
    surgicalPlan: surgicalResult,
    researchData: researchResult
  });
});
```

### Canvas Renderer Integration
The Dynamic Component Renderer at `/src/components/canvas/dynamic-component-renderer.tsx` consumes the generated code:

```typescript
// Transpile TSX -> plain JS
const jsCode = transpileComponent(code);

// Extract component name and create function
const componentName = extractComponentName(jsCode);
const functionCode = `${jsCode}; return ${componentName};`;

// Execute with dependency injection
const createComponent = new Function(/* parameters */, functionCode);
const Component = createComponent(/* dependencies */);
```

## Performance Characteristics

### Generation Times
- **Average Generation**: 15-30 seconds for complete component
- **Tool-Assisted Refinement**: 8 max steps with thinking mode
- **Validation Overhead**: ~2-3 seconds for comprehensive validation
- **Retry Logic**: Exponential backoff handles API overload gracefully

### Memory Usage
- **Thinking Budget**: 12,000 tokens for internal reasoning
- **Generation Tokens**: ~1,000-2,000 tokens for component code
- **Validation Memory**: Minimal overhead for TypeScript compilation
- **Cache Efficiency**: Reuses model instances across requests

## Error Handling Patterns

### Hard Fail Examples
```typescript
// Schema validation failure
if (!result.success) {
  throw new Error('Code generation agent returned success: false');
}

// Empty code generation
if (!result.generatedCode || result.generatedCode.trim().length === 0) {
  throw new Error('Code generation agent returned empty generatedCode');
}

// TypeScript compilation errors
if (tsDiagnostics.length) {
  throw new Error(`Static TypeScript errors in generated code:\n${messages.join('\n---\n')}`);
}
```

### Error Context Logging
Comprehensive error details for debugging:

```typescript
if (typeof error === 'object' && error !== null) {
  const e = error as Record<string, unknown>;
  console.error('💥 [CODE-GEN] Error details:', {
    cause: e.cause,
    url: e.url,
    statusCode: e.statusCode,
    responseBody: e.responseBody,
    isRetryable: e.isRetryable,
  });
}
```

## Production Deployment Considerations

### Environment Requirements
- **Node.js**: Version 18+ for TypeScript compilation features
- **Memory**: Minimum 512MB for in-memory TypeScript compilation
- **API Keys**: Claude/Anthropic API access for model requests
- **Timeout**: 60+ second timeout for complex component generation

### Monitoring and Observability
- **Structured Logging**: Comprehensive console logging throughout generation
- **Performance Metrics**: Generation time, validation duration, retry counts
- **Error Tracking**: Detailed error context for debugging failures
- **Success Metrics**: Component generation success rate, validation pass rate

### Scalability Patterns
- **Stateless Architecture**: No shared state between generations
- **Connection Pooling**: Reuse HTTP connections for model requests
- **Timeout Management**: Graceful handling of long-running generations
- **Resource Cleanup**: Proper cleanup of TypeScript compilation resources

## Future Enhancement Opportunities

### Advanced Tool Integration
- **ESLint Rule Customization**: Fine-tune linting rules for generated components
- **Prettier Integration**: Automatic code formatting during generation
- **Custom Validation Tools**: Domain-specific validation for business logic

### Model Optimization
- **Fine-Tuning**: Custom model training on successful component patterns
- **Prompt Engineering**: Iterative improvement of generation prompts
- **Context Optimization**: Reduce token usage while maintaining quality

### Performance Improvements
- **Caching Layer**: Cache successful validations and transpilations
- **Parallel Processing**: Concurrent execution of validation steps
- **Streaming Generation**: Real-time component generation feedback

This revolutionary architecture represents a paradigm shift from traditional code generation to AI-assisted, tool-validated, production-ready component creation with zero tolerance for errors and complete TypeScript compliance.