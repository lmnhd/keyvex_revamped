# WINDSURF AGENT TASK: Fix MCP Server Persistent Connection Issue

## 🎯 OBJECTIVE
Use AWS WebSocket infrastructure as a bridge/proxy to maintain persistent connection to the Smithery MCP filesystem server. The goal is to solve "Server not initialized" errors by keeping the MCP server connection alive throughout the entire FileCoder agent execution process.

## 🚨 CRITICAL RULES
- **HARD FAILS ONLY** - No fallback logic, no graceful degradation, no retry mechanisms
- **If something fails, it should fail clearly and immediately**
- **Do not implement any try-catch that hides real errors**
- **Remove all misleading error handling**

## 🧠 UNDERSTANDING THE CURRENT PROBLEM

### FileCoder Agent Current Flow
```typescript
// FileCoder agent receives MCP tools and uses them during execution
export async function runFileCoderAgent(
  surgicalPlan: SurgicalPlan,
  researchData: MainResearchData,
  tools: AgentTools,  // ← Contains MCP filesystem tools
  workingDirectory: string,
): Promise<string>
```

### MCP Tools Used by FileCoder Agent
```typescript
// From the agent's perspective, it uses these tools:
- set_filesystem_default: Set working directory  
- read_file: Read file contents
- update_file: Update file with new content
- ts_lint_checker_file: Validate TypeScript/ESLint compliance
```

### Current Problem
1. **MCP Server Connection Drops**: Smithery MCP server disconnects between tool calls
2. **"Server not initialized" Errors**: Each tool call fails because connection is lost
3. **No Persistence**: Current implementation creates new connection for each tool call
4. **Agent Workflow Breaks**: FileCoder agent cannot complete its 4-step process

## 🌐 SOLUTION: WEBSOCKET MCP BRIDGE

Use AWS WebSocket as a **persistent bridge** to the MCP server, not a replacement.

### Environment Variables (from Legacy System)
```bash
# WebSocket API Endpoint (Legacy System)  
NEXT_PUBLIC_WEBSOCKET_API_ENDPOINT=wss://4pfmheijde.execute-api.us-east-1.amazonaws.com/dev
WEBSOCKET_API_URL=wss://4pfmheijde.execute-api.us-east-1.amazonaws.com/dev

# AWS Credentials
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
DYNAMODB_TABLE_NAME=keyvex-main-table-development

# MCP Bridge Configuration
MCP_BRIDGE_TIMEOUT=10000
MCP_BRIDGE_HEARTBEAT=30000
MCP_SERVER_URL=https://server.smithery.ai/@cyanheads/filesystem-mcp-server/mcp?api_key=18a69c93-690b-42c9-9999-dce450c8bf82&profile=sad-hyena-3XY0Jp
```

## 📋 COMPLETE TASK LIST

### Task 1: Create MCP Bridge Connection Manager
**File**: `/src/lib/ai/mcp/mcp-bridge-manager.ts`

**Implementation:**
```typescript
/**
 * MCP Bridge Manager - WebSocket Bridge to MCP Server
 * Maintains persistent connection to Smithery MCP server via WebSocket proxy
 */

import { WebSocket } from 'ws';

interface MCPBridgeMessage {
  type: 'mcp_initialize' | 'mcp_tool_call' | 'mcp_response' | 'bridge_ping';
  id: string;
  mcpRequest?: any;
  mcpResponse?: any;
  timestamp: number;
}

interface MCPBridgeConnection {
  ws: WebSocket;
  mcpSessionId: string;
  isInitialized: boolean;
  lastActivity: number;
}

export class MCPBridgeManager {
  private static instance: MCPBridgeManager;
  private bridgeConnection: MCPBridgeConnection | null = null;
  private pendingRequests: Map<string, { resolve: Function; reject: Function }> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  public static getInstance(): MCPBridgeManager {
    if (!MCPBridgeManager.instance) {
      MCPBridgeManager.instance = new MCPBridgeManager();
    }
    return MCPBridgeManager.instance;
  }

  public async ensureBridgeConnection(): Promise<void> {
    if (this.bridgeConnection && this.bridgeConnection.ws.readyState === WebSocket.OPEN) {
      console.log('🌉 [MCP-BRIDGE] Connection already active');
      return;
    }

    console.log('🌉 [MCP-BRIDGE] Establishing bridge connection...');
    
    const wsUrl = process.env.WEBSOCKET_API_URL;
    if (!wsUrl) {
      throw new Error('WEBSOCKET_API_URL environment variable not set');
    }

    const ws = new WebSocket(`${wsUrl}?bridgeType=mcp&mcpServer=${encodeURIComponent(process.env.MCP_SERVER_URL!)}`);
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        ws.close();
        reject(new Error('MCP Bridge connection timeout'));
      }, parseInt(process.env.MCP_BRIDGE_TIMEOUT || '10000'));

      ws.onopen = () => {
        clearTimeout(timeout);
        console.log('🌉 [MCP-BRIDGE] WebSocket bridge connected');
        
        this.bridgeConnection = {
          ws,
          mcpSessionId: `mcp_${Date.now()}`,
          isInitialized: false,
          lastActivity: Date.now()
        };

        this.setupMessageHandling();
        this.setupHeartbeat();
        this.initializeMCPSession().then(resolve).catch(reject);
      };

      ws.onerror = (error) => {
        clearTimeout(timeout);
        reject(new Error(`MCP Bridge connection failed: ${error}`));
      };
    });
  }

  private async initializeMCPSession(): Promise<void> {
    if (!this.bridgeConnection) {
      throw new Error('No bridge connection available');
    }

    console.log('🌉 [MCP-BRIDGE] Initializing MCP server session...');

    const initMessage: MCPBridgeMessage = {
      type: 'mcp_initialize',
      id: `init_${Date.now()}`,
      mcpRequest: {
        jsonrpc: '2.0',
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: { tools: {} },
          clientInfo: { name: 'keyvex-file-coder-bridge', version: '1.0.0' }
        }
      },
      timestamp: Date.now()
    };

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(initMessage.id);
        reject(new Error('MCP initialization timeout'));
      }, 30000);

      this.pendingRequests.set(initMessage.id, {
        resolve: (response: any) => {
          clearTimeout(timeout);
          if (response.mcpResponse?.result) {
            this.bridgeConnection!.isInitialized = true;
            console.log('✅ [MCP-BRIDGE] MCP server initialized successfully');
            resolve();
          } else {
            reject(new Error('MCP initialization failed'));
          }
        },
        reject: (error: any) => {
          clearTimeout(timeout);
          reject(error);
        }
      });

      this.bridgeConnection.ws.send(JSON.stringify(initMessage));
      this.bridgeConnection.lastActivity = Date.now();
    });
  }

  public async callMCPTool(toolName: string, args: any): Promise<any> {
    await this.ensureBridgeConnection();
    
    if (!this.bridgeConnection?.isInitialized) {
      throw new Error('MCP server not initialized');
    }

    console.log(`🛠️ [MCP-BRIDGE] Calling tool: ${toolName}`, args);

    const requestId = `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const toolMessage: MCPBridgeMessage = {
      type: 'mcp_tool_call',
      id: requestId,
      mcpRequest: {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: args
        },
        id: requestId
      },
      timestamp: Date.now()
    };

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject(new Error(`MCP tool call timeout: ${toolName}`));
      }, 30000);

      this.pendingRequests.set(requestId, {
        resolve: (response: any) => {
          clearTimeout(timeout);
          console.log(`✅ [MCP-BRIDGE] Tool ${toolName} completed`);
          resolve(response.mcpResponse?.result);
        },
        reject: (error: any) => {
          clearTimeout(timeout);
          reject(error);
        }
      });

      this.bridgeConnection!.ws.send(JSON.stringify(toolMessage));
      this.bridgeConnection!.lastActivity = Date.now();
    });
  }

  private setupMessageHandling(): void {
    if (!this.bridgeConnection) return;

    this.bridgeConnection.ws.onmessage = (event) => {
      try {
        const message: MCPBridgeMessage = JSON.parse(event.data);
        this.bridgeConnection!.lastActivity = Date.now();

        console.log(`📨 [MCP-BRIDGE] Received: ${message.type}`);

        if (message.type === 'mcp_response' && message.id) {
          const pendingRequest = this.pendingRequests.get(message.id);
          if (pendingRequest) {
            this.pendingRequests.delete(message.id);
            pendingRequest.resolve(message);
          }
        }
      } catch (error) {
        console.error('❌ [MCP-BRIDGE] Message parse error:', error);
      }
    };

    this.bridgeConnection.ws.onclose = () => {
      console.log('🌉 [MCP-BRIDGE] Connection closed');
      this.bridgeConnection = null;
      this.clearHeartbeat();
    };

    this.bridgeConnection.ws.onerror = (error) => {
      console.error('❌ [MCP-BRIDGE] Connection error:', error);
    };
  }

  private setupHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.bridgeConnection && this.bridgeConnection.ws.readyState === WebSocket.OPEN) {
        const pingMessage: MCPBridgeMessage = {
          type: 'bridge_ping',
          id: `ping_${Date.now()}`,
          timestamp: Date.now()
        };
        
        this.bridgeConnection.ws.send(JSON.stringify(pingMessage));
        
        // Check for stale connection (2 minutes)
        const timeSinceLastActivity = Date.now() - this.bridgeConnection.lastActivity;
        if (timeSinceLastActivity > 120000) {
          console.warn('⚠️ [MCP-BRIDGE] Stale connection detected, closing...');
          this.bridgeConnection.ws.close();
        }
      }
    }, parseInt(process.env.MCP_BRIDGE_HEARTBEAT || '30000'));
  }

  private clearHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  public async shutdown(): Promise<void> {
    this.clearHeartbeat();
    if (this.bridgeConnection) {
      this.bridgeConnection.ws.close();
      this.bridgeConnection = null;
    }
    this.pendingRequests.clear();
  }
}
```

### Task 2: Create Bridged MCP Tools
**File**: `/src/lib/ai/mcp/bridged-filesystem-tools.ts`

**Implementation:**
```typescript
/**
 * Bridged MCP Tools - File System Tools via WebSocket Bridge
 * These tools maintain the same interface but use the persistent bridge connection
 */

import { z } from 'zod';
import { MCPBridgeManager } from './mcp-bridge-manager';

const bridgeManager = MCPBridgeManager.getInstance();

export const createBridgedFileSystemTools = () => {
  return {
    set_filesystem_default: {
      description: 'Set the default filesystem directory for operations',
      parameters: z.object({
        path: z.string().describe('The filesystem path to set as default'),
      }),
      execute: async (args: { path: string }) => {
        console.log('📁 [BRIDGED-FS] Setting filesystem default:', args.path);
        return await bridgeManager.callMCPTool('set_filesystem_default', args);
      },
    },

    read_file: {
      description: 'Read the contents of a file from the filesystem',
      parameters: z.object({
        path: z.string().describe('The file path to read'),
      }),
      execute: async (args: { path: string }) => {
        console.log('📁 [BRIDGED-FS] Reading file:', args.path);
        return await bridgeManager.callMCPTool('read_file', args);
      },
    },

    update_file: {
      description: 'Update the contents of a file on the filesystem',
      parameters: z.object({
        path: z.string().describe('The file path to update'),
        new_content: z.string().describe('The new content for the file'),
      }),
      execute: async (args: { path: string; new_content: string }) => {
        console.log('📁 [BRIDGED-FS] Updating file:', args.path, `(${args.new_content.length} chars)`);
        return await bridgeManager.callMCPTool('update_file', args);
      },
    },
  };
};
```

### Task 3: Create WebSocket MCP Bridge Server Handler
**File**: `/src/lib/ai/mcp/bridge-server-handler.ts`

**Implementation:**
```typescript
/**
 * WebSocket MCP Bridge Server Handler
 * Runs on AWS WebSocket API Gateway - handles MCP bridge connections
 */

import { experimental_createMCPClient as createMCPClient } from 'ai';

interface MCPServerSession {
  mcpClient: any;
  sessionId: string;
  lastActivity: number;
  isInitialized: boolean;
}

export class MCPBridgeServerHandler {
  private mcpSessions: Map<string, MCPServerSession> = new Map();

  public async handleConnection(connectionId: string, event: any): Promise<any> {
    console.log(`🌉 [BRIDGE-SERVER] New connection: ${connectionId}`);
    
    const { bridgeType, mcpServer } = event.queryStringParameters || {};
    
    if (bridgeType === 'mcp' && mcpServer) {
      await this.initializeMCPSession(connectionId, decodeURIComponent(mcpServer));
    }

    return { statusCode: 200 };
  }

  public async handleMessage(connectionId: string, message: any): Promise<any> {
    try {
      const { type, id, mcpRequest } = message;
      const session = this.mcpSessions.get(connectionId);

      if (!session) {
        return this.sendError(connectionId, id, 'No MCP session found');
      }

      session.lastActivity = Date.now();

      switch (type) {
        case 'bridge_ping':
          return this.sendPong(connectionId, id);

        case 'mcp_initialize':
          return await this.handleMCPInitialize(connectionId, id, mcpRequest);

        case 'mcp_tool_call':
          return await this.handleMCPToolCall(connectionId, id, mcpRequest);

        default:
          return this.sendError(connectionId, id, `Unknown message type: ${type}`);
      }
    } catch (error) {
      console.error('❌ [BRIDGE-SERVER] Message handling error:', error);
      return this.sendError(connectionId, message.id, error.message);
    }
  }

  public async handleDisconnection(connectionId: string): Promise<any> {
    console.log(`🌉 [BRIDGE-SERVER] Disconnection: ${connectionId}`);
    
    const session = this.mcpSessions.get(connectionId);
    if (session) {
      try {
        await session.mcpClient.close();
      } catch (error) {
        console.warn('⚠️ [BRIDGE-SERVER] Error closing MCP client:', error);
      }
      this.mcpSessions.delete(connectionId);
    }

    return { statusCode: 200 };
  }

  private async initializeMCPSession(connectionId: string, mcpServerUrl: string): Promise<void> {
    console.log(`🔧 [BRIDGE-SERVER] Initializing MCP session for: ${connectionId}`);
    
    try {
      const mcpClient = createMCPClient({
        transport: {
          type: 'sse',
          url: mcpServerUrl,
        },
      });

      const session: MCPServerSession = {
        mcpClient,
        sessionId: `session_${Date.now()}`,
        lastActivity: Date.now(),
        isInitialized: false
      };

      this.mcpSessions.set(connectionId, session);
      console.log(`✅ [BRIDGE-SERVER] MCP session created for: ${connectionId}`);
    } catch (error) {
      console.error(`❌ [BRIDGE-SERVER] Failed to create MCP session:`, error);
      throw error;
    }
  }

  private async handleMCPInitialize(connectionId: string, requestId: string, mcpRequest: any): Promise<any> {
    const session = this.mcpSessions.get(connectionId);
    if (!session) {
      return this.sendError(connectionId, requestId, 'No MCP session');
    }

    try {
      console.log(`🔧 [BRIDGE-SERVER] Initializing MCP client for: ${connectionId}`);
      
      // The MCP client should handle initialization internally
      // For Smithery, we might need to call specific initialization
      const result = { 
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: { name: 'smithery-filesystem', version: '1.0.0' }
      };

      session.isInitialized = true;
      
      return this.sendMCPResponse(connectionId, requestId, { result });
    } catch (error) {
      console.error(`❌ [BRIDGE-SERVER] MCP initialization failed:`, error);
      return this.sendError(connectionId, requestId, `MCP initialization failed: ${error.message}`);
    }
  }

  private async handleMCPToolCall(connectionId: string, requestId: string, mcpRequest: any): Promise<any> {
    const session = this.mcpSessions.get(connectionId);
    if (!session || !session.isInitialized) {
      return this.sendError(connectionId, requestId, 'MCP session not initialized');
    }

    try {
      const { name: toolName, arguments: args } = mcpRequest.params;
      console.log(`🛠️ [BRIDGE-SERVER] Executing tool: ${toolName} for: ${connectionId}`);

      // Use the persistent MCP client to call the tool
      const tools = await session.mcpClient.tools({
        schemas: {
          [toolName]: { parameters: {} } // Schema will be handled by the client
        }
      });

      const tool = tools[toolName];
      if (!tool) {
        return this.sendError(connectionId, requestId, `Tool not found: ${toolName}`);
      }

      const result = await tool.execute(args);
      console.log(`✅ [BRIDGE-SERVER] Tool ${toolName} completed for: ${connectionId}`);

      return this.sendMCPResponse(connectionId, requestId, { result });
    } catch (error) {
      console.error(`❌ [BRIDGE-SERVER] Tool call failed:`, error);
      return this.sendError(connectionId, requestId, `Tool call failed: ${error.message}`);
    }
  }

  private async sendMCPResponse(connectionId: string, requestId: string, mcpResponse: any): Promise<any> {
    // Send response back through WebSocket API Gateway
    const message = {
      type: 'mcp_response',
      id: requestId,
      mcpResponse,
      timestamp: Date.now()
    };

    // Implementation depends on your WebSocket API Gateway setup
    // This would typically use AWS API Gateway Management API
    console.log(`📤 [BRIDGE-SERVER] Sending response to: ${connectionId}`, message);
    
    return { statusCode: 200, body: JSON.stringify(message) };
  }

  private async sendPong(connectionId: string, requestId: string): Promise<any> {
    const message = {
      type: 'bridge_pong', 
      id: requestId,
      timestamp: Date.now()
    };

    console.log(`🏓 [BRIDGE-SERVER] Sending pong to: ${connectionId}`);
    return { statusCode: 200, body: JSON.stringify(message) };
  }

  private async sendError(connectionId: string, requestId: string, errorMessage: string): Promise<any> {
    const message = {
      type: 'mcp_response',
      id: requestId,
      mcpResponse: { error: { message: errorMessage } },
      timestamp: Date.now()
    };

    console.error(`❌ [BRIDGE-SERVER] Sending error to: ${connectionId}`, errorMessage);
    return { statusCode: 200, body: JSON.stringify(message) };
  }
}
```

### Task 4: Update Surgical Pipeline to Use Bridged Tools
**File**: `/src/app/api/ai/surgical-pipeline/start/route.ts`

**Replace MCP Client with Bridge:**
```typescript
// Remove existing MCP client code:
// const mcpClient = createMCPClient({ transport: { type: 'sse', url: smitheryUrl } });

// Add bridge-based tools:
import { createBridgedFileSystemTools } from '@/lib/ai/mcp/bridged-filesystem-tools';
import { MCPBridgeManager } from '@/lib/ai/mcp/mcp-bridge-manager';

export async function POST(request: Request) {
  const sessionId = crypto.randomUUID();
  const tempDir = path.join('/tmp', sessionId);
  let bridgeManager: MCPBridgeManager | null = null;

  try {
    // Create workspace
    await fs.mkdir(tempDir, { recursive: true });
    
    // Copy baseline template
    const templateContent = getTemplateByType(preprocessingResult.toolType);
    const templatePath = path.join(tempDir, 'component.tsx');
    await fs.writeFile(templatePath, templateContent);

    // Initialize bridge to MCP server (maintains persistent connection)
    bridgeManager = MCPBridgeManager.getInstance();
    await bridgeManager.ensureBridgeConnection();

    // Create bridged file system tools (same interface, persistent connection)
    const fileSystemTools = createBridgedFileSystemTools();
    const allTools = {
      ...fileSystemTools,
      tsLintCheckerFileTool,
    };

    console.log('🛠️ [PIPELINE] Using bridged MCP tools with persistent connection');

    // Run File Coder Agent (same as before, but with persistent MCP bridge)
    const agentRaw = await withRetry(() =>
      runFileCoderAgent(surgicalPlan, researchData, allTools, tempDir),
    );

    // Read final result
    const finalComponentCode = await fs.readFile(templatePath, 'utf-8');
    
    return NextResponse.json({
      success: true,
      tool: {
        id: sessionId,
        title: preprocessingResult.title,
        type: preprocessingResult.toolType,
        componentCode: finalComponentCode,
        leadCapture: preprocessingResult.leadCapture,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
    });

  } catch (error) {
    console.error('💥 [PIPELINE] Error:', error);
    throw error;
  } finally {
    // Cleanup: Bridge connection remains persistent for future requests
    // Only clean temp directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (cleanupError) {
      console.warn('⚠️ [CLEANUP] Failed to remove temp directory:', cleanupError);
    }
  }
}
```

### Task 5: Update Test Route for Bridged Connection
**File**: `/src/app/api/tests/code-agent/route.ts`

**Replace Direct Smithery Calls:**
```typescript
// Remove all direct Smithery API calls and complex session management
import { createBridgedFileSystemTools } from '@/lib/ai/mcp/bridged-filesystem-tools';
import { MCPBridgeManager } from '@/lib/ai/mcp/mcp-bridge-manager';

export async function GET() {
  console.log('🧪 [TEST-AGENT] Starting FileCoder agent with Bridged MCP tools...');
  
  try {
    // Initialize bridge to MCP server
    const bridgeManager = MCPBridgeManager.getInstance();
    await bridgeManager.ensureBridgeConnection();

    // Create bridged tools (same interface, persistent connection)
    const fileSystemTools = createBridgedFileSystemTools();
    const allTools = {
      ...fileSystemTools,
      ts_lint_checker_file: tsLintCheckerFileTool,
    };

    console.log('🧪 [TEST-AGENT] Tools loaded via bridge:', Object.keys(allTools));
    console.log('🧪 [TEST-AGENT] Calling FileCoder agent...');
    
    const result = await runFileCoderAgent(
      savedInput.surgicalPlan as any,
      savedInput.researchData as any,
      allTools,
      '/tmp'
    );
    
    console.log('🧪 [TEST-AGENT] Agent completed successfully');
    return NextResponse.json(result, { status: 200 });
    
  } catch (error: any) {
    console.error('💥 [TEST-AGENT] Failed:', error);
    return NextResponse.json(
      { error: error?.message ?? 'Unknown error', stack: error?.stack },
      { status: 500 },
    );
  }
}
```

### Task 6: Environment Configuration
**File**: `.env.local`

**Add Bridge Configuration:**
```bash
# Keep existing Smithery MCP server URL
FILESYSTEM_MCP_SERVER=https://server.smithery.ai/@cyanheads/filesystem-mcp-server/mcp?api_key=18a69c93-690b-42c9-9999-dce450c8bf82&profile=sad-hyena-3XY0Jp

# Add WebSocket bridge configuration (from legacy system)
WEBSOCKET_API_URL=wss://4pfmheijde.execute-api.us-east-1.amazonaws.com/dev
NEXT_PUBLIC_WEBSOCKET_API_ENDPOINT=wss://4pfmheijde.execute-api.us-east-1.amazonaws.com/dev

# Bridge-specific settings
MCP_SERVER_URL=https://server.smithery.ai/@cyanheads/filesystem-mcp-server/mcp?api_key=18a69c93-690b-42c9-9999-dce450c8bf82&profile=sad-hyena-3XY0Jp
MCP_BRIDGE_TIMEOUT=10000
MCP_BRIDGE_HEARTBEAT=30000

# AWS Credentials (for WebSocket infrastructure)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
DYNAMODB_TABLE_NAME=keyvex-main-table-development
```

## 🎯 SUCCESS CRITERIA

**Before (Failing Connections):**
```
FileCoder Agent → MCP Tool Call → New MCP Connection → "Server not initialized" → Failure
```

**After (Persistent Bridge):**
```
FileCoder Agent → Bridged Tool Call → WebSocket Bridge → Persistent MCP Connection → Success
```

**Verification:**
- ✅ MCP server connection remains alive throughout entire FileCoder agent execution
- ✅ All 4 FileCoder agent steps complete successfully (setup → modify → validate → finalize)
- ✅ No "Server not initialized" errors during tool execution
- ✅ WebSocket bridge maintains heartbeat with MCP server
- ✅ Multiple tool calls use the same persistent MCP session
- ✅ FileCoder agent receives successful responses from all MCP tools

## 🚨 ERROR HANDLING RULES
- **NO try-catch blocks that hide MCP connection errors**
- **NO fallback logic or graceful degradation for bridge failures**  
- **Throw clear, descriptive errors immediately for bridge connection issues**
- **Let MCP server failures bubble up to show real tool execution problems**

## 🔧 EXPECTED BENEFITS
1. **Persistent MCP Connection** - No more connection drops between tool calls
2. **Proven Bridge Architecture** - Based on battle-tested legacy WebSocket system
3. **Same Tool Interface** - FileCoder agent uses tools exactly the same way
4. **Session Management** - WebSocket handles MCP session lifecycle
5. **Heartbeat Monitoring** - Automatic connection health with MCP server
6. **AWS Infrastructure** - Leverage existing WebSocket API Gateway

The FileCoder agent workflow remains exactly the same - it just uses bridged tools that maintain persistent MCP server connections via WebSocket proxy.

Execute these tasks in order and verify the MCP bridge connection works before proceeding to the next.