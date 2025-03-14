import React from 'react';
import { Sparkles, FileText, Send } from 'lucide-react';
import { Instructions, InstructionStep } from './Instructions';

export function ArticleInstructions() {
  const steps: InstructionStep[] = [
    {
      icon: Sparkles,
      title: 'Generate Ideas',
      description: 'Start by clicking "Generate Ideas" to get content theme suggestions. These ideas can be used across all content types - articles, social posts, and newsletters.'
    },
    {
      icon: FileText,
      title: 'Generate Outline',
      description: 'Select an idea and click "Generate Outline". This will create a structured outline for your article that you can review and edit.'
    },
    {
      icon: Send,
      title: 'Generate Article',
      description: 'Once you\'re happy with the outline, click "Generate Article" to create the full article. The generated article will appear in your Articles sidebar.'
    }
  ];

  return <Instructions title="How to Generate Articles" steps={steps} />;
} 