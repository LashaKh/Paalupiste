import React, { useState, useEffect, useCallback } from 'react';
import { X, Save, Edit2, Eye, Loader2, FileText, Send } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useOutlines } from '../../contexts/OutlineContext';
import { marked } from 'marked';
import { v4 as uuidv4 } from 'uuid';

interface OutlineEditorProps {
  title: string;
  outlineId: string;
  content: string;
  onClose: () => void;
  onGenerateArticle: () => Promise<void>;
}

export function OutlineEditor({ title, outlineId, content, onClose, onGenerateArticle }: OutlineEditorProps) {
  const [editedContent, setEditedContent] = useState(content);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { showToast } = useToast();
  const { updateOutline } = useOutlines();

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      if (isEditing) {
        handleSave();
      }
    }
  }, [isEditing, onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateOutline(outlineId, editedContent);
      setIsEditing(false);
      showToast('Outline saved successfully', 'success');
    } catch (error) {
      showToast('Failed to save outline', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateArticle = async () => {
    setIsGenerating(true);
    try {
      // Generate a unique request ID
      const requestId = uuidv4();

      // Call the webhook with the unique request ID
      const response = await fetch('https://hook.eu2.make.com/ux47aj42iy2kmndvwswve3lhex6euwq3', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: requestId,
          title,
          outline: editedContent,
          type: 'article'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate article');
      }

      showToast('Article generation started successfully', 'success');
    } catch (error) {
      showToast('Failed to generate article', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50" aria-labelledby="outline-modal" role="dialog" aria-modal="true">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Overlay */}
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" aria-hidden="true" onClick={onClose} />

        {/* Modal */}
        <div 
          className="relative w-[70vw] max-h-[85vh] bg-white rounded-xl shadow-2xl transform transition-all flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <FileText className="w-6 h-6 mr-2 text-primary" />
              {title}
            </h2>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {isEditing ? (
                  <>
                    <Eye className="w-4 h-4 mr-1.5" />
                    Preview
                  </>
                ) : (
                  <>
                    <Edit2 className="w-4 h-4 mr-1.5" />
                    Edit
                  </>
                )}
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto flex-1">
            {isEditing ? (
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full h-full min-h-[400px] p-4 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                placeholder="Enter your outline content..."
              />
            ) : (
              <div className="prose prose-lg max-w-none prose-headings:font-bold prose-h2:text-2xl prose-h3:text-xl prose-h2:mt-8 prose-h3:mt-6">
                <div className="markdown-preview whitespace-pre-wrap">
                  <div dangerouslySetInnerHTML={{ __html: marked(editedContent) }} />
                </div>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="flex items-center justify-end gap-4 p-6 border-t border-gray-200">
            <button
              onClick={onGenerateArticle}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <Send className="w-4 h-4 mr-2" />
              Generate Article
            </button>
            {isEditing && (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="animate-spin w-4 h-4 mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}