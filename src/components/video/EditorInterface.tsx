import React, { useState, useRef, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import MediaPanel from './panels/MediaPanel';
import EditingToolbar from './EditingToolbar';
import Timeline from './timeline/Timeline';
import PropertyPanel from './panels/PropertyPanel';
import VideoPlayer from './VideoPlayer';
import { usePlaybackController } from './PlaybackController';
import { useToast } from '../../hooks/useToast';
import { VideoProject } from '../../types/video';

interface EditorInterfaceProps {
  project: VideoProject;
  updateProject: (updates: Partial<VideoProject>) => void;
  generatedVoiceover: string | null;
  onError: (errorMessage: string) => void;
}

export default function EditorInterface({ 
  project, 
  updateProject,
  generatedVoiceover,
  onError
}: EditorInterfaceProps) {
  const [volume, setVolume] = useState(1);
  const [selectedTool, setSelectedTool] = useState('basic');
  const [playerError, setPlayerError] = useState<string | null>(null);
  
  const { showToast } = useToast();
  
  const {
    currentTime,
    isPlaying,
    selectedClipId,
    selectedClip,
    isLoadingVideo,
   setSelectedClipId,
    handleClipEnd,
    selectClip,
    handleTimeUpdate,
    handlePlayStateChange,
    handleSeek,
  } = usePlaybackController({ project, onError });

  useEffect(() => {
    // Add the generated voiceover to audio tracks if it exists
    if (generatedVoiceover && project.audioTracks.length === 0) {
      try {
        updateProject({
          audioTracks: [
            ...project.audioTracks,
            {
              id: Date.now().toString(),
              name: 'Generated Voiceover',
              type: 'voiceover',
              url: generatedVoiceover,
              volume: 1,
              startTime: 0,
              endTime: 60,
              selected: false
            }
          ]
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to add voiceover to project';
        setPlayerError(errorMessage);
        onError(errorMessage);
      }
    }
  }, [generatedVoiceover]);

  const handleTrimStart = (clipId: string, time: number) => {
    const updatedClips = project.clips.map(clip => {
      if (clip.id === clipId) {
        return {
          ...clip,
          trim: {
            ...clip.trim,
            start: Math.max(0, Math.min(time, clip.trim?.end || clip.duration))
          }
        };
      }
      return clip;
    });
    updateProject({ clips: updatedClips });
  };

  const handleTrimEnd = (clipId: string, time: number) => {
    const updatedClips = project.clips.map(clip => {
      if (clip.id === clipId) {
        return {
          ...clip,
          trim: {
            ...clip.trim,
            end: Math.max(clip.trim?.start || 0, Math.min(time, clip.duration))
          }
        };
      }
      return clip;
    });
    updateProject({ clips: updatedClips });
  };

  const handleDeleteClip = (clipId: string) => {
    const updatedClips = project.clips.filter(clip => clip.id !== clipId);
    updateProject({ clips: updatedClips });
    if (selectedClipId === clipId) {
      setSelectedClipId(null);
    }
  };

  const clearError = () => {
    setPlayerError(null);
  };

  return (
    <div className="flex flex-col h-full max-h-full bg-gray-100 w-full">
      {playerError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 m-2 rounded-md flex items-start">
          <AlertCircle className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
          <span className="text-xs">{playerError}</span>
          <button onClick={clearError} className="ml-auto text-red-500 hover:text-red-700">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className="flex flex-1 min-h-0 overflow-hidden w-full">
        {/* Left Panel - Media Library & Tools */}
        <div className="w-56 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          <EditingToolbar 
            selectedTool={selectedTool}
            onSelectTool={setSelectedTool}
          />
          <div className="flex-1 overflow-auto">
            <MediaPanel 
              onError={onError}
              project={project}
              updateProject={updateProject}
            />
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Preview Area */}
          <div className="flex-1 bg-gray-900 flex items-center justify-center relative overflow-hidden">
            <div className="relative w-full h-full max-w-full max-h-full flex items-center justify-center">
              <div className="aspect-video w-auto h-auto max-w-full max-h-full">
                <VideoPlayer
                  selectedClip={selectedClip}
                  isPlaying={isPlaying}
                  volume={volume}
                  currentTime={currentTime}
                  onTimeUpdate={handleTimeUpdate}
                  onDurationChange={(duration) => updateProject({ duration })}
                  onPlayStateChange={handlePlayStateChange}
                  onVolumeChange={setVolume}
                  onError={onError}
                  onClipEnd={handleClipEnd}
                  isLoadingVideo={isLoadingVideo}
                />
              </div>
              
              {project.clips.length === 0 && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                  <p className="text-[9px] font-medium text-white">No video clips added</p>
                  <p className="text-[7px] mt-0.5 text-gray-400">Import media from the left panel</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Timeline */}
          <div className="h-28 bg-gray-800 border-t border-gray-700 overflow-auto">
            <Timeline 
              project={project} 
              currentTime={currentTime}
              onSelectClip={selectClip}
              selectedClipId={selectedClipId}
              onSeek={handleSeek}
              onTrimStart={handleTrimStart}
              onTrimEnd={handleTrimEnd}
              onDeleteClip={handleDeleteClip}
              updateProject={updateProject}
            />
          </div>
        </div>

        {/* Right Panel - Properties */}
        <div className="w-56 bg-white border-l border-gray-200 overflow-hidden">
          <PropertyPanel 
            selectedTool={selectedTool}
            selectedClipId={selectedClipId}
            project={project}
            updateProject={updateProject}
            onError={onError}
          />
        </div>
      </div>
    </div>
  );
}