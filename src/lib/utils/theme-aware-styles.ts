/**
 * Theme-Aware Style Utilities
 * Prevents white-on-white visibility issues by providing theme-aware class builders
 */

import { INPUT_VISIBILITY_STANDARDS, ACCESSIBILITY_STANDARDS } from '@/lib/constants/styling-standards';

export interface ThemeAwareStyleOptions {
  theme?: 'light' | 'dark' | 'auto';
  variant?: 'default' | 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Creates theme-aware input classes that prevent invisible text
 * CRITICAL: Addresses #1 user complaint from legacy system
 */
export function getThemeAwareInputClasses(options: ThemeAwareStyleOptions = {}): string {
  const { theme = 'auto', size = 'md', variant = 'default' } = options;
  
  // Base classes that work in both themes
  let baseClasses = 'w-full border-2 rounded-lg transition-all duration-200';
  
  // Size variants
  const sizeClasses = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4',
    lg: 'h-12 px-4 text-lg'
  };
  
  baseClasses += ` ${sizeClasses[size]}`;
  
  // Theme-aware text and background colors
  if (theme === 'light') {
    // Light theme: dark text on light background
    baseClasses += ' text-gray-900 bg-white border-gray-300 focus:ring-blue-100 focus:border-blue-500';
  } else if (theme === 'dark') {
    // Dark theme: light text on dark background
    baseClasses += ' text-gray-100 bg-slate-700/50 border-slate-400 placeholder-slate-400 focus:ring-blue-400 focus:border-blue-400 shadow-inner';
  } else {
    // Auto theme: use CSS variables that adapt
    baseClasses += ' text-foreground bg-background border-border focus:ring-ring focus:border-ring';
  }
  
  return baseClasses;
}

/**
 * Creates theme-aware button classes
 */
export function getThemeAwareButtonClasses(options: ThemeAwareStyleOptions = {}): string {
  const { theme = 'auto', variant = 'default', size = 'md' } = options;
  
  let baseClasses = 'font-semibold rounded-lg transition-all duration-200 hover:scale-105 border';
  
  // Size variants
  const sizeClasses = {
    sm: 'px-4 py-1.5 text-sm',
    md: 'px-6 py-2',
    lg: 'px-8 py-3 text-lg'
  };
  
  baseClasses += ` ${sizeClasses[size]}`;
  
  // Variant and theme combinations
  if (variant === 'primary') {
    if (theme === 'dark') {
      baseClasses += ' bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white border-blue-400 shadow-lg hover:shadow-xl';
    } else {
      baseClasses += ' bg-primary hover:bg-primary/90 text-primary-foreground border-primary shadow-lg hover:shadow-xl';
    }
  } else if (variant === 'secondary') {
    if (theme === 'dark') {
      baseClasses += ' bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white border-slate-400 shadow-md';
    } else {
      baseClasses += ' bg-secondary hover:bg-secondary/90 text-secondary-foreground border-secondary shadow-md';
    }
  } else {
    // Default variant
    baseClasses += ' bg-background hover:bg-accent text-foreground border-border shadow-md hover:bg-accent/90';
  }
  
  return baseClasses;
}

/**
 * Creates theme-aware card classes
 */
export function getThemeAwareCardClasses(variant: 'main' | 'input' | 'results' | 'header' = 'main'): string {
  const baseClasses = 'rounded-lg shadow-lg border';
  
  switch (variant) {
    case 'header':
      return `${baseClasses} bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0 shadow-xl`;
    case 'input':
      return `${baseClasses} bg-card text-card-foreground border-border p-6 space-y-6`;
    case 'results':
      return `${baseClasses} bg-gradient-to-br from-card to-card/80 text-card-foreground border-border shadow-xl p-6`;
    case 'main':
    default:
      return `${baseClasses} bg-card text-card-foreground border-border shadow-2xl`;
  }
}

/**
 * Creates theme-aware text classes that ensure proper contrast
 */
export function getThemeAwareTextClasses(variant: 'primary' | 'secondary' | 'muted' | 'accent' = 'primary'): string {
  switch (variant) {
    case 'primary':
      return 'text-foreground';
    case 'secondary':
      return 'text-muted-foreground';
    case 'muted':
      return 'text-muted-foreground/70';
    case 'accent':
      return 'text-accent-foreground';
    default:
      return 'text-foreground';
  }
}

/**
 * Creates theme-aware chart container classes
 */
export function getThemeAwareChartClasses(): string {
  return 'bg-card border border-border rounded-lg p-6 shadow-xl';
}

/**
 * Validates contrast for custom color combinations
 */
export function validateContrast(backgroundColor: string, textColor: string): boolean {
  // Simple validation - in production, you'd use a proper contrast ratio calculator
  const lightBackgrounds = ['white', 'gray-50', 'blue-50', 'slate-50'];
  const darkBackgrounds = ['gray-900', 'slate-900', 'black'];
  const lightText = ['white', 'gray-100', 'slate-100'];
  const darkText = ['gray-900', 'slate-900', 'black'];
  
  const isLightBg = lightBackgrounds.some(color => backgroundColor.includes(color));
  const isDarkBg = darkBackgrounds.some(color => backgroundColor.includes(color));
  const isLightText = lightText.some(color => textColor.includes(color));
  const isDarkText = darkText.some(color => textColor.includes(color));
  
  // Good contrast combinations
  if (isLightBg && isDarkText) return true;
  if (isDarkBg && isLightText) return true;
  
  // Bad contrast combinations
  if (isLightBg && isLightText) return false;
  if (isDarkBg && isDarkText) return false;
  
  // Assume safe for other combinations
  return true;
}

/**
 * Gets dimension-aware input classes for specific input types
 */
export function getDimensionAwareInputClasses(inputType: 'currency' | 'percentage' | 'age' | 'quantity' | 'text' = 'text'): string {
  const baseClasses = getThemeAwareInputClasses();
  
  switch (inputType) {
    case 'currency':
      return baseClasses.replace('w-full', 'max-w-32'); // 8-character width for amounts like $50,000
    case 'percentage':
      return baseClasses.replace('w-full', 'max-w-20'); // 5-character width for values like 15.5%
    case 'age':
      return baseClasses.replace('w-full', 'max-w-16'); // 3-character width for values like 25
    case 'quantity':
      return baseClasses.replace('w-full', 'max-w-24'); // 6-character width for values like 1,500
    case 'text':
    default:
      return baseClasses; // Keep full width for text inputs
  }
}