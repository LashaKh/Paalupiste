import React, { useState, useRef, useEffect } from 'react';
import { VideoProject } from '../../../types/video';
import TimelineTrack from './TimelineTrack';
import TimelineRuler from './TimelineRuler';
import { 
  ZoomIn, ZoomOut, ChevronRight, ChevronDown, 
  Plus, Music, MoveHorizontal, Video, Type 
} from 'lucide-react'; 
import { useToast } from '../../../hooks/useToast';

interface TimelineProps {
  project: VideoProject;
  currentTime: number;
  onSelectClip: (clipId: string) => void;
  selectedClipId: string | null;
  onSeek: (time: number) => void;
  onTrimStart: (clipId: string, time: number) => void;
  onTrimEnd: (clipId: string, time: number) => void;
  onDeleteClip: (clipId: string) => void;
  updateProject: (updates: Partial<VideoProject>) => void;
}

export default function Timeline({ 
  project, 
  currentTime,
  onSelectClip,
  selectedClipId,
  onSeek,
  onTrimStart,
  onTrimEnd,
  onDeleteClip,
  updateProject
}: TimelineProps) {
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState<'seek' | 'trim-start' | 'trim-end' | 'move' | null>(null);
  const [draggedClipId, setDraggedClipId] = useState<string | null>(null);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartTime, setDragStartTime] = useState(0);
  const [expandedTracks, setExpandedTracks] = useState({
    video: true,
    audio: true,
    text: true
  });
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  const handleClipDragStart = (clipId: string, initialX: number) => {
    setDraggedClipId(clipId);
    setDragStartX(initialX);
    setDragType('move');
    
    // Find the clip
    const clip = project.clips.find(c => c.id === clipId);
    if (clip) {
      setDragStartTime(clip.trim?.start || 0);
    }
  };

  const handleClipDragMove = (e: MouseEvent) => {
    if (!draggedClipId || !timelineRef.current || dragType !== 'move') return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const pixelsPerSecond = 50 * zoom;
    
    // Calculate new X position
    const x = Math.max(0, e.clientX - rect.left);
    const newTime = (x / pixelsPerSecond);
    
    // Update clip position
    const updatedClips = project.clips.map(clip => {
      if (clip.id === draggedClipId) {
        const clipDuration = (clip.trim?.end || clip.duration) - (clip.trim?.start || 0);
        return {
          ...clip, 
          trim: {
            start: Math.max(0, newTime),
            end: Math.max(clipDuration, newTime + clipDuration)
          }
        };
      }
      return clip;
    });
    
    updateProject({
      ...project,
      clips: updatedClips
    });
  };

  const handleClipDragEnd = () => {
    setDraggedClipId(null);
    setDragType(null);
  };

  // Calculate the next available position on the timeline to avoid overlapping clips
  const getNextAvailablePosition = () => {
    if (project.clips.length === 0) return 0;
    
    // Find the latest end time of all clips
    const latestEndTime = Math.max(...project.clips.map(clip => 
      (clip.trim?.end || clip.duration)
    ));
    
    // Add a small gap (0.1 second) after the last clip
    return latestEndTime + 0.1;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!timelineRef.current) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pixelsPerSecond = 50 * zoom;
    const time = x / pixelsPerSecond;
    
    // Check if we're near a clip edge for trimming
    const clipEdgeThreshold = 10; // pixels
    const nearestClip = project.clips.find(clip => {
      const clipStart = (clip.trim?.start || 0) * pixelsPerSecond;
      const clipEnd = (clip.trim?.end || clip.duration) * pixelsPerSecond;
      
      return Math.abs(x - clipStart) < clipEdgeThreshold || Math.abs(x - clipEnd) < clipEdgeThreshold;
    });
    
    if (nearestClip) {
      const clipStart = (nearestClip.trim?.start || 0) * pixelsPerSecond;
      const clipEnd = (nearestClip.trim?.end || nearestClip.duration) * pixelsPerSecond;
      
      if (Math.abs(x - clipStart) < clipEdgeThreshold) {
        setDragType('trim-start');
        setDraggedClipId(nearestClip.id);
        onTrimStart?.(nearestClip.id, time);
      } else if (Math.abs(x - clipEnd) < clipEdgeThreshold) {
        setDragType('trim-end');
        setDraggedClipId(nearestClip.id);
        onTrimEnd?.(nearestClip.id, time);
      }
    } else {
      setDragType('seek');
      onSeek(time);
    }
    
    setIsDragging(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !timelineRef.current) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const pixelsPerSecond = 50 * zoom;
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const time = x / pixelsPerSecond;
    
    switch (dragType) {
      case 'seek':
        onSeek(time);
        break;
      case 'trim-start':
        if (draggedClipId) {
          onTrimStart?.(draggedClipId, time);
        }
        break;
      case 'trim-end':
        if (draggedClipId) {
          onTrimEnd?.(draggedClipId, time);
        }
        break;
      case 'move':
        handleClipDragMove(e);
        break;
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragType(null);
    setDraggedClipId(null);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragType, draggedClipId]);

  // Toggle track expansion
  const toggleTrack = (track: 'video' | 'audio' | 'text') => {
    setExpandedTracks(prev => ({
      ...prev,
      [track]: !prev[track]
    }));
  };

  // Handle zoom in/out
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  return (
    <div className="relative flex flex-col h-full bg-gray-800 text-white">
      {/* Timeline Controls */}
      <div className="flex items-center justify-between px-3 py-1 bg-gray-900 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleZoomIn}
            className="p-1 hover:bg-gray-700 rounded"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1 hover:bg-gray-700 rounded"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs text-gray-400">{Math.round(zoom * 100)}%</span>
        </div>
      </div>

      {/* Timeline Content */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-x-auto overflow-y-hidden"
        onMouseDown={handleMouseDown}
      >
        <div 
          ref={timelineRef}
          className="relative"
          style={{ width: `${Math.max(project.duration * 50 * zoom, 800)}px` }}
        >
          {/* Ruler */}
          <TimelineRuler 
            zoom={zoom} 
            duration={project.duration} 
            currentTime={currentTime} 
          />

          {/* Video Track */}
          <div className="flex items-center">
            <button
              onClick={() => toggleTrack('video')}
              className="flex items-center w-24 px-2 py-1 text-xs hover:bg-gray-700"
            >
              {expandedTracks.video ? <ChevronDown className="w-3 h-3 mr-1" /> : <ChevronRight className="w-3 h-3 mr-1" />}
              <Video className="w-3 h-3 mr-1" />
              Video
            </button>
          </div>
          {expandedTracks.video && (
            <TimelineTrack
              trackType="video"
              items={project.clips.map(clip => ({
                id: clip.id,
                name: clip.name,
                startTime: clip.trim?.start || 0,
                endTime: clip.trim?.end || clip.duration,
                color: '#4F46E5',
                type: 'video',
                selected: clip.id === selectedClipId
              }))}
              zoom={zoom}
              onSelectItem={onSelectClip}
              selectedClipId={selectedClipId}
              currentTime={currentTime}
              onTrimStart={onTrimStart}
              onTrimEnd={onTrimEnd}
              onDeleteItem={onDeleteClip}
              project={project}
            />
          )}

          {/* Audio Track */}
          <div className="flex items-center mt-2">
            <button
              onClick={() => toggleTrack('audio')}
              className="flex items-center w-24 px-2 py-1 text-xs hover:bg-gray-700"
            >
              {expandedTracks.audio ? <ChevronDown className="w-3 h-3 mr-1" /> : <ChevronRight className="w-3 h-3 mr-1" />}
              <Music className="w-3 h-3 mr-1" />
              Audio
            </button>
          </div>
          {expandedTracks.audio && (
            <TimelineTrack
              trackType="audio"
              items={project.audioTracks.map(track => ({
                id: track.id,
                name: track.name,
                startTime: track.startTime,
                endTime: track.endTime,
                color: track.type === 'music' ? '#10B981' : '#F59E0B',
                type: track.type,
                selected: false
              }))}
              zoom={zoom}
              onSelectItem={() => {}}
              selectedClipId={null}
              currentTime={currentTime}
              onTrimStart={onTrimStart}
              onTrimEnd={onTrimEnd}
              project={project}
            />
          )}

          {/* Text Track */}
          <div className="flex items-center mt-2">
            <button
              onClick={() => toggleTrack('text')}
              className="flex items-center w-24 px-2 py-1 text-xs hover:bg-gray-700"
            >
              {expandedTracks.text ? <ChevronDown className="w-3 h-3 mr-1" /> : <ChevronRight className="w-3 h-3 mr-1" />}
              <Type className="w-3 h-3 mr-1" />
              Text
            </button>
          </div>
          {expandedTracks.text && (
            <TimelineTrack
              trackType="text"
              items={project.textOverlays.map(overlay => ({
                id: overlay.id,
                name: overlay.text,
                startTime: overlay.startTime,
                endTime: overlay.endTime,
                color: '#EC4899',
                type: 'text',
                selected: false
              }))}
              zoom={zoom}
              onSelectItem={() => {}}
              selectedClipId={null}
              currentTime={currentTime}
              onTrimStart={onTrimStart}
              onTrimEnd={onTrimEnd}
              project={project}
            />
          )}

          {/* Current Time Indicator */}
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-white"
            style={{ 
              left: `${currentTime * 50 * zoom}px`,
              zIndex: 10
            }}
          />
        </div>
      </div>
    </div>
  );
}