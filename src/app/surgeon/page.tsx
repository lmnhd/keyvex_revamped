'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ToolRenderer } from '@/components/canvas/tool-renderer';

import { ToolRequest, Tool, SurgicalPlan, PreprocessingResult, ResearchData, CodeGenerationResult } from '@/lib/types/tool';
import { ThemeToggle } from '@/components/ui/theme-toggle';

/**
 * Surgical Pipeline Test Page
 * Demonstrates the 4-agent surgical pipeline approach
 */
export default function SurgeonPage() {
  const [userRequest, setUserRequest] = useState<ToolRequest>({
    userPrompt: '',
    businessType: '',
    industry: ''
  });
  const [generatedTool, setGeneratedTool] = useState<Tool | null>(null);
  const [pipelineResults, setPipelineResults] = useState<{
    preprocessingResult: PreprocessingResult;
    surgicalPlan: SurgicalPlan;
    researchData: ResearchData;
    codeGenerationResult: CodeGenerationResult;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleGenerateTool = async () => {
    if (!userRequest.userPrompt.trim()) return;
    
    setIsProcessing(true);
    try {
      const response = await fetch('/api/ai/surgical-pipeline/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userRequest),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setGeneratedTool(result.tool);
        setPipelineResults({
          preprocessingResult: result.preprocessingResult,
          surgicalPlan: result.surgicalPlan,
          researchData: result.researchData,
          codeGenerationResult: result.codeGenerationResult,
        });
      } else {
        throw new Error(result.error || 'Tool generation failed');
      }
    } catch (error) {
      console.error('Tool generation failed:', error);
      alert('Tool generation failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Surgical Pipeline</h1>
          <p className="text-muted-foreground">4-Agent AI Pipeline: Preprocessing → Planning → Research → Code Generation</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Control Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* User Request */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">1. Describe Your Tool</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">What tool do you need?</Label>
                  <Textarea
                    value={userRequest.userPrompt}
                    onChange={(e) => setUserRequest(prev => ({ ...prev, userPrompt: e.target.value }))}
                    placeholder="I need a mortgage payment calculator for real estate agents..."
                    className="min-h-[100px]"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Business Type</Label>
                    <Input
                      value={userRequest.businessType}
                      onChange={(e) => setUserRequest(prev => ({ ...prev, businessType: e.target.value }))}
                      placeholder="Real Estate"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Industry</Label>
                    <Input
                      value={userRequest.industry}
                      onChange={(e) => setUserRequest(prev => ({ ...prev, industry: e.target.value }))}
                      placeholder="finance"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">2. Generate Tool</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handleGenerateTool}
                  className="w-full"
                  disabled={!userRequest.userPrompt.trim() || isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Generate Custom Tool'}
                </Button>
              </CardContent>
            </Card>

            {/* Pipeline Results */}
            {pipelineResults && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pipeline Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Preprocessing</h4>
                    <div className="p-2 bg-muted rounded text-xs">
                      <p><strong>Template:</strong> {pipelineResults.preprocessingResult.selectedTemplate}</p>
                      <p><strong>Fit Score:</strong> {pipelineResults.preprocessingResult.templateFitScore}%</p>
                      <p><strong>Target:</strong> {pipelineResults.preprocessingResult.targetAudience}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Surgical Plan</h4>
                    <div className="p-2 bg-muted rounded text-xs">
                      <p><strong>Modifications:</strong> {pipelineResults.surgicalPlan.modifications.length}</p>
                      <p><strong>Source:</strong> {pipelineResults.surgicalPlan.sourceTemplate}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Code Generation</h4>
                    <div className="p-2 bg-muted rounded text-xs">
                      <p><strong>Success:</strong> {pipelineResults.codeGenerationResult.success ? 'Yes' : 'No'}</p>
                      <p><strong>Applied:</strong> {pipelineResults.codeGenerationResult.modificationsApplied}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Preview Area */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {generatedTool ? 'Generated Tool' : 'Tool Preview'}
                </CardTitle>
                {generatedTool && (
                  <div className="flex items-center gap-2">
                    <Badge variant="default">Success</Badge>
                    <Badge variant="outline">{generatedTool.type}</Badge>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {generatedTool ? (
                  <ToolRenderer 
                    tool={generatedTool}
                    className="min-h-[600px]"
                  />
                ) : (
                  <div className="flex items-center justify-center h-[600px] bg-muted rounded-lg">
                    <div className="text-center">
                      <p className="text-muted-foreground mb-2">No tool generated yet</p>
                      <p className="text-sm text-muted-foreground">
                        Describe your tool requirements and click &quot;Generate Custom Tool&quot;
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}