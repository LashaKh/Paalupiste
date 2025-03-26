import React, { useState, useEffect, useRef } from 'react';
import { Check, X, Edit } from 'lucide-react';

interface EditableFieldProps {
  value: string;
  onSave: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'textarea' | 'select';
  options?: Array<{ label: string; value: string }>;
  multiline?: boolean;
  className?: string;
  inputClassName?: string;
  displayComponent?: React.ReactNode;
  canEdit?: boolean;
}

export function EditableField({
  value,
  onSave,
  placeholder = 'Click to edit',
  type = 'text',
  options = [],
  multiline = false,
  className = '',
  inputClassName = '',
  displayComponent,
  canEdit = true,
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (e.key === 'Enter' && !multiline) {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleSave = () => {
    onSave(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleStartEditing = () => {
    if (canEdit) {
      setIsEditing(true);
    }
  };

  const renderDisplay = () => {
    if (displayComponent) {
      return displayComponent;
    }

    return (
      <div 
        onClick={handleStartEditing} 
        className={`group text-gray-800 py-1 px-2 -m-1 rounded ${canEdit ? 'hover:bg-gray-100 cursor-pointer' : ''} ${className}`}
      >
        {value ? (
          <span>{value}</span>
        ) : (
          <span className="text-gray-400 italic">{placeholder}</span>
        )}
        {canEdit && <Edit className="w-3 h-3 ml-1.5 text-gray-400 opacity-0 group-hover:opacity-100 inline-block transition-opacity" />}
      </div>
    );
  };

  const renderEditor = () => {
    const commonClasses = `w-full border rounded focus:outline-none focus:ring-1 focus:ring-primary px-2 py-1 text-sm ${inputClassName}`;

    if (type === 'textarea' || multiline) {
      return (
        <div className="flex flex-col">
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            className={`${commonClasses} min-h-[80px]`}
            placeholder={placeholder}
          />
          <div className="flex justify-end mt-1 space-x-1">
            <button
              onClick={handleCancel}
              className="p-1 text-gray-500 hover:bg-gray-100 rounded"
              title="Cancel"
            >
              <X className="w-3 h-3" />
            </button>
            <button
              onClick={handleSave}
              className="p-1 text-primary hover:bg-primary/10 rounded"
              title="Save"
            >
              <Check className="w-3 h-3" />
            </button>
          </div>
        </div>
      );
    }

    if (type === 'select') {
      return (
        <div className="flex items-center">
          <select
            ref={inputRef as React.RefObject<HTMLSelectElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            className={commonClasses}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="ml-1 flex space-x-1">
            <button
              onClick={handleCancel}
              className="p-1 text-gray-500 hover:bg-gray-100 rounded"
              title="Cancel"
            >
              <X className="w-3 h-3" />
            </button>
            <button
              onClick={handleSave}
              className="p-1 text-primary hover:bg-primary/10 rounded"
              title="Save"
            >
              <Check className="w-3 h-3" />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center">
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className={commonClasses}
          placeholder={placeholder}
        />
        <div className="ml-1 flex space-x-1">
          <button
            onClick={handleCancel}
            className="p-1 text-gray-500 hover:bg-gray-100 rounded"
            title="Cancel"
          >
            <X className="w-3 h-3" />
          </button>
          <button
            onClick={handleSave}
            className="p-1 text-primary hover:bg-primary/10 rounded"
            title="Save"
          >
            <Check className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  };

  return isEditing ? renderEditor() : renderDisplay();
} 