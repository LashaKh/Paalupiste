import React from 'react';
import { 
  Scissors, Sliders, Music, Type, Smile, 
  Film, Camera, Video, FileVideo, Download
} from 'lucide-react';

interface EditingToolbarProps {
  selectedTool: string;
  onSelectTool: (tool: string) => void;
}

const tools = [
  { id: 'media', label: 'Media', icon: FileVideo },
  { id: 'basic', label: 'Edit', icon: Scissors },
  { id: 'visual', label: 'Effects', icon: Sliders },
  { id: 'transitions', label: 'Trans', icon: Film },
  { id: 'audio', label: 'Audio', icon: Music },
  { id: 'text', label: 'Text', icon: Type },
  { id: 'stickers', label: 'Stckrs', icon: Smile },
  { id: 'export', label: 'Export', icon: Download },
];

export default function EditingToolbar({ selectedTool, onSelectTool }: EditingToolbarProps) {
  return (
    <div className="bg-gray-800 text-white">
      <div className="flex overflow-x-auto hide-scrollbar">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={() => onSelectTool(tool.id)}
              className={`px-0.5 py-0.5 flex-1 flex flex-col items-center justify-center text-[7px] font-medium transition-colors ${
                selectedTool === tool.id
                  ? 'bg-primary text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              <Icon className="w-2.5 h-2.5 mb-0.5" />
              {tool.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}