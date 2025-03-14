import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Loader2 } from 'lucide-react';
import { VideoClip } from '../../types/video';

interface VideoPlayerProps {
  selectedClip: VideoClip | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  onTimeUpdate: (time: number) => void;
  onDurationChange: (duration: number) => void;
  onPlayStateChange: (isPlaying: boolean) => void;
  onVolumeChange: (volume: number) => void;
  onError: (error: string) => void;
  onClipEnd: () => void;
  isLoadingVideo: boolean;
}

export default function VideoPlayer({
  selectedClip,
  isPlaying,
  volume,
  currentTime,
  onTimeUpdate,
  onDurationChange,
  onPlayStateChange,
  onVolumeChange,
  onError,
  onClipEnd,
  isLoadingVideo
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 });

  // Load and prepare video when clip changes
  useEffect(() => {
    if (!videoRef.current || !selectedClip) return;

    const prepareVideo = async () => {
      try {
        // Reset video element
        videoRef.current.pause();
        videoRef.current.removeAttribute('src');
        videoRef.current.load();

        // Set new source and properties
        videoRef.current.src = selectedClip.source;
        videoRef.current.currentTime = selectedClip.trim?.start || 0;
        
        // Wait for video to be ready
        await videoRef.current.load();
        setIsVideoReady(true);
        
        // Store original video dimensions
        setVideoDimensions({
          width: videoRef.current.videoWidth,
          height: videoRef.current.videoHeight
        });

        if (isPlaying) {
          try {
            await videoRef.current.play();
          } catch (error) {
            onPlayStateChange(false);
            throw error;
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to prepare video';
        onError(errorMessage);
        setIsVideoReady(false);
      }
    };

    prepareVideo();

    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.removeAttribute('src');
        videoRef.current.load();
      }
    };
  }, [selectedClip?.id]);

  // Handle play state changes
  useEffect(() => {
    if (!videoRef.current || !isVideoReady) return;

    const playVideo = async () => {
      try {
        if (isPlaying) {
          await videoRef.current.play();
        } else {
          videoRef.current.pause();
        }
      } catch (error) {
        onPlayStateChange(false);
        const errorMessage = error instanceof Error ? error.message : 'Playback error';
        onError(errorMessage);
      }
    };

    playVideo();
  }, [isPlaying, isVideoReady]);

  // Handle volume changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
  }, [volume]);

  // Handle playback speed changes
  useEffect(() => {
    if (videoRef.current && selectedClip) {
      videoRef.current.playbackRate = selectedClip.speed;
    }
  }, [selectedClip?.speed]);

  // Calculate video dimensions based on trim
  const getVideoStyle = () => {
    if (!selectedClip || !videoDimensions.width || !videoDimensions.height) {
      return { opacity: isLoadingVideo ? 0 : 1 };
    }

    const trimStart = selectedClip.trim?.start || 0;
    const trimEnd = selectedClip.trim?.end || selectedClip.duration;
    const trimDuration = trimEnd - trimStart;
    const aspectRatio = videoDimensions.width / videoDimensions.height;

    // Calculate dimensions to maintain aspect ratio
    const containerWidth = '100%';
    const containerHeight = '100%';
    
    return {
      width: containerWidth,
      height: containerHeight,
      objectFit: 'contain' as const,
      opacity: isLoadingVideo ? 0 : 1,
      transform: `scale(${selectedClip.speed >= 1 ? 1 : selectedClip.speed})`,
      transition: 'transform 0.2s ease-out'
    };
  };

  // Handle time updates
  useEffect(() => {
    if (!videoRef.current || !isVideoReady) return;
    
    if (Math.abs(videoRef.current.currentTime - currentTime) > 0.1) {
      videoRef.current.currentTime = currentTime;
    }
  }, [currentTime, isVideoReady]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative w-full h-full">
      {isLoadingVideo && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
      )}
      
      <video
        ref={videoRef}
        className="w-full h-full bg-black"
        preload="auto"
        onTimeUpdate={() => {
          if (videoRef.current) {
            onTimeUpdate(videoRef.current.currentTime);
            
            // Check for clip end
            if (selectedClip && videoRef.current.currentTime >= (selectedClip.trim?.end || selectedClip.duration)) {
              onClipEnd();
            }
          }
        }}
        onLoadedMetadata={() => {
          if (videoRef.current) {
            onDurationChange(videoRef.current.duration);
          }
        }}
        onError={(e) => {
          const mediaError = (e.target as HTMLVideoElement).error;
          let errorMessage = "Failed to play video. ";
          
          if (mediaError) {
            switch (mediaError.code) {
              case MediaError.MEDIA_ERR_ABORTED:
                errorMessage += "The video playback was aborted.";
                break;
              case MediaError.MEDIA_ERR_NETWORK:
                errorMessage += "A network error occurred while loading the video.";
                break;
              case MediaError.MEDIA_ERR_DECODE:
                errorMessage += "The video file is corrupted or uses an unsupported format.";
                break;
              case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
                errorMessage += "The video format is not supported. Please use MP4 or WebM format.";
                break;
            }
          }
          
          onError(errorMessage);
          onPlayStateChange(false);
          setIsVideoReady(false);
        }}
        playsInline
        crossOrigin="anonymous"
        muted={volume === 0}
        style={getVideoStyle()}
      />

      {/* Video Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gray-800/80 text-white py-0.5 px-1 flex items-center text-xs">
        <button 
          onClick={() => onPlayStateChange(!isPlaying)}
          className="p-0.5 hover:bg-gray-700 rounded"
          disabled={!isVideoReady}
        >
          {isPlaying ? <Pause className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5" />}
        </button>
        <button className="p-0.5 hover:bg-gray-700 rounded mx-1">
          <SkipBack className="w-2.5 h-2.5" />
        </button>
        <button className="p-0.5 hover:bg-gray-700 rounded">
          <SkipForward className="w-2.5 h-2.5" />
        </button>
        
        <div className="mx-1 text-[8px]">
          {formatTime(currentTime)} / {formatTime(selectedClip?.duration || 0)}
        </div>
        
        <div className="ml-auto flex items-center">
          <Volume2 className="w-2.5 h-2.5 mr-1" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="w-12"
          />
        </div>
      </div>
    </div>
  );
}