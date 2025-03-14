import React from 'react';
import { Download, FileVideo, Settings, Film } from 'lucide-react';
import { VideoProject } from '../../../../types/video';

interface ExportPropertiesProps {
  project: VideoProject;
  updateProject: (updates: Partial<VideoProject>) => void;
}

export default function ExportProperties({
  project,
  updateProject
}: ExportPropertiesProps) {
  // Update export settings
  const updateExportSettings = (key: string, value: any) => {
    updateProject({
      exportSettings: {
        ...project.exportSettings,
        [key]: value
      }
    });
  };

  return (
    <div className="p-4 space-y-4">
      <h4 className="text-xs font-medium text-gray-900 mb-4 flex items-center">
        <FileVideo className="w-3 h-3 mr-1.5 text-primary" />
        Export Settings
      </h4>
      
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Resolution
          </label>
          <select
            value={project.exportSettings.resolution}
            onChange={(e) => updateExportSettings('resolution', e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
          >
            <option value="4K">4K (3840 x 2160)</option>
            <option value="1080p">1080p (1920 x 1080)</option>
            <option value="720p">720p (1280 x 720)</option>
            <option value="480p">480p (854 x 480)</option>
          </select>
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Format
          </label>
          <select
            value={project.exportSettings.format}
            onChange={(e) => updateExportSettings('format', e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
          >
            <option value="mp4">MP4</option>
            <option value="mov">MOV</option>
            <option value="webm">WebM</option>
            <option value="gif">GIF</option>
          </select>
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Quality
          </label>
          <select
            value={project.exportSettings.quality}
            onChange={(e) => updateExportSettings('quality', e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Aspect Ratio
          </label>
          <select
            value={project.exportSettings.aspectRatio}
            onChange={(e) => updateExportSettings('aspectRatio', e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
          >
            <option value="16:9">16:9 (Widescreen)</option>
            <option value="4:3">4:3 (Standard)</option>
            <option value="1:1">1:1 (Square)</option>
            <option value="9:16">9:16 (Vertical)</option>
          </select>
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            FPS
          </label>
          <select
            value={project.exportSettings.fps}
            onChange={(e) => updateExportSettings('fps', parseInt(e.target.value))}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
          >
            <option value="24">24 fps</option>
            <option value="30">30 fps</option>
            <option value="60">60 fps</option>
          </select>
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Compression Level
          </label>
          <div className="flex items-center">
            <input
              type="range"
              min="0"
              max="100"
              step="10"
              value={project.exportSettings.compression}
              onChange={(e) => updateExportSettings('compression', parseInt(e.target.value))}
              className="flex-1 mr-2"
            />
            <span className="text-xs w-8 text-right">
              {project.exportSettings.compression}%
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Higher Quality</span>
            <span>Smaller Size</span>
          </div>
        </div>
      </div>
      
      <div className="pt-4 mt-4 border-t border-gray-200">
        <button
          className="w-full flex justify-center items-center p-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors"
        >
          <Download className="w-4 h-4 mr-1.5" />
          Export Video
        </button>
        
        <p className="text-xs text-gray-500 mt-3 text-center">
          Estimated file size: {Math.round(((project.clips.length * 10) * (project.exportSettings.quality === 'high' ? 1 : project.exportSettings.quality === 'medium' ? 0.7 : 0.4) * (project.exportSettings.resolution === '4K' ? 4 : project.exportSettings.resolution === '1080p' ? 2 : project.exportSettings.resolution === '720p' ? 1 : 0.5) * (100 - project.exportSettings.compression) / 100) * 0.1 * 10) / 10} MB
        </p>
      </div>
    </div>
  );
}