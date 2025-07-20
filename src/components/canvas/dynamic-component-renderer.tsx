'use client';

import React, { useState, useEffect, useCallback, ErrorInfo } from 'react';
import { transformComponentCode, validateComponentSyntax } from '@/lib/transpilation/jsx-transpiler';

// Import Shadcn/UI components for dependency injection
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';

/**
 * Props for Dynamic Component Renderer
 */
interface DynamicComponentRendererProps {
  componentCode: string;
  onRenderStart?: () => void;
  onRenderSuccess?: () => void;
  onRenderError?: (error: string) => void;
  className?: string;
}

/**
 * Render state tracking
 */
interface RenderState {
  isLoading: boolean;
  isRendered: boolean;
  error: string | null;
  Component: React.ComponentType | null;
}

/**
 * Error boundary for component rendering
 */
class ComponentErrorBoundary extends React.Component<
  { children: React.ReactNode; onError: (error: string) => void },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Component render error:', error, errorInfo);
    this.props.onError(`Component render error: ${error.message}`);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
          <p className="text-red-700 text-sm">Component failed to render</p>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Dynamic Component Renderer - Simplified for Template System
 * Executes JSX component code safely with Shadcn/UI dependencies
 */
export function DynamicComponentRenderer({
  componentCode,
  onRenderStart,
  onRenderSuccess,
  onRenderError,
  className = ''
}: DynamicComponentRendererProps) {
  const [renderState, setRenderState] = useState<RenderState>({
    isLoading: false,
    isRendered: false,
    error: null,
    Component: null
  });

  /**
   * Handle rendering errors
   */
  const handleError = useCallback((error: string) => {
    setRenderState(prev => ({
      ...prev,
      isLoading: false,
      error,
      Component: null
    }));
    onRenderError?.(error);
  }, [onRenderError]);

  /**
   * Render the component from code
   */
  const renderComponent = useCallback(async (code: string) => {
    try {
      setRenderState(prev => ({ ...prev, isLoading: true, error: null }));
      onRenderStart?.();

      // Validate syntax first
      const validation = validateComponentSyntax(code);
      if (!validation.isValid) {
        throw new Error(`Syntax Error: ${validation.error}`);
      }

      // Transform JSX to executable code
      const transpileResult = await transformComponentCode(code);
      if (!transpileResult.success) {
        throw new Error(`Transpilation Error: ${transpileResult.error}`);
      }

      if (!transpileResult.code) {
        throw new Error('Transpilation produced empty code');
      }

      // Create component dependencies
      const dependencies = {
        React,
        useState: React.useState,
        useEffect: React.useEffect,
        useCallback: React.useCallback,
        useMemo: React.useMemo,
        Button,
        Input,
        Label,
        Card,
        CardContent,
        CardHeader,
        CardTitle,
        Select,
        SelectContent,
        SelectItem,
        SelectTrigger,
        SelectValue,
        Checkbox,
        Slider,
        Badge
      };

      // Create dependency arrays for Function constructor
      const dependencyNames = Object.keys(dependencies);
      const dependencyValues = Object.values(dependencies);

      // Execute the component code safely
      const componentFunction = new Function(
        ...dependencyNames,
        transpileResult.code
      );

      const ComponentImpl = componentFunction(...dependencyValues);

      if (typeof ComponentImpl !== 'function') {
        throw new Error('Generated code did not return a valid React component');
      }

      // Test render the component
      try {
        React.createElement(ComponentImpl);
      } catch (testError) {
        throw new Error(`Component test failed: ${testError instanceof Error ? testError.message : 'Unknown error'}`);
      }

      // Success - update state
      setRenderState({
        isLoading: false,
        isRendered: true,
        error: null,
        Component: ComponentImpl
      });

      onRenderSuccess?.();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown rendering error';
      handleError(errorMessage);
    }
  }, [onRenderStart, onRenderSuccess, handleError]);

  /**
   * Re-render when component code changes
   */
  useEffect(() => {
    if (componentCode && componentCode.trim()) {
      renderComponent(componentCode);
    } else {
      setRenderState({
        isLoading: false,
        isRendered: false,
        error: null,
        Component: null
      });
    }
  }, [componentCode, renderComponent]);

  /**
   * Render loading state
   */
  if (renderState.isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
          <p className="text-sm text-muted-foreground">Rendering component...</p>
        </div>
      </div>
    );
  }

  /**
   * Render error state
   */
  if (renderState.error) {
    return (
      <div className={`p-4 border border-red-200 bg-red-50 rounded-lg ${className}`}>
        <div className="flex items-center gap-2 text-red-700 mb-2">
          <span className="text-lg">⚠️</span>
          <h3 className="font-medium">Render Error</h3>
        </div>
        <p className="text-sm text-red-600 mb-3">{renderState.error}</p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => renderComponent(componentCode)}
        >
          Retry Render
        </Button>
      </div>
    );
  }

  /**
   * Render empty state
   */
  if (!renderState.Component) {
    return (
      <div className={`p-8 border-2 border-dashed border-border rounded-lg text-center ${className}`}>
        <div className="text-muted-foreground mb-2">📝</div>
        <p className="text-muted-foreground text-sm">No component to render</p>
      </div>
    );
  }

  /**
   * Render the actual component with error boundary
   */
  return (
    <div className={`w-full ${className}`}>
      <ComponentErrorBoundary onError={handleError}>
        <renderState.Component />
      </ComponentErrorBoundary>
    </div>
  );
}

export default DynamicComponentRenderer;