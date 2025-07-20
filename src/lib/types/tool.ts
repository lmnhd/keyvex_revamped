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
  mockData: TemplateData;
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
    newElement?: ComponentElement;
    insertPosition?: 'before' | 'after' | 'inside';
    removeTarget?: string;
    replaceWith?: ComponentElement;
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
  modificationData: ModificationData;
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

// ============================================================================
// REQUIRED TYPE DEFINITIONS TO ELIMINATE 'any' TYPES
// ============================================================================

/**
 * Template Data Structures
 */
export interface TemplateData {
  options: Record<string, string[]>;
  defaults: Record<string, string | number>;
  calculations: Record<string, number>;
  metadata: Record<string, string>;
}

/**
 * Component Element Types
 */
export interface ComponentElement {
  type: string;
  props: Record<string, unknown>;
  children?: ComponentElement[];
}

/**
 * Modification Data Types
 */
export interface ModificationData {
  styleChanges: Record<string, string>;
  contentChanges: Record<string, string>;
  structureChanges: ComponentElement[];
  dataUpdates: TemplateData;
}

/**
 * Diagnostic Tool Types
 */
export interface DiagnosticTest {
  id: string;
  name: string;
  status: 'pass' | 'fail' | 'warning';
  score: number;
  description: string;
  recommendations: string[];
}

export interface DiagnosticResults {
  overallScore: number;
  tests: DiagnosticTest[];
  categories: Record<string, DiagnosticTest[]>;
  recommendations: string[];
}

/**
 * Planner Tool Types
 */
export interface ChannelData {
  name: string;
  budget: number;
  posts: number;
  reach: number;
  engagement: number;
}

export interface TimelineItem {
  date: string;
  task: string;
  description: string;
  assignedTo?: string;
}

export interface PlannerResults {
  timeline: TimelineItem[];
  channelBreakdown: ChannelData[];
  totalBudget: number;
  estimatedReach: number;
}

/**
 * Form Tool Types
 */
export interface ProposalData {
  title: string;
  description: string;
  sections: ProposalSection[];
  pricing: PricingData;
  timeline: string;
}

export interface ProposalSection {
  title: string;
  content: string;
  deliverables: string[];
}

export interface PricingData {
  amount: number;
  currency: string;
  breakdown: Array<{
    item: string;
    cost: number;
  }>;
}

/**
 * External API Types
 */
export interface PerplexityResponse {
  answer: string;
  citations: Citation[];
  metadata: Record<string, unknown>;
}

export interface Citation {
  url: string;
  title: string;
  snippet: string;
}

export interface WebSearchResult {
  query: string;
  results: Array<{
    title: string;
    snippet: string;
    url: string;
  }>;
  summary: string;
  timestamp: number;
}

export interface WebSearchOptions {
  maxResults?: number;
  focus?: 'recent' | 'comprehensive';
}

/**
 * Babel Types
 */
export interface BabelTransformOptions {
  presets?: string[];
  plugins?: string[];
  filename?: string;
  sourceMaps?: boolean;
}

/**
 * Component Props Types
 */
export interface ComponentProps<T = unknown> {
  [key: string]: T;
}