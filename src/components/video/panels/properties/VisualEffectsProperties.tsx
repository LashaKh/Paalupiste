import React, { useState } from 'react';
import { Sliders, Pipette, ImageIcon, Maximize } from 'lucide-react';
import { VideoClip, VideoProject, VideoFilters } from '../../../../types/video';

interface VisualEffectsPropertiesProps {
  selectedClip: VideoClip | null;
  project: VideoProject;
  updateProject: (updates: Partial<VideoProject>) => void;
}

// Filter presets
const filterPresets = [
  { name: 'None', value: '' },
  { name: 'Vintage', value: 'sepia(0.5) contrast(110%) brightness(110%)' },
  { name: 'Black & White', value: 'grayscale(100%)' },
  { name: 'Warm', value: 'brightness(105%) sepia(0.3) saturate(140%)' },
  { name: 'Cool', value: 'brightness(105%) hue-rotate(180deg) saturate(120%)' },
  { name: 'Vivid', value: 'contrast(120%) saturate(150%)' },
  { name: 'Dramatic', value: 'contrast(150%) brightness(90%)' },
  { name: 'Muted', value: 'saturate(70%) brightness(110%)' },
  { name: 'Cinematic', value: 'contrast(120%) saturate(110%) brightness(95%)' }
];

export default function VisualEffectsProperties({
  selectedClip,
  project,
  updateProject
}: VisualEffectsPropertiesProps) {
  const [activeSection, setActiveSection] = useState<'adjustments' | 'filters' | 'crop'>('adjustments');

  // Update a clip's filters
  const updateClipFilters = (clipId: string, updates: Partial<VideoFilters>) => {
    const updatedClips = project.clips.map(clip => {
      if (clip.id === clipId) {
        return {
          ...clip,
          filters: {
            ...clip.filters,
            ...updates
          }
        };
      }
      return clip;
    });
    
    updateProject({ clips: updatedClips });
  };

  // Apply a filter preset
  const applyFilterPreset = (clipId: string, presetValue: string) => {
    updateClipFilters(clipId, { customFilter: presetValue });
  };

  if (!selectedClip) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>Select a clip to edit its visual effects</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Section Tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          onClick={() => setActiveSection('adjustments')}
          className={`py-2 px-3 text-xs font-medium ${
            activeSection === 'adjustments' 
              ? 'text-primary border-b-2 border-primary -mb-px' 
              : 'text-gray-600 hover:text-primary'
          }`}
        >
          <Sliders className="w-3 h-3 inline mr-1" />
          Adjustments
        </button>
        <button
          onClick={() => setActiveSection('filters')}
          className={`py-2 px-3 text-xs font-medium ${
            activeSection === 'filters' 
              ? 'text-primary border-b-2 border-primary -mb-px' 
              : 'text-gray-600 hover:text-primary'
          }`}
        >
          <ImageIcon className="w-3 h-3 inline mr-1" />
          Filters
        </button>
        <button
          onClick={() => setActiveSection('crop')}
          className={`py-2 px-3 text-xs font-medium ${
            activeSection === 'crop' 
              ? 'text-primary border-b-2 border-primary -mb-px' 
              : 'text-gray-600 hover:text-primary'
          }`}
        >
          <Maximize className="w-3 h-3 inline mr-1" />
          Crop
        </button>
      </div>

      {/* Adjustments Section */}
      {activeSection === 'adjustments' && (
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs text-gray-700 mb-1">
              <label>Brightness</label>
              <span>{selectedClip.filters.brightness}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              step="5"
              value={selectedClip.filters.brightness}
              onChange={(e) => updateClipFilters(selectedClip.id, {
                brightness: parseInt(e.target.value)
              })}
              className="w-full"
            />
          </div>
          
          <div>
            <div className="flex justify-between text-xs text-gray-700 mb-1">
              <label>Contrast</label>
              <span>{selectedClip.filters.contrast}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              step="5"
              value={selectedClip.filters.contrast}
              onChange={(e) => updateClipFilters(selectedClip.id, {
                contrast: parseInt(e.target.value)
              })}
              className="w-full"
            />
          </div>
          
          <div>
            <div className="flex justify-between text-xs text-gray-700 mb-1">
              <label>Saturation</label>
              <span>{selectedClip.filters.saturation}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              step="5"
              value={selectedClip.filters.saturation}
              onChange={(e) => updateClipFilters(selectedClip.id, {
                saturation: parseInt(e.target.value)
              })}
              className="w-full"
            />
          </div>
          
          <div>
            <div className="flex justify-between text-xs text-gray-700 mb-1">
              <label>Hue Rotate</label>
              <span>{selectedClip.filters.hue}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              step="5"
              value={selectedClip.filters.hue}
              onChange={(e) => updateClipFilters(selectedClip.id, {
                hue: parseInt(e.target.value)
              })}
              className="w-full"
            />
          </div>
          
          <div className="grid grid-cols-3 gap-2 mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selectedClip.filters.grayscale}
                onChange={(e) => updateClipFilters(selectedClip.id, {
                  grayscale: e.target.checked
                })}
                className="rounded text-primary focus:ring-primary mr-1"
              />
              <span className="text-xs">Grayscale</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selectedClip.filters.sepia}
                onChange={(e) => updateClipFilters(selectedClip.id, {
                  sepia: e.target.checked
                })}
                className="rounded text-primary focus:ring-primary mr-1"
              />
              <span className="text-xs">Sepia</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selectedClip.filters.invert}
                onChange={(e) => updateClipFilters(selectedClip.id, {
                  invert: e.target.checked
                })}
                className="rounded text-primary focus:ring-primary mr-1"
              />
              <span className="text-xs">Invert</span>
            </label>
          </div>
          
          <div className="flex justify-end mt-3">
            <button
              onClick={() => {
                updateClipFilters(selectedClip.id, {
                  brightness: 100,
                  contrast: 100,
                  saturation: 100,
                  hue: 0,
                  blur: 0,
                  grayscale: false,
                  sepia: false,
                  invert: false
                });
              }}
              className="px-3 py-1 text-xs text-primary border border-primary hover:bg-primary hover:text-white rounded"
            >
              Reset Adjustments
            </button>
          </div>
        </div>
      )}

      {/* Filters Section */}
      {activeSection === 'filters' && (
        <div>
          <h4 className="text-xs font-medium text-gray-700 mb-3 flex items-center">
            <Pipette className="w-3 h-3 mr-1.5 text-primary" />
            Filter Presets
          </h4>
          
          <div className="grid grid-cols-3 gap-2">
            {filterPresets.map(preset => (
              <button
                key={preset.name}
                onClick={() => applyFilterPreset(selectedClip.id, preset.value)}
                className={`p-2 text-xs rounded border ${
                  selectedClip.filters.customFilter === preset.value
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-primary/30'
                }`}
              >
                {preset.name}
              </button>
            ))}
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-700 mb-1">
              <label>Filter Intensity</label>
              <span>{selectedClip.filters.filterIntensity || 100}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={selectedClip.filters.filterIntensity || 100}
              onChange={(e) => updateClipFilters(selectedClip.id, {
                filterIntensity: parseInt(e.target.value)
              })}
              className="w-full"
              disabled={!selectedClip.filters.customFilter}
            />
          </div>
        </div>
      )}

      {/* Crop Section */}
      {activeSection === 'crop' && (
        <div className="space-y-3">
          <h4 className="text-xs font-medium text-gray-700 mb-3">
            Crop & Transform
          </h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-700 mb-1">Crop Top</label>
              <input
                type="range"
                min="0"
                max="100"
                value={selectedClip.transform?.cropTop || 0}
                onChange={(e) => {
                  const updatedClips = project.clips.map(clip => {
                    if (clip.id === selectedClip.id) {
                      return {
                        ...clip,
                        transform: {
                          ...clip.transform,
                          cropTop: parseInt(e.target.value)
                        }
                      };
                    }
                    return clip;
                  });
                  
                  updateProject({ clips: updatedClips });
                }}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-700 mb-1">Crop Bottom</label>
              <input
                type="range"
                min="0"
                max="100"
                value={selectedClip.transform?.cropBottom || 0}
                onChange={(e) => {
                  const updatedClips = project.clips.map(clip => {
                    if (clip.id === selectedClip.id) {
                      return {
                        ...clip,
                        transform: {
                          ...clip.transform,
                          cropBottom: parseInt(e.target.value)
                        }
                      };
                    }
                    return clip;
                  });
                  
                  updateProject({ clips: updatedClips });
                }}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-700 mb-1">Crop Left</label>
              <input
                type="range"
                min="0"
                max="100"
                value={selectedClip.transform?.cropLeft || 0}
                onChange={(e) => {
                  const updatedClips = project.clips.map(clip => {
                    if (clip.id === selectedClip.id) {
                      return {
                        ...clip,
                        transform: {
                          ...clip.transform,
                          cropLeft: parseInt(e.target.value)
                        }
                      };
                    }
                    return clip;
                  });
                  
                  updateProject({ clips: updatedClips });
                }}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-700 mb-1">Crop Right</label>
              <input
                type="range"
                min="0"
                max="100"
                value={selectedClip.transform?.cropRight || 0}
                onChange={(e) => {
                  const updatedClips = project.clips.map(clip => {
                    if (clip.id === selectedClip.id) {
                      return {
                        ...clip,
                        transform: {
                          ...clip.transform,
                          cropRight: parseInt(e.target.value)
                        }
                      };
                    }
                    return clip;
                  });
                  
                  updateProject({ clips: updatedClips });
                }}
                className="w-full"
              />
            </div>
          </div>
          
          <div className="mt-3">
            <label className="block text-xs text-gray-700 mb-1">Rotation</label>
            <div className="flex items-center">
              <input
                type="range"
                min="0"
                max="360"
                value={selectedClip.transform?.rotate || 0}
                onChange={(e) => {
                  const updatedClips = project.clips.map(clip => {
                    if (clip.id === selectedClip.id) {
                      return {
                        ...clip,
                        transform: {
                          ...clip.transform,
                          rotate: parseInt(e.target.value)
                        }
                      };
                    }
                    return clip;
                  });
                  
                  updateProject({ clips: updatedClips });
                }}
                className="flex-1"
              />
              <span className="ml-2 text-xs w-8">{selectedClip.transform?.rotate || 0}°</span>
            </div>
          </div>
          
          <div className="flex justify-between mt-2">
            <button
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
              onClick={() => {
                const updatedClips = project.clips.map(clip => {
                  if (clip.id === selectedClip.id) {
                    return {
                      ...clip,
                      transform: {
                        ...clip.transform,
                        scaleX: (clip.transform?.scaleX || 1) * -1
                      }
                    };
                  }
                  return clip;
                });
                
                updateProject({ clips: updatedClips });
              }}
            >
              Flip Horizontal
            </button>
            
            <button
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
              onClick={() => {
                const updatedClips = project.clips.map(clip => {
                  if (clip.id === selectedClip.id) {
                    return {
                      ...clip,
                      transform: {
                        ...clip.transform,
                        scaleY: (clip.transform?.scaleY || 1) * -1
                      }
                    };
                  }
                  return clip;
                });
                
                updateProject({ clips: updatedClips });
              }}
            >
              Flip Vertical
            </button>
          </div>
          
          <div className="flex justify-end mt-3">
            <button
              onClick={() => {
                const updatedClips = project.clips.map(clip => {
                  if (clip.id === selectedClip.id) {
                    return {
                      ...clip,
                      transform: {
                        rotate: 0,
                        scaleX: 1,
                        scaleY: 1,
                        cropTop: 0,
                        cropRight: 0,
                        cropBottom: 0,
                        cropLeft: 0
                      }
                    };
                  }
                  return clip;
                });
                
                updateProject({ clips: updatedClips });
              }}
              className="px-3 py-1 text-xs text-primary border border-primary hover:bg-primary hover:text-white rounded"
            >
              Reset Transform
            </button>
          </div>
        </div>
      )}
    </div>
  );
}