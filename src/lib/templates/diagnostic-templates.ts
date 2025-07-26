// @ts-nocheck - Template literals contain valid JSX code
/**
 * Diagnostic Template Examples for Keyvex Revamped
 * Demonstrates: Diagnostic assessment, scoring system, technical industry colors
 */

import { convertToThemeAware } from '@/lib/utils/theme-conversion';
import type { TemplateExample, DiagnosticResults, DiagnosticTest } from '@/lib/types/tool';

const getDiagnosticComponentCode = () => convertToThemeAware(`
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

export default function WebsiteDiagnostic() {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [auditType, setAuditType] = useState('');
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [results, setResults] = useState<DiagnosticResults | null>(null);

  const auditTypes = [
    { value: 'performance', label: 'Performance Audit' },
    { value: 'seo', label: 'SEO Audit' },
    { value: 'accessibility', label: 'Accessibility Audit' },
    { value: 'security', label: 'Security Audit' },
    { value: 'comprehensive', label: 'Comprehensive Audit' }
  ];

  const testOptions = [
    { value: 'load-time', label: 'Page Load Time', category: 'performance' },
    { value: 'core-web-vitals', label: 'Core Web Vitals', category: 'performance' },
    { value: 'mobile-friendly', label: 'Mobile Friendliness', category: 'performance' },
    { value: 'meta-tags', label: 'Meta Tags', category: 'seo' },
    { value: 'headings', label: 'Heading Structure', category: 'seo' },
    { value: 'images', label: 'Image Optimization', category: 'seo' },
    { value: 'alt-text', label: 'Alt Text', category: 'accessibility' },
    { value: 'contrast', label: 'Color Contrast', category: 'accessibility' },
    { value: 'keyboard', label: 'Keyboard Navigation', category: 'accessibility' },
    { value: 'ssl', label: 'SSL Certificate', category: 'security' },
    { value: 'headers', label: 'Security Headers', category: 'security' }
  ];

  const handleTestChange = (test: string, checked: boolean) => {
    if (checked) {
      setSelectedTests(prev => [...prev, test]);
    } else {
      setSelectedTests(prev => prev.filter(t => t !== test));
    }
  };

  const runAudit = () => {
    const auditResults = {
      url: websiteUrl,
      auditType: auditTypes.find(type => type.value === auditType)?.label || auditType,
      timestamp: new Date().toISOString(),
      overallScore: calculateOverallScore(),
      tests: selectedTests.map(test => {
        const testOption = testOptions.find(opt => opt.value === test);
        return {
          name: testOption?.label || test,
          category: testOption?.category || 'general',
          score: Math.floor(Math.random() * 40) + 60, // Simulated score 60-100
          status: Math.random() > 0.3 ? 'pass' : 'fail',
          issues: generateIssues(test),
          recommendations: generateRecommendations(test)
        };
      }),
      summary: generateSummary()
    };

    setResults(auditResults);
  };

  const calculateOverallScore = () => {
    return Math.floor(Math.random() * 30) + 70; // Simulated score 70-100
  };

  const generateIssues = (test: string) => {
    const issues: Record<string, string[]> = {
      'load-time': [
        'Page load time exceeds 3 seconds',
        'Large image files not optimized',
        'JavaScript blocking rendering'
      ],
      'core-web-vitals': [
        'Largest Contentful Paint (LCP) > 2.5s',
        'First Input Delay (FID) > 100ms',
        'Cumulative Layout Shift (CLS) > 0.1'
      ],
      'meta-tags': [
        'Missing meta description',
        'Incomplete Open Graph tags',
        'No canonical URL specified'
      ],
      'images': [
        'Images missing alt text',
        'Images not using WebP format',
        'Images not properly sized'
      ],
      'ssl': [
        'SSL certificate expired',
        'Mixed content warnings',
        'Insecure HTTP resources'
      ]
    };
    
    return issues[test] || ['General optimization needed'];
  };

  const generateRecommendations = (test: string) => {
    const recommendations: Record<string, string[]> = {
      'load-time': [
        'Optimize and compress images',
        'Minify CSS and JavaScript',
        'Enable browser caching'
      ],
      'core-web-vitals': [
        'Optimize server response times',
        'Reduce JavaScript execution time',
        'Prevent layout shifts during loading'
      ],
      'meta-tags': [
        'Add compelling meta descriptions',
        'Implement complete Open Graph tags',
        'Set up canonical URLs'
      ],
      'images': [
        'Add descriptive alt text to all images',
        'Convert images to WebP format',
        'Implement responsive images'
      ],
      'ssl': [
        'Renew SSL certificate',
        'Fix mixed content issues',
        'Redirect HTTP to HTTPS'
      ]
    };
    
    return recommendations[test] || ['Review and optimize based on best practices'];
  };

  const generateSummary = () => {
    const passedTests = results?.tests.filter((test: DiagnosticTest) => test.status === 'pass').length || 0;
    const totalTests = results?.tests.length || 0;
    
    return {
      totalTests,
      passedTests,
      failedTests: totalTests - passedTests,
      priority: results?.overallScore > 90 ? 'Low' : results?.overallScore > 70 ? 'Medium' : 'High',
      estimatedTime: Math.ceil((totalTests - passedTests) * 2) // 2 hours per failed test
    };
  };

  const getTestsByCategory = () => {
    const categories: Record<string, DiagnosticTest[]> = {};
    testOptions.forEach(test => {
      if (!categories[test.category]) {
        categories[test.category] = [];
      }
      categories[test.category].push(test);
    });
    return categories;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Website Performance Audit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="websiteUrl">Website URL</Label>
                <Input
                  id="websiteUrl"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="auditType">Audit Type</Label>
                <Select value={auditType} onValueChange={setAuditType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select audit type" />
                  </SelectTrigger>
                  <SelectContent>
                    {auditTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-4">
              <Label>Select Tests</Label>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {Object.entries(getTestsByCategory()).map(([category, tests]) => (
                  <div key={category} className="space-y-2">
                    <h4 className="font-semibold text-sm capitalize">{category}</h4>
                    {tests.map((test) => (
                      <div key={test.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={test.value}
                          checked={selectedTests.includes(test.value)}
                          onCheckedChange={(checked) => 
                            handleTestChange(test.value, checked as boolean)
                          }
                        />
                        <Label htmlFor={test.value} className="flex-1 cursor-pointer text-sm">
                          {test.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <Button 
            onClick={runAudit} 
            disabled={!websiteUrl || selectedTests.length === 0}
            className="w-full"
          >
            Run Website Audit
          </Button>

          {results && (
            <div className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Audit Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Overall Score</p>
                      <p className="text-3xl font-bold text-primary">{results.overallScore}/100</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Tests Run</p>
                      <p className="text-2xl font-bold">{results.tests.length}</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Passed</p>
                      <p className="text-2xl font-bold text-green-600">
                        {results.tests.filter((test: DiagnosticTest) => test.status === 'pass').length}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Failed</p>
                      <p className="text-2xl font-bold text-red-600">
                        {results.tests.filter((test: DiagnosticTest) => test.status === 'fail').length}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold">Test Results</h4>
                    {results.tests.map((test: DiagnosticTest, index: number) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-medium">{test.name}</h5>
                          <div className="flex items-center space-x-2">
                            <span className={'px-2 py-1 rounded text-xs font-medium ' + 
                              (test.status === 'pass' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')
                            }>
                              {test.status.toUpperCase()}
                            </span>
                            <span className="text-sm font-bold">{test.score}/100</span>
                          </div>
                        </div>
                        
                        {test.status === 'fail' && (
                          <div className="space-y-2">
                            <div>
                              <h6 className="text-sm font-medium text-red-600">Issues Found:</h6>
                              <ul className="text-sm space-y-1">
                                {test.issues.map((issue: string, i: number) => (
                                  <li key={i} className="flex items-start space-x-2">
                                    <span className="text-red-500">•</span>
                                    <span>{issue}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h6 className="text-sm font-medium text-blue-600">Recommendations:</h6>
                              <ul className="text-sm space-y-1">
                                {test.recommendations.map((rec: string, i: number) => (
                                  <li key={i} className="flex items-start space-x-2">
                                    <span className="text-blue-500">•</span>
                                    <span>{rec}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Action Summary</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p><strong>Priority:</strong> {generateSummary().priority}</p>
                      </div>
                      <div>
                        <p><strong>Estimated Time:</strong> {generateSummary().estimatedTime} hours</p>
                      </div>
                      <div>
                        <p><strong>Next Steps:</strong> Focus on failed tests first</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
`);

export const WEBSITE_DIAGNOSTIC_TEMPLATE: TemplateExample = {
  id: 'diagnostic-001',
  title: 'Website Performance Audit',
  type: 'diagnostic',
  description: 'Comprehensive website performance assessment and improvement recommendations',
  industry: 'technology',
  get componentCode() {
    return getDiagnosticComponentCode();
  },
  styling: {
    theme: 'auto',
    industry: 'technology',
    colorScheme: {
      primary: '#dc2626',
      secondary: '#b91c1c',
      accent: '#ef4444',
      background: '#ffffff',
      surface: '#fef2f2',
      text: {
        primary: '#1f2937',
        secondary: '#6b7280',
        muted: '#9ca3af'
      },
      border: '#fecaca',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626'
    },
    contrastValidated: true
  },
  mockData: {
    sampleUrl: 'https://example.com',
    sampleAuditType: 'comprehensive',
    sampleTests: ['load-time', 'core-web-vitals', 'meta-tags'],
    expectedScore: 85
  },
  leadCapture: { 
    emailRequired: true, 
    trigger: 'after_results', 
    incentive: 'Get your detailed improvement plan' 
  }
}; 