import { useState, useCallback } from 'react';
import { VideoProject, VideoClip } from '../../types/video';
import { useToast } from '../../hooks/useToast';

interface UsePlaybackController {
  project: VideoProject;
  onError: (error: string) => void;
}

export function usePlaybackController({ project, onError }: UsePlaybackController) {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);
  const { showToast } = useToast();

  const selectedClip = selectedClipId ? project.clips.find(clip => clip.id === selectedClipId) : null;

  const handleClipEnd = useCallback(async () => {
    if (!selectedClip) return;

    const currentIndex = project.clips.findIndex(clip => clip.id === selectedClip.id);
    const nextClip = project.clips[currentIndex + 1];

    if (nextClip) {
      try {
        setIsLoadingVideo(true);
        setSelectedClipId(nextClip.id);
        setCurrentTime(nextClip.trim?.start || 0);
        setIsPlaying(true);
      } catch (error) {
        setIsPlaying(false);
        const errorMessage = error instanceof Error ? error.message : 'Failed to transition to next clip';
        onError(errorMessage);
        showToast(errorMessage, 'error');
      } finally {
        setIsLoadingVideo(false);
      }
    } else {
      setIsPlaying(false);
      showToast('End of playlist reached', 'info');
    }
  }, [selectedClip, project.clips]);

  const selectClip = useCallback((clipId: string) => {
    setSelectedClipId(clipId);
    const clip = project.clips.find(c => c.id === clipId);
    if (clip) {
      setCurrentTime(clip.trim?.start || 0);
    }
    setIsPlaying(false);
  }, [project.clips]);

  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  const handlePlayStateChange = useCallback((playing: boolean) => {
    if (playing && !selectedClip) {
      // Auto-select first clip if none selected
      const firstClip = project.clips[0];
      if (firstClip) {
        setSelectedClipId(firstClip.id);
        setCurrentTime(firstClip.trim?.start || 0);
      } else {
        showToast('No clips available to play', 'info');
        return;
      }
    }
    setIsPlaying(playing);
  }, [selectedClip, project.clips]);

  const handleSeek = useCallback((time: number) => {
    setCurrentTime(time);
    setIsPlaying(false);
  }, []);

  return {
    currentTime,
    isPlaying,
    selectedClipId,
    selectedClip,
    isLoadingVideo,
   setSelectedClipId,
    handleClipEnd,
    selectClip,
    handleTimeUpdate,
    handlePlayStateChange,
    handleSeek,
  };
}