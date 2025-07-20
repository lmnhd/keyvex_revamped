'use client';

import { useState } from 'react';
import { ToolRenderer } from '@/components/canvas/tool-renderer';
import { Tool } from '@/lib/types/tool';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Textarea } from '@/components/ui/textarea';
import { convertToThemeAware } from '@/lib/utils/theme-conversion';

/**
 * Tool Testing Page - Immediate visualization and testing
 */
export default function TestPage() {
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Surgical Pipeline State
  const [businessDescription, setBusinessDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processError, setProcessError] = useState<string | null>(null);
  
  // Sample tools for testing with theme-aware styling
  const sampleTools: Tool[] = [
    {
      id: 'calc-001',
      title: 'Solar Panel Savings Calculator',
      type: 'calculator',
      componentCode: convertToThemeAware(`
function SolarCalculator() {
  const [homeSize, setHomeSize] = useState('medium');
  const [monthlyBill, setMonthlyBill] = useState(150);
  const [results, setResults] = useState(null);
  
  const calculate = () => {
    const savings = monthlyBill * 12 * 0.8; // 80% savings
    const payback = 15000 / (monthlyBill * 0.8); // Rough payback period
    
    setResults({
      annualSavings: savings,
      paybackMonths: Math.round(payback),
      twentyYearSavings: savings * 20
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Home Size</label>
          <select value={homeSize} onChange={(e) => setHomeSize(e.target.value)} className="w-full p-2 border border-border bg-background text-foreground rounded focus:ring-2 focus:ring-ring">
            <option value="small">Small (1,000-1,500 sq ft)</option>
            <option value="medium">Medium (1,500-2,500 sq ft)</option>
            <option value="large">Large (2,500+ sq ft)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Monthly Electric Bill</label>
          <input 
            type="number" 
            value={monthlyBill} 
            onChange={(e) => setMonthlyBill(Number(e.target.value))}
            className="w-full p-2 border border-border bg-background text-foreground rounded focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>
      
      <button onClick={calculate} className="bg-primary text-primary-foreground px-6 py-2 rounded hover:bg-primary/90 transition-colors">
        Calculate Savings
      </button>
      
      {results && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg border border-emerald-200 dark:border-emerald-800">
          <h3 className="font-semibold text-emerald-800 dark:text-emerald-200 mb-2">Your Solar Savings</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">$\{results.annualSavings.toLocaleString()}</div>
              <div className="text-emerald-700 dark:text-emerald-300">Annual Savings</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">\{results.paybackMonths} months</div>
              <div className="text-emerald-700 dark:text-emerald-300">Payback Period</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">$\{results.twentyYearSavings.toLocaleString()}</div>
              <div className="text-emerald-700 dark:text-emerald-300">20-Year Savings</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}`),
      leadCapture: {
        emailRequired: true,
        trigger: 'after_results',
        incentive: 'Get your detailed solar analysis report'
      },
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: 'quiz-001', 
      title: 'Neighborhood Ranking Quiz',
      type: 'quiz',
      componentCode: convertToThemeAware(`
function NeighborhoodQuiz() {
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  
  const questions = [
    { id: 'schools', text: 'How important are good schools?', options: ['Not important', 'Somewhat important', 'Very important'] },
    { id: 'commute', text: 'How important is a short commute?', options: ['Not important', 'Somewhat important', 'Very important'] },
    { id: 'price', text: 'How important is affordability?', options: ['Not important', 'Somewhat important', 'Very important'] }
  ];
  
  const calculateResults = () => {
    // Mock neighborhood scoring based on answers
    const neighborhoods = [
      { name: 'Downtown', schools: 2, commute: 3, price: 1 },
      { name: 'Suburbs', schools: 3, commute: 1, price: 2 },
      { name: 'Midtown', schools: 2, commute: 2, price: 3 }
    ];
    
    setResults(neighborhoods);
  };
  
  return (
    <div className="space-y-6">
      {questions.map(q => (
        <div key={q.id} className="border-b border-border pb-4">
          <h3 className="font-medium text-foreground mb-3">\{q.text}</h3>
          <div className="space-y-2">
            {q.options.map(option => (
              <label key={option} className="flex items-center space-x-2 text-foreground">
                <input 
                  type="radio" 
                  name={q.id}
                  value={option}
                  onChange={() => setAnswers({...answers, [q.id]: option})}
                  className="text-primary"
                />
                <span>\{option}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
      
      <button onClick={calculateResults} className="bg-primary text-primary-foreground px-6 py-2 rounded hover:bg-primary/90 transition-colors">
        Get My Neighborhood Rankings
      </button>
      
      {results && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">Your Top Neighborhoods</h3>
          <div className="space-y-2">
            {results.map((neighborhood, index) => (
              <div key={neighborhood.name} className="flex items-center justify-between p-2 bg-card text-card-foreground border border-border rounded">
                <span className="font-medium text-foreground">\{index + 1}. \{neighborhood.name}</span>
                <span className="text-sm text-muted-foreground">Match Score: 85%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}`),
      leadCapture: {
        emailRequired: true,
        trigger: 'after_results', 
        incentive: 'Get your personalized neighborhood guide'
      },
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  ];
  
  const loadTool = (tool: Tool) => {
    setIsLoading(true);
    // Simulate loading time
    setTimeout(() => {
      setSelectedTool(tool);
      setIsLoading(false);
    }, 500);
  };
  
  // Surgical Pipeline Process
  const runSurgicalPipeline = async () => {
    if (!businessDescription.trim()) {
      setProcessError('Please enter a business description');
      return;
    }
    
    setIsProcessing(true);
    setProcessError(null);
    
    try {
      const response = await fetch('/api/ai/surgical-pipeline/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userPrompt: businessDescription.trim() })
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Set the generated tool as selected
      if (result.tool) {
        setSelectedTool(result.tool);
        setBusinessDescription(''); // Clear input
      } else {
        setProcessError('No tool was generated from the pipeline');
      }
      
    } catch (error) {
      console.error('Surgical pipeline error:', error);
      setProcessError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="relative min-h-screen bg-background text-foreground p-6">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Tool Testing Lab</h1>
          <p className="text-muted-foreground">Test templates and surgical pipeline</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tool Selection Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Surgical Pipeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🔬 Create New Tool</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Describe your business and tool needs:
                  </label>
                  <Textarea
                    value={businessDescription}
                    onChange={(e) => setBusinessDescription(e.target.value)}
                    placeholder="I'm a financial advisor who wants to help clients calculate retirement savings needed based on their age, income, and goals..."
                    className="min-h-[100px]"
                    disabled={isProcessing}
                  />
                </div>

                {/* Advanced Test Cases */}
                <div className="space-y-3">
                  <div className="text-sm font-medium text-foreground">Quick Test Cases:</div>
                  <div className="grid grid-cols-1 gap-2">
                    {/* Calculator Tests */}
                    <div className="border-l-2 border-blue-500 pl-3">
                      <div className="text-xs font-medium text-blue-600 mb-1">CALCULATOR</div>
                      <div className="space-y-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs text-left justify-start h-auto py-2 px-3"
                          onClick={() => setBusinessDescription("I run a wedding photography business and need to help couples calculate their total wedding photography investment including engagement shoots, day-of coverage, albums, and travel fees based on their specific package choices and venue location")}
                          disabled={isProcessing}
                        >
                          Wedding Photography ROI Calculator
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs text-left justify-start h-auto py-2 px-3"
                          onClick={() => setBusinessDescription("I'm a solar panel installer who needs to calculate exact ROI for homeowners considering their roof orientation, local utility rates, financing options, and state/federal tax incentives")}
                          disabled={isProcessing}
                        >
                          Solar Panel ROI with Tax Incentives
                        </Button>
                      </div>
                    </div>

                    {/* Quiz Tests */}
                    <div className="border-l-2 border-green-500 pl-3">
                      <div className="text-xs font-medium text-green-600 mb-1">QUIZ/ASSESSMENT</div>
                      <div className="space-y-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs text-left justify-start h-auto py-2 px-3"
                          onClick={() => setBusinessDescription("I'm a cybersecurity consultant who needs to assess small businesses' security readiness across 8 different threat vectors and provide risk scores with specific remediation priorities")}
                          disabled={isProcessing}
                        >
                          Cybersecurity Threat Assessment
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs text-left justify-start h-auto py-2 px-3"
                          onClick={() => setBusinessDescription("I offer franchise consulting and need to evaluate potential franchisees' readiness across financial capacity, industry experience, location factors, and personality fit for specific franchise brands")}
                          disabled={isProcessing}
                        >
                          Franchise Readiness Evaluation
                        </Button>
                      </div>
                    </div>

                    {/* Planner Tests */}
                    <div className="border-l-2 border-purple-500 pl-3">
                      <div className="text-xs font-medium text-purple-600 mb-1">PLANNER</div>
                      <div className="space-y-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs text-left justify-start h-auto py-2 px-3"
                          onClick={() => setBusinessDescription("I'm a wedding planner who needs to create detailed 18-month planning timelines for couples, accounting for venue booking deadlines, vendor selection phases, dress fittings, and final month countdown tasks")}
                          disabled={isProcessing}
                        >
                          Wedding Planning 18-Month Timeline
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs text-left justify-start h-auto py-2 px-3"
                          onClick={() => setBusinessDescription("I run a content marketing agency and need to plan 90-day content calendars for B2B SaaS clients across multiple channels with campaign themes, product launches, and seasonal considerations")}
                          disabled={isProcessing}
                        >
                          Content Marketing 90-Day Calendar
                        </Button>
                      </div>
                    </div>

                    {/* Form Tests */}
                    <div className="border-l-2 border-orange-500 pl-3">
                      <div className="text-xs font-medium text-orange-600 mb-1">FORM/GENERATOR</div>
                      <div className="space-y-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs text-left justify-start h-auto py-2 px-3"
                          onClick={() => setBusinessDescription("I'm a business attorney who generates custom operating agreements for LLCs with different member structures, profit distributions, management styles, and exit strategies across various industries")}
                          disabled={isProcessing}
                        >
                          LLC Operating Agreement Generator
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs text-left justify-start h-auto py-2 px-3"
                          onClick={() => setBusinessDescription("I create custom employee handbooks for growing companies that need policies covering remote work, PTO, performance reviews, and compliance requirements specific to their industry and state")}
                          disabled={isProcessing}
                        >
                          Employee Handbook Generator
                        </Button>
                      </div>
                    </div>

                    {/* Diagnostic Tests */}
                    <div className="border-l-2 border-red-500 pl-3">
                      <div className="text-xs font-medium text-red-600 mb-1">DIAGNOSTIC</div>
                      <div className="space-y-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs text-left justify-start h-auto py-2 px-3"
                          onClick={() => setBusinessDescription("I audit e-commerce stores' conversion optimization across product pages, checkout flow, mobile experience, and abandoned cart recovery with specific improvement recommendations and priority rankings")}
                          disabled={isProcessing}
                        >
                          E-commerce Conversion Audit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs text-left justify-start h-auto py-2 px-3"
                          onClick={() => setBusinessDescription("I evaluate manufacturing companies' operational efficiency by analyzing production workflows, inventory management, quality control, and supply chain vulnerabilities")}
                          disabled={isProcessing}
                        >
                          Manufacturing Efficiency Analysis
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={runSurgicalPipeline}
                  disabled={isProcessing || !businessDescription.trim()}
                  className="w-full"
                >
                  {isProcessing ? 'Processing...' : 'Generate Tool'}
                </Button>
                
                {processError && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded text-destructive text-sm">
                    {processError}
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Sample Tools */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">📋 Sample Templates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {sampleTools.map(tool => (
                  <div
                    key={tool.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors \${
                      selectedTool?.id === tool.id 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-border/70 hover:bg-accent/50'
                    }`}
                    onClick={() => loadTool(tool)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-sm text-foreground">{tool.title}</h3>
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {tool.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Lead Capture: {tool.leadCapture.trigger}
                    </p>
                    <p className="text-xs text-primary">
                      {tool.leadCapture.incentive}
                    </p>
                  </div>
                ))}
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setSelectedTool(null)}
                >
                  Clear Selection
                </Button>
              </CardContent>
            </Card>
          </div>
          
          {/* Tool Renderer */}
          <div className="lg:col-span-2">
            <ToolRenderer 
              tool={selectedTool as Tool}
              isLoading={isLoading}
              className="min-h-[600px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}