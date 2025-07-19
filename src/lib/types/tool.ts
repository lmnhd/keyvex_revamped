/**
 * SIMPLE TOOL TYPES - Start Small, Build as Needed
 * Based on real user requests
 */

// ============================================================================
// BASIC TOOL STRUCTURE
// ============================================================================

/**
 * Simple tool types based on actual user requests
 */
export type ToolType = 'calculator' | 'quiz' | 'planner' | 'form' | 'diagnostic';

/**
 * Basic tool definition
 */
export interface Tool {
  id: string;
  title: string;
  type: ToolType;
  componentCode: string;
  
  // Dual objectives - keep it simple
  leadCapture: {
    emailRequired: boolean;
    trigger: 'before_results' | 'after_results';
    incentive: string; // "Get your detailed report"
  };
  
  // Timestamps
  createdAt: number;
  updatedAt: number;
}

/**
 * User request for creating a tool
 */
export interface ToolRequest {
  // What the user actually types
  userPrompt: string;
  
  // Optional context
  businessType?: string;
  industry?: string;
}

/**
 * Styling metadata for components
 */
export interface StylingMetadata {
  theme: 'light' | 'dark' | 'auto';
  industry?: string;
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: {
      primary: string;
      secondary: string;
      muted: string;
    };
    border: string;
    success: string;
    warning: string;
    error: string;
  };
  contrastValidated: boolean;
}

/**
 * Template tool examples that demonstrate baseline functionality
 */
export interface TemplateExample {
  id: string;
  type: ToolType;
  title: string;
  description: string;
  industry: string;
  componentCode: string;
  styling: StylingMetadata;
  mockData: Record<string, any>;
  leadCapture: {
    emailRequired: boolean;
    trigger: 'before_results' | 'after_results';
    incentive: string;
  };
}