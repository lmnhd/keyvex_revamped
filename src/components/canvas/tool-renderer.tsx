'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Tool } from '@/lib/types/tool';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { AlertCircle, Loader2 } from 'lucide-react';
import DynamicComponentRenderer from '@/lib/components/dynamic-component-renderer';

/**
 * Simple tool renderer - no complex validation, just render and test
 */
interface ToolRendererProps {
  tool?: Tool;
  isLoading?: boolean;
  className?: string;
}

export function ToolRenderer({ tool, isLoading = false, className = '' }: ToolRendererProps) {
  const [renderError, setRenderError] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  // Show loading state
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-12 ${className}`}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-primary" />
          <p className="text-sm text-muted-foreground">Generating tool...</p>
        </div>
      </div>
    );
  }
  
  // Show placeholder when no tool
  if (!tool) {
    return (
      <div className={`p-8 border-2 border-dashed border-border rounded-lg text-center ${className}`}>
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium text-foreground mb-2">No Tool Loaded</h3>
        <p className="text-sm text-muted-foreground">Create or select a tool to see it rendered here</p>
      </div>
    );
  }
  
  // Show error state
  if (renderError) {
    return (
      <div className={`p-6 border border-red-200 bg-red-50 rounded-lg ${className}`}>
        <div className="flex items-center gap-2 text-red-700 mb-2">
          <AlertCircle className="h-5 w-5" />
          <h3 className="font-medium">Render Error</h3>
        </div>
        <p className="text-sm text-red-600 mb-3">{renderError}</p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setRenderError(null)}
        >
          Retry
        </Button>
      </div>
    );
  }
  
  // Render the tool
  return (
    <div className={`w-full ${className}`} ref={wrapperRef}>
      <div className="border border-border rounded-lg p-6 bg-card text-card-foreground shadow-sm">
        {/* Tool Header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-2">{tool.title}</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
              {tool.type}
            </span>
            <span>•</span>
            <span>ID: {tool.id}</span>
          </div>
        </div>
        
        {/* Rendered Component */}
        <div className="tool-content">
          <DynamicComponentRenderer componentCode={tool.componentCode} />
        </div>
        
        {/* Lead Capture Preview */}
        {tool.leadCapture.emailRequired && (
          <div className="mt-6 pt-4 border-t border-border">
            <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg">
              <p className="text-sm text-primary mb-2">
                📧 Lead Capture: {tool.leadCapture.incentive}
              </p>
              <p className="text-xs text-primary/80">
                Trigger: {tool.leadCapture.trigger}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


export default ToolRenderer;