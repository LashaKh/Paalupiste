import React from 'react';
import { Volume2, Music, Mic, Waves as Waveform } from 'lucide-react';
import { VideoClip, VideoProject, AudioTrack } from '../../../../types/video';

interface AudioPropertiesProps {
  selectedClip: VideoClip | null;
  project: VideoProject;
  updateProject: (updates: Partial<VideoProject>) => void;
}

export default function AudioProperties({
  selectedClip,
  project,
  updateProject
}: AudioPropertiesProps) {
  // Format time (seconds) to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Update clip's volume
  const updateClipVolume = (clipId: string, volume: number) => {
    const updatedClips = project.clips.map(clip => 
      clip.id === clipId ? { ...clip, volume } : clip
    );
    
    updateProject({ clips: updatedClips });
  };

  // Update audio track
  const updateAudioTrack = (trackId: string, updates: Partial<AudioTrack>) => {
    const updatedTracks = project.audioTracks.map(track => 
      track.id === trackId ? { ...track, ...updates } : track
    );
    
    updateProject({ audioTracks: updatedTracks });
  };

  return (
    <div className="p-4 space-y-6">
      {/* Original Audio (if clip is selected) */}
      {selectedClip && (
        <div className="border-b border-gray-200 pb-4">
          <h4 className="text-xs font-medium text-gray-900 mb-3 flex items-center">
            <Waveform className="w-3 h-3 mr-1.5 text-primary" />
            Original Audio
          </h4>
          
          <div>
            <div className="flex justify-between text-xs text-gray-700 mb-1">
              <label>Volume</label>
              <span>{selectedClip.volume * 100}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1.5"
              step="0.1"
              value={selectedClip.volume}
              onChange={(e) => updateClipVolume(selectedClip.id, parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div className="flex justify-between mt-3">
            <button
              onClick={() => updateClipVolume(selectedClip.id, 0)}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
            >
              Mute
            </button>
            <button
              onClick={() => updateClipVolume(selectedClip.id, 1)}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Audio Tracks */}
      <div>
        <h4 className="text-xs font-medium text-gray-900 mb-3 flex items-center">
          <Music className="w-3 h-3 mr-1.5 text-primary" />
          Audio Tracks
        </h4>
        
        {project.audioTracks.length > 0 ? (
          <div className="space-y-4">
            {project.audioTracks.map(track => (
              <div key={track.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    {track.type === 'music' ? (
                      <Music className="w-3 h-3 text-primary mr-1.5" />
                    ) : (
                      <Mic className="w-3 h-3 text-primary mr-1.5" />
                    )}
                    <span className="text-xs font-medium">{track.name}</span>
                  </div>
                  <button
                    onClick={() => {
                      updateProject({
                        audioTracks: project.audioTracks.filter(t => t.id !== track.id)
                      });
                    }}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
                
                <div>
                  <div className="flex justify-between text-xs text-gray-700 mb-1">
                    <label>Volume</label>
                    <span>{track.volume * 100}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1.5"
                    step="0.1"
                    value={track.volume}
                    onChange={(e) => updateAudioTrack(track.id, {
                      volume: parseFloat(e.target.value)
                    })}
                    className="w-full"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <div>
                    <div className="flex justify-between text-xs text-gray-700 mb-1">
                      <label>Start Time</label>
                      <span>{formatTime(track.startTime)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={Math.max(...project.clips.map(c => c.duration)) || 60}
                      step="0.5"
                      value={track.startTime}
                      onChange={(e) => updateAudioTrack(track.id, {
                        startTime: parseFloat(e.target.value)
                      })}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs text-gray-700 mb-1">
                      <label>End Time</label>
                      <span>{formatTime(track.endTime)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={Math.max(...project.clips.map(c => c.duration)) || 60}
                      step="0.5"
                      value={track.endTime}
                      onChange={(e) => updateAudioTrack(track.id, {
                        endTime: parseFloat(e.target.value)
                      })}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 border-2 border-dashed border-gray-200 rounded-lg">
            <Music className="mx-auto h-6 w-6 text-gray-400" />
            <p className="mt-2 text-xs text-gray-500">No audio tracks added</p>
            <p className="text-xs text-gray-400 mt-1">Upload audio files from the Media Library</p>
          </div>
        )}
      </div>
    </div>
  );
}