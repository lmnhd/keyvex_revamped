/**
 * Simple TypeScript Stripper - No Babel, No Transpilation
 */

export function stripTypeScript(code: string): string {
  let cleanCode = code;
  
  // Remove interface declarations
  cleanCode = cleanCode.replace(/interface\s+\w+\s*{[^}]*}/g, '');
  
  // Remove type annotations from variables
  cleanCode = cleanCode.replace(/:\s*\w+(\[\]|\<[^>]*\>)*(\s*\|\s*\w+(\[\]|\<[^>]*\>)*)*(?=\s*[=;,)])/g, '');
  
  // Remove generic type parameters
  cleanCode = cleanCode.replace(/<[^>]*>/g, '');
  
  // Remove React.FC and similar type annotations
  cleanCode = cleanCode.replace(/:\s*React\.FC\s*/g, '');
  
  // Remove Record and other utility types
  cleanCode = cleanCode.replace(/Record<[^>]*>/g, 'any');
  
  // Clean up multiple spaces and empty lines
  cleanCode = cleanCode.replace(/\s+/g, ' ').replace(/\n\s*\n/g, '\n');
  
  return cleanCode.trim();
}

export function removeImportsAndExports(code: string): string {
  let cleanCode = code;
  
  // Remove imports
  cleanCode = cleanCode.replace(/import\s+.*?from\s+['"].*?['"];?\s*/g, '');
  
  // Remove exports
  cleanCode = cleanCode.replace(/export\s+default\s+/g, '');
  cleanCode = cleanCode.replace(/export\s*{\s*.*?\s*};?\s*/g, '');
  
  return cleanCode.trim();
}