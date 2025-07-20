/**
 * Baseline Template Examples for Keyvex Revamped
 * Consolidated imports from individual template files
 * CRITICAL: All inputs use theme-aware classes to prevent invisible text
 */

import { TemplateExample } from '@/lib/types/tool';
import { FINANCIAL_CALCULATOR_TEMPLATE } from './calculator-templates';
import { HEALTH_QUIZ_TEMPLATE } from './quiz-templates';
import { MARKETING_PLANNER_TEMPLATE } from './planner-templates';
import { SERVICE_PROPOSAL_TEMPLATE } from './form-templates';
import { WEBSITE_DIAGNOSTIC_TEMPLATE } from './diagnostic-templates';

// Export consolidated array of all templates
export const BASELINE_TEMPLATES: TemplateExample[] = [
  FINANCIAL_CALCULATOR_TEMPLATE,
  HEALTH_QUIZ_TEMPLATE,
  MARKETING_PLANNER_TEMPLATE,
  SERVICE_PROPOSAL_TEMPLATE,
  WEBSITE_DIAGNOSTIC_TEMPLATE
];

// Utility functions for template selection
export function getTemplateByType(type: string, industry?: string): TemplateExample | null {
  const templates = BASELINE_TEMPLATES.filter(template => template.type === type);
  
  if (industry) {
    const industryTemplates = templates.filter(template => template.industry === industry);
    return industryTemplates.length > 0 ? industryTemplates[0] : templates[0] || null;
  }
  
  return templates[0] || null;
}

export function getTemplatesByIndustry(industry: string): TemplateExample[] {
  return BASELINE_TEMPLATES.filter(template => template.industry === industry);
}

// Individual template exports for backward compatibility
export { FINANCIAL_CALCULATOR_TEMPLATE } from './calculator-templates';
export { HEALTH_QUIZ_TEMPLATE } from './quiz-templates';
export { MARKETING_PLANNER_TEMPLATE } from './planner-templates';
export { SERVICE_PROPOSAL_TEMPLATE } from './form-templates';
export { WEBSITE_DIAGNOSTIC_TEMPLATE } from './diagnostic-templates';