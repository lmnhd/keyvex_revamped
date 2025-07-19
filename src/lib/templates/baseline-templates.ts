/**
 * Baseline Template Examples for Keyvex Revamped
 * These demonstrate the 5 core tool types with proper styling standards
 * CRITICAL: All inputs use theme-aware classes to prevent invisible text
 */

import { TemplateExample } from '@/lib/types/tool';

/**
 * Financial Calculator Template
 * Demonstrates: Theme-aware inputs, proper contrast, industry-appropriate colors
 */
export const FINANCIAL_CALCULATOR_TEMPLATE: TemplateExample = {
  id: 'financial-calculator-baseline',
  type: 'calculator',
  title: 'Investment ROI Calculator',
  description: 'Calculate return on investment with professional financial styling',
  industry: 'finance',
  componentCode: `
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function InvestmentROICalculator() {
  const [initialInvestment, setInitialInvestment] = useState('');
  const [finalValue, setFinalValue] = useState('');
  const [timeYears, setTimeYears] = useState('');
  const [results, setResults] = useState(null);

  const calculateROI = () => {
    const initial = parseFloat(initialInvestment);
    const final = parseFloat(finalValue);
    const years = parseFloat(timeYears);
    
    if (initial && final && years) {
      const totalReturn = ((final - initial) / initial) * 100;
      const annualReturn = Math.pow(final / initial, 1 / years) - 1;
      const profit = final - initial;
      
      setResults({
        totalReturn: totalReturn.toFixed(2),
        annualReturn: (annualReturn * 100).toFixed(2),
        profit: profit.toFixed(2)
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Card */}
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-0 shadow-xl mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Investment ROI Calculator</CardTitle>
            <p className="text-blue-100">Calculate your investment returns with precision</p>
          </CardHeader>
        </Card>

        {/* Main Tool Card */}
        <Card className="bg-card text-card-foreground border-border shadow-2xl">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Input Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Investment Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label className="block text-sm font-semibold text-foreground uppercase tracking-wide mb-3">
                      Initial Investment ($)
                    </Label>
                    <Input
                      type="number"
                      value={initialInvestment}
                      onChange={(e) => setInitialInvestment(e.target.value)}
                      placeholder="10000"
                      className="max-w-32 text-foreground bg-background border-border focus:ring-ring focus:border-ring"
                    />
                  </div>
                  
                  <div>
                    <Label className="block text-sm font-semibold text-foreground uppercase tracking-wide mb-3">
                      Final Value ($)
                    </Label>
                    <Input
                      type="number"
                      value={finalValue}
                      onChange={(e) => setFinalValue(e.target.value)}
                      placeholder="15000"
                      className="max-w-32 text-foreground bg-background border-border focus:ring-ring focus:border-ring"
                    />
                  </div>
                  
                  <div>
                    <Label className="block text-sm font-semibold text-foreground uppercase tracking-wide mb-3">
                      Time Period (Years)
                    </Label>
                    <Input
                      type="number"
                      value={timeYears}
                      onChange={(e) => setTimeYears(e.target.value)}
                      placeholder="5"
                      className="max-w-16 text-foreground bg-background border-border focus:ring-ring focus:border-ring"
                    />
                  </div>
                </div>
              </div>

              {/* Results Section */}
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-foreground">Calculate Returns</h3>
                  <Button
                    onClick={calculateROI}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow-lg transition-all duration-200 hover:scale-105"
                  >
                    Calculate ROI
                  </Button>
                </div>

                {results && (
                  <div className="grid grid-cols-1 gap-4">
                    <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200 shadow-lg">
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl font-bold text-emerald-600 mb-2">
                          {results.totalReturn}%
                        </div>
                        <div className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">
                          Total Return
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 shadow-lg">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600 mb-2">
                          {results.annualReturn}%
                        </div>
                        <div className="text-sm font-semibold text-blue-700 uppercase tracking-wide">
                          Annual Return
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200 shadow-lg">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600 mb-2">
                          ${results.profit}
                        </div>
                        <div className="text-sm font-semibold text-purple-700 uppercase tracking-wide">
                          Total Profit
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}`,
  styling: {
    theme: 'auto',
    industry: 'finance',
    colorScheme: {
      primary: '#2563eb', // blue-600
      secondary: '#4f46e5', // indigo-700
      accent: '#059669', // emerald-600
      background: '#ffffff',
      surface: '#f8fafc',
      text: {
        primary: '#1f2937', // gray-800
        secondary: '#6b7280', // gray-500
        muted: '#9ca3af' // gray-400
      },
      border: '#e5e7eb', // gray-200
      success: '#059669', // emerald-600
      warning: '#d97706', // amber-600
      error: '#dc2626' // red-600
    },
    contrastValidated: true
  },
  mockData: {
    sampleInvestment: 10000,
    sampleFinalValue: 15000,
    sampleYears: 5,
    expectedROI: 50
  },
  leadCapture: {
    emailRequired: true,
    trigger: 'after_results',
    incentive: 'Get your detailed investment analysis report'
  }
};

/**
 * Health Quiz Template
 * Demonstrates: Multi-step interaction, progress tracking, health industry colors
 */
export const HEALTH_QUIZ_TEMPLATE: TemplateExample = {
  id: 'health-quiz-baseline',
  type: 'quiz',
  title: 'Health Risk Assessment',
  description: 'Interactive health quiz with professional medical styling',
  industry: 'healthcare',
  componentCode: `
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function HealthRiskAssessment() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);

  const questions = [
    {
      id: 'age',
      question: 'What is your age range?',
      options: [
        { value: 1, label: '18-30 years', score: 1 },
        { value: 2, label: '31-45 years', score: 2 },
        { value: 3, label: '46-60 years', score: 3 },
        { value: 4, label: '60+ years', score: 4 }
      ]
    },
    {
      id: 'exercise',
      question: 'How often do you exercise?',
      options: [
        { value: 1, label: 'Daily', score: 1 },
        { value: 2, label: '3-4 times per week', score: 2 },
        { value: 3, label: '1-2 times per week', score: 3 },
        { value: 4, label: 'Rarely or never', score: 4 }
      ]
    },
    {
      id: 'diet',
      question: 'How would you describe your diet?',
      options: [
        { value: 1, label: 'Very healthy', score: 1 },
        { value: 2, label: 'Mostly healthy', score: 2 },
        { value: 3, label: 'Average', score: 3 },
        { value: 4, label: 'Poor', score: 4 }
      ]
    }
  ];

  const handleAnswer = (score) => {
    const newAnswers = {
      ...answers,
      [questions[currentQuestion].id]: score
    };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResults(newAnswers);
    }
  };

  const calculateResults = (finalAnswers) => {
    const totalScore = Object.values(finalAnswers).reduce((sum, score) => sum + score, 0);
    const maxScore = questions.length * 4;
    const percentage = ((maxScore - totalScore) / (maxScore - questions.length)) * 100;
    
    let riskLevel = 'Low';
    let color = 'text-emerald-600';
    let bgColor = 'from-emerald-50 to-green-50';
    
    if (percentage < 40) {
      riskLevel = 'High';
      color = 'text-red-600';
      bgColor = 'from-red-50 to-rose-50';
    } else if (percentage < 70) {
      riskLevel = 'Moderate';
      color = 'text-amber-600';
      bgColor = 'from-amber-50 to-orange-50';
    }

    setResults({
      score: Math.round(percentage),
      riskLevel,
      color,
      bgColor
    });
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setResults(null);
  };

  if (results) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-gradient-to-r from-cyan-600 to-teal-700 text-white border-0 shadow-xl mb-8">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Health Assessment Results</CardTitle>
              <p className="text-cyan-100">Your personalized health risk evaluation</p>
            </CardHeader>
          </Card>

          <Card className="bg-card text-card-foreground border-border shadow-2xl">
            <CardContent className="p-8 text-center">
              <Card className={\`bg-gradient-to-br \${results.bgColor} border-2 shadow-lg mb-6\`}>
                <CardContent className="p-6">
                  <div className={\`text-5xl font-bold \${results.color} mb-4\`}>
                    {results.score}%
                  </div>
                  <div className={\`text-xl font-semibold \${results.color} mb-2\`}>
                    Health Score
                  </div>
                  <div className={\`text-lg font-semibold \${results.color.replace('600', '700')}\`}>
                    {results.riskLevel} Risk
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Based on your responses, your overall health risk is {results.riskLevel.toLowerCase()}.
                </p>
                <Button
                  onClick={resetQuiz}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold px-6 py-2 rounded-lg shadow-lg"
                >
                  Take Quiz Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-gradient-to-r from-cyan-600 to-teal-700 text-white border-0 shadow-xl mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Health Risk Assessment</CardTitle>
            <p className="text-cyan-100">Answer a few questions to evaluate your health risks</p>
          </CardHeader>
        </Card>

        <Card className="bg-card text-card-foreground border-border shadow-2xl">
          <CardContent className="p-8">
            <div className="mb-6">
              <div className="text-sm text-muted-foreground mb-2">
                Question {currentQuestion + 1} of {questions.length}
              </div>
              <div className="w-full bg-border rounded-full h-2">
                <div 
                  className="bg-cyan-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: \`\${((currentQuestion + 1) / questions.length) * 100}%\` }}
                ></div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-foreground">
                {questions[currentQuestion].question}
              </h3>

              <div className="space-y-3">
                {questions[currentQuestion].options.map((option) => (
                  <Button
                    key={option.value}
                    onClick={() => handleAnswer(option.score)}
                    variant="outline"
                    className="w-full justify-start text-left p-4 h-auto border-border hover:bg-accent hover:text-accent-foreground"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}`,
  styling: {
    theme: 'auto',
    industry: 'healthcare',
    colorScheme: {
      primary: '#0891b2', // cyan-600
      secondary: '#0f766e', // teal-700
      accent: '#059669', // emerald-600
      background: '#ffffff',
      surface: '#f8fafc',
      text: {
        primary: '#1f2937',
        secondary: '#6b7280',
        muted: '#9ca3af'
      },
      border: '#e5e7eb',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626'
    },
    contrastValidated: true
  },
  mockData: {
    totalQuestions: 3,
    maxScore: 100,
    categories: ['age', 'exercise', 'diet'],
    riskLevels: ['Low', 'Moderate', 'High']
  },
  leadCapture: {
    emailRequired: true,
    trigger: 'after_results',
    incentive: 'Get your personalized health improvement plan'
  }
};

/**
 * Baseline templates collection
 */
export const BASELINE_TEMPLATES: TemplateExample[] = [
  FINANCIAL_CALCULATOR_TEMPLATE,
  HEALTH_QUIZ_TEMPLATE
  // TODO: Add planner, form, and diagnostic templates
];

/**
 * Get template by type and industry
 */
export function getTemplateByType(type: string, industry?: string): TemplateExample | null {
  return BASELINE_TEMPLATES.find(template => 
    template.type === type && 
    (!industry || template.industry === industry)
  ) || BASELINE_TEMPLATES.find(template => template.type === type) || null;
}

/**
 * Get all templates for a specific industry
 */
export function getTemplatesByIndustry(industry: string): TemplateExample[] {
  return BASELINE_TEMPLATES.filter(template => template.industry === industry);
}