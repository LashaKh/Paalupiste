import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Repeat } from 'lucide-react';

export interface InstructionStep {
  icon: React.ElementType;
  title: string;
  description: string;
}

interface InstructionsProps {
  title: string;
  steps: InstructionStep[];
}

export function Instructions({ title, steps }: InstructionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed right-4 top-20 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center px-4 py-2 rounded-lg bg-white border border-gray-200 shadow-lg text-gray-700 hover:bg-gray-50 transition-colors hover:scale-105 transform duration-200"
      >
        <HelpCircle className="h-5 w-5 mr-2" />
        Instructions
        {isOpen ? (
          <ChevronUp className="h-4 w-4 ml-2" />
        ) : (
          <ChevronDown className="h-4 w-4 ml-2" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-200 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <ChevronUp className="h-5 w-5" />
            </button>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Repeat className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-blue-900">Shared Ideas System</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Generated ideas are shared across all content types. You can use any saved idea to create articles, social media posts, or newsletters.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{`${index + 1}. ${step.title}`}</h4>
                    <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Tip: Access your saved ideas from any content generation page through the Ideas sidebar. Ideas you generate or save can be used to create any type of content.
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 