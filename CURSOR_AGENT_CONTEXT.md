# Cursor Agent Context - Type Consolidation ONLY

## 🎯 TASK OBJECTIVE

**CRITICAL TYPE VIOLATIONS FOUND - CLEAN UP TYPES ONLY**

The codebase has violated the "no new types" rule and scattered type definitions across multiple schema files. You must consolidate types back to the single source of truth pattern.

**DO NOT TOUCH TEMPLATE FILES - The template file separation is correct and necessary to keep files under 500 lines.**

## 🚨 CRITICAL TYPE VIOLATIONS TO FIX

### Type Violations Found:
1. **Agents creating new types** in schema files instead of importing from `/lib/types/tool.ts`
2. **Duplicated type definitions** across multiple schema files
3. **Use of `z.any()` types** instead of proper TypeScript definitions
4. **Schema files redefining** structures that already exist in main types file

## 📋 TYPE CONSOLIDATION REQUIREMENTS

### 1. DELETE These Files (Type Violations ONLY):
```
src/lib/ai/agents/preprocessing/schema.ts
src/lib/ai/agents/surgical-planning/schema.ts  
src/lib/ai/agents/data-research/schema.ts
src/lib/ai/agents/code-generation/schema.ts
```

### 2. UPDATE Agent types.ts Files
Each agent's `types.ts` file should ONLY re-export from main types:

**`/src/lib/ai/agents/preprocessing/types.ts`**:
```typescript
// Re-export shared types - NO new type creation allowed
export type { 
  PreprocessingResult,
  ToolRequest as PreprocessingInput 
} from '@/lib/types/tool';
```

**`/src/lib/ai/agents/surgical-planning/types.ts`**:
```typescript
// Re-export shared types - NO new type creation allowed  
export type { 
  SurgicalPlan,
  PreprocessingResult
} from '@/lib/types/tool';

export interface SurgicalPlanningInput {
  preprocessingResult: PreprocessingResult;
}
```

**`/src/lib/ai/agents/data-research/types.ts`**:
```typescript
// Re-export shared types - NO new type creation allowed
export type { 
  ResearchData,
  SurgicalPlan 
} from '@/lib/types/tool';

export interface DataResearchInput {
  surgicalPlan: SurgicalPlan;
}
```

**`/src/lib/ai/agents/code-generation/types.ts`**:
```typescript
// Re-export shared types - NO new type creation allowed
export type { 
  CodeGenerationResult,
  SurgicalPlan,
  ResearchData 
} from '@/lib/types/tool';

export interface CodeGenerationInput {
  surgicalPlan: SurgicalPlan;
  researchData: ResearchData;
}
```

### 3. UPDATE Agent core-logic.ts Files
Remove schema imports and use direct validation:

**Pattern for all agents**:
```typescript
// REMOVE: import from './schema'
// REPLACE WITH: Direct type imports
import type { PreprocessingResult, SurgicalPlan } from '@/lib/types/tool';

// REMOVE: Zod schema validation  
// REPLACE WITH: Simple input validation
function validateInput(input: any): PreprocessingResult {
  if (!input.userPrompt || input.userPrompt.length < 10) {
    throw new Error('Invalid input: userPrompt required and must be at least 10 characters');
  }
  return input as PreprocessingResult;
}

export async function runPreprocessingAgent(rawInput: any): Promise<PreprocessingResult> {
  // Simple validation instead of Zod schemas
  const input = validateInput(rawInput);
  
  // Rest of function unchanged...
}
```

### 4. ADD Missing Types to `/lib/types/tool.ts`
Add any missing input interfaces directly to the main types file:

```typescript
// Add these interfaces to /lib/types/tool.ts if they don't exist
export interface SurgicalPlanningInput {
  preprocessingResult: PreprocessingResult;
}

export interface DataResearchInput {
  surgicalPlan: SurgicalPlan;
}

export interface CodeGenerationInput {
  surgicalPlan: SurgicalPlan;
  researchData: ResearchData;
}
```

## ⚠️ CRITICAL RULES TO FOLLOW

1. **SINGLE SOURCE OF TRUTH**: All types MUST be in `/lib/types/tool.ts` only
2. **NO NEW TYPE CREATION**: Agents can only import and re-export existing types
3. **NO ZOD SCHEMAS**: Remove all Zod validation, use simple input checking
4. **NO `z.any()` USAGE**: All types must be properly defined TypeScript interfaces
5. **AGENT TYPES FILES**: Should only re-export from main types, no definitions
6. **DO NOT TOUCH TEMPLATE FILES**: The template file separation is correct and necessary

## 🔧 IMPLEMENTATION ORDER

1. **Delete all schema files** that violate type rules
2. **Update agent types.ts files** to only re-export from main types
3. **Update agent core-logic.ts files** to remove Zod dependencies
4. **Add missing interfaces** to `/lib/types/tool.ts` if needed
5. **Verify all imports** point to single source of truth

## ✅ SUCCESS CRITERIA

1. **Zero schema files** in agent directories
2. **All types consolidated** in `/lib/types/tool.ts` only
3. **No `z.any()` usage** anywhere in codebase
4. **Agent files** only import from main types file
5. **No type duplication** across multiple files
6. **Template files unchanged** - they are correctly separated for file size management

**This is a critical cleanup task focusing ONLY on type consolidation - do not modify template files.**