/**
 * Utility to convert hardcoded component styles to theme-aware ones
 * Addresses the critical white-on-white visibility issue
 */

/**
 * Mapping of hardcoded colors to theme-aware equivalents
 */
const COLOR_MAPPINGS: Record<string, string> = {
  // Text colors
  'text-gray-900': 'text-foreground',
  'text-gray-800': 'text-foreground',
  'text-gray-700': 'text-foreground',
  'text-gray-600': 'text-muted-foreground',
  'text-gray-500': 'text-muted-foreground',
  'text-gray-400': 'text-muted-foreground',
  'text-white': 'text-primary-foreground',
  'text-black': 'text-foreground',
  
  // Background colors
  'bg-white': 'bg-card',
  'bg-gray-50': 'bg-muted',
  'bg-gray-100': 'bg-muted',
  'bg-gray-200': 'bg-muted',
  
  // Border colors
  'border-gray-200': 'border-border',
  'border-gray-300': 'border-border',
  'border-gray-400': 'border-border',
  
  // Button colors (keep branded colors but add theme variants)
  'bg-blue-600': 'bg-primary',
  'bg-blue-500': 'bg-primary',
  'hover:bg-blue-700': 'hover:bg-primary/90',
  'hover:bg-blue-600': 'hover:bg-primary/90',
  'text-blue-600': 'text-primary',
  'text-blue-700': 'text-primary',
  'text-blue-800': 'text-primary',
  
  // Status colors (enhanced for dark mode)
  'bg-green-50': 'bg-emerald-50 dark:bg-emerald-900/20',
  'bg-green-100': 'bg-emerald-50 dark:bg-emerald-900/20',
  'text-green-600': 'text-emerald-600 dark:text-emerald-400',
  'text-green-700': 'text-emerald-700 dark:text-emerald-300',
  'text-green-800': 'text-emerald-800 dark:text-emerald-200',
  
  'bg-blue-50': 'bg-blue-50 dark:bg-blue-900/20',
  'bg-blue-100': 'bg-blue-50 dark:bg-blue-900/20',
  
  // Form elements
  'border rounded': 'border border-border bg-background text-foreground rounded focus:ring-2 focus:ring-ring',
  'w-full p-2 border rounded': 'w-full p-2 border border-border bg-background text-foreground rounded focus:ring-2 focus:ring-ring'
};

/**
 * Converts hardcoded component code to theme-aware version
 */
export function convertToThemeAware(componentCode: string): string {
  let converted = componentCode;
  
  // Apply all color mappings
  for (const [hardcoded, themeAware] of Object.entries(COLOR_MAPPINGS)) {
    // Use regex to match whole class names, not partial matches
    const regex = new RegExp(`\\b${hardcoded.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
    converted = converted.replace(regex, themeAware);
  }
  
  // Special patterns for form elements
  converted = converted.replace(
    /className="([^"]*\s)?p-2 border rounded(\s[^"]*)?"/g,
    'className="$1p-2 border border-border bg-background text-foreground rounded focus:ring-2 focus:ring-ring$2"'
  );
  
  // Fix select elements
  converted = converted.replace(
    /<select([^>]*?)>/g,
    '<select$1 className="w-full p-2 border border-border bg-background text-foreground rounded focus:ring-2 focus:ring-ring">'
  );
  
  // Fix label elements that don't have text color
  converted = converted.replace(
    /<label className="([^"]*?)(?<!text-[\w-]+)([^"]*?)">/g,
    '<label className="$1 text-foreground$2">'
  );
  
  // Fix span elements that don't have text color
  converted = converted.replace(
    /<span className="([^"]*?)(?<!text-[\w-]+)([^"]*?)">/g,
    '<span className="$1 text-foreground$2">'
  );
  
  // Fix h3 elements that don't have text color
  converted = converted.replace(
    /<h3 className="([^"]*?)(?<!text-[\w-]+)([^"]*?)">/g,
    '<h3 className="$1 text-foreground$2">'
  );
  
  return converted;
}

/**
 * Validates that a component code string doesn't have visibility issues
 */
export function validateComponentVisibility(componentCode: string): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  // Check for hardcoded colors that cause visibility issues
  const problematicPatterns = [
    /text-gray-900/g,
    /text-gray-800/g,
    /text-white.*bg-white/g,
    /bg-white.*text-white/g,
    /text-black.*bg-black/g,
    /bg-gray-900.*text-gray-900/g
  ];
  
  problematicPatterns.forEach((pattern, index) => {
    if (pattern.test(componentCode)) {
      switch (index) {
        case 0:
        case 1:
          issues.push('Hardcoded dark text colors found - may be invisible in dark mode');
          break;
        case 2:
        case 3:
          issues.push('White text on white background detected');
          break;
        case 4:
          issues.push('Black text on black background detected');
          break;
        case 5:
          issues.push('Dark text on dark background detected');
          break;
      }
    }
  });
  
  // Check for missing text colors on interactive elements
  if (/<input[^>]*(?!.*text-[\w-]).*>/g.test(componentCode)) {
    issues.push('Input elements without explicit text color may be invisible');
  }
  
  if (/<label[^>]*(?!.*text-[\w-]).*>/g.test(componentCode)) {
    issues.push('Label elements without explicit text color may be invisible');
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
}