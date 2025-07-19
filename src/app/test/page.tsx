'use client';

import { useState } from 'react';
import { ToolRenderer } from '@/components/canvas/tool-renderer';
import { Tool } from '@/lib/types/tool';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';

/**
 * Tool Testing Page - Immediate visualization and testing
 */
export default function TestPage() {
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Sample tools for testing
  const sampleTools: Tool[] = [
    {
      id: 'calc-001',
      title: 'Solar Panel Savings Calculator',
      type: 'calculator',
      componentCode: `
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
}`,
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
      componentCode: `
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
}`,
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
  
  return (
    <div className="relative min-h-screen bg-background text-foreground p-6">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Tool Testing Lab</h1>
          <p className="text-muted-foreground">Test and visualize tool templates</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tool Selection Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Available Tools</CardTitle>
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