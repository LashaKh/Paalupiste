import React, { useState } from 'react';
import { VideoProject } from '../../../types/video';
import BasicEditProperties from './properties/BasicEditProperties';
import VisualEffectsProperties from './properties/VisualEffectsProperties';
import TextProperties from './properties/TextProperties';
import AudioProperties from './properties/AudioProperties';
import ExportProperties from './properties/ExportProperties';
import { AlertCircle } from 'lucide-react';

interface PropertyPanelProps {
  selectedTool: string;
  selectedClipId: string | null;
  project: VideoProject;
  updateProject: (updates: Partial<VideoProject>) => void;
  onError: (errorMessage: string) => void;
}

export default function PropertyPanel({ 
  selectedTool, 
  selectedClipId,
  project,
  updateProject,
  onError
}: PropertyPanelProps) {
  const [panelError, setPanelError] = useState<string | null>(null);

  // Get the current selected clip if any
  const selectedClip = selectedClipId 
    ? project.clips.find(clip => clip.id === selectedClipId) 
    : null;

  // Wrap updateProject to handle errors
  const safeUpdateProject = (updates: Partial<VideoProject>) => {
    try {
      updateProject(updates);
      setPanelError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update project';
      setPanelError(errorMessage);
      onError(errorMessage);
    }
  };

  // Render different property panels based on selected tool
  const renderPropertyPanel = () => {
    switch (selectedTool) {
      case 'basic':
        return (
          <BasicEditProperties 
            selectedClip={selectedClip}
            project={project}
            updateProject={safeUpdateProject}
          />
        );
      case 'visual':
        return (
          <VisualEffectsProperties 
            selectedClip={selectedClip}
            project={project}
            updateProject={safeUpdateProject}
          />
        );
      case 'audio':
        return (
          <AudioProperties 
            selectedClip={selectedClip}
            project={project}
            updateProject={safeUpdateProject}
          />
        );
      case 'text':
        return (
          <TextProperties 
            project={project}
            updateProject={safeUpdateProject}
          />
        );
      case 'export':
        return (
          <ExportProperties 
            project={project}
            updateProject={safeUpdateProject}
          />
        );
      default:
        return (
          <div className="p-4 text-center text-gray-500">
            <p>Select a tool or clip to view properties</p>
          </div>
        );
    }
  };

  const clearError = () => {
    setPanelError(null);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-3 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">Properties</h3>
        {selectedClip && (
          <span className="text-xs text-gray-500">{selectedClip.name}</span>
        )}
      </div>
      
      {panelError && (
        <div className="m-2 p-2 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-start">
            <AlertCircle className="w-3.5 h-3.5 text-red-500 mt-0.5 mr-1.5 flex-shrink-0" />
            <p className="text-xs text-red-700">{panelError}</p>
            <button 
              onClick={clearError}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
      
      {renderPropertyPanel()}
    </div>
  );
}