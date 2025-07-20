// @ts-nocheck - Template literals contain valid JSX code
import { convertToThemeAware } from '@/lib/utils/theme-conversion';
import type { TemplateExample } from '@/lib/types/tool';

export const MARKETING_PLANNER_TEMPLATE: TemplateExample = {
  id: 'planner-001',
  title: 'Marketing Campaign Planner',
  type: 'planner',
  description: 'Comprehensive marketing campaign planning with budget allocation',
  industry: 'marketing',
  componentCode: convertToThemeAware(`
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

export default function MarketingPlanner() {
  const [budget, setBudget] = useState(5000);
  const [duration, setDuration] = useState(30);
  const [channels, setChannels] = useState<string[]>([]);
  const [targetAudience, setTargetAudience] = useState('');
  const [results, setResults] = useState<any>(null);

  const channelOptions = [
    { value: 'social', label: 'Social Media' },
    { value: 'email', label: 'Email Marketing' },
    { value: 'ppc', label: 'Pay-Per-Click' },
    { value: 'content', label: 'Content Marketing' },
    { value: 'influencer', label: 'Influencer Marketing' }
  ];

  const handleChannelChange = (channel: string, checked: boolean) => {
    if (checked) {
      setChannels(prev => [...prev, channel]);
    } else {
      setChannels(prev => prev.filter(c => c !== channel));
    }
  };

  const generatePlan = () => {
    const dailyBudget = budget / duration;
    const channelBudget = dailyBudget / Math.max(channels.length, 1);
    
    const plan = {
      totalBudget: budget,
      duration: duration,
      dailyBudget: dailyBudget,
      channelBreakdown: channels.map(channel => ({
        channel: channelOptions.find(opt => opt.value === channel)?.label || channel,
        budget: channelBudget,
        strategy: getStrategyForChannel(channel)
      })),
      recommendations: getRecommendations(budget, duration, channels.length)
    };

    setResults(plan);
  };

  const getStrategyForChannel = (channel: string) => {
    const strategies: Record<string, string> = {
      social: 'Focus on engaging content and community building',
      email: 'Segmented campaigns with personalized messaging',
      ppc: 'Targeted keywords with A/B testing',
      content: 'SEO-optimized blog posts and videos',
      influencer: 'Partner with relevant industry influencers'
    };
    return strategies[channel] || 'Custom strategy based on channel analysis';
  };

  const getRecommendations = (budget: number, duration: number, channelCount: number) => {
    const recommendations = [];
    
    if (budget < 1000) {
      recommendations.push('Consider focusing on 1-2 channels for maximum impact');
    }
    if (duration < 14) {
      recommendations.push('Short campaigns work best with high-frequency messaging');
    }
    if (channelCount > 3) {
      recommendations.push('Multiple channels require coordinated messaging strategy');
    }
    
    return recommendations;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Marketing Campaign Planner</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="budget">Campaign Budget ($)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  placeholder="Enter total budget"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="duration">Campaign Duration (Days)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  placeholder="Enter duration in days"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="audience">Target Audience</Label>
                <Input
                  id="audience"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g., Small business owners, 25-45"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <Label>Marketing Channels</Label>
              <div className="space-y-3">
                {channelOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.value}
                      checked={channels.includes(option.value)}
                      onCheckedChange={(checked) => 
                        handleChannelChange(option.value, checked as boolean)
                      }
                    />
                    <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <Button 
            onClick={generatePlan} 
            disabled={!targetAudience || channels.length === 0}
            className="w-full"
          >
            Generate Marketing Plan
          </Button>

          {results && (
            <div className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Budget</p>
                      <p className="text-2xl font-bold">${results.totalBudget.toLocaleString()}</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Daily Budget</p>
                      <p className="text-2xl font-bold">${results.dailyBudget.toFixed(2)}</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="text-2xl font-bold">{results.duration} days</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Channel Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {results.channelBreakdown.map((channel: any, index: number) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">{channel.channel}</h4>
                          <span className="text-lg font-bold">${channel.budget.toFixed(2)}/day</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{channel.strategy}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {results.recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {results.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-primary">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
`),
  styling: {
    theme: 'auto',
    industry: 'marketing',
    colorScheme: {
      primary: '#7c3aed',
      secondary: '#6d28d9',
      accent: '#8b5cf6',
      background: '#ffffff',
      surface: '#faf5ff',
      text: {
        primary: '#1f2937',
        secondary: '#6b7280',
        muted: '#9ca3af'
      },
      border: '#e9d5ff',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626'
    },
    contrastValidated: true
  },
  mockData: {
    sampleBudget: 5000,
    sampleDuration: 30,
    sampleChannels: ['social', 'email'],
    expectedDailyBudget: 166.67
  },
  leadCapture: { 
    emailRequired: true, 
    trigger: 'after_results', 
    incentive: 'Get your complete campaign timeline and strategy' 
  }
}; 