/**
 * JSX Transpiler - Simplified for Revamped System
 * Converts JSX syntax to React.createElement calls using Babel
 */

import { ensureBabelLoaded, isBabelLoaded } from './babel-loader';

export interface TranspileResult {
  success: boolean;
  code?: string;
  error?: string;
}

export interface ComponentCodeFormat {
  isJSX: boolean;
  isCreateElement: boolean;
  isFunction: boolean;
  hasExports: boolean;
  hasImports: boolean;
}

/**
 * Detect the format of component code
 */
export function detectComponentCodeFormat(code: string): ComponentCodeFormat {
  if (!code || typeof code !== 'string') {
    return {
      isJSX: false,
      isCreateElement: false,
      isFunction: false,
      hasExports: false,
      hasImports: false
    };
  }

  // Clean code for analysis
  const cleanCode = code.trim();
  
  return {
    isJSX: /(<[A-Z][^>]*>|<\/[A-Z][^>]*>|<[a-z][^>]*\/>)/.test(cleanCode),
    isCreateElement: /React\.createElement\s*\(/.test(cleanCode),
    isFunction: /^(function|const|let|var)\s+\w+/.test(cleanCode) || /^\s*\(\s*\)\s*=>/.test(cleanCode),
    hasExports: /(export\s+default|export\s*{|module\.exports)/.test(cleanCode),
    hasImports: /(import\s+.*from|require\s*\()/.test(cleanCode)
  };
}

/**
 * Transform component code using Babel
 */
export async function transformComponentCode(code: string): Promise<TranspileResult> {
  try {
    // Ensure Babel is loaded
    await ensureBabelLoaded();
    
    if (!isBabelLoaded()) {
      return {
        success: false,
        error: 'Babel not available for transpilation'
      };
    }

    // Analyze code format
    const format = detectComponentCodeFormat(code);
    
    // If already in createElement format, return as-is
    if (format.isCreateElement && !format.isJSX) {
      return {
        success: true,
        code: cleanAndWrapCode(code)
      };
    }

    // Prepare code for transpilation
    const preparedCode = prepareCodeForTranspilation(code, format);
    
    // Transform with Babel
    const result = window.Babel!.transform(preparedCode, {
      presets: ['react'],
      plugins: [],
      filename: 'component.jsx'
    });

    if (!result.code) {
      return {
        success: false,
        error: 'Babel transformation returned empty code'
      };
    }

    // Clean and finalize
    const finalCode = cleanAndWrapCode(result.code);
    
    return {
      success: true,
      code: finalCode
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown transpilation error'
    };
  }
}

/**
 * Prepare code for Babel transpilation
 */
function prepareCodeForTranspilation(code: string, format: ComponentCodeFormat): string {
  let preparedCode = code.trim();

  // Remove imports (we'll provide dependencies directly)
  preparedCode = preparedCode.replace(/import\s+.*?from\s+['"].*?['"];?\s*/g, '');
  
  // Remove exports
  preparedCode = preparedCode.replace(/export\s+default\s+/g, '');
  preparedCode = preparedCode.replace(/export\s*{\s*.*?\s*};?\s*/g, '');
  preparedCode = preparedCode.replace(/module\.exports\s*=\s*/g, '');

  // If it's a function component, wrap in return statement
  if (format.isFunction) {
    // Already a function, just clean it
    return preparedCode;
  }

  // If it's JSX without function wrapper, wrap it
  if (format.isJSX && !format.isFunction) {
    // Wrap adjacent JSX elements in React.Fragment if needed
    const lines = preparedCode.split('\n').filter(line => line.trim());
    if (lines.length > 1) {
      preparedCode = `<React.Fragment>${preparedCode}</React.Fragment>`;
    }
    
    return `function Component() { return (${preparedCode}); }`;
  }

  return preparedCode;
}

/**
 * Clean and wrap the final transpiled code
 */
function cleanAndWrapCode(code: string): string {
  let cleanCode = code.trim();
  
  // Remove any lingering semicolons at the end
  cleanCode = cleanCode.replace(/;+$/, '');
  
  // Ensure it returns a component function
  if (!cleanCode.includes('function') && !cleanCode.includes('=>')) {
    cleanCode = `return function Component() { return ${cleanCode}; };`;
  } else if (cleanCode.startsWith('function')) {
    cleanCode = `return ${cleanCode};`;
  }
  
  return cleanCode;
}

/**
 * Validate component code syntax
 */
export function validateComponentSyntax(code: string): { isValid: boolean; error?: string } {
  try {
    // Basic syntax checks
    if (!code || typeof code !== 'string') {
      return { isValid: false, error: 'Code is empty or not a string' };
    }

    // Check for balanced brackets
    const openBrackets = (code.match(/\{/g) || []).length;
    const closeBrackets = (code.match(/\}/g) || []).length;
    if (openBrackets !== closeBrackets) {
      return { isValid: false, error: 'Unbalanced curly brackets' };
    }

    // Check for balanced parentheses  
    const openParens = (code.match(/\(/g) || []).length;
    const closeParens = (code.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      return { isValid: false, error: 'Unbalanced parentheses' };
    }

    return { isValid: true };
  } catch (error) {
    return { 
      isValid: false, 
      error: error instanceof Error ? error.message : 'Syntax validation error'
    };
  }
}