import React from 'react';
import { Video } from 'lucide-react';
import VideoEditor from '../components/video/VideoEditor';

export default function VideoGeneration() {
  return (
    <div className="flex flex-col h-[calc(100vh-40px)] w-screen overflow-hidden">
      {/* Ultra-compact header */}
      <div className="bg-gray-900 text-white py-1 px-2 flex items-center gap-2 border-b border-gray-700">
        <Video className="h-4 w-4 text-primary" />
        <h1 className="text-base font-medium">Video Generation</h1>
      </div>
      
      {/* Full-height editor */}
      <div className="flex-1 overflow-hidden">
        <VideoEditor />
      </div>
    </div>
  );
}