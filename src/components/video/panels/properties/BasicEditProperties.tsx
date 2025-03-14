import React from 'react';
import { Scissors, Clock, Activity } from 'lucide-react';
import { VideoClip, VideoProject } from '../../../../types/video';

interface BasicEditPropertiesProps {
  selectedClip: VideoClip | null;
  project: VideoProject;
  updateProject: (updates: Partial<VideoProject>) => void;
}

export default function BasicEditProperties({
  selectedClip,
  project,
  updateProject
}: BasicEditPropertiesProps) {
  // Format time (seconds) to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Update a clip property
  const updateClip = (clipId: string, updates: Partial<VideoClip>) => {
    const updatedClips = project.clips.map(clip => 
      clip.id === clipId ? { ...clip, ...updates } : clip
    );
    
    updateProject({ clips: updatedClips });
  };

  if (!selectedClip) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>Select a clip to edit its properties</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="border-b border-gray-200 pb-3">
        <h4 className="text-xs font-medium text-gray-900 mb-3 flex items-center">
          <Scissors className="w-3 h-3 mr-1.5 text-primary" />
          Trim & Cut
        </h4>
        
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Start Trim
            </label>
            <div className="flex items-center">
              <input
                type="range"
                min="0"
                max={selectedClip.duration}
                step="0.1"
                value={selectedClip.trim?.start || 0}
                onChange={(e) => {
                  const start = parseFloat(e.target.value);
                  if (start < (selectedClip.trim?.end || selectedClip.duration)) {
                    updateClip(selectedClip.id, {
                      trim: { 
                        ...selectedClip.trim,
                        start 
                      }
                    });
                  }
                }}
                className="flex-1 mr-2"
              />
              <span className="text-xs font-mono w-12 text-right">
                {formatTime(selectedClip.trim?.start || 0)}
              </span>
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              End Trim
            </label>
            <div className="flex items-center">
              <input
                type="range"
                min="0"
                max={selectedClip.duration}
                step="0.1"
                value={selectedClip.trim?.end || selectedClip.duration}
                onChange={(e) => {
                  const end = parseFloat(e.target.value);
                  if (end > (selectedClip.trim?.start || 0)) {
                    updateClip(selectedClip.id, {
                      trim: { 
                        ...selectedClip.trim,
                        end 
                      }
                    });
                  }
                }}
                className="flex-1 mr-2"
              />
              <span className="text-xs font-mono w-12 text-right">
                {formatTime(selectedClip.trim?.end || selectedClip.duration)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200 pb-3">
        <h4 className="text-xs font-medium text-gray-900 mb-3 flex items-center">
          <Clock className="w-3 h-3 mr-1.5 text-primary" />
          Playback Speed
        </h4>
        
        <div className="flex items-center">
          <input
            type="range"
            min="0.25"
            max="4"
            step="0.25"
            value={selectedClip.speed}
            onChange={(e) => {
              updateClip(selectedClip.id, {
                speed: parseFloat(e.target.value)
              });
            }}
            className="flex-1 mr-2"
          />
          <span className="text-xs font-medium">{selectedClip.speed}x</span>
        </div>
        
        <div className="flex justify-between mt-2">
          <button 
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
            onClick={() => updateClip(selectedClip.id, { speed: 0.5 })}
          >
            0.5x
          </button>
          <button 
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
            onClick={() => updateClip(selectedClip.id, { speed: 1 })}
          >
            1x
          </button>
          <button 
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
            onClick={() => updateClip(selectedClip.id, { speed: 1.5 })}
          >
            1.5x
          </button>
          <button 
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
            onClick={() => updateClip(selectedClip.id, { speed: 2 })}
          >
            2x
          </button>
        </div>
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-900 mb-3 flex items-center">
          <Activity className="w-3 h-3 mr-1.5 text-primary" />
          Clip Details
        </h4>
        
        <div className="space-y-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Clip Name
            </label>
            <input
              type="text"
              value={selectedClip.name}
              onChange={(e) => {
                updateClip(selectedClip.id, {
                  name: e.target.value
                });
              }}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Duration
              </label>
              <input
                type="text"
                value={formatTime((selectedClip.trim?.end || selectedClip.duration) - (selectedClip.trim?.start || 0))}
                disabled
                className="w-full px-2 py-1 text-xs border border-gray-200 rounded bg-gray-50"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Original Duration
              </label>
              <input
                type="text"
                value={formatTime(selectedClip.duration)}
                disabled
                className="w-full px-2 py-1 text-xs border border-gray-200 rounded bg-gray-50"
              />
            </div>
          </div>
          
          <div className="flex justify-end mt-2">
            <button 
              className="px-3 py-1 text-xs text-white bg-primary hover:bg-primary-hover rounded"
              onClick={() => {
                updateClip(selectedClip.id, {
                  trim: {
                    start: 0,
                    end: selectedClip.duration
                  },
                  speed: 1
                });
              }}
            >
              Reset All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}