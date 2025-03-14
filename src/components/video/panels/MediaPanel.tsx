import React, { useState, useEffect } from 'react';
import { 
  Upload, Image, Music, Video, File, 
  Search, FolderOpen, Plus, Library, GridIcon,
  ListIcon, ChevronRight, ChevronDown, AlertCircle,
  X
} from 'lucide-react';
import { useToast } from '../../../hooks/useToast';
import { VideoProject } from '../../../types/video';

interface MediaPanelProps {
  onError: (errorMessage: string) => void;
  project: VideoProject;
  updateProject: (updates: Partial<VideoProject>) => void;
}

export default function MediaPanel({ onError, project, updateProject }: MediaPanelProps) {
  const [mediaType, setMediaType] = useState<'video' | 'audio' | 'images'>('video');
  const [uploadedMedia, setUploadedMedia] = useState<Array<{id: string, name: string, url: string, type: string}>>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    uploads: true,
    stock: false,
    recent: false
  });
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { showToast } = useToast();

  // Track which videos are in the timeline
  const [videosInTimeline, setVideosInTimeline] = useState<Set<string>>(new Set());

  // Update videosInTimeline when project.clips changes
  useEffect(() => {
    setVideosInTimeline(new Set(project.clips.map(clip => clip.id)));
  }, [project.clips]);

  // Track object URLs to clean up
  const [objectUrls, setObjectUrls] = useState<string[]>([]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      objectUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [objectUrls]);

  // File size limits in bytes
  const FILE_SIZE_LIMITS = {
    video: 100 * 1024 * 1024, // 100MB for videos
    audio: 10 * 1024 * 1024,  // 10MB for audio
    image: 10 * 1024 * 1024   // 10MB for images
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'video' | 'audio' | 'image') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      // Clear previous errors
      setUploadError(null);
      
      const allowedTypes: Record<string, string[]> = {
        video: ['video/mp4', 'video/webm', 'video/avi', 'video/mov'],
        audio: ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/mpeg'],
        image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      };

      // Check if file types are allowed
      const invalidFiles = Array.from(files).filter(file => !allowedTypes[type].includes(file.type));
      if (invalidFiles.length > 0) {
        const errorMsg = `Some files have invalid formats for ${type} upload`;
        setUploadError(errorMsg);
        onError(errorMsg);
        showToast(errorMsg, 'error');
        return;
      }

      // Check file size against type-specific limits
      const sizeLimit = FILE_SIZE_LIMITS[type];
      const oversizedFiles = Array.from(files).filter(file => file.size > sizeLimit);
      if (oversizedFiles.length > 0) {
        const sizeMB = sizeLimit / (1024 * 1024);
        const errorMsg = `Some files exceed the ${sizeMB}MB size limit for ${type} files`;
        setUploadError(errorMsg);
        onError(errorMsg);
        showToast(errorMsg, 'error');
        return;
      }

      const newMedia = Array.from(files).map(file => {
        // Create object URL for the file
        const url = URL.createObjectURL(file);
        setObjectUrls(prev => [...prev, url]);
        
        // Create media object
        return {
          id: Math.random().toString(36).substring(2, 9),
          name: file.name,
          url,
          type
        };
      });

      setUploadedMedia(prev => [...prev, ...newMedia]);
      showToast(`${newMedia.length} ${type}(s) uploaded successfully`, 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadError(errorMessage);
      onError(errorMessage);
      showToast(`Upload failed: ${errorMessage}`, 'error');
    }
  };

  const toggleFolder = (folder: string) => {
    setExpandedFolders(prev => ({ 
      ...prev, 
      [folder]: !prev[folder] 
    }));
  };

  const clearError = () => {
    setUploadError(null);
  };

  // Calculate the next available position on the timeline
  const getNextAvailablePosition = () => {
    if (project.clips.length === 0) return 0;
    
    // Find the latest end time of all clips
    const latestEndTime = Math.max(...project.clips.map(clip => 
      (clip.trim?.end || clip.duration)
    ));
    
    // Add a minimal gap (0.1 second) after the last clip
    return latestEndTime + 0.1;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Media Type Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setMediaType('video')}
          className={`flex-1 py-2 px-3 text-xs font-medium ${
            mediaType === 'video' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-gray-600 hover:text-primary'
          }`}
        >
          <Video className="w-3 h-3 inline-block mr-1" />
          Videos
        </button>
        <button
          onClick={() => setMediaType('audio')}
          className={`flex-1 py-2 px-3 text-xs font-medium ${
            mediaType === 'audio' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-gray-600 hover:text-primary'
          }`}
        >
          <Music className="w-3 h-3 inline-block mr-1" />
          Audio
        </button>
        <button
          onClick={() => setMediaType('images')}
          className={`flex-1 py-2 px-3 text-xs font-medium ${
            mediaType === 'images' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-gray-600 hover:text-primary'
          }`}
        >
          <Image className="w-3 h-3 inline-block mr-1" />
          Images
        </button>
      </div>

      {uploadError && (
        <div className="m-2 bg-red-50 border border-red-200 text-red-600 rounded px-2 py-1 text-xs flex items-start">
          <AlertCircle className="w-3 h-3 mt-0.5 mr-1 flex-shrink-0" />
          <span className="flex-1">{uploadError}</span>
          <button onClick={clearError} className="text-red-500 hover:text-red-700 ml-1">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Search and View Controls */}
      <div className="p-2 flex items-center justify-between border-b border-gray-200">
        <div className="relative flex-1 mr-2">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search media"
            className="w-full pl-7 pr-2 py-1 text-xs border border-gray-300 rounded"
          />
        </div>
        
        <div className="flex">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1 ${viewMode === 'grid' ? 'text-primary' : 'text-gray-500'}`}
          >
            <GridIcon className="w-3 h-3" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1 ${viewMode === 'list' ? 'text-primary' : 'text-gray-500'}`}
          >
            <ListIcon className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Media Browser */}
      <div className="flex-1 overflow-y-auto p-2">
        {/* Upload Section */}
        <div className="mb-3">
          <div 
            className="flex items-center py-1 px-2 text-xs font-medium cursor-pointer hover:bg-gray-100 rounded"
            onClick={() => toggleFolder('uploads')}
          >
            {expandedFolders.uploads ? (
              <ChevronDown className="w-3 h-3 mr-1" />
            ) : (
              <ChevronRight className="w-3 h-3 mr-1" />
            )}
            Uploads
          </div>
          
          {expandedFolders.uploads && (
            <div className="mt-2 pl-5 space-y-2">
              {/* Upload Buttons */}
              <div className="flex flex-wrap gap-1 mb-2">
                <label className="inline-flex items-center px-2 py-1 text-xs text-white bg-primary hover:bg-primary-hover rounded cursor-pointer">
                  <Upload className="w-3 h-3 mr-1" />
                  Upload Video
                  <input
                    type="file"
                    className="hidden"
                    key={uploadedMedia.length} // Force input reset on deletion
                    accept="video/*"
                    onChange={(e) => handleMediaUpload(e, 'video')}
                    multiple
                  />
                </label>
                
                <label className="inline-flex items-center px-2 py-1 text-xs text-primary border border-primary hover:bg-primary-hover hover:text-white rounded cursor-pointer">
                  <Upload className="w-3 h-3 mr-1" />
                  Upload Audio
                  <input
                    type="file"
                    className="hidden"
                    key={uploadedMedia.length} // Force input reset on deletion
                    accept="audio/*"
                    onChange={(e) => handleMediaUpload(e, 'audio')}
                    multiple
                  />
                </label>
                
                <label className="inline-flex items-center px-2 py-1 text-xs text-primary border border-primary hover:bg-primary-hover hover:text-white rounded cursor-pointer">
                  <Upload className="w-3 h-3 mr-1" />
                  Upload Image
                  <input
                    type="file"
                    className="hidden"
                    key={uploadedMedia.length} // Force input reset on deletion
                    accept="image/*"
                    onChange={(e) => handleMediaUpload(e, 'image')}
                    multiple
                  />
                </label>
              </div>
              
              {/* Uploaded Media */}
              {uploadedMedia.filter(media => 
                (mediaType === 'video' && media.type === 'video') ||
                (mediaType === 'audio' && media.type === 'audio') ||
                (mediaType === 'images' && media.type === 'image')
              ).length > 0 ? (
                <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-2' : 'space-y-2'}>
                  {uploadedMedia
                    .filter(media => 
                      (mediaType === 'video' && media.type === 'video') ||
                      (mediaType === 'audio' && media.type === 'audio') ||
                      (mediaType === 'images' && media.type === 'image')
                    )
                    .map(media => (
                      <div 
                        key={media.id}
                        className={`
                          border border-gray-200 rounded hover:border-primary cursor-pointer
                          relative
                          ${viewMode === 'grid' ? '' : 'flex items-center p-1'}
                          ${videosInTimeline.has(media.id) ? 'ring-2 ring-primary' : ''}
                        `}
                        title={media.name}
                        draggable={media.type === 'video' && !videosInTimeline.has(media.id)}
                        onDragStart={(e) => {
                          e.dataTransfer.setData('application/json', JSON.stringify({
                            id: media.id,
                            name: media.name,
                            url: media.url,
                            type: media.type
                          }));
                        }}
                      >
                        {media.type === 'video' && (
                          <video
                            src={media.url}
                            className={`${viewMode === 'grid' ? 'w-full aspect-video' : 'w-10 h-10'} object-cover`}
                            onError={() => {
                              const errorMsg = `Failed to load video: ${media.name}`;
                              setUploadError(errorMsg);
                              onError(errorMsg);
                            }}
                          />
                        )}
                        {media.type === 'image' && (
                          <img
                            src={media.url}
                            alt={media.name}
                            className={`${viewMode === 'grid' ? 'w-full aspect-video' : 'w-10 h-10'} object-cover`}
                            onError={() => {
                              const errorMsg = `Failed to load image: ${media.name}`;
                              setUploadError(errorMsg);
                              onError(errorMsg);
                            }}
                          />
                        )}
                        {media.type === 'audio' && (
                          <div className={`
                            bg-gray-100 flex items-center justify-center
                            ${viewMode === 'grid' ? 'w-full aspect-video' : 'w-10 h-10'}
                          `}>
                            <Music className="w-6 h-6 text-gray-500" />
                          </div>
                        )}
                        
                        {viewMode === 'list' && (
                          <span className="ml-2 text-xs truncate">{media.name}</span>
                        )}
                        
                        {/* Delete from uploads button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Only remove from uploads
                            URL.revokeObjectURL(media.url);
                            setObjectUrls(prev => prev.filter(url => url !== media.url));
                            setUploadedMedia(prev => prev.filter(m => m.id !== media.id));
                            showToast('Media deleted', 'success');
                          }}
                          className="absolute top-1 right-1 p-1 bg-red-500/20 hover:bg-red-500/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3 text-red-500" />
                        </button>

                        {/* Add to timeline button */}
                        {media.type === 'video' && !videosInTimeline.has(media.id) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const video = document.createElement('video');
                              video.src = media.url;
                              
                              video.onerror = () => {
                                const errorMsg = `Failed to load video: ${media.name}. Please ensure it's a valid video file.`;
                                setUploadError(errorMsg);
                                onError(errorMsg);
                                showToast(errorMsg, 'error');
                              };
                              
                              video.onloadedmetadata = () => {
                                // Calculate next available position
                                const startPosition = getNextAvailablePosition();
                                
                                const newClip = {
                                  id: media.id,
                                  name: media.name,
                                  source: media.url,
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
                                
                                setVideosInTimeline(prev => new Set([...prev, media.id]));
                                showToast('Video added to timeline', 'success');
                              };
                            }}
                            className="absolute top-1 right-8 p-1 bg-primary/20 hover:bg-primary/40 rounded-full"
                          >
                            <Plus className="w-3 h-3 text-primary" />
                          </button>
                        )}
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-3 border-2 border-dashed border-gray-200 rounded-lg">
                  <Upload className="mx-auto w-6 h-6 text-gray-400" />
                  <p className="mt-1 text-xs text-gray-500">No {mediaType} uploads yet</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Stock Media */}
        <div className="mb-3">
          <div 
            className="flex items-center py-1 px-2 text-xs font-medium cursor-pointer hover:bg-gray-100 rounded"
            onClick={() => toggleFolder('stock')}
          >
            {expandedFolders.stock ? (
              <ChevronDown className="w-3 h-3 mr-1" />
            ) : (
              <ChevronRight className="w-3 h-3 mr-1" />
            )}
            Stock Media
          </div>
          
          {expandedFolders.stock && (
            <div className="mt-2 pl-5">
              <p className="text-xs text-gray-500 italic">Browse stock media to use in your projects</p>
              {/* This would be populated with actual stock media options */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}