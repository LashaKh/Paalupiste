import React from 'react';

interface TimelineRulerProps {
  duration: number;
  zoom: number;
  currentTime: number;
}

const CURSOR_COLOR = '#FF3A2D'; // Using the primary brand color
const CURSOR_WIDTH = 2; // Width of cursor line in pixels

export default function TimelineRuler({ 
  duration, 
  zoom,
  currentTime
}: TimelineRulerProps) {
  const createTimeMarkers = () => {
    const markers = [];
    const step = zoom >= 1 ? 1 : 5; // Use 1-second markers at higher zoom levels
    const maxTime = Math.max(duration, 60); // Ensure at least 60 seconds of timeline
    
    for (let i = 0; i <= maxTime; i += step) {
      const position = i * 50 * zoom;
      const shouldShowText = i % 5 === 0; // Show text every 5 seconds
      
      markers.push(
        <div key={i} className="absolute flex flex-col items-center" style={{ left: `${position}px` }}>
          <div className={`h-1 w-px bg-gray-500 ${shouldShowText ? 'bg-gray-400' : 'bg-gray-600'}`} />
          {shouldShowText && (
            <div className="text-[7px] text-gray-400">
              {formatTime(i)}
            </div>
          )}
        </div>
      );
    }
    
    return markers;
  };

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className="relative h-full"
      style={{ width: `${Math.max(100, duration * 50 * zoom)}px` }}
    >
      {/* Time markers */}
      {createTimeMarkers()}
      
      {/* Current time indicator */}
      <div
        className="absolute top-0 bottom-0 flex items-center justify-center z-10 pointer-events-none"
        style={{ 
          left: `${currentTime * 50 * zoom}px`,
          width: `${CURSOR_WIDTH}px`,
          transform: `translateX(-${CURSOR_WIDTH / 2}px)`
        }}
      >
        {/* Cursor triangle */}
        <div className="absolute -top-1">
          <svg width="12" height="6" viewBox="0 0 12 6" fill="none">
            <path d="M6 0L12 6H0L6 0Z" fill={CURSOR_COLOR} />
          </svg>
        </div>

        {/* Cursor line */}
        <div className="absolute inset-y-0 w-full bg-gradient-to-b from-primary via-primary to-primary/50" />
        
        {/* Time label */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-primary text-[7px] text-white px-1 py-0.5 rounded whitespace-nowrap shadow-sm">
          {formatTime(currentTime)}
        </div>
      </div>
    </div>
  );
}