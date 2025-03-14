import React, { useState } from 'react';
import { Type, Plus, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline } from 'lucide-react';
import { VideoProject, TextOverlay } from '../../../../types/video';

interface TextPropertiesProps {
  project: VideoProject;
  updateProject: (updates: Partial<VideoProject>) => void;
}

// Font options
const fontFamilies = [
  'Arial', 'Verdana', 'Helvetica', 'Times New Roman', 
  'Georgia', 'Courier New', 'Impact', 'Comic Sans MS'
];

// Text animation options
const textAnimations = [
  { value: 'none', label: 'None' },
  { value: 'fadeIn', label: 'Fade In' },
  { value: 'slideIn', label: 'Slide In' },
  { value: 'zoomIn', label: 'Zoom In' },
  { value: 'bounce', label: 'Bounce' },
  { value: 'typewriter', label: 'Typewriter' }
];

export default function TextProperties({
  project,
  updateProject
}: TextPropertiesProps) {
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);

  // Format time (seconds) to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Add new text overlay
  const addTextOverlay = () => {
    const newOverlay: TextOverlay = {
      id: Date.now().toString(),
      text: 'New Text',
      fontSize: 24,
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: 'transparent',
      position: { x: 100, y: 100 },
      startTime: 0,
      endTime: 5,
      animation: 'none',
      alignment: 'center'
    };
    
    updateProject({
      textOverlays: [...project.textOverlays, newOverlay]
    });
    
    setSelectedTextId(newOverlay.id);
  };

  // Update text overlay
  const updateTextOverlay = (id: string, updates: Partial<TextOverlay>) => {
    const updatedOverlays = project.textOverlays.map(overlay => 
      overlay.id === id ? { ...overlay, ...updates } : overlay
    );
    
    updateProject({ textOverlays: updatedOverlays });
  };

  // Delete text overlay
  const deleteTextOverlay = (id: string) => {
    updateProject({
      textOverlays: project.textOverlays.filter(overlay => overlay.id !== id)
    });
    
    if (selectedTextId === id) {
      setSelectedTextId(null);
    }
  };

  // Get selected text overlay
  const selectedText = selectedTextId 
    ? project.textOverlays.find(overlay => overlay.id === selectedTextId)
    : null;

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-xs font-medium text-gray-900 flex items-center">
          <Type className="w-3 h-3 mr-1.5 text-primary" />
          Text Overlays
        </h4>
        
        <button
          onClick={addTextOverlay}
          className="inline-flex items-center px-2 py-1 text-xs text-white bg-primary hover:bg-primary-hover rounded"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add Text
        </button>
      </div>

      {/* Text List */}
      {project.textOverlays.length > 0 ? (
        <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-2">
          {project.textOverlays.map(overlay => (
            <div
              key={overlay.id}
              className={`p-2 rounded text-xs cursor-pointer ${
                selectedTextId === overlay.id 
                  ? 'bg-primary/10 border border-primary/30' 
                  : 'hover:bg-gray-50 border border-gray-200'
              }`}
              onClick={() => setSelectedTextId(overlay.id)}
            >
              <div className="flex justify-between">
                <span 
                  className="truncate max-w-[180px]"
                  style={{ 
                    fontFamily: overlay.fontFamily,
                    color: overlay.color
                  }}
                >
                  {overlay.text}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTextOverlay(overlay.id);
                  }}
                  className="text-gray-400 hover:text-red-500"
                >
                  ×
                </button>
              </div>
              <div className="text-gray-400 mt-1">
                {formatTime(overlay.startTime)} - {formatTime(overlay.endTime)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 border-2 border-dashed border-gray-200 rounded-lg">
          <Type className="mx-auto h-6 w-6 text-gray-400" />
          <p className="mt-2 text-xs text-gray-500">No text overlays added</p>
          <p className="text-xs text-gray-400 mt-1">Add text overlays to your video</p>
        </div>
      )}

      {/* Text Editor */}
      {selectedText && (
        <div className="border-t border-gray-200 pt-4 mt-4">
          <h4 className="text-xs font-medium text-gray-900 mb-3">
            Edit Text
          </h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-700 mb-1">Text Content</label>
              <input
                type="text"
                value={selectedText.text}
                onChange={(e) => updateTextOverlay(selectedText.id, { text: e.target.value })}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-700 mb-1">Font Family</label>
                <select
                  value={selectedText.fontFamily}
                  onChange={(e) => updateTextOverlay(selectedText.id, { fontFamily: e.target.value })}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                >
                  {fontFamilies.map(font => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs text-gray-700 mb-1">Font Size</label>
                <input
                  type="number"
                  min="8"
                  max="72"
                  value={selectedText.fontSize}
                  onChange={(e) => updateTextOverlay(selectedText.id, { fontSize: parseInt(e.target.value) })}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-700 mb-1">Text Color</label>
                <div className="flex items-center">
                  <input
                    type="color"
                    value={selectedText.color}
                    onChange={(e) => updateTextOverlay(selectedText.id, { color: e.target.value })}
                    className="w-8 h-8 p-0 border-0 rounded mr-2"
                  />
                  <input
                    type="text"
                    value={selectedText.color}
                    onChange={(e) => updateTextOverlay(selectedText.id, { color: e.target.value })}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs text-gray-700 mb-1">Background</label>
                <div className="flex items-center">
                  <input
                    type="color"
                    value={selectedText.backgroundColor === 'transparent' ? '#ffffff' : selectedText.backgroundColor}
                    onChange={(e) => updateTextOverlay(selectedText.id, { backgroundColor: e.target.value })}
                    className="w-8 h-8 p-0 border-0 rounded mr-2"
                  />
                  <select
                    value={selectedText.backgroundColor}
                    onChange={(e) => updateTextOverlay(selectedText.id, { backgroundColor: e.target.value })}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                  >
                    <option value="transparent">Transparent</option>
                    <option value="#000000">Black</option>
                    <option value="#ffffff">White</option>
                    <option value={selectedText.backgroundColor}>Custom</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-xs text-gray-700 mb-1">Text Alignment</label>
              <div className="flex border border-gray-200 rounded-lg divide-x divide-gray-200">
                <button
                  className={`flex-1 p-2 ${selectedText.alignment === 'left' ? 'bg-primary/10 text-primary' : 'text-gray-600'}`}
                  onClick={() => updateTextOverlay(selectedText.id, { alignment: 'left' })}
                >
                  <AlignLeft className="w-3 h-3 mx-auto" />
                </button>
                <button
                  className={`flex-1 p-2 ${selectedText.alignment === 'center' ? 'bg-primary/10 text-primary' : 'text-gray-600'}`}
                  onClick={() => updateTextOverlay(selectedText.id, { alignment: 'center' })}
                >
                  <AlignCenter className="w-3 h-3 mx-auto" />
                </button>
                <button
                  className={`flex-1 p-2 ${selectedText.alignment === 'right' ? 'bg-primary/10 text-primary' : 'text-gray-600'}`}
                  onClick={() => updateTextOverlay(selectedText.id, { alignment: 'right' })}
                >
                  <AlignRight className="w-3 h-3 mx-auto" />
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-xs text-gray-700 mb-1">Animation</label>
              <select
                value={selectedText.animation}
                onChange={(e) => updateTextOverlay(selectedText.id, { animation: e.target.value })}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
              >
                {textAnimations.map(animation => (
                  <option key={animation.value} value={animation.value}>{animation.label}</option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-700 mb-1">Start Time</label>
                <div className="flex items-center">
                  <input
                    type="range"
                    min="0"
                    max={project.duration || 60}
                    step="0.5"
                    value={selectedText.startTime}
                    onChange={(e) => updateTextOverlay(selectedText.id, { startTime: parseFloat(e.target.value) })}
                    className="flex-1 mr-2"
                  />
                  <span className="text-xs font-mono w-12">
                    {formatTime(selectedText.startTime)}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-xs text-gray-700 mb-1">End Time</label>
                <div className="flex items-center">
                  <input
                    type="range"
                    min="0"
                    max={project.duration || 60}
                    step="0.5"
                    value={selectedText.endTime}
                    onChange={(e) => updateTextOverlay(selectedText.id, { endTime: parseFloat(e.target.value) })}
                    className="flex-1 mr-2"
                  />
                  <span className="text-xs font-mono w-12">
                    {formatTime(selectedText.endTime)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}