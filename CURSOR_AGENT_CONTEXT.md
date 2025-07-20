# CURSOR AGENT CONTEXT - CHANGE UNKNOWN TO ANY

## 🎯 SIMPLE TASK: REPLACE UNKNOWN WITH ANY

**WHAT TO DO**: Change `unknown` to `any` in 8 specific lines across 4 files
**WHY**: We prefer honest `any` over "type theater" `unknown` for external inputs

## 📝 EXACT CHANGES NEEDED

### File 1: `/src/lib/ai/agents/preprocessing/core-logic.ts`
- **Line 13**: Change `input: unknown` to `input: any`
- **Line 44**: Change `rawInput: unknown` to `rawInput: any`

### File 2: `/src/lib/ai/agents/surgical-planning/core-logic.ts`
- **Line 13**: Change `input: unknown` to `input: any`
- **Line 53**: Change `rawInput: unknown` to `rawInput: any`

### File 3: `/src/lib/ai/agents/data-research/core-logic.ts`
- **Line 13**: Change `input: unknown` to `input: any`
- **Line 70**: Change `rawInput: unknown` to `rawInput: any`

### File 4: `/src/lib/ai/agents/code-generation/core-logic.ts`
- **Line 13**: Change `input: unknown` to `input: any`
- **Line 62**: Change `rawInput: unknown` to `rawInput: any`

## ✅ VERIFICATION

After changes, this command should show only error handling (8 lines):
```bash
rg ": unknown" src/lib/ai/agents/ -n
```

**JUST MAKE THESE 8 SIMPLE EDITS - THAT'S ALL**