# Refactoring Plan: File Coder Agent with MCP File System

This document outlines the step-by-step process to refactor the AI pipeline, replacing the current code generation agent with a new "File Coder" agent that directly interacts with the file system via an MCP server.

---

## Phase 1: Create New Agent-Facing Tools

**Goal:** Create a new, file-based linter tool that will coexist with the current in-memory linter, following the established file pattern.

**Note:** All new functions and tool wrappers created in this phase should include extensive `console.log` statements to detail their execution flow, inputs, and results (e.g., `[LINTER-FILE] Starting validation for path...`, `[LINTER-FILE] Validation complete, returning results.`).

### 1.1. Create Core Logic for NEW File-Based Linter
- [ ] Create a new file: `src/lib/ai/agentic-tools/core-logic/ts-lint-checker-file.ts`
- [ ] **Action:** In this new file, implement the logic for file-based linting. This will involve:
    - Importing `fs` from `fs/promises`, `ts` from `typescript`, `Linter` from `eslint`, etc.
    - Creating a new exported function `validateComponentFile(filePath: string)`.
    - This function will use `fs.readFile(filePath, 'utf-8')` to get the code content.
    - It will then pass this content to the TypeScript compiler and ESLint instances to get diagnostics and errors, similar to the existing in-memory linter.

### 1.2. Create Vercel AI SDK Tool Wrapper for NEW Linter
- [ ] Create a new file: `src/lib/ai/agentic-tools/vercel-tool/ts-lint-checker-file.ts`
- [ ] **Action:** In this new file, create a Vercel AI SDK `tool` named `tsLintCheckerFileTool`.
- [ ] **Action:** Define its `parameters` schema using Zod to accept `{ filePath: z.string() }`.
- [ ] **Action:** The `execute` function should import and call `validateComponentFile` from `src/lib/ai/agentic-tools/core-logic/ts-lint-checker-file.ts`.

---

## Phase 2: Implement the `FileCoder` Agent

**Goal:** Create the new, autonomous agent that will perform the file modifications.

### 2.1. Create Agent Directory
- [ ] Create a new directory: `src/lib/ai/agents/file-coder/`

### 2.2. Design the Agent's System Prompt
- [ ] Create file: `src/lib/ai/agents/file-coder/prompt.ts`
- [ ] **Action:** Write a new system prompt that instructs the agent on its role as an autonomous developer.
- [ ] **Key Instructions to Include:**
    - Role: "You are an autonomous React developer agent."
    - Goal: "Your goal is to modify a source file in a temporary directory to match a surgical plan."
    - Available Tools: "You have access to file system tools (`set_filesystem_default`, `read_file`, `update_file`) and a validation tool (`ts_lint_checker_file`)."
    - Workflow: "Follow this iterative process: 1. Set your working directory using `set_filesystem_default`. 2. Read the file. 3. Apply one change using `update_file`. 4. Validate the entire file with `ts_lint_checker_file`. 5. If errors exist, fix them. 6. Repeat for all changes."
    - Completion Signal: "When all modifications are applied and the file is valid, respond with `{\"success\": true, \"message\": \"File updated successfully.\"}`."

### 2.3. Implement the Agent's Core Logic
- [ ] Create file: `src/lib/ai/agents/file-coder/core-logic.ts`
- [ ] **Action:** Define an exported async function `runFileCoderAgent(surgicalPlan, researchData, tools, workingDirectory)`.
- [ ] **Action:** The function's main responsibility is to build the prompt for the LLM (combining the system prompt with the `surgicalPlan` and `workingDirectory` path) and then call `generateText`.
- [ ] **Action:** The `tools` object (containing both MCP tools and our custom linter) will be passed into this function and then into the `generateText` call.

---

## Phase 3: Refactor the Surgical Pipeline Orchestrator

**Goal:** Update the main API route to manage the new agent's lifecycle, including workspace setup and tool provisioning.

### 3.1. Modify `start/route.ts`
- [ ] Open file: `src/app/api/ai/surgical-pipeline/start/route.ts`

### 3.2. Implement Workspace Management
- [ ] At the start of the `try` block, generate a unique session ID (e.g., using `crypto.randomUUID()`).
- [ ] Create a unique temporary directory within `/tmp` using the session ID: `const tempDir = path.join('/tmp', sessionId);`.
- [ ] Copy the correct baseline template file into the new `tempDir`.

### 3.3. Implement Tool Provisioning and MCP Connection
- [ ] Read the `FILESYSTEM_MCP_SERVER` environment variable.
- [ ] Initialize the MCP client using the `sse` transport and the URL.
- [ ] Define the schemas for the file system tools (`set_filesystem_default`, `read_file`, `update_file`).
- [ ] Instantiate our custom `tsLintCheckerFileTool`.
- [ ] Combine the file system tools from the MCP client and the custom linter tool into a single `allTools` object.

### 3.4. Update Agent Invocation
- [ ] Replace the call to `runCodeGenerationAgent` with a call to the new `runFileCoderAgent`.
- [ ] Pass the `surgicalPlan`, `researchData`, the `allTools` object, and the `tempDir` path to the new agent.

### 3.5. Finalize Response and Cleanup
- [ ] Upon a successful response from the agent, read the final, modified code from the temporary file (e.g., `path.join(tempDir, 'component.tsx')`).
- [ ] Add this final code to the API response object.
- [ ] Create a `finally` block for the main `try...catch` structure.
- [ ] Inside the `finally` block, ensure you call `mcpClient.close()` and then delete the entire temporary directory using `fs.promises.rm(tempDir, { recursive: true, force: true })`.

---

## Phase 4: Deprecate and Clean Up Old Assets

**Goal:** Archive obsolete files to prevent confusion and complete the refactor.

### 4.1. Archive Old Code Generation Agent
- [ ] Rename the directory `src/lib/ai/agents/code-generation/` to `src/lib/ai/agents/code-generation_DEPRECATED/`.

### 4.2. Archive Old In-Memory Linter
- [ ] Rename the directory `src/lib/ai/agentic-tools/core-logic/` to `src/lib/ai/agentic-tools/core-logic_DEPRECATED/`.
- [ ] Rename the directory `src/lib/ai/agentic-tools/vercel-tool/` to `src/lib/ai/agentic-tools/vercel-tool_DEPRECATED/`.

### 4.3. Review Dependencies
- [ ] Check for any lingering imports pointing to the deprecated directories and update them or remove them as necessary. 

---

## Phase 5: Update the Frontend Test Environment

**Goal:** Adapt the primary testing page to work with the new refactored pipeline and properly display the final generated tool.

### 5.1. Modify `/test` Page
- [ ] Open file: `src/app/tests/code-agent/page.tsx`

### 5.2. Update API Call Logic
- [ ] **Action:** Modify the `handleSubmit` (or equivalent) function that triggers the API call to `/api/ai/surgical-pipeline/start`.
- [ ] **Action:** The request body no longer needs to be constructed from a `<textarea>`. Instead, import a pre-saved JSON object representing a complete `CodeGenerationInput` (the mock input for the entire pipeline).
    - We will use the existing mock file at `src/app/api/tests/code-agent/code-gen-input.json`. This page will now trigger a full, end-to-end pipeline test with a single button click.
- [ ] **Action:** The body sent in the `fetch` call will now just be this static JSON object.

### 5.3. Update State Management and Display
- [ ] **Action:** Modify the component's state. Instead of storing the raw `generatedCode` string from the API response, it should now store the entire `tool` object.
    - `const [generatedTool, setGeneratedTool] = useState<Tool | null>(null);`
- [ ] **Action:** On a successful API response, set this new state: `setGeneratedTool(response.tool);`.
- [ ] **Action:** In the JSX, remove the `DynamicComponentRenderer` which was previously used to display the raw code.
- [ ] **Action:** Replace it with the `ToolRenderer` component.
- [ ] **Action:** Pass the `generatedTool` object from the state into the `ToolRenderer` component: `<ToolRenderer tool={generatedTool} />`. This will handle the rendering of the final, complete tool.

---

## Phase 6: Update the Primary User-Facing Test Page

**Goal:** Ensure the main test page at `/test` is also updated to use the new pipeline and correctly render the final tool.

### 6.1. Modify `/test` Page
- [ ] Open file: `src/app/test/page.tsx`

### 6.2. Update API Call Logic
- [ ] **Action:** Modify the `handleSubmit` (or equivalent) function that triggers the API call to `/api/ai/surgical-pipeline/start`.
- [ ] **Action:** Ensure the request body sent in the `fetch` call is constructed correctly from the page's input fields (e.g., the `textarea`).

### 6.3. Update State Management and Display
- [ ] **Action:** Modify the component's state to store the full `Tool` object returned from the API, not just the code.
    - `const [generatedTool, setGeneratedTool] = useState<Tool | null>(null);`
- [ ] **Action:** On a successful API response, update the state with the `tool` object from the response.
- [ ] **Action:** Replace the existing component display logic with the `ToolRenderer` component.
- [ ] **Action:** Pass the `generatedTool` object from state into the renderer: `<ToolRenderer tool={generatedTool} isLoading={isLoading} />`. 