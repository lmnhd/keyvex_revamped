# Keyvex Revamped Project Documentation

## Project Overview
**Date**: July 18, 2025  
**Project**: Keyvex Revamped - Template-First Lead Magnet Generation System  
**Parent Project**: Keyvex_Project  
**Technology Stack**: Next.js 15, React 19, TypeScript, Tailwind CSS  

## Project Vision

Create a simplified but effective implementation of the current Keyvex app objective: generating customized business lead magnets based on client business model specifications. The key innovation is a **template-first approach** using surgical modifications rather than complete AI generation from scratch.

### CRITICAL REQUIREMENT: Dual Objectives
Every product tool MUST accomplish TWO main objectives:
1. **Lead Collection**: Capture email addresses and relevant business insights from users
2. **Value Delivery**: Provide useful data, insights, plans, recommendations, or analysis to users

Both objectives must be seamlessly integrated into the user experience, with lead capture being a side effect of the value delivery process."

## Core Architectural Decisions

### 1. Template-First Approach
- **Problem**: Current system generates everything from scratch, leading to code complexity and data mismatches
- **Solution**: Start with working baseline templates and make targeted modifications
- **Benefits**: 
  - Immediate working product
  - Predictable changes
  - Easier debugging
  - Maintainable code

### 2. Expanded Tool Definition
- **Beyond Calculators**: Quiz, Planner, Form, Assessment, Diagnostic tools
- **Input/Output Patterns**: Each tool type has specific data structures
- **Business Model Alignment**: Tool type matches business service model
- **Dual-Purpose Design**: Every tool collects leads AND delivers value
- **No Text Inputs**: All inputs must be pre-set options (dropdowns, checkboxes, sliders)
- **Research-Driven Data**: AI generates realistic mock data from web research

### 3. Surgical Modification Agent
- **Single Agent**: Replace complex multi-agent orchestration
- **Targeted Changes**: Modify specific parts of template (state, functions, styling, content)
- **Real-Time Preview**: Instant feedback through canvas renderer
- **Template-Specific**: Different modification patterns per tool type

## Tool Type Taxonomy

### 1. Calculator Tools
- **Input**: Numeric selections, ranges, dropdowns (NO text inputs)
- **Output**: Calculations, charts, recommendations
- **Lead Capture**: Email required for "detailed report" or "personalized analysis"
- **Insights Collected**: Financial capacity, investment preferences, business size
- **Use Cases**: ROI, pricing, savings estimators
- **Target**: Financial services, consultants, SaaS
- **Mock Data**: Tax rates, industry benchmarks, regulatory data

### 2. Quiz/Assessment Tools
- **Input**: Multiple choice, ratings, selections (ALL pre-set options)
- **Output**: Personality type, recommendations, action steps
- **Lead Capture**: Email required for "full assessment results" or "action plan"
- **Insights Collected**: Readiness level, pain points, priorities, preferences
- **Use Cases**: Readiness assessments, skill evaluations
- **Target**: Coaches, consultants, training companies
- **Mock Data**: Industry standards, assessment criteria, best practices

### 3. Planner Tools
- **Input**: Preferences, constraints, dates, budgets (dropdown selections)
- **Output**: Structured plans, itineraries, schedules
- **Lead Capture**: Email required for "complete itinerary" or "detailed plan"
- **Insights Collected**: Budget range, preferences, timeline, requirements
- **Use Cases**: Travel planning, marketing calendars, project timelines
- **Target**: Travel agencies, marketing agencies, event planners
- **Mock Data**: Pricing data, location info, seasonal trends

### 4. Form/Generator Tools
- **Input**: Business details, specifications, requirements (structured selections)
- **Output**: Custom documents, proposals, reports
- **Lead Capture**: Email required for "document download" or "proposal access"
- **Insights Collected**: Company size, industry, service needs, budget
- **Use Cases**: Proposal generators, contract builders
- **Target**: Legal services, agencies, B2B services
- **Mock Data**: Industry templates, pricing structures, legal requirements

### 5. Diagnostic Tools
- **Input**: Symptoms, conditions, current state (checkbox/dropdown selections)
- **Output**: Analysis, recommendations, action plans
- **Lead Capture**: Email required for "detailed analysis" or "improvement plan"
- **Insights Collected**: Current state, problems, improvement areas, urgency
- **Use Cases**: Business health checks, website audits
- **Target**: Consultants, technical services, healthcare
- **Mock Data**: Industry benchmarks, diagnostic criteria, best practices

## Technical Architecture

### Core Components (Clean Architecture)
1. **Tool Renderer** (`/src/components/canvas/tool-renderer.tsx`) - Main tool display component
2. **Dynamic Component Renderer** (`/src/components/canvas/dynamic-component-renderer.tsx`) - JSX execution engine
3. **Tool Types** (`/src/lib/types/tool.ts`) - SINGLE SOURCE OF TRUTH for all type definitions
4. **AI Agents** (`/src/lib/ai/agents/`) - 4-agent surgical modification pipeline (no schema files)
5. **Baseline Templates** (`/src/lib/templates/`) - 5 tool types in separate files (under 500 lines each)
6. **Surgical Pipeline API** (`/src/app/api/ai/surgical-pipeline/start/route.ts`) - Complete orchestration endpoint

### Refactoring Strategy
- **Remove**: Extensive console logging, complex validation
- **Simplify**: Error handling, dependency injection
- **Streamline**: Transpilation process, validation logic
- **Focus**: Essential functionality only

### AI-First Surgical Pipeline (4 Agents)
1. **Business Input** - User describes business needs via `/test` page textarea
2. **Enhanced Preprocessing Agent** - Maps user intent to template + modification signals  
3. **Template-Aware Surgical Planning Agent** - Creates detailed modification plans
4. **Template-Focused Data Research Agent** - Researches real data using Perplexity API
5. **All-AI Code Generation Agent** - Generates complete modified React components
6. **Real-Time Preview** - Tool renderer displays generated tools with lead capture
7. **Final Product** - Working dual-purpose tool with real data and lead collection

## Key Implementation Decisions

### Enhanced Brainstorm Process (Based on Current Logic Architect System)
- **Business Analysis**: Industry, target audience, value proposition, lead goals
- **Dual Objective Planning**: Lead capture strategy + value delivery approach
- **Tool Type Matching**: AI recommends optimal tool type with built-in lead capture
- **Data Requirements Research**: Web research for industry-specific mock data
- **Structured Input Design**: All inputs must be pre-set options (no text fields)
- **Client Instructions**: Clear specifications for updating mock data with proprietary data

### Data Requirements & Research Process
- **AI-Driven Research**: Uses Perplexity API for industry-specific data
- **Mock Data Generation**: Realistic test data with 3-10 options per category
- **Data Categories**: Regulatory, market pricing, geographic, industry standards, statistical
- **Template-Specific**: Each template has predefined data structures
- **Agent-Modified**: Surgeon adapts existing structure vs. generating from scratch
- **Client Guidance**: Clear instructions for replacing mock data with proprietary data

### Canvas Tool Integration
- **Reuse**: Leverage existing battle-tested renderer
- **Lean**: Remove unnecessary complexity
- **Real-Time**: Instant preview of modifications
- **Multi-Type**: Support all tool types

## Todo List (Current Status)

### High Priority
1. ✅ Create keyvex_revamped directory structure with process flow diagram
2. 🔄 Document current conversation and project decisions
3. ⏳ Bootstrap NextJS 15 application in keyvex_revamped directory
4. ⏳ Expand ProductTool definition to include quiz, planner, form, and assessment tool types
5. ⏳ Design template taxonomy with input/output patterns
6. ⏳ Create business-model-to-tool-type mapping system for brainstorm process
7. ⏳ Build 3-5 working baseline templates covering major tool types
8. ⏳ Design aligned brainstorm process that matches business model to appropriate tool template

### Medium Priority
9. ⏳ Build surgical modification agent with template-specific modification patterns

## Benefits Over Current System

1. **Avoid Code Spaghetti**: Clean architecture from day one
2. **Immediate Results**: Working templates provide instant value
3. **Predictable Modifications**: Easier to test and debug
4. **Better Business Alignment**: Tool types match business models
5. **Reduced Complexity**: Single agent vs. orchestration system
6. **Maintainable**: Easy to modify and iterate

## Next Steps

1. Bootstrap Next.js 15 application
2. Create expanded ProductTool type definitions
3. Build baseline templates for each tool type
4. Implement simplified brainstorm process
5. Create surgical modification agent
6. Integrate canvas tool renderer
7. Test end-to-end flow

## Conversation Summary

The discussion established the need for a template-first approach to solve the complexity and data mismatch issues in the current Keyvex system. Key decisions include expanding beyond calculators to include quiz, planner, form, and diagnostic tools, implementing a surgical modification agent instead of complex orchestration, and ensuring tight alignment between brainstorm process and template capabilities.

The architecture prioritizes working products, predictable changes, and maintainable code over the current system's complexity. The canvas tool from the existing project will be reused as the renderer, but simplified to remove unnecessary complexity.

Project will be developed in phases, starting with foundation elements (project structure, template definitions, baseline templates) then moving to core functionality (brainstorm process, surgical agent, real-time preview) and finally integration and testing.