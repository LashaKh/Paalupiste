import React from 'react';
import { Check, Eye } from 'lucide-react';

interface BrochureTemplateProps {
  id: string;
  name: string;
  preview: string;
  selected: boolean;
  onSelect: (id: string) => void;
  onPreview: () => void;
}

export function BrochureTemplate({ id, name, preview, selected, onSelect, onPreview }: BrochureTemplateProps) {
  return (
    <div
      className={`relative cursor-pointer group rounded-lg overflow-hidden border-2 transition-all duration-200 flex-shrink-0 w-48 h-64 snap-start ${
        selected ? 'border-primary shadow-lg scale-[1.02]' : 'border-gray-200 hover:border-primary/50'
      }`}
    >
      {/* Preview Image */}
      <div 
        className="absolute inset-0"
        style={{ 
          backgroundImage: `url(${preview})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Template Name */}
      <div className="absolute inset-x-0 bottom-0 p-4">
        <h3 className="text-white font-medium text-sm">{name}</h3>
      </div>

      {/* Selection Indicator */}
      {selected && (
        <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
          <Check className="w-4 h-4" />
        </div>
      )}

      {/* Action Buttons */}
      <div className={`absolute inset-0 bg-primary/20 backdrop-blur-sm transition-opacity duration-200 flex items-center justify-center gap-2 ${
        selected ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'
      }`}>
        <button
          onClick={onPreview}
          className="bg-white text-primary text-sm font-medium px-3 py-1.5 rounded-lg shadow-lg transform transition-transform duration-200 hover:scale-105 flex items-center"
        >
          <Eye className="w-4 h-4 mr-1.5" />
          Preview
        </button>
        <button
          onClick={() => onSelect(id)}
          className="bg-white text-primary text-sm font-medium px-3 py-1.5 rounded-lg shadow-lg transform transition-transform duration-200 hover:scale-105"
        >
          Select Template
        </button>
      </div>
    </div>
  );
}