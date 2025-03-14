import React, { useState } from 'react';
import { Video, Save, Download, Settings, Share } from 'lucide-react';

interface VideoHeaderProps {
  title: string;
  onTitleChange: (title: string) => void;
}

export default function VideoHeader({ title, onTitleChange }: VideoHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editableTitle, setEditableTitle] = useState(title);

  const handleTitleSave = () => {
    onTitleChange(editableTitle);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setEditableTitle(title);
      setIsEditing(false);
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-1 py-0.5 flex items-center justify-between text-xs">
      <div className="flex items-center">
        <Video className="h-2.5 w-2.5 text-primary mr-1" />
        {isEditing ? (
          <input
            type="text"
            value={editableTitle}
            onChange={(e) => setEditableTitle(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={handleKeyDown}
            className="border border-gray-300 rounded px-1 py-0.5 text-xs font-medium w-36"
            autoFocus
          />
        ) : (
          <h2 
            className="text-xs font-medium text-gray-900 cursor-pointer hover:text-primary"
            onClick={() => setIsEditing(true)}
          >
            {title}
          </h2>
        )}
      </div>
      
      <div className="flex items-center space-x-1">
        <button className="p-0.5 text-gray-500 hover:text-primary hover:bg-gray-100 rounded">
          <Save className="h-2.5 w-2.5" />
        </button>
        <button className="p-0.5 text-gray-500 hover:text-primary hover:bg-gray-100 rounded">
          <Settings className="h-2.5 w-2.5" />
        </button>
        <button className="p-0.5 text-gray-500 hover:text-primary hover:bg-gray-100 rounded">
          <Share className="h-2.5 w-2.5" />
        </button>
        <button className="px-1 py-0.5 text-[8px] font-medium text-white bg-primary hover:bg-primary-hover rounded flex items-center">
          <Download className="h-2 w-2 mr-0.5" />
          Export
        </button>
      </div>
    </div>
  );
}