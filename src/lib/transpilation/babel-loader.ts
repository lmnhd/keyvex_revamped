/**
 * Babel Dynamic Loader - Simplified for Revamped System
 * Loads Babel Standalone from CDN for JSX transpilation
 */

// Global Babel interface
declare global {
  interface Window {
    Babel?: {
      transform: (code: string, options: any) => { code: string };
    };
  }
}

export interface BabelLoadStatus {
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
}

let loadingPromise: Promise<void> | null = null;

/**
 * Check if Babel is already loaded
 */
export function isBabelLoaded(): boolean {
  return typeof window !== 'undefined' && !!window.Babel;
}

/**
 * Get current Babel loading status
 */
export function getBabelLoadStatus(): BabelLoadStatus {
  return {
    isLoaded: isBabelLoaded(),
    isLoading: !!loadingPromise,
    error: null
  };
}

/**
 * Ensure Babel is loaded, load from CDN if needed
 */
export async function ensureBabelLoaded(): Promise<void> {
  // Already loaded
  if (isBabelLoaded()) {
    return;
  }

  // Already loading
  if (loadingPromise) {
    return loadingPromise;
  }

  // Start loading
  loadingPromise = loadBabelFromCDN();
  
  try {
    await loadingPromise;
  } finally {
    loadingPromise = null;
  }
}

/**
 * Load Babel Standalone from CDN
 */
async function loadBabelFromCDN(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Server-side rendering check
    if (typeof window === 'undefined') {
      reject(new Error('Babel loader can only run in browser environment'));
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@babel/standalone/babel.min.js';
    script.crossOrigin = 'anonymous';
    
    // Handle successful load
    script.onload = () => {
      if (window.Babel) {
        console.log('Babel loaded successfully from CDN');
        resolve();
      } else {
        reject(new Error('Babel loaded but not available on window object'));
      }
    };
    
    // Handle load error
    script.onerror = () => {
      reject(new Error('Failed to load Babel from CDN'));
    };
    
    // Add to document
    document.head.appendChild(script);
  });
}