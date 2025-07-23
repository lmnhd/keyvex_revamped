# CURSOR AGENT CONTEXT - Critical Fixes Needed

## =® CRITICAL ISSUE: `recommendedLeadCapture` Validation Error

**URGENT FIX REQUIRED** in `/src/lib/ai/agents/preprocessing/core-logic.ts` lines 25-29:

The `recommendedLeadCapture` field is causing validation errors because it's REQUIRED but the AI doesn't always provide it.

**Current Code (BROKEN):**
```typescript
recommendedLeadCapture: z.object({
  trigger: z.enum(['before_results', 'after_results']),
  incentive: z.string().min(1),
  additionalFields: z.array(z.string())
})
```

**Required Fix:**
```typescript
recommendedLeadCapture: z.object({
  trigger: z.enum(['before_results', 'after_results']),
  incentive: z.string().min(1),
  additionalFields: z.array(z.string())
}).optional()  // ê ADD THIS .optional()
```

**Error Message Being Thrown:**
```
"recommendedLeadCapture": {
  "code": "invalid_type",
  "expected": "object", 
  "received": "undefined",
  "message": "Required"
}
```

## =' Additional 'any' Type Violations to Fix

### High Priority (Agent Core Logic Files):

**1. Preprocessing Agent** (`/src/lib/ai/agents/preprocessing/core-logic.ts`):
- Line 33: `function validateInput(input: any)` í use `PreprocessingInput`
- Line 37: `typedInput.userPrompt: any; businessType?: any; industry?: any` í use proper interfaces  
- Line 88: `object as any` í use proper type casting

**2. Surgical Planning Agent** (`/src/lib/ai/agents/surgical-planning/core-logic.ts`):
- Line 40: `function validateInput(input: any)` í use `SurgicalPlanningInput`
- Line 21: `newElement: z.any().optional()` í define specific type
- Line 24: `replaceWith: z.any().optional()` í define specific type
- Line 97: `object as any as SurgicalPlan` í use proper type casting

**3. Data Research Agent** (`/src/lib/ai/agents/data-research/core-logic.ts`):
- Line 40: `function validateInput(input: any)` í use `DataResearchInput`
- Line 30: `modificationData: z.any().optional()` í define specific type
- Line 114: `object as any as ResearchData` í use proper type casting

**4. Code Generation Agent** (`/src/lib/ai/agents/code-generation/core-logic.ts`):
- Line 24: `function validateInput(input: any)` í use `CodeGenerationInput`
- Line 16: `customizedTool: z.any().optional()` í define specific type
- Line 92: `object as any as CodeGenerationResult` í use proper type casting

## =À Windsurf Agent Completed Tasks 

The Windsurf agent successfully:
- Replaced `unknown` parameters with `any` in all four agent core-logic files
- Updated function signatures: `rawInput: any` (as requested)
- Maintained `unknown` only in error handling contexts
- Created git checkpoints and commits

## <Ø Cursor Agent Next Actions

1. **CRITICAL FIRST**: Fix the `recommendedLeadCapture.optional()` issue in preprocessing agent
2. **HIGH PRIORITY**: Replace all `any` types with proper TypeScript interfaces from `/lib/types/tool.ts`
3. **VALIDATION**: Ensure all validation functions use proper input types
4. **TYPE CASTING**: Replace `object as any as Type` with proper type assertions

## =Õ Files Ready for Updates

All agent core-logic files are ready for type fixes:
-  `/src/lib/ai/agents/preprocessing/core-logic.ts`
-  `/src/lib/ai/agents/surgical-planning/core-logic.ts` 
-  `/src/lib/ai/agents/data-research/core-logic.ts`
-  `/src/lib/ai/agents/code-generation/core-logic.ts`

**Priority Order**: Start with preprocessing agent's `recommendedLeadCapture` fix, then systematically replace all `any` types with proper TypeScript interfaces.