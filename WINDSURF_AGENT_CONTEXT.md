# Windsurf Agent Context - Enhanced Preprocessing Agent Implementation

## 🎯 TASK OBJECTIVE

**Create the Enhanced Preprocessing Agent** - The first step in our AI-first surgical modification pipeline.

This agent takes raw user business descriptions and outputs structured template selection + modification signals for the surgical planning agent.

## 📋 IMPLEMENTATION REQUIREMENTS

### 1. File Structure to Create
```
/keyvex_revamped/src/lib/ai/
├── agents/
│   └── preprocessing/
│       ├── core-logic.ts          # Main preprocessing logic
│       ├── schema.ts               # Zod schemas for input/output
│       ├── prompt.ts               # AI prompt template
│       └── types.ts                # TypeScript definitions
└── models/
    └── model-config.ts             # AI model configuration
```

### 2. Core Functionality
The Enhanced Preprocessing Agent must:
- **Analyze business descriptions** to identify industry, audience, services
- **Map to appropriate tool type** (Calculator, Quiz, Planner, Form, Diagnostic)  
- **Generate template fit score** (0-100) for confidence level
- **Extract modification signals** for surgical planning
- **Identify lead capture strategy** aligned with business model

### 3. Input/Output Schema
```typescript
// INPUT: Raw user description
interface PreprocessingInput {
  userPrompt: string;           // Raw business description
  businessType?: string;        // Optional industry context
  industry?: string;            // Optional industry specification
}

// OUTPUT: Structured analysis for surgical planning
interface PreprocessingResult {
  selectedTemplate: string;           // Calculator|Quiz|Planner|Form|Diagnostic
  templateFitScore: number;           // 0-100 confidence score
  targetAudience: string;             // Identified target audience
  modificationSignals: string[];      // Signals for surgical modifications
  businessAnalysis: {
    industry: string;
    services: string[];
    valueProposition: string;
    leadGoals: string[];
  };
  recommendedLeadCapture: {
    trigger: 'before_results' | 'after_results';
    incentive: string;
    additionalFields: string[];
  };
}
```

## 🔧 TECHNICAL SPECIFICATIONS

### Required Dependencies
```typescript
import { z } from 'zod';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
```

### AI Model Configuration
- **Primary Model**: Claude 3.5 Sonnet (anthropic) for complex analysis
- **Fallback Model**: GPT-4o (openai) for reliability
- **Temperature**: 0.3 (balanced creativity/consistency)
- **Max Tokens**: 1500 (structured output)

### Template Matching Logic
The agent must analyze user input against these tool types:

1. **Calculator Tools**
   - Keywords: cost, price, ROI, savings, estimate, calculate, budget
   - Business types: Financial services, SaaS, consultants
   - Value delivery: Numerical analysis, financial insights

2. **Quiz/Assessment Tools**  
   - Keywords: assess, evaluate, ready, fit, personality, skills
   - Business types: Coaches, consultants, training companies
   - Value delivery: Personalized recommendations, readiness scores

3. **Planner Tools**
   - Keywords: plan, schedule, timeline, itinerary, calendar
   - Business types: Travel agencies, marketing agencies, event planners
   - Value delivery: Structured plans, timelines, schedules

4. **Form/Generator Tools**
   - Keywords: generate, create, build, proposal, document, contract
   - Business types: Legal services, agencies, B2B services  
   - Value delivery: Custom documents, proposals, reports

5. **Diagnostic Tools**
   - Keywords: audit, check, analyze, diagnose, review, health
   - Business types: Consultants, technical services, healthcare
   - Value delivery: Analysis, recommendations, improvement plans

## 📄 IMPLEMENTATION REFERENCE

### Core Architecture Pattern
Based on legacy system at `/keyvex_app/src/app/api/ai/logic-architect/brainstorm/core-logic.ts`:
- **Input validation** with Zod schemas
- **AI model selection** with fallback logic  
- **Structured output generation** using AI SDK
- **Error handling** with descriptive messages
- **Type safety** throughout the pipeline

### Key Files to Reference
- **`/keyvex_app/src/lib/ai/models/model-config.ts`** - Model provider configuration
- **`/keyvex_app/src/app/api/ai/logic-architect/brainstorm/core-logic.ts`** - Business analysis patterns
- **`/keyvex_revamped/src/lib/types/tool.ts`** - Type definitions (already exists)
- **`/keyvex_revamped/PROJECT_DOCUMENTATION.md`** - Tool type taxonomy and requirements

## 🚀 PROMPT ENGINEERING GUIDELINES

### System Prompt Structure
```
You are the Enhanced Preprocessing Agent for the Keyvex template-first lead magnet generation system.

Your role is to analyze raw business descriptions and map them to the optimal tool template with surgical modification signals.

CRITICAL REQUIREMENTS:
1. Every tool MUST serve dual objectives: Lead Collection + Value Delivery
2. All inputs must be pre-set options (dropdowns, checkboxes, sliders) - NO text inputs
3. Focus on template-first approach with surgical modifications
4. Generate realistic modification signals for the surgical planning agent
5. Recommend lead capture strategy aligned with business model

TOOL TYPE TAXONOMY:
- Calculator: Numerical analysis, financial insights (ROI, pricing, savings)
- Quiz/Assessment: Personalized recommendations, readiness evaluation  
- Planner: Structured plans, timelines, schedules
- Form/Generator: Custom documents, proposals, reports
- Diagnostic: Analysis, audits, health checks, recommendations

BUSINESS ANALYSIS FRAMEWORK:
- Industry identification and target audience
- Service offerings and value proposition  
- Lead generation goals and client insights needed
- Template fit analysis with confidence scoring
- Modification signals for surgical customization
```

### Output Format Requirements
- **Structured JSON** following PreprocessingResult schema
- **High confidence scores** (80+) for clear matches
- **Detailed modification signals** for surgical planning
- **Specific lead capture recommendations** 
- **Clear reasoning** for template selection

## ✅ TESTING REQUIREMENTS

### Test Cases to Implement
Create test cases for each tool type:

1. **Calculator Example**: "I'm a financial advisor who wants to help clients calculate retirement savings needed based on their age, income, and goals"

2. **Quiz Example**: "I'm a business coach who wants to assess if entrepreneurs are ready to scale their business"

3. **Planner Example**: "I'm a travel agent who wants to help clients plan their perfect vacation itinerary"

4. **Form Example**: "I'm a lawyer who wants to generate custom contracts for small businesses"  

5. **Diagnostic Example**: "I'm a marketing consultant who wants to audit businesses' digital marketing effectiveness"

### Expected Outputs
Each test should produce:
- **Correct template selection** with high fit score
- **Relevant modification signals** 
- **Appropriate lead capture strategy**
- **Detailed business analysis**

## 🔄 INTEGRATION POINTS

### Input Source
- **API Route**: `/api/ai/agents/preprocessing` (to be created)
- **Frontend**: Template selection interface
- **Legacy Integration**: Enhanced brainstorm process

### Output Destination  
- **Next Agent**: Template-Aware Surgical Planning Agent
- **Storage**: Session state or database persistence
- **UI Feedback**: Template recommendation with confidence

### Error Handling
- **Model Failures**: Fallback to secondary AI model
- **Low Confidence**: Request more user context
- **Invalid Input**: Clear validation error messages
- **Timeout**: Graceful degradation with basic template suggestion

## 📋 DELIVERABLES CHECKLIST

- [ ] `/src/lib/ai/agents/preprocessing/core-logic.ts` - Main implementation
- [ ] `/src/lib/ai/agents/preprocessing/schema.ts` - Zod validation schemas  
- [ ] `/src/lib/ai/agents/preprocessing/prompt.ts` - AI prompt template
- [ ] `/src/lib/ai/agents/preprocessing/types.ts` - TypeScript definitions
- [ ] `/src/lib/ai/models/model-config.ts` - Model configuration (if not exists)
- [ ] Test cases demonstrating all 5 tool types
- [ ] Error handling for edge cases
- [ ] Documentation with usage examples

## 🎯 SUCCESS CRITERIA

1. **Accurate Template Matching**: 90%+ accuracy on test cases
2. **High Confidence Scores**: 80+ for clear business descriptions  
3. **Useful Modification Signals**: Actionable insights for surgical planning
4. **Lead Capture Alignment**: Strategy matches business model and tool type
5. **Type Safety**: Full TypeScript coverage with no 'any' types
6. **Error Resilience**: Graceful handling of all failure modes

This agent is the foundation of our AI-first surgical modification system. Focus on accuracy, type safety, and comprehensive error handling.