/**
 * component-transpiler.ts
 * ---------------------------------------
 * Babel-powered helper that turns arbitrary TSX/JSX strings into plain
 * executable JavaScript that can be evaluated with `new Function`.
 * - Strips TypeScript types
 * - Converts JSX → React.createElement calls
 * - Removes static imports / exports so that output is self-contained
 *
 * IMPORTANT: This relies on the runtime-only `@babel/standalone` package,
 * which must be available in `node_modules` or provided via CDN when used
 * in the browser.
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore – typings are not shipped with @babel/standalone
import * as Babel from '@babel/standalone';

/**
 * Transpile arbitrary component code to plain JS.
 * @param src Raw TSX/JSX string (may contain imports / exports)
 * @returns Transpiled, import-free, export-free JavaScript source.
 */
export function transpileComponent(src: string): string {
  const removeImportsExportsPlugin = () => ({
    visitor: {
      ImportDeclaration(path: any) {
        path.remove();
      },
      ExportNamedDeclaration(path: any) {
        path.remove();
      },
      ExportDefaultDeclaration(path: any) {
        // Replace `export default Foo` with just `Foo` so callers can `return Foo` later.
        const decl = path.node.declaration;
        if (decl) {
          path.replaceWith(decl);
        } else {
          path.remove();
        }
      },
    },
  });

  const { code } = (Babel as any).transform(src, {
    presets: ['typescript', 'react'],
    plugins: [removeImportsExportsPlugin],
    sourceType: 'module',
    filename: 'generated-component.tsx',
  });

  return code.trim();
}

// Backwards-compat shims for older code paths
export const stripTypeScript = transpileComponent;
export const removeImportsAndExports = transpileComponent;
