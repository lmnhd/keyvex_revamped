# Cursor Agent Context - Pragmatic Type Cleanup

## 🎯 TASK OBJECTIVE

**REPLACE INEFFECTIVE 'UNKNOWN' TYPE THEATER WITH PRAGMATIC APPROACH**

The current `unknown` type usage in AI agent validation functions is providing no practical benefits over `any` while making the code harder to work with. Replace with honest, pragmatic typing.

## 🚨 CURRENT PROBLEMS IDENTIFIED

### Issues with Current Approach:
1. **Type Theater**: Using `unknown` for external inputs then immediately casting to `any` behavior
2. **No Development Benefits**: `unknown` provides zero type safety in validation functions  
3. **Inconsistent Pattern**: 76% of generic type usage is unnecessary
4. **Maintenance Overhead**: Complex validation logic for no practical gain

## 📋 PRAGMATIC TYPE FIXES REQUIRED

### 1. Replace 'unknown' Type Theater in AI Agent Functions

**Current Pattern (16 instances across 4 agents)**:
```typescript
// CURRENT - Type theater that helps nobody
function validateInput(input: unknown): PreprocessingInput {
  const typedInput = input as { userPrompt: unknown; businessType?: unknown };
  // ... validation
  return input as PreprocessingInput;
}

export async function runPreprocessingAgent(rawInput: unknown): Promise<PreprocessingResult>
```

**NEW Pattern - Honest External Input Handling**:
```typescript
// NEW - Honest about external inputs
function validateInput(input: any): PreprocessingInput {
  if (!input || typeof input !== 'object' || !input.userPrompt) {
    throw new Error('Invalid input: userPrompt required');
  }
  if (typeof input.userPrompt !== 'string' || input.userPrompt.length < 10) {
    throw new Error('userPrompt must be at least 10 characters');
  }
  return input as PreprocessingInput;
}

export async function runPreprocessingAgent(rawInput: any): Promise<PreprocessingResult>
```

### 2. Update All 4 Agent Core-Logic Files

**Files to Update**:
- `/src/lib/ai/agents/preprocessing/core-logic.ts`
- `/src/lib/ai/agents/surgical-planning/core-logic.ts`  
- `/src/lib/ai/agents/data-research/core-logic.ts`
- `/src/lib/ai/agents/code-generation/core-logic.ts`

**Changes for Each File**:
1. Replace `rawInput: unknown` → `rawInput: any`
2. Replace `function validateInput(input: unknown)` → `function validateInput(input: any)`
3. Replace `const typedInput = input as { prop: unknown }` → direct property access
4. Keep `error?: unknown` (appropriate for error handling)
5. Simplify validation logic without nested type assertions

### 3. Keep Appropriate Generic Types (5 instances)

**These are correctly using generics and should NOT be changed**:
```typescript
// Component props - genuinely can be any React prop type
props: Record<string, unknown>;

// External API metadata - unpredictable structure  
metadata: Record<string, unknown>;

// Error handling - errors can be anything in JavaScript
error?: unknown
```

## 📝 SPECIFIC REPLACEMENTS NEEDED

### Agent Validation Functions (4 files)

**preprocessing/core-logic.ts**:
```typescript
// REPLACE:
function validateInput(input: unknown): PreprocessingInput {
  const typedInput = input as { userPrompt: unknown; businessType?: unknown; industry?: unknown };
  if (!typedInput.userPrompt || typeof typedInput.userPrompt !== 'string') {

// WITH:
function validateInput(input: any): PreprocessingInput {
  if (!input || !input.userPrompt || typeof input.userPrompt !== 'string') {
```

**surgical-planning/core-logic.ts**:
```typescript
// REPLACE:
function validateInput(input: unknown): SurgicalPlanningInput {
  const typedInput = input as { preprocessingResult: unknown };
  if (!typedInput.preprocessingResult || typeof typedInput.preprocessingResult !== 'object') {

// WITH:
function validateInput(input: any): SurgicalPlanningInput {
  if (!input || !input.preprocessingResult || typeof input.preprocessingResult !== 'object') {
```

**data-research/core-logic.ts**:
```typescript
// REPLACE:
function validateInput(input: unknown): DataResearchInput {
  const typedInput = input as { surgicalPlan: unknown };
  if (!typedInput.surgicalPlan || typeof typedInput.surgicalPlan !== 'object') {

// WITH:
function validateInput(input: any): DataResearchInput {
  if (!input || !input.surgicalPlan || typeof input.surgicalPlan !== 'object') {
```

**code-generation/core-logic.ts**:
```typescript
// REPLACE:
function validateInput(input: unknown): CodeGenerationInput {
  const typedInput = input as { surgicalPlan?: unknown; researchData?: unknown };
  if (!typedInput.surgicalPlan || !typedInput.researchData) {

// WITH:
function validateInput(input: any): CodeGenerationInput {
  if (!input || !input.surgicalPlan || !input.researchData) {
```

### Function Signatures (4 files)

**Replace in all agent files**:
```typescript
// REPLACE:
export async function runAgent(rawInput: unknown): Promise<Result>

// WITH:
export async function runAgent(rawInput: any): Promise<Result>
```

## ⚠️ CRITICAL RULES

1. **Only change AI agent validation functions** - external input handling where `any` is honest
2. **Keep error handling as `unknown`** - errors genuinely can be anything  
3. **Keep component props as `unknown`** - React props genuinely need flexibility
4. **Keep external API metadata as `unknown`** - unpredictable structures
5. **Simplify validation logic** - remove unnecessary nested type assertions
6. **Do not change template files** - they are correctly structured

## 🎯 RATIONALE

**Why `any` is better than `unknown` for external inputs**:
- **Honest**: We're accepting JSON from API calls, we don't know the shape
- **Practical**: No false sense of type safety during development  
- **Simpler**: Less complex validation logic
- **Maintainable**: Clear intent about what we're doing

**The 5 remaining generic types are appropriate because**:
- Component props genuinely can be any React prop value
- Error objects genuinely can be any type in JavaScript  
- External API metadata genuinely has unpredictable structure

## ✅ SUCCESS CRITERIA

1. **AI agent functions use `any` for external inputs** (honest about unknown shape)
2. **Simplified validation logic** without nested type assertions
3. **Keep 5 appropriate generic types unchanged** (props, metadata, errors)
4. **No type theater** - every generic type serves a real purpose
5. **Build and lint pass** with clean, maintainable code

**Focus: Replace type theater with pragmatic honesty for external input handling.**