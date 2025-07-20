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

/**
 * Lead capture configuration for specialized CTA component
 */
export interface LeadCaptureConfig {
  emailRequired: boolean;
  additionalFields?: {
    name?: boolean;
    phone?: boolean;
    company?: boolean;
    jobTitle?: boolean;
    customFields?: Array<{
      name: string;
      type: 'text' | 'email' | 'phone' | 'select';
      required: boolean;
      options?: string[]; // For select type
    }>;
  };
  doubleOptIn: {
    enabled: boolean;
    confirmationMessage?: string;
    redirectUrl?: string;
    emailTemplate?: string;
  };
  incentive: {
    title: string;
    description: string;
    deliveryMethod: 'email' | 'download' | 'redirect';
    deliveryTarget: string; // Email template ID, download URL, or redirect URL
  };
  trigger: 'before_results' | 'after_results' | 'manual';
  styling?: {
    variant: 'primary' | 'secondary' | 'success';
    size: 'sm' | 'md' | 'lg';
    customClasses?: string;
  };
}

/**
 * AI Agent Processing Types
 */
export interface PreprocessingResult {
  selectedTemplate: ToolType;
  templateFitScore: number;
  targetAudience: string;
  modificationSignals: string[];
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

export interface SurgicalModification {
  operation: 'modify' | 'add' | 'remove' | 'replace';
  type: 'text' | 'calculation' | 'input' | 'function' | 'section' | 'styling';
  target: string;
  details: {
    from?: string;
    to?: string;
    newElement?: any;
    insertPosition?: 'before' | 'after' | 'inside';
    removeTarget?: string;
    replaceWith?: any;
  };
  reasoning: string;
}

export interface SurgicalPlan {
  sourceTemplate: string;
  modifications: SurgicalModification[];
  dataRequirements: {
    researchQueries: string[];
    expectedDataTypes: string[];
  };
  templateEnhancements?: string[];
}

export interface ResearchData {
  modificationData: Record<string, any>;
  populatedModifications: SurgicalModification[];
  clientInstructions: {
    summary: string;
    dataNeeded: string[];
    format: string;
  };
}

export interface CodeGenerationResult {
  success: boolean;
  customizedTool?: Tool;
  generatedCode: string;
  modificationsApplied: number;
  validationErrors?: string[];
  enhancementsAdded?: string[];
}

// ============================================================================
// AGENT INPUT INTERFACES
// ============================================================================

/**
 * Input interfaces for AI agents - consolidated in main types file
 */
export interface SurgicalPlanningInput {
  preprocessingResult: PreprocessingResult;
}

export interface DataResearchInput {
  surgicalPlan: SurgicalPlan;
}

export interface CodeGenerationInput {
  surgicalPlan: SurgicalPlan;
  researchData: ResearchData;
}