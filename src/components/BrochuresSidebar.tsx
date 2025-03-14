import React, { useState } from 'react';
import { FileText, Trash2, X, Code, Eye } from 'lucide-react';
import { useBrochures, Brochure } from '../contexts/BrochureContext';
import { useToast } from '../contexts/ToastContext';

interface BrochuresSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectHTML?: (html: string) => void; 
}

export function BrochuresSidebar({ isOpen, onClose, onSelectHTML }: BrochuresSidebarProps) {
  const { brochures, deleteBrochure } = useBrochures();
  const { showToast } = useToast();
  const [selectedBrochure, setSelectedBrochure] = useState<Brochure | null>(null);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteBrochure(id);
      showToast('Brochure deleted successfully', 'success');
    } catch (error) {
      showToast('Failed to delete brochure', 'error');
    }
  };

  const handlePreview = (brochure: Brochure) => {
    if (onSelectHTML && brochure.html_content) {
      onSelectHTML(brochure.html_content);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="brochures-modal" role="dialog" aria-modal="true">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" aria-hidden="true" onClick={onClose} />

        <div className="relative w-[70vw] max-h-[85vh] bg-white rounded-xl shadow-2xl transform transition-all flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Generated HTMLs</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {brochures.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No HTML content generated yet</p>
              </div>
            ) : (
              brochures.map((brochure) => (
                <div
                  key={brochure.id}
                  className="relative bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-green-500 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between gap-4 w-full">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 break-words">{brochure.title}</h3>
                      <p className="text-xs text-gray-400">
                        Generated: {new Date(brochure.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handlePreview(brochure);
                        }}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <Eye className="h-4 w-4 mr-1.5" />
                        View HTML
                      </button>
                      <button
                        onClick={(e) => handleDelete(brochure.id, e)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
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
  );
}