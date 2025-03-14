import React from 'react';
import { Sparkles, Share2, Send } from 'lucide-react';
import { Instructions, InstructionStep } from './Instructions';

export function SocialInstructions() {
  const steps: InstructionStep[] = [
    {
      icon: Sparkles,
      title: 'Generate Ideas',
      description: 'Start by clicking "Generate Ideas" to get content theme suggestions. These ideas can be used across all content types - articles, social posts, and newsletters.'
    },
    {
      icon: Share2,
      title: 'Select Platform',
      description: 'Choose between LinkedIn and Facebook as your target platform. Each platform has its own style and tone optimized for its audience.'
    },
    {
      icon: Send,
      title: 'Generate Post',
      description: 'Once you\'ve selected an idea and platform, click "Generate Post" to create your social media content. The generated post will appear in your Posts sidebar.'
    }
  ];

  return <Instructions title="How to Generate Social Posts" steps={steps} />;
} 