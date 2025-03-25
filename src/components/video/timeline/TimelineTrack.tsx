import React, { useState, useEffect, useRef } from 'react';
import { X, MoveHorizontal, GripVertical } from 'lucide-react';
import { VideoProject } from '../../../types/video';

interface DragState {
  startX: number;
  startTime: number;
  itemId: string | null;
}

interface TimelineItem {
  id: string;
  name: string;
  startTime: number;
  endTime: number;
  color: string;
  type: string;
  selected: boolean;
}

interface TimelineTrackProps {
  trackType: 'video' | 'audio' | 'text';
  items: TimelineItem[];
  zoom: number;
  onSelectItem: (clipId: string) => void;
  selectedClipId: string | null;
  onItemDragStart?: (itemId: string) => void;
  onItemDragEnd?: () => void;
  onItemDrag?: (delta: number) => void;
  currentTime: number;
  onDeleteItem?: (id: string) => void;
  onTrimStart: (id: string, time: number) => void;
  onTrimEnd: (id: string, time: number) => void;
  project: VideoProject;
}

export default function TimelineTrack({
  trackType,
  items,
  zoom,
  onSelectItem,
  selectedClipId,
  onItemDragStart,
  onItemDragEnd,
  onItemDrag,
  currentTime,
  onDeleteItem,
  onTrimStart,
  onTrimEnd,
  project,
}: TimelineTrackProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState<'trim-start' | 'trim-end' | null>(null);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartTime, setDragStartTime] = useState(0);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // Default track height based on type
  const getTrackHeight = () => {
    switch (trackType) {
      case 'video':
        return 'h-6';
      case 'audio':
        return 'h-4';
      case 'text':
        return 'h-3';
      default:
        return 'h-4';
    }
  };

  // Calculate position and width based on timeline zoom
  const getItemStyle = (item: TimelineItem) => {
    const leftPosition = item.startTime * 50 * zoom;
    const width = (item.endTime - item.startTime) * 50 * zoom;
    
    return {
      left: `${leftPosition}px`,
      width: `${Math.max(width - 2, 0)}px`, // Minimal gap (2px)
      backgroundColor: item.color
    };
  };

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMouseDown = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    
    // Get the click target
    const target = e.target as HTMLElement;
    
    // Check if clicking on trim handles
    if (target.closest('.trim-handle')) {
      return; // Let the trim handlers handle it
    }
    
    if (trackType !== 'video') return;
    
    const trackRect = trackRef.current?.getBoundingClientRect();
    if (!trackRect) return;

    const item = items.find(i => i.id === itemId);
    if (!item) return;

    // Calculate offset from mouse position to item start
    const itemStartPx = item.startTime * 50 * zoom;
    const mousePositionInTrack = e.clientX - trackRect.left;
    const offsetX = mousePositionInTrack - itemStartPx;
    
    // Store initial drag state
    setDragOffset(offsetX);
    setDragStartX(e.clientX);
    setDragStartTime(item.startTime);
    setDraggedItemId(itemId);
    setIsDragging(true);
    setDragType(null);
    
    onSelectItem(itemId);

    // Prevent text selection while dragging
    e.preventDefault();

    // Set cursor style
    document.body.style.cursor = 'grabbing';
    (e.currentTarget as HTMLElement).style.cursor = 'grabbing';
  };

  const handleTrimDragStart = (e: React.MouseEvent, item: TimelineItem, type: 'trim-start' | 'trim-end') => {
    e.stopPropagation();
    e.preventDefault();
    
    if (trackType !== 'video') return;
    
    setIsDragging(true);
    setDragType(type);
    setDragStartX(e.clientX);
    setDragStartTime(type === 'trim-start' ? item.startTime : item.endTime);
    setDraggedItemId(item.id);
    onSelectItem(item.id);
  };

  const handleTrimDragMove = (e: MouseEvent) => {
    if (!isDragging || !dragType || !draggedItemId) return;
    
    const trackRect = document.querySelector('.timeline-track')?.getBoundingClientRect() || { left: 0, width: 0 };
    if (!trackRect) return;
    
    const mouseX = e.clientX - trackRect.left;
    let newTime = Math.max(0, mouseX / (50 * zoom));
    
    const item = items.find(i => i.id === draggedItemId);
    if (!item) return;
    
    if (dragType === 'trim-start') {
      const maxStart = item.endTime - 0.1;
      onTrimStart(draggedItemId, Math.min(newTime, maxStart));
    } else {
      const minEnd = item.startTime + 0.1;
      onTrimEnd(draggedItemId, Math.max(newTime, minEnd));
    }
  };

  const handleTrimDragEnd = () => {
    setIsDragging(false);
    setDragType(null);
    setDraggedItemId(null);
  };

  useEffect(() => {
    if (isDragging) {
      const handleMouseMove = (e: MouseEvent) => {
        if (draggedItemId && !dragType && dragOffset !== null && trackRef.current) {
          // Handle clip movement
          const trackRect = trackRef.current.getBoundingClientRect();
          
          // Calculate new position based on mouse position minus the initial drag offset
          const mousePositionInTrack = e.clientX - trackRect.left;
          const newPositionPx = mousePositionInTrack - dragOffset;
          let newStartTime = Math.max(0, newPositionPx / (50 * zoom));
          
          const item = items.find(i => i.id === draggedItemId);
          if (item) {
            const duration = item.endTime - item.startTime;
            
            // Ensure clip stays within timeline bounds
            const maxStartTime = Math.max(0, (project?.duration || 60) - duration);
            newStartTime = Math.max(0, Math.min(newStartTime, maxStartTime));
            
            // Update clip position
            if (onTrimStart && onTrimEnd) {
              onTrimStart(draggedItemId, newStartTime);
              onTrimEnd(draggedItemId, newStartTime + duration);
            }
          }
        } else {
          handleTrimDragMove(e);
        }
      };
      
      const handleMouseUp = () => {
        setDragOffset(null);
        setDraggedItemId(null);
        setIsDragging(false);
        setDragType(null);
        handleTrimDragEnd();
        
        // Reset cursor style
        document.body.style.cursor = '';
        if (trackRef.current) {
          const items = trackRef.current.querySelectorAll('.timeline-item');
          items.forEach(item => {
            if (item instanceof HTMLElement) {
              item.style.cursor = 'grab';
            }
          });
        }
      };
      
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
      };
    }
  }, [isDragging, dragType, draggedItemId, dragOffset, zoom, project]);

  return (
    <div ref={trackRef} className={`relative ${getTrackHeight()} bg-gray-850 border-b border-gray-800 timeline-track`}>
      {/* Current time indicator */}
      <div 
        className="absolute top-0 bottom-0 w-px bg-red-500 z-10"
        style={{ left: `${currentTime * 50 * zoom}px` }}
      />
      
      {/* Timeline items */}
      {items.map(item => (
        <div
          key={item.id}
          className={`absolute top-0.5 bottom-0.5 mx-1 rounded-md cursor-move transition-all duration-150 overflow-hidden group
            timeline-item
            border-[2px] border-gray-900 shadow-lg
            ${item.selected ? 'ring-2 ring-primary shadow-lg scale-y-105 z-10' : 'hover:ring-1 hover:ring-primary/50'}
            hover:scale-y-105
          `}
          style={{
            ...getItemStyle(item),
            cursor: 'default'
          }}
          onClick={(e) => {
            e.stopPropagation();
            onSelectItem(item.id);
          }}
          title={`${item.name} (${formatTime(item.startTime)} - ${formatTime(item.endTime)})`}
        >
          {/* Trim handles */}
          {trackType === 'video' && (
            <>
              {/* Left trim handle - Add trim-handle class */}
              <button
                className="trim-handle absolute left-0 top-0 bottom-0 w-4 -ml-2 cursor-w-resize opacity-0 group-hover:opacity-100 z-20 focus:outline-none"
                onMouseDown={(e) => handleTrimDragStart(e, item, 'trim-start')}
              >
                <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-white/50 group-hover:bg-primary" />
                <GripVertical className="absolute left-1 top-1/2 -translate-y-1/2 w-2 h-4 text-white/50 group-hover:text-primary" />
              </button>
              
              {/* Right trim handle - Add trim-handle class */}
              <button
                className="trim-handle absolute right-0 top-0 bottom-0 w-4 -mr-2 cursor-e-resize opacity-0 group-hover:opacity-100 z-20 focus:outline-none"
                onMouseDown={(e) => handleTrimDragStart(e, item, 'trim-end')}
              >
                <div className="absolute right-2 top-0 bottom-0 w-0.5 bg-white/50 group-hover:bg-primary" />
                <GripVertical className="absolute right-1 top-1/2 -translate-y-1/2 w-2 h-4 text-white/50 group-hover:text-primary" />
              </button>
            </>
          )}

          {/* Item label */}
          <div className="flex items-center justify-between px-2 h-full bg-gradient-to-r from-black/70 via-black/40 to-transparent">
            <span className="text-[7px] text-white font-medium truncate">
              <div 
                className="absolute inset-0 cursor-grab active:cursor-grabbing"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  if (onItemDragStart) {
                    onItemDragStart(item.id);
                  }
                }}
              />
              {item.name}
            </span>
            
            {/* For video and audio, show duration */}
            {(trackType === 'video' || trackType === 'audio') && (
              <span className="text-[6px] text-white/80 ml-1 hidden sm:inline">
                {formatTime(item.endTime - item.startTime)}
              </span>
            )}

            {/* Delete button */}
            {onDeleteItem && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteItem(item.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-500/20 rounded"
              >
                <X className="w-2 h-2 text-red-500" />
              </button>
            )}
          </div>
          
          {/* Drag handles */}
          <div className="absolute inset-x-0 top-0 h-full flex items-center justify-center opacity-0 group-hover:opacity-100">
            <MoveHorizontal className="w-4 h-4 text-white/80" />
          </div>
          
          {/* Visual styles based on item type */}
          {trackType === 'audio' && (
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <div className="w-full h-1/2 bg-white/10">
                <div className="h-full w-full bg-current opacity-50" 
                  style={{
                    maskImage: "url(\"data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M0,50 Q5,30 10,50 T20,50 T30,50 T40,50 T50,50 T60,50 T70,50 T80,50 T90,50 T100,50' stroke='black' fill='none' stroke-width='6'/%3e%3c/svg%3e\")",
                    maskSize: "20px 100%",
                    maskRepeat: "repeat-x"
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}