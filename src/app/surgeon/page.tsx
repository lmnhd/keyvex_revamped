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

import { SurgicalModificationAgent, ModificationResult, SurgicalPlan } from '@/lib/agents/surgical-modification-agent';
import { BASELINE_TEMPLATES, getTemplateByType } from '@/lib/templates/baseline-templates';
import { ToolRequest, Tool } from '@/lib/types/tool';
import { ThemeToggle } from '@/components/ui/theme-toggle';

/**
 * Surgical Modification Test Page
 * Demonstrates the template-first approach with targeted modifications
 */
export default function SurgeonPage() {
  const [selectedTemplate, setSelectedTemplate] = useState(BASELINE_TEMPLATES[0]);
  const [userRequest, setUserRequest] = useState<ToolRequest>({
    userPrompt: '',
    businessType: '',
    industry: ''
  });
  const [surgicalPlan, setSurgicalPlan] = useState<SurgicalPlan | null>(null);
  const [modificationResult, setModificationResult] = useState<ModificationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePreviewModifications = async () => {
    if (!userRequest.userPrompt.trim()) return;
    
    setIsProcessing(true);
    try {
      const plan = await SurgicalModificationAgent.previewModifications(selectedTemplate, userRequest);
      setSurgicalPlan(plan);
    } catch (error) {
      console.error('Preview failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExecuteModifications = async () => {
    if (!userRequest.userPrompt.trim()) return;
    
    setIsProcessing(true);
    try {
      const result = await SurgicalModificationAgent.createCustomTool(selectedTemplate, userRequest);
      setModificationResult(result);
    } catch (error) {
      console.error('Modification failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTemplateChange = (templateId: string) => {
    const template = BASELINE_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      setSurgicalPlan(null);
      setModificationResult(null);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Surgical Modification Agent</h1>
          <p className="text-muted-foreground">Transform templates into customized tools through targeted modifications</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Control Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Template Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">1. Select Base Template</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Template Type</Label>
                  <Select value={selectedTemplate.id} onValueChange={handleTemplateChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BASELINE_TEMPLATES.map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.title} ({template.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{selectedTemplate.type}</Badge>
                    <Badge variant="secondary">{selectedTemplate.industry}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* User Request */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">2. Describe Your Tool</CardTitle>
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
                <CardTitle className="text-lg">3. Execute Surgery</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handlePreviewModifications}
                  variant="outline"
                  className="w-full"
                  disabled={!userRequest.userPrompt.trim() || isProcessing}
                >
                  Preview Modifications
                </Button>
                
                <Button
                  onClick={handleExecuteModifications}
                  className="w-full"
                  disabled={!userRequest.userPrompt.trim() || isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Create Custom Tool'}
                </Button>
              </CardContent>
            </Card>

            {/* Surgical Plan Preview */}
            {surgicalPlan && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Surgical Plan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant={surgicalPlan.riskAssessment.complexity === 'low' ? 'default' : 'destructive'}>
                      {surgicalPlan.riskAssessment.complexity} complexity
                    </Badge>
                    <Badge variant="outline">
                      {surgicalPlan.riskAssessment.confidence}% confidence
                    </Badge>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Planned Modifications ({surgicalPlan.modifications.length})</h4>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {surgicalPlan.modifications.map((mod, index) => (
                        <div key={index} className="p-2 bg-muted rounded text-xs">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">{mod.type}</Badge>
                          </div>
                          <p className="text-muted-foreground">{mod.reasoning}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {surgicalPlan.riskAssessment.potentialIssues.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2 text-amber-600">Potential Issues</h4>
                      <ul className="text-xs text-amber-600 space-y-1">
                        {surgicalPlan.riskAssessment.potentialIssues.map((issue, index) => (
                          <li key={index}>• {issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Preview Area */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {modificationResult ? 'Modified Tool' : 'Base Template Preview'}
                </CardTitle>
                {modificationResult && (
                  <div className="flex items-center gap-2">
                    <Badge variant={modificationResult.success ? 'default' : 'destructive'}>
                      {modificationResult.success ? 'Success' : 'Partial Success'}
                    </Badge>
                    {modificationResult.executedModifications.length > 0 && (
                      <Badge variant="outline">
                        {modificationResult.executedModifications.length} modifications applied
                      </Badge>
                    )}
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {modificationResult?.modifiedTool ? (
                  <ToolRenderer 
                    tool={modificationResult.modifiedTool}
                    className="min-h-[600px]"
                  />
                ) : (
                  <ToolRenderer 
                    tool={{
                      id: selectedTemplate.id,
                      title: selectedTemplate.title,
                      type: selectedTemplate.type,
                      componentCode: selectedTemplate.componentCode,
                      leadCapture: selectedTemplate.leadCapture,
                      createdAt: Date.now(),
                      updatedAt: Date.now()
                    }}
                    className="min-h-[600px]"
                  />
                )}
                
                {modificationResult && (
                  <div className="mt-6 pt-4 border-t space-y-4">
                    {modificationResult.validationErrors.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 text-red-600">Validation Errors</h4>
                        <ul className="text-sm text-red-600 space-y-1">
                          {modificationResult.validationErrors.map((error, index) => (
                            <li key={index}>• {error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {modificationResult.failedModifications.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 text-amber-600">Failed Modifications</h4>
                        <ul className="text-sm text-amber-600 space-y-1">
                          {modificationResult.failedModifications.map((mod, index) => (
                            <li key={index}>• {mod.type}: {mod.reasoning}</li>
                          ))}
                        </ul>
                      </div>
                    )}
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