import React from 'react';
import { Sparkles, Mail, Send } from 'lucide-react';
import { Instructions, InstructionStep } from './Instructions';

export function NewsletterInstructions() {
  const steps: InstructionStep[] = [
    {
      icon: Sparkles,
      title: 'Generate Ideas',
      description: 'Start by clicking "Generate Ideas" to get content theme suggestions. These ideas can be used across all content types - articles, social posts, and newsletters.'
    },
    {
      icon: Mail,
      title: 'Configure Newsletter',
      description: 'Set your newsletter title and description. Add key points you want to cover to ensure the newsletter aligns with your communication goals.'
    },
    {
      icon: Send,
      title: 'Generate Newsletter',
      description: 'Once you\'ve configured your newsletter details, click "Generate Newsletter" to create your email content. The generated newsletter will appear in your Newsletters sidebar.'
    }
  ];

  return <Instructions title="How to Generate Newsletters" steps={steps} />;
} 