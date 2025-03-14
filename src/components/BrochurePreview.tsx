import React from 'react';
import { X } from 'lucide-react';

interface BrochurePreviewProps {
  content: string;
  onClose: () => void;
}

export function BrochurePreview({ content, onClose }: BrochurePreviewProps) {
  return (
    <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="brochure-preview" role="dialog">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative h-full flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-4xl h-[85vh] rounded-xl shadow-2xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Brochure Preview</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Preview Content */}
          <div className="flex-1 overflow-auto p-8">
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}