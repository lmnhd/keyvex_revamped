// @ts-nocheck - Template literals contain valid JSX code
import { convertToThemeAware } from '@/lib/utils/theme-conversion';
import type { TemplateExample } from '@/lib/types/tool';

const getCalculatorComponentCode = () => convertToThemeAware(`
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function FinancialCalculator() {
  const [principal, setPrincipal] = useState(10000);
  const [rate, setRate] = useState(5);
  const [time, setTime] = useState(10);
  const [calculationType, setCalculationType] = useState('compound');
  const [results, setResults] = useState(null);

  const calculateInterest = () => {
    let amount = 0;
    let interest = 0;

    if (calculationType === 'simple') {
      interest = (principal * rate * time) / 100;
      amount = principal + interest;
    } else {
      amount = principal * Math.pow(1 + rate / 100, time);
      interest = amount - principal;
    }

    setResults({ amount, interest });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Financial Calculator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="principal">Principal Amount ($)</Label>
              <Input
                id="principal"
                type="number"
                value={principal}
                onChange={(e) => setPrincipal(Number(e.target.value))}
                placeholder="Enter principal amount"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rate">Interest Rate (%)</Label>
              <Input
                id="rate"
                type="number"
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                placeholder="Enter interest rate"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time Period (Years)</Label>
              <Input
                id="time"
                type="number"
                value={time}
                onChange={(e) => setTime(Number(e.target.value))}
                placeholder="Enter time period"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="calculationType">Calculation Type</Label>
              <Select value={calculationType} onValueChange={setCalculationType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select calculation type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="simple">Simple Interest</SelectItem>
                  <SelectItem value="compound">Compound Interest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button onClick={calculateInterest} className="w-full">
            Calculate Interest
          </Button>

          {results && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Results</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-xl font-bold">\${results.amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Interest Earned</p>
                  <p className="text-xl font-bold">\${results.interest.toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
`);

export const FINANCIAL_CALCULATOR_TEMPLATE: TemplateExample = {
  id: 'calc-001',
  title: 'Financial Calculator',
  type: 'calculator',
  description: 'Calculate return on investment with professional financial styling',
  industry: 'finance',
  // @ts-ignore - Template literal contains valid JSX code
  get componentCode() {
    return getCalculatorComponentCode();
  },
  styling: {
    theme: 'auto',
    industry: 'finance',
    colorScheme: {
      primary: '#2563eb',
      secondary: '#4f46e5',
      accent: '#059669',
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
    samplePrincipal: 10000,
    sampleRate: 5,
    sampleTime: 10,
    expectedAmount: 16288.95
  },
  leadCapture: { 
    emailRequired: true, 
    trigger: 'after_results', 
    incentive: 'Get your detailed financial analysis report' 
  }
}; 