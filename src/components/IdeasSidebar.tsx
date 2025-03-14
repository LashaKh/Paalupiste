import React from 'react';
import { FileText, Trash2, X, Plus } from 'lucide-react';
import { useIdeas, ArticleIdea } from '../contexts/IdeasContext';
import { useToast } from '../contexts/ToastContext';

interface IdeasSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectIdea: (idea: ArticleIdea) => void;
}

export function IdeasSidebar({ isOpen, onClose, onSelectIdea }: IdeasSidebarProps) {
  const { ideas, deleteIdea } = useIdeas();
  const { showToast } = useToast();

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteIdea(id);
      showToast('Idea deleted successfully', 'success');
    } catch (error) {
      showToast('Failed to delete idea', 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50" aria-labelledby="ideas-modal" role="dialog" aria-modal="true">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" aria-hidden="true" onClick={onClose} />

        <div className="relative w-[70vw] h-[85vh] bg-white rounded-xl shadow-2xl transform transition-all">
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Saved Article Ideas</h2>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {ideas.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No saved ideas yet</p>
                </div>
              ) : (
                ideas.map((idea) => (
                  <div
                    key={idea.id}
                    className="group bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{idea.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{idea.description}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(idea.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onSelectIdea(idea)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg"
                        >
                          <Plus className="h-4 w-4 mr-1.5" />
                          Use Idea
                        </button>
                        <button
                          onClick={(e) => handleDelete(idea.id, e)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="h-4 w-4 mr-1.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}