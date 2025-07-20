# Cursor Agent Context - REPLACE UNKNOWN WITH ANY

## 🎯 TASK OBJECTIVE

**CRITICAL: REPLACE 'UNKNOWN' WITH 'ANY' IN EXTERNAL INPUT FUNCTIONS**

**THE CURRENT CODE IS WRONG** - We are currently using `unknown` in AI agent validation functions but this is "type theater" that provides zero benefits. We need to REPLACE `unknown` with `any` for honest external input handling.

**IMPORTANT: `unknown` is the PROBLEM, `any` is the SOLUTION for external inputs.**

## 🚨 CURRENT PROBLEMS IDENTIFIED

### Issues with Current Approach:
1. **Type Theater**: Using `unknown` for external inputs then immediately casting to `any` behavior
2. **No Development Benefits**: `unknown` provides zero type safety in validation functions  
3. **Inconsistent Pattern**: 76% of generic type usage is unnecessary
4. **Maintenance Overhead**: Complex validation logic for no practical gain

## 📋 REQUIRED CHANGES: UNKNOWN → ANY

### 1. FIND AND REPLACE ALL 'unknown' in AI Agent Validation

**YOU MUST SEARCH FOR AND REPLACE THE FOLLOWING PATTERN**:

**SEARCH FOR THIS (WRONG - CURRENTLY IN THE CODE)**:
```typescript
function validateInput(input: unknown): PreprocessingInput {
  const typedInput = input as { userPrompt: unknown; businessType?: unknown };
```

**REPLACE WITH THIS (CORRECT)**:
```typescript
function validateInput(input: any): PreprocessingInput {
  if (!input || !input.userPrompt || typeof input.userPrompt !== 'string') {
```

**SEARCH FOR THIS (WRONG - CURRENTLY IN THE CODE)**:
```typescript
export async function runPreprocessingAgent(rawInput: unknown): Promise<PreprocessingResult>
```

**REPLACE WITH THIS (CORRECT)**:
```typescript
export async function runPreprocessingAgent(rawInput: any): Promise<PreprocessingResult>
```

### 2. EXACT FILES TO CHANGE (ALL CURRENTLY USE 'unknown' - WRONG!)

**STEP 1: Open these 4 files and look for 'unknown' types**:
- `/src/lib/ai/agents/preprocessing/core-logic.ts`
- `/src/lib/ai/agents/surgical-planning/core-logic.ts`  
- `/src/lib/ai/agents/data-research/core-logic.ts`
- `/src/lib/ai/agents/code-generation/core-logic.ts`

**STEP 2: In each file, find lines like this (CURRENT - WRONG)**:
```typescript
function validateInput(input: unknown): PreprocessingInput {
  const typedInput = input as { userPrompt: unknown; businessType?: unknown; industry?: unknown };
  if (!typedInput.userPrompt || typeof typedInput.userPrompt !== 'string') {
```

**STEP 3: Replace with (CORRECT)**:
```typescript
function validateInput(input: any): PreprocessingInput {
  if (!input || !input.userPrompt || typeof input.userPrompt !== 'string') {
```

**STEP 4: Find function signatures like (CURRENT - WRONG)**:
```typescript
export async function runPreprocessingAgent(rawInput: unknown): Promise<PreprocessingResult>
```

**STEP 5: Replace with (CORRECT)**:
```typescript
export async function runPreprocessingAgent(rawInput: any): Promise<PreprocessingResult>
```

**DO NOT TOUCH**:
- `error?: unknown` (keep this)
- Template files (they are correct)

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

**TO VERIFY YOUR CHANGES WORKED, RUN THIS COMMAND**:
```bash
rg ": unknown" src/lib/ai/agents/ -n
```

**AFTER YOUR CHANGES, THIS SHOULD ONLY SHOW**:
- `error?: unknown` (these are correct, keep them)
- NO `input: unknown` or `rawInput: unknown` (these should now be `any`)

**BEFORE YOUR CHANGES (WRONG STATE)**:
```bash
# Should show many lines like:
function validateInput(input: unknown): PreprocessingInput
rawInput: unknown,
const typedInput = input as { userPrompt: unknown }
```

**AFTER YOUR CHANGES (CORRECT STATE)**:
```bash
# Should only show error handling:
error?: unknown
```

1. **AI agent functions use `any` for external inputs** (honest about unknown shape)
2. **Simplified validation logic** without nested type assertions  
3. **Keep 5 appropriate generic types unchanged** (props, metadata, errors)
4. **No type theater** - every generic type serves a real purpose
5. **Build and lint pass** with clean, maintainable code

**SUMMARY: Change `unknown` to `any` for external input validation, keep `unknown` for error handling.**