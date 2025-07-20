// @ts-nocheck - Template literals contain valid JSX code
import { convertToThemeAware } from '@/lib/utils/theme-conversion';
import type { TemplateExample } from '@/lib/types/tool';

export const SERVICE_PROPOSAL_TEMPLATE: TemplateExample = {
  id: 'form-001',
  title: 'Service Proposal Generator',
  type: 'form',
  description: 'Professional service proposal generation with cost estimation',
  industry: 'consulting',
  componentCode: convertToThemeAware(`
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ServiceProposal() {
  const [formData, setFormData] = useState({
    clientName: '',
    companyName: '',
    serviceType: '',
    projectScope: '',
    budget: '',
    timeline: '',
    requirements: ''
  });
  const [proposal, setProposal] = useState<any>(null);

  const serviceOptions = [
    { value: 'web-development', label: 'Web Development' },
    { value: 'mobile-app', label: 'Mobile App Development' },
    { value: 'design', label: 'UI/UX Design' },
    { value: 'marketing', label: 'Digital Marketing' },
    { value: 'consulting', label: 'Business Consulting' }
  ];

  const timelineOptions = [
    { value: '1-2-weeks', label: '1-2 weeks' },
    { value: '1-month', label: '1 month' },
    { value: '2-3-months', label: '2-3 months' },
    { value: '3-6-months', label: '3-6 months' },
    { value: '6-months-plus', label: '6+ months' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateProposal = () => {
    const estimatedCost = calculateEstimatedCost(formData.serviceType, formData.budget);
    const deliverables = getDeliverables(formData.serviceType);
    
    const proposalData = {
      clientInfo: {
        name: formData.clientName,
        company: formData.companyName
      },
      projectDetails: {
        service: serviceOptions.find(opt => opt.value === formData.serviceType)?.label || formData.serviceType,
        scope: formData.projectScope,
        timeline: timelineOptions.find(opt => opt.value === formData.timeline)?.label || formData.timeline,
        requirements: formData.requirements
      },
      financials: {
        budget: formData.budget,
        estimatedCost: estimatedCost,
        paymentTerms: getPaymentTerms(estimatedCost)
      },
      deliverables: deliverables,
      nextSteps: getNextSteps()
    };

    setProposal(proposalData);
  };

  const calculateEstimatedCost = (serviceType: string, budget: string) => {
    const budgetNum = parseInt(budget) || 0;
    const multipliers: Record<string, number> = {
      'web-development': 1.2,
      'mobile-app': 1.5,
      'design': 0.8,
      'marketing': 1.0,
      'consulting': 1.3
    };
    
    return Math.round(budgetNum * (multipliers[serviceType] || 1.0));
  };

  const getDeliverables = (serviceType: string) => {
    const deliverables: Record<string, string[]> = {
      'web-development': [
        'Responsive website design',
        'Frontend and backend development',
        'Content management system',
        'SEO optimization',
        'Testing and deployment'
      ],
      'mobile-app': [
        'App design and wireframes',
        'iOS and Android development',
        'App store optimization',
        'Testing and quality assurance',
        'Deployment and launch support'
      ],
      'design': [
        'User research and analysis',
        'Wireframes and prototypes',
        'Visual design system',
        'Interactive prototypes',
        'Design documentation'
      ],
      'marketing': [
        'Marketing strategy plan',
        'Content creation',
        'Social media management',
        'Analytics and reporting',
        'Campaign optimization'
      ],
      'consulting': [
        'Business analysis',
        'Strategic recommendations',
        'Implementation roadmap',
        'Performance metrics',
        'Ongoing support'
      ]
    };
    
    return deliverables[serviceType] || ['Custom deliverables based on requirements'];
  };

  const getPaymentTerms = (cost: number) => {
    if (cost < 5000) return '50% upfront, 50% upon completion';
    if (cost < 20000) return '30% upfront, 40% at milestone, 30% upon completion';
    return '25% upfront, 25% at each milestone, 25% upon completion';
  };

  const getNextSteps = () => [
    'Review and approve proposal',
    'Sign service agreement',
    'Initial project kickoff meeting',
    'Begin project execution',
    'Regular progress updates'
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Service Proposal Generator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name</Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) => handleInputChange('clientName', e.target.value)}
                  placeholder="Enter client name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="Enter company name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="serviceType">Service Type</Label>
                <Select value={formData.serviceType} onValueChange={(value) => handleInputChange('serviceType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="budget">Budget Range ($)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', e.target.value)}
                  placeholder="Enter budget amount"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="timeline">Project Timeline</Label>
                <Select value={formData.timeline} onValueChange={(value) => handleInputChange('timeline', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timeline" />
                  </SelectTrigger>
                  <SelectContent>
                    {timelineOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="projectScope">Project Scope</Label>
              <Textarea
                id="projectScope"
                value={formData.projectScope}
                onChange={(e) => handleInputChange('projectScope', e.target.value)}
                placeholder="Describe the project scope and objectives"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="requirements">Specific Requirements</Label>
              <Textarea
                id="requirements"
                value={formData.requirements}
                onChange={(e) => handleInputChange('requirements', e.target.value)}
                placeholder="List any specific requirements or constraints"
                rows={3}
              />
            </div>
          </div>
          
          <Button 
            onClick={generateProposal} 
            disabled={!formData.clientName || !formData.serviceType || !formData.budget}
            className="w-full"
          >
            Generate Proposal
          </Button>

          {proposal && (
            <div className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Proposal Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">Client Information</h4>
                      <p><strong>Name:</strong> {proposal.clientInfo.name}</p>
                      <p><strong>Company:</strong> {proposal.clientInfo.company}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Project Details</h4>
                      <p><strong>Service:</strong> {proposal.projectDetails.service}</p>
                      <p><strong>Timeline:</strong> {proposal.projectDetails.timeline}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Financial Summary</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Budget</p>
                        <p className="text-lg font-bold">${proposal.financials.budget}</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Estimated Cost</p>
                        <p className="text-lg font-bold">${proposal.financials.estimatedCost}</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Payment Terms</p>
                        <p className="text-sm">{proposal.financials.paymentTerms}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Deliverables</h4>
                    <ul className="space-y-1">
                      {proposal.deliverables.map((deliverable: string, index: number) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-primary">•</span>
                          <span>{deliverable}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Next Steps</h4>
                    <ol className="space-y-1">
                      {proposal.nextSteps.map((step: string, index: number) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-primary font-bold">{index + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
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
`),
  styling: {
    theme: 'auto',
    industry: 'consulting',
    colorScheme: {
      primary: '#1e40af',
      secondary: '#1e3a8a',
      accent: '#3b82f6',
      background: '#ffffff',
      surface: '#eff6ff',
      text: {
        primary: '#1f2937',
        secondary: '#6b7280',
        muted: '#9ca3af'
      },
      border: '#bfdbfe',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626'
    },
    contrastValidated: true
  },
  mockData: {
    sampleService: 'web-development',
    sampleBudget: 10000,
    sampleTimeline: '2-3-months',
    expectedCost: 12000
  },
  leadCapture: { 
    emailRequired: true, 
    trigger: 'before_results', 
    incentive: 'Generate your custom proposal' 
  }
}; 