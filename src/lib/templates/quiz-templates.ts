import { convertToThemeAware } from '@/lib/utils/theme-conversion';
import type { TemplateExample } from '@/lib/types/tool';

export const HEALTH_QUIZ_TEMPLATE: TemplateExample = {
  id: 'quiz-001',
  title: 'Health Assessment Quiz',
  type: 'quiz',
  description: 'Interactive health quiz with professional medical styling',
  industry: 'healthcare',
  componentCode: convertToThemeAware(`
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface Question {
  id: number;
  text: string;
  options: { value: string; label: string; score: number }[];
}

const questions: Question[] = [
  {
    id: 1,
    text: "How often do you exercise?",
    options: [
      { value: "never", label: "Never", score: 1 },
      { value: "rarely", label: "Rarely (1-2 times/month)", score: 2 },
      { value: "sometimes", label: "Sometimes (1-2 times/week)", score: 3 },
      { value: "regularly", label: "Regularly (3+ times/week)", score: 4 }
    ]
  },
  {
    id: 2,
    text: "How would you rate your sleep quality?",
    options: [
      { value: "poor", label: "Poor (< 6 hours)", score: 1 },
      { value: "fair", label: "Fair (6-7 hours)", score: 2 },
      { value: "good", label: "Good (7-8 hours)", score: 3 },
      { value: "excellent", label: "Excellent (8+ hours)", score: 4 }
    ]
  },
  {
    id: 3,
    text: "How often do you eat fruits and vegetables?",
    options: [
      { value: "rarely", label: "Rarely", score: 1 },
      { value: "sometimes", label: "Sometimes", score: 2 },
      { value: "often", label: "Often", score: 3 },
      { value: "daily", label: "Daily", score: 4 }
    ]
  }
];

export default function HealthQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);

  const handleAnswer = (questionId: number, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const calculateScore = () => {
    let totalScore = 0;
    let maxScore = 0;
    
    questions.forEach(question => {
      const answer = answers[question.id];
      if (answer) {
        const option = question.options.find(opt => opt.value === answer);
        if (option) {
          totalScore += option.score;
        }
      }
      maxScore += Math.max(...question.options.map(opt => opt.score));
    });

    const percentage = (totalScore / maxScore) * 100;
    
    if (percentage >= 80) return { level: 'Excellent', description: 'You have excellent health habits!' };
    if (percentage >= 60) return { level: 'Good', description: 'You have good health habits with room for improvement.' };
    if (percentage >= 40) return { level: 'Fair', description: 'Your health habits need some attention.' };
    return { level: 'Poor', description: 'Your health habits need significant improvement.' };
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  if (showResults) {
    const result = calculateScore();
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Your Health Assessment Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="text-4xl font-bold text-primary">{result.level}</div>
              <p className="text-lg text-muted-foreground">{result.description}</p>
              <div className="mt-6">
                <Button onClick={() => window.location.reload()} className="w-full">
                  Take Quiz Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Health Assessment Quiz</CardTitle>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300" 
              style={{ width: progress + '%' }}
            />
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Question {currentQuestion + 1} of {questions.length}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{currentQ.text}</h3>
            <RadioGroup 
              value={answers[currentQ.id] || ''} 
              onValueChange={(value) => handleAnswer(currentQ.id, value)}
            >
              {currentQ.options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <Button 
            onClick={nextQuestion} 
            disabled={!answers[currentQ.id]}
            className="w-full"
          >
            {currentQuestion === questions.length - 1 ? 'See Results' : 'Next Question'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
`),
  styling: {
    theme: 'auto',
    industry: 'healthcare',
    colorScheme: {
      primary: '#059669',
      secondary: '#047857',
      accent: '#10b981',
      background: '#ffffff',
      surface: '#f0fdf4',
      text: {
        primary: '#1f2937',
        secondary: '#6b7280',
        muted: '#9ca3af'
      },
      border: '#d1fae5',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626'
    },
    contrastValidated: true
  },
  mockData: {
    options: {
      questionCount: ['3', '5', '7', '10'],
      difficultyLevel: ['easy', 'medium', 'hard'],
      resultTypes: ['score', 'level', 'detailed']
    },
    defaults: {
      questionCount: 5,
      difficultyLevel: 'medium',
      resultType: 'level'
    },
    calculations: {
      passingScore: 70,
      timePerQuestion: 30,
      totalTime: 150
    },
    metadata: {
      category: 'healthcare',
      version: '1.0',
      lastUpdated: '2024-01-01'
    }
  },
  leadCapture: { 
    emailRequired: true, 
    trigger: 'after_results', 
    incentive: 'Get your personalized health improvement plan' 
  }
}; 