# Agent Orchestration Refactor Plan

## 🎯 **Objective**
Refactor the FileCoder agent from a monolithic, timeout-prone system to an orchestrated, step-by-step architecture with specialized prompts and batched operations.

## 📋 **Current Problems**
- [ ] **Vercel timeout issues** - 2-minute operations exceed serverless limits
- [ ] **Monolithic prompts** - One large prompt for all operations
- [ ] **No progress tracking** - Users wait without feedback
- [ ] **Inefficient LLM usage** - Multiple small operations = many calls
- [ ] **No error recovery** - Failures lose all progress

## 🏗️ **Target Architecture**

### **Phase 1: Core Infrastructure**
- [ ] **State Management System** - Track agent progress across API calls
- [ ] **Step Orchestrator** - Group operations by type for efficiency
- [ ] **Specialized Prompts** - Focused prompts for each operation type
- [ ] **Progress API** - Real-time status updates

### **Phase 2: Smart Batching**
- [ ] **Operation Grouping** - Batch similar operations (text changes, structural changes)
- [ ] **Efficient LLM Usage** - Reduce calls from 13 to 5 (62% reduction)
- [ ] **Context Preservation** - Maintain surgical architect philosophy

### **Phase 3: User Experience**
- [ ] **Real-time Progress** - WebSocket or polling for live updates
- [ ] **Error Recovery** - Resume from any point
- [ ] **Timeout Prevention** - Each step completes quickly

---

## 📁 **File Structure**

```
src/
├── lib/
│   ├── ai/
│   │   ├── agents/
│   │   │   └── file-coder/
│   │   │       ├── core-logic.ts (DEPRECATED)
│   │   │       ├── prompt.ts (DEPRECATED)
│   │   │       └── orchestrated/
│   │   │           ├── orchestrator.ts
│   │   │           ├── state-manager.ts
│   │   │           ├── step-executor.ts
│   │   │           └── prompts/
│   │   │               ├── core-philosophy.ts
│   │   │               ├── analysis-prompt.ts
│   │   │               ├── text-modifications-prompt.ts
│   │   │               ├── structural-changes-prompt.ts
│   │   │               ├── calculation-prompt.ts
│   │   │               └── validation-prompt.ts
│   │   └── agentic-tools/
│   │       └── (existing tools remain unchanged)
├── app/
│   └── api/
│       ├── agent/
│       │   ├── start/
│       │   │   └── route.ts
│       │   ├── status/
│       │   │   └── [sessionId]/
│       │   │       └── route.ts
│       │   ├── step/
│       │   │   └── route.ts
│       │   └── result/
│       │       └── [sessionId]/
│       │           └── route.ts
│       └── tests/
│           └── orchestrated-agent/
│               └── route.ts
└── types/
    └── agent-orchestration.ts
```

---

## 🔧 **Implementation Checklist**

### **Phase 1: Core Infrastructure**

#### **1.1 Create Type Definitions**
- [ ] **File**: `src/types/agent-orchestration.ts`
- [ ] **Task**: Define all interfaces for the orchestration system
- [ ] **Deliverables**:
  - [ ] `AgentState` interface
  - [ ] `AgentStep` interface
  - [ ] `OperationGroup` interface
  - [ ] `StepResult` interface
  - [ ] `ExecutionPlan` interface

#### **1.2 Create State Management System**
- [ ] **File**: `src/lib/ai/agents/file-coder/orchestrated/state-manager.ts`
- [ ] **Task**: Implement state persistence and retrieval
- [ ] **Deliverables**:
  - [ ] `saveState(sessionId, state)` function
  - [ ] `loadState(sessionId)` function
  - [ ] `updateState(sessionId, updates)` function
  - [ ] `deleteState(sessionId)` function
  - [ ] File-based storage in `/tmp/agent-sessions/`

#### **1.3 Create Core Philosophy Module**
- [ ] **File**: `src/lib/ai/agents/file-coder/orchestrated/prompts/core-philosophy.ts`
- [ ] **Task**: Extract reusable surgical architect philosophy
- [ ] **Deliverables**:
  - [ ] `SURGICAL_CORE` constant
  - [ ] `SURGICAL_PRINCIPLES` constant
  - [ ] `TOOL_GUIDANCE` constant

#### **1.4 Create Specialized Prompts**
- [ ] **File**: `src/lib/ai/agents/file-coder/orchestrated/prompts/analysis-prompt.ts`
- [ ] **Task**: Create focused analysis prompt
- [ ] **Deliverables**:
  - [ ] `ANALYSIS_PROMPT` template
  - [ ] Context replacement functions
  - [ ] JSON output format specification

- [ ] **File**: `src/lib/ai/agents/file-coder/orchestrated/prompts/text-modifications-prompt.ts`
- [ ] **Task**: Create batched text modification prompt
- [ ] **Deliverables**:
  - [ ] `TEXT_MODIFICATIONS_PROMPT` template
  - [ ] Multiple text change handling
  - [ ] Tool selection logic

- [ ] **File**: `src/lib/ai/agents/file-coder/orchestrated/prompts/structural-changes-prompt.ts`
- [ ] **Task**: Create batched structural changes prompt
- [ ] **Deliverables**:
  - [ ] `STRUCTURAL_CHANGES_PROMPT` template
  - [ ] Multiple element addition handling
  - [ ] Component structure preservation

- [ ] **File**: `src/lib/ai/agents/file-coder/orchestrated/prompts/calculation-prompt.ts`
- [ ] **Task**: Create calculation logic prompt
- [ ] **Deliverables**:
  - [ ] `CALCULATION_PROMPT` template
  - [ ] Research data integration
  - [ ] Pricing formula implementation

- [ ] **File**: `src/lib/ai/agents/file-coder/orchestrated/prompts/validation-prompt.ts`
- [ ] **Task**: Create validation prompt
- [ ] **Deliverables**:
  - [ ] `VALIDATION_PROMPT` template
  - [ ] Error analysis and recommendations
  - [ ] Next step guidance

#### **1.5 Create Step Executor**
- [ ] **File**: `src/lib/ai/agents/file-coder/orchestrated/step-executor.ts`
- [ ] **Task**: Implement specialized step execution
- [ ] **Deliverables**:
  - [ ] `executeAnalysisStep(context)` function
  - [ ] `executeTextModificationsStep(context)` function
  - [ ] `executeStructuralChangesStep(context)` function
  - [ ] `executeCalculationStep(context)` function
  - [ ] `executeValidationStep(context)` function
  - [ ] Tool integration for each step type

### **Phase 2: Smart Orchestration**

#### **2.1 Create Operation Grouping Logic**
- [ ] **File**: `src/lib/ai/agents/file-coder/orchestrated/orchestrator.ts`
- [ ] **Task**: Implement intelligent operation batching
- [ ] **Deliverables**:
  - [ ] `groupOperations(surgicalPlan)` function
  - [ ] Text modification batching logic
  - [ ] Structural change batching logic
  - [ ] Operation type classification
  - [ ] Execution order optimization

#### **2.2 Create Execution Plan Generator**
- [ ] **File**: `src/lib/ai/agents/file-coder/orchestrated/orchestrator.ts`
- [ ] **Task**: Generate optimized execution plans
- [ ] **Deliverables**:
  - [ ] `createExecutionPlan(surgicalPlan, researchData)` function
  - [ ] Step dependency analysis
  - [ ] Resource requirement estimation
  - [ ] Progress tracking setup

#### **2.3 Create Orchestrated Agent**
- [ ] **File**: `src/lib/ai/agents/file-coder/orchestrated/orchestrated-agent.ts`
- [ ] **Task**: Main orchestration logic
- [ ] **Deliverables**:
  - [ ] `OrchestratedFileCoderAgent` class
  - [ ] `initialize(surgicalPlan, researchData)` method
  - [ ] `executeStep(stepId)` method
  - [ ] `getStatus()` method
  - [ ] `getResult()` method
  - [ ] Error handling and recovery

### **Phase 3: API Infrastructure**

#### **3.1 Create Agent Start API**
- [ ] **File**: `src/app/api/agent/start/route.ts`
- [ ] **Task**: Initialize orchestrated agent
- [ ] **Deliverables**:
  - [ ] POST endpoint for starting agent
  - [ ] Session ID generation
  - [ ] Initial state creation
  - [ ] Execution plan generation
  - [ ] Immediate response with session ID

#### **3.2 Create Agent Status API**
- [ ] **File**: `src/app/api/agent/status/[sessionId]/route.ts`
- [ ] **Task**: Provide real-time status updates
- [ ] **Deliverables**:
  - [ ] GET endpoint for status checking
  - [ ] Current step information
  - [ ] Progress percentage
  - [ ] Error status and messages
  - [ ] Estimated completion time

#### **3.3 Create Agent Step API**
- [ ] **File**: `src/app/api/agent/step/route.ts`
- [ ] **Task**: Execute next step in sequence
- [ ] **Deliverables**:
  - [ ] POST endpoint for step execution
  - [ ] Step validation and execution
  - [ ] State updates
  - [ ] Result return
  - [ ] Error handling

#### **3.4 Create Agent Result API**
- [ ] **File**: `src/app/api/agent/result/[sessionId]/route.ts`
- [ ] **Task**: Retrieve final results
- [ ] **Deliverables**:
  - [ ] GET endpoint for final results
  - [ ] Component code retrieval
  - [ ] Validation results
  - [ ] Execution summary
  - [ ] Cleanup operations

### **Phase 4: Testing and Integration**

#### **4.1 Create Test API**
- [ ] **File**: `src/app/api/tests/orchestrated-agent/route.ts`
- [ ] **Task**: Test the new orchestrated system
- [ ] **Deliverables**:
  - [ ] Test endpoint with sample data
  - [ ] Step-by-step execution testing
  - [ ] Progress tracking verification
  - [ ] Error handling validation
  - [ ] Performance comparison

#### **4.2 Create Test Frontend**
- [ ] **File**: `src/app/tests/orchestrated-agent/page.tsx`
- [ ] **Task**: Frontend for testing orchestrated agent
- [ ] **Deliverables**:
  - [ ] Start agent button
  - [ ] Real-time progress display
  - [ ] Step-by-step execution controls
  - [ ] Result display
  - [ ] Error handling UI

#### **4.3 Integration Testing**
- [ ] **Task**: Test integration with existing pipeline
- [ ] **Deliverables**:
  - [ ] Surgical pipeline integration
  - [ ] Tool compatibility verification
  - [ ] State persistence testing
  - [ ] Error recovery validation
  - [ ] Performance benchmarking

### **Phase 5: Migration and Cleanup**

#### **5.1 Update Surgical Pipeline**
- [ ] **File**: `src/app/api/ai/surgical-pipeline/start/route.ts`
- [ ] **Task**: Integrate orchestrated agent
- [ ] **Deliverables**:
  - [ ] Replace monolithic agent call
  - [ ] Add orchestrated agent initialization
  - [ ] Update response format
  - [ ] Maintain backward compatibility

#### **5.2 Deprecate Old Files**
- [ ] **Task**: Mark old files as deprecated
- [ ] **Deliverables**:
  - [ ] Add deprecation comments to old files
  - [ ] Update imports to use new system
  - [ ] Remove unused dependencies
  - [ ] Update documentation

#### **5.3 Performance Optimization**
- [ ] **Task**: Optimize for production use
- [ ] **Deliverables**:
  - [ ] Token usage optimization
  - [ ] Response time improvements
  - [ ] Memory usage optimization
  - [ ] Error rate reduction

---

## 📊 **Success Metrics**

### **Performance Targets**
- [ ] **LLM Calls**: Reduce from 13 to 5 (62% reduction)
- [ ] **Execution Time**: Each step < 30 seconds
- [ ] **Success Rate**: > 95% completion rate
- [ ] **Error Recovery**: 100% resumable from any point

### **User Experience Targets**
- [ ] **Progress Visibility**: Real-time updates
- [ ] **Timeout Elimination**: No more 2-minute waits
- [ ] **Error Clarity**: Clear error messages and recovery options
- [ ] **Responsiveness**: Immediate feedback on actions

### **Technical Targets**
- [ ] **State Persistence**: Reliable across API calls
- [ ] **Tool Integration**: All existing tools work seamlessly
- [ ] **Code Quality**: Maintain surgical architect philosophy
- [ ] **Maintainability**: Clear separation of concerns

---

## 🚨 **Risk Mitigation**

### **Technical Risks**
- [ ] **State Corruption**: Implement robust state validation
- [ ] **Tool Failures**: Add comprehensive error handling
- [ ] **Prompt Degradation**: Maintain quality through specialized prompts
- [ ] **Performance Regression**: Benchmark against current system

### **Migration Risks**
- [ ] **Breaking Changes**: Maintain backward compatibility
- [ ] **Data Loss**: Implement state backup and recovery
- [ ] **User Confusion**: Provide clear migration path
- [ ] **Rollback Plan**: Keep old system as fallback

---

## 📝 **Documentation Requirements**

### **Technical Documentation**
- [ ] **Architecture Overview**: System design and flow
- [ ] **API Documentation**: All new endpoints and responses
- [ ] **State Management**: Data structures and persistence
- [ ] **Prompt Engineering**: Specialized prompt design

### **User Documentation**
- [ ] **Migration Guide**: How to switch to new system
- [ ] **Troubleshooting**: Common issues and solutions
- [ ] **Best Practices**: Optimal usage patterns
- [ ] **Performance Tips**: How to get best results

---

## 🎯 **Completion Criteria**

### **Phase 1 Complete When**
- [ ] All core infrastructure files created
- [ ] State management system working
- [ ] Specialized prompts implemented
- [ ] Step executor functional

### **Phase 2 Complete When**
- [ ] Operation grouping working
- [ ] Execution plans generated correctly
- [ ] Orchestrated agent functional
- [ ] Batching reduces LLM calls by 62%

### **Phase 3 Complete When**
- [ ] All API endpoints working
- [ ] Real-time status updates functional
- [ ] Step-by-step execution working
- [ ] Error handling robust

### **Phase 4 Complete When**
- [ ] All tests passing
- [ ] Integration verified
- [ ] Performance targets met
- [ ] User experience improved

### **Phase 5 Complete When**
- [ ] Surgical pipeline updated
- [ ] Old system deprecated
- [ ] Performance optimized
- [ ] Documentation complete

---

## 🔄 **Agent Assignment Strategy**

### **Agent 1: Infrastructure Specialist**
- **Focus**: Phases 1.1-1.5 (Core Infrastructure)
- **Skills**: TypeScript, file systems, state management
- **Deliverables**: Type definitions, state manager, core philosophy

### **Agent 2: Prompt Engineer**
- **Focus**: Phases 1.4, 2.1-2.2 (Prompts & Orchestration)
- **Skills**: LLM prompting, operation grouping
- **Deliverables**: Specialized prompts, operation grouping logic

### **Agent 3: API Developer**
- **Focus**: Phases 3.1-3.4 (API Infrastructure)
- **Skills**: Next.js API routes, HTTP handling
- **Deliverables**: All API endpoints, error handling

### **Agent 4: Integration Specialist**
- **Focus**: Phases 4.1-4.3, 5.1-5.3 (Testing & Migration)
- **Skills**: Testing, integration, performance optimization
- **Deliverables**: Tests, migration, optimization

### **Agent 5: Documentation Specialist**
- **Focus**: Documentation requirements
- **Skills**: Technical writing, user guides
- **Deliverables**: All documentation, migration guides

---

## 📅 **Timeline Estimate**

- **Phase 1**: 2-3 days (Core infrastructure)
- **Phase 2**: 2-3 days (Smart orchestration)
- **Phase 3**: 2-3 days (API infrastructure)
- **Phase 4**: 2-3 days (Testing and integration)
- **Phase 5**: 1-2 days (Migration and cleanup)

**Total Estimated Time**: 9-14 days

---

## 🎉 **Success Definition**

The refactor is successful when:
1. **No more timeouts** - Each step completes in < 30 seconds
2. **62% fewer LLM calls** - From 13 to 5 calls per operation
3. **Real-time progress** - Users see live updates
4. **Error recovery** - Can resume from any point
5. **Maintained quality** - Same or better code generation
6. **Backward compatibility** - Existing pipeline still works

---

*This document serves as the master plan for the agent orchestration refactor. Each agent should reference this document and update their assigned sections as they complete work.* 