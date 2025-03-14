import React, { useState, useEffect, useCallback } from 'react';
import { Video, Share, Save, Settings, Download, Loader2, FileText } from 'lucide-react';
import VideoHeader from './VideoHeader';
import ScriptGenerationForm from './ScriptGenerationForm';
import EditorInterface from './EditorInterface';
import { VideoProject } from '../../types/video';

const initialVideoProject: VideoProject = {
  id: Date.now().toString(),
  title: 'Untitled Video Project',
  duration: 0,
  clips: [],
  audioTracks: [],
  textOverlays: [],
  effects: [],
  exportSettings: {
    resolution: '1080p',
    format: 'mp4',
    quality: 'high',
    aspectRatio: '16:9',
    compression: 80,
    fps: 30,
  }
};

export default function VideoEditor() {
  const [project, setProject] = useState<VideoProject>(initialVideoProject);
  const [showScriptForm, setShowScriptForm] = useState(true);
  const [generatedVoiceover, setGeneratedVoiceover] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle script generation success
  const handleScriptGenerated = (voiceoverUrl: string) => {
    try {
      setGeneratedVoiceover(voiceoverUrl);
      setShowScriptForm(false);
      setError(null);
    } catch (err) {
      console.error("Error handling script generation:", err);
      setError("Failed to process the generated script. Please try again.");
    }
  };

  // Update project state
  const updateProject = (updates: Partial<VideoProject>) => {
    try {
      setProject(prev => ({ ...prev, ...updates }));
    } catch (err) {
      console.error("Error updating project:", err);
      setError("Failed to update the project. Please try again.");
    }
  };

  // Error recovery
  const resetError = () => {
    setError(null);
  };

  return (
    <div className="flex flex-col w-full h-full bg-gray-50 overflow-hidden">
      <VideoHeader 
        title={project.title}
        onTitleChange={(title) => updateProject({ title })}
      />

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-1 mx-2 my-1">
          <div className="flex text-xs">
            <div className="flex-shrink-0">
              <svg className="h-3 w-3 text-red-500 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-2">
              <p className="text-xs text-red-700">{error}</p>
            </div>
            <button onClick={resetError} className="ml-auto text-red-500 hover:text-red-700">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {showScriptForm ? (
        <div className="flex-1 flex items-start justify-center p-2 overflow-auto">
          <ScriptGenerationForm 
            onScriptGenerated={handleScriptGenerated}
            onError={(errorMsg) => setError(errorMsg)} 
          />
        </div>
      ) : (
        <div className="flex-1 overflow-hidden">
          <EditorInterface 
            project={project}
            updateProject={updateProject}
            generatedVoiceover={generatedVoiceover}
            onError={(errorMsg) => setError(errorMsg)}
          />
        </div>
      )}
    </div>
  );
}