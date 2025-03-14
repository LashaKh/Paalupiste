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
    <div 
      ref={timelineRef}
      className="h-full flex flex-col bg-gray-900 text-white text-xs w-full"
      onMouseDown={handleMouseDown}
      onDragOver={(e) => {
        e.preventDefault();
        e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
      }}
      onDragLeave={(e) => {
        e.currentTarget.style.backgroundColor = '';
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.currentTarget.style.backgroundColor = '';
        try {
          const data = JSON.parse(e.dataTransfer.getData('application/json'));
          if (data.type === 'video') {
            const video = document.createElement('video');
            video.src = data.url;
            video.onerror = () => {
              const errorMsg = `Failed to load video. Please ensure the file format is supported (MP4, WebM).`;
              showToast(errorMsg, 'error');
            };
            video.onloadedmetadata = () => {
              // Calculate position for the new clip to avoid overlap
              const startPosition = getNextAvailablePosition();
              
              const newClip = {
                id: data.id,
                name: data.name,
                source: data.url,
                duration: video.duration,
                speed: 1,
                volume: 1,
                trim: {
                  start: startPosition,
                  end: startPosition + video.duration
                },
                filters: {
                  brightness: 100,
                  contrast: 100,
                  saturation: 100,
                  hue: 0,
                  blur: 0,
                  grayscale: false,
                  sepia: false,
                  invert: false
                }
              };
              
              updateProject({
                ...project,
                clips: [...project.clips, newClip],
                duration: Math.max(project.duration, startPosition + video.duration)
              });
              
              showToast('Video added to timeline', 'success');
            };
          }
        } catch (error) {
          console.error('Error adding video to timeline:', error);
          showToast('Failed to add video to timeline', 'error');
        }
      }}
      style={{ cursor: isDragging ? (dragType === 'move' ? 'grabbing' : 'col-resize') : 'pointer' }}
    >
      {/* Timeline Controls */}
      <div className="flex items-center justify-between p-0.5 border-b border-gray-700 text-[8px]">
        <div className="flex items-center">
          <button
            onClick={handleZoomOut}
            className="p-0.5 text-gray-400 hover:text-white rounded"
            disabled={zoom <= 0.5}
          >
            <ZoomOut className="w-2 h-2" />
          </button>
          <div className="text-[7px] mx-0.5">
            {Math.round(zoom * 100)}%
          </div>
          <button
            onClick={handleZoomIn}
            className="p-0.5 text-gray-400 hover:text-white rounded"
            disabled={zoom >= 3}
          >
            <ZoomIn className="w-2 h-2" />
          </button>
        </div>
        
        <div className="text-[7px] text-gray-400">
          {project.clips.length} clips • 
          {project.audioTracks.length} audio •
          {project.textOverlays.length} text
        </div>
        
        <button className="p-0.5 text-gray-400 hover:text-white rounded flex items-center text-[7px]">
          <Plus className="w-1.5 h-1.5 mr-0.5" />
          Add Track
        </button>
      </div>
      
      {/* Timeline Ruler */}
      <div className="h-3 border-b border-gray-700 overflow-hidden">
        <TimelineRuler 
          duration={project.duration || 60} 
          zoom={zoom}
          currentTime={currentTime}
        />
      </div>
      
      {/* Timeline Tracks */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-auto"
      >
        <div className="min-w-full">
          {/* Video Track Group */}
          <div className="border-b border-gray-700">
            <div 
              className="flex items-center p-0.5 hover:bg-gray-800 cursor-pointer"
              onClick={() => toggleTrack('video')}
            >
              {expandedTracks.video ? (
                <ChevronDown className="w-2 h-2 text-gray-400" />
              ) : (
                <ChevronRight className="w-2 h-2 text-gray-400" />
              )}
              <Video className="w-2 h-2 ml-0.5 mr-0.5 text-blue-400" />
              <span className="text-[7px] font-medium">Video</span>
            </div>
            
            {expandedTracks.video && (
              <div 
                style={{ width: `${Math.max(100, (project.duration || 60) * 50 * zoom)}px` }}
              >
                <TimelineTrack
                  trackType="video"
                  items={project.clips.map(clip => ({
                    id: clip.id,
                    name: clip.name,
                    startTime: clip.trim?.start || 0,
                    endTime: clip.trim?.end || clip.duration,
                    color: 'rgb(59, 130, 246)', // Blue
                    type: 'video',
                    selected: clip.id === selectedClipId
                  }))}
                  zoom={zoom}
                  onSelectItem={onSelectClip}
                  selectedClipId={selectedClipId}
                  onTrimStart={onTrimStart}
                  onTrimEnd={onTrimEnd}
                  onDeleteItem={onDeleteClip}
                  onDragStart={handleClipDragStart}
                  project={project}
                  currentTime={currentTime}
                />
              </div>
            )}
          </div>
          
          {/* Audio Track Group */}
          <div className="border-b border-gray-700">
            <div 
              className="flex items-center p-0.5 hover:bg-gray-800 cursor-pointer"
              onClick={() => toggleTrack('audio')}
            >
              {expandedTracks.audio ? (
                <ChevronDown className="w-2 h-2 text-gray-400" />
              ) : (
                <ChevronRight className="w-2 h-2 text-gray-400" />
              )}
              <Music className="w-2 h-2 ml-0.5 mr-0.5 text-green-400" />
              <span className="text-[7px] font-medium">Audio</span>
            </div>
            
            {expandedTracks.audio && (
              <div 
                style={{ width: `${Math.max(100, (project.duration || 60) * 50 * zoom)}px` }}
              >
                <TimelineTrack
                  trackType="audio"
                  items={project.audioTracks.map(track => ({
                    id: track.id,
                    name: track.name,
                    startTime: track.startTime,
                    endTime: track.endTime,
                    color: track.type === 'music' ? 'rgb(16, 185, 129)' : 'rgb(239, 68, 68)', // Green/Red
                    type: track.type,
                    selected: false
                  }))}
                  zoom={zoom}
                  onSelectItem={() => {}}
                  currentTime={currentTime}
                  project={project}
                  onTrimStart={() => {}}
                  onTrimEnd={() => {}}
                />
              </div>
            )}
          </div>
          
          {/* Text Track Group */}
          <div className="border-b border-gray-700">
            <div 
              className="flex items-center p-0.5 hover:bg-gray-800 cursor-pointer"
              onClick={() => toggleTrack('text')}
            >
              {expandedTracks.text ? (
                <ChevronDown className="w-2 h-2 text-gray-400" />
              ) : (
                <ChevronRight className="w-2 h-2 text-gray-400" />
              )}
              <Type className="w-2 h-2 ml-0.5 mr-0.5 text-yellow-400" />
              <span className="text-[7px] font-medium">Text</span>
            </div>
            
            {expandedTracks.text && (
              <div 
                style={{ width: `${Math.max(100, (project.duration || 60) * 50 * zoom)}px` }}
              >
                <TimelineTrack
                  trackType="text"
                  items={project.textOverlays.map(overlay => ({
                    id: overlay.id,
                    name: overlay.text,
                    startTime: overlay.startTime,
                    endTime: overlay.endTime,
                    color: 'rgb(234, 179, 8)', // Yellow
                    type: 'text',
                    selected: false
                  }))}
                  zoom={zoom}
                  onSelectItem={() => {}}
                  currentTime={currentTime}
                  project={project}
                  onTrimStart={() => {}}
                  onTrimEnd={() => {}}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}