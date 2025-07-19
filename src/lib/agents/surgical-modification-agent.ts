/**
 * Surgical Modification Agent
 * 
 * The core agent that transforms baseline templates into customized tools
 * through targeted, surgical modifications rather than complex orchestration.
 */

import { TemplateExample, Tool, ToolRequest } from '@/lib/types/tool';
import { convertToThemeAware } from '@/lib/utils/theme-conversion';

// ============================================================================
// SURGICAL MODIFICATION TYPES
// ============================================================================

export interface ModificationTarget {
  type: 'text' | 'calculation' | 'options' | 'styling' | 'structure';
  element: string; // CSS selector or element identifier
  currentValue: string;
  newValue: string;
  reasoning: string;
}

export interface SurgicalPlan {
  sourceTemplate: TemplateExample;
  userRequest: ToolRequest;
  modifications: ModificationTarget[];
  preservedElements: string[]; // Elements that should NOT be changed
  riskAssessment: {
    complexity: 'low' | 'medium' | 'high';
    confidence: number; // 0-100
    potentialIssues: string[];
  };
}

export interface ModificationResult {
  success: boolean;
  modifiedTool?: Tool;
  executedModifications: ModificationTarget[];
  failedModifications: ModificationTarget[];
  validationErrors: string[];
  previewReady: boolean;
}

// ============================================================================
// TEMPLATE ANALYSIS SYSTEM
// ============================================================================

/**
 * Analyzes a template to understand its modifiable components
 */
export class TemplateAnalyzer {
  /**
   * Extract modifiable elements from a template
   */
  static analyzeTemplate(template: TemplateExample): {
    modifiableElements: ModificationTarget[];
    preservedElements: string[];
    complexityScore: number;
  } {
    const componentCode = template.componentCode;
    const modifiableElements: ModificationTarget[] = [];
    const preservedElements: string[] = [];
    
    // Analyze text content
    const textMatches = componentCode.match(/(['"`])([^'"`]{10,})\\1/g);
    textMatches?.forEach(match => {
      const text = match.slice(1, -1); // Remove quotes
      if (this.isModifiableText(text)) {
        modifiableElements.push({
          type: 'text',
          element: `text-content-${modifiableElements.length}`,
          currentValue: text,
          newValue: '', // To be filled by surgeon
          reasoning: 'User-facing text that can be customized'
        });
      }
    });
    
    // Analyze calculation logic
    const calculationMatches = componentCode.match(/const\\s+\\w+\\s*=\\s*[^;]+;/g);
    calculationMatches?.forEach(calc => {
      if (this.isModifiableCalculation(calc)) {
        modifiableElements.push({
          type: 'calculation',
          element: `calculation-${modifiableElements.length}`,
          currentValue: calc,
          newValue: '',
          reasoning: 'Business logic that can be customized'
        });
      }
    });
    
    // Analyze dropdown options
    const optionMatches = componentCode.match(/<option[^>]*>([^<]+)<\\/option>/g);
    optionMatches?.forEach(option => {
      modifiableElements.push({
        type: 'options',
        element: `option-${modifiableElements.length}`,
        currentValue: option,
        newValue: '',
        reasoning: 'Dropdown option that can be customized'
      });
    });
    
    // Mark React structure as preserved
    preservedElements.push('useState', 'useEffect', 'return statement', 'JSX structure');
    
    return {
      modifiableElements,
      preservedElements,
      complexityScore: this.calculateComplexity(componentCode)
    };
  }
  
  private static isModifiableText(text: string): boolean {
    // Skip very short text, variable names, CSS classes
    if (text.length < 5) return false;
    if (/^[a-z-]+$/i.test(text)) return false; // CSS classes
    if (/^\$?{/.test(text)) return false; // Template literals
    return true;
  }
  
  private static isModifiableCalculation(calc: string): boolean {
    // Look for business logic calculations, not React state
    return !calc.includes('useState') && 
           !calc.includes('useEffect') &&
           (calc.includes('*') || calc.includes('/') || calc.includes('+') || calc.includes('-'));
  }
  
  private static calculateComplexity(code: string): number {
    let score = 0;
    
    // Count complexity indicators
    score += (code.match(/useState/g) || []).length * 5;
    score += (code.match(/useEffect/g) || []).length * 10;
    score += (code.match(/if\s*\\(/g) || []).length * 3;
    score += (code.match(/map\\(/g) || []).length * 4;
    score += (code.match(/\\?\\./g) || []).length * 2; // Optional chaining
    
    return Math.min(score, 100);
  }
}

// ============================================================================
// SURGICAL MODIFICATION ENGINE
// ============================================================================

/**
 * The core engine that performs targeted modifications
 */
export class SurgicalModificationEngine {
  /**
   * Creates a surgical plan for modifying a template
   */
  static async createSurgicalPlan(
    template: TemplateExample,
    userRequest: ToolRequest
  ): Promise<SurgicalPlan> {
    const analysis = TemplateAnalyzer.analyzeTemplate(template);
    
    // Generate modifications based on user request
    const modifications = await this.planModifications(
      template,
      userRequest,
      analysis.modifiableElements
    );
    
    // Assess risk
    const riskAssessment = this.assessRisk(modifications, analysis.complexityScore);
    
    return {
      sourceTemplate: template,
      userRequest,
      modifications,
      preservedElements: analysis.preservedElements,
      riskAssessment
    };
  }
  
  /**
   * Execute the surgical plan to create a modified tool
   */
  static async executeSurgicalPlan(plan: SurgicalPlan): Promise<ModificationResult> {
    const executedModifications: ModificationTarget[] = [];
    const failedModifications: ModificationTarget[] = [];
    const validationErrors: string[] = [];
    
    let modifiedCode = plan.sourceTemplate.componentCode;
    
    // Execute modifications in order of safety (text first, structure last)
    const sortedMods = [...plan.modifications].sort((a, b) => 
      this.getModificationPriority(a.type) - this.getModificationPriority(b.type)
    );
    
    for (const modification of sortedMods) {
      try {
        const result = await this.executeModification(modifiedCode, modification);
        
        if (result.success) {
          modifiedCode = result.modifiedCode;
          executedModifications.push(modification);
        } else {
          failedModifications.push(modification);
          validationErrors.push(result.error || 'Unknown modification error');
        }
      } catch (error) {
        failedModifications.push(modification);
        validationErrors.push(`Modification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    // Create the modified tool
    const modifiedTool: Tool = {
      id: `modified-${Date.now()}`,
      title: this.generateToolTitle(plan.userRequest),
      type: plan.sourceTemplate.type,
      componentCode: convertToThemeAware(modifiedCode), // Ensure theme safety
      leadCapture: plan.sourceTemplate.leadCapture,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    return {
      success: failedModifications.length === 0,
      modifiedTool,
      executedModifications,
      failedModifications,
      validationErrors,
      previewReady: validationErrors.length === 0
    };
  }
  
  private static async planModifications(
    template: TemplateExample,
    userRequest: ToolRequest,
    modifiableElements: ModificationTarget[]
  ): Promise<ModificationTarget[]> {
    // This would typically use AI to plan modifications
    // For now, we'll create a simple rule-based system
    
    const modifications: ModificationTarget[] = [];
    const prompt = userRequest.userPrompt.toLowerCase();
    
    // Example: If user mentions "mortgage", update text accordingly
    if (prompt.includes('mortgage') || prompt.includes('loan')) {
      modifications.push({
        type: 'text',
        element: 'title',
        currentValue: template.title,
        newValue: 'Mortgage Payment Calculator',
        reasoning: 'User requested mortgage-related tool'
      });
    }
    
    // Example: If user mentions specific industry, update styling
    if (userRequest.industry && userRequest.industry !== template.industry) {
      modifications.push({
        type: 'styling',
        element: 'industry-colors',
        currentValue: template.industry,
        newValue: userRequest.industry,
        reasoning: 'Update styling to match requested industry'
      });
    }
    
    return modifications;
  }
  
  private static assessRisk(modifications: ModificationTarget[], complexityScore: number): {
    complexity: 'low' | 'medium' | 'high';
    confidence: number;
    potentialIssues: string[];
  } {
    const potentialIssues: string[] = [];
    let riskScore = complexityScore;
    
    // Assess modification types
    modifications.forEach(mod => {
      switch (mod.type) {
        case 'text':
          riskScore += 1; // Very safe
          break;
        case 'options':
          riskScore += 2; // Safe
          break;
        case 'calculation':
          riskScore += 5; // Medium risk
          potentialIssues.push('Business logic modification may introduce errors');
          break;
        case 'structure':
          riskScore += 10; // High risk
          potentialIssues.push('Structural changes may break component');
          break;
        case 'styling':
          riskScore += 3; // Low-medium risk
          break;
      }
    });
    
    const complexity = riskScore < 20 ? 'low' : riskScore < 50 ? 'medium' : 'high';
    const confidence = Math.max(10, 100 - riskScore);
    
    return { complexity, confidence, potentialIssues };
  }
  
  private static getModificationPriority(type: ModificationTarget['type']): number {
    const priorities = {
      'text': 1,
      'styling': 2,
      'options': 3,
      'calculation': 4,
      'structure': 5
    };
    return priorities[type];
  }
  
  private static async executeModification(
    code: string,
    modification: ModificationTarget
  ): Promise<{ success: boolean; modifiedCode: string; error?: string }> {
    try {
      let modifiedCode = code;
      
      switch (modification.type) {
        case 'text':
          // Simple text replacement with escaping
          const escapedCurrent = modification.currentValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          modifiedCode = code.replace(new RegExp(escapedCurrent, 'g'), modification.newValue);
          break;
          
        case 'calculation':
          // More complex calculation replacement would go here
          modifiedCode = code.replace(modification.currentValue, modification.newValue);
          break;
          
        default:
          throw new Error(`Modification type ${modification.type} not implemented yet`);
      }
      
      return { success: true, modifiedCode };
    } catch (error) {
      return { 
        success: false, 
        modifiedCode: code, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
  
  private static generateToolTitle(userRequest: ToolRequest): string {
    // Simple title generation - would be enhanced with AI
    const prompt = userRequest.userPrompt;
    
    if (prompt.toLowerCase().includes('calculator')) {
      return `${userRequest.businessType || 'Custom'} Calculator`;
    }
    
    return `Custom ${userRequest.businessType || 'Business'} Tool`;
  }
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Main interface for the Surgical Modification system
 */
export class SurgicalModificationAgent {
  /**
   * Transform a template into a customized tool
   */
  static async createCustomTool(
    template: TemplateExample,
    userRequest: ToolRequest
  ): Promise<ModificationResult> {
    // Step 1: Create surgical plan
    const plan = await SurgicalModificationEngine.createSurgicalPlan(template, userRequest);
    
    // Step 2: Execute the plan
    const result = await SurgicalModificationEngine.executeSurgicalPlan(plan);
    
    return result;
  }
  
  /**
   * Preview modifications without executing them
   */
  static async previewModifications(
    template: TemplateExample,
    userRequest: ToolRequest
  ): Promise<SurgicalPlan> {
    return SurgicalModificationEngine.createSurgicalPlan(template, userRequest);
  }
  
  /**
   * Validate a template for modification compatibility
   */
  static validateTemplate(template: TemplateExample): {
    isCompatible: boolean;
    issues: string[];
    recommendations: string[];
  } {
    const analysis = TemplateAnalyzer.analyzeTemplate(template);
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    if (analysis.complexityScore > 80) {
      issues.push('Template is very complex and may be difficult to modify safely');
      recommendations.push('Consider simplifying template structure');
    }
    
    if (analysis.modifiableElements.length < 3) {
      issues.push('Template has very few modifiable elements');
      recommendations.push('Add more customizable text and options');
    }
    
    return {
      isCompatible: issues.length === 0,
      issues,
      recommendations
    };
  }
}