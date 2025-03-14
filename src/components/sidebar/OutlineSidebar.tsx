import React, { useState } from 'react';
import { FileText, Trash2, X, Loader2 } from 'lucide-react';
import { useOutlines, Outline } from '../../contexts/OutlineContext';
import { useArticles } from '../../contexts/ArticlesContext';
import { useNavigate } from 'react-router-dom';
import { OutlineEditor } from '../forms/OutlineEditor';
import { useToast } from '../../contexts/ToastContext';

interface OutlineSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OutlineSidebar({ isOpen, onClose }: OutlineSidebarProps) {
  const { outlines, deleteOutline } = useOutlines();
  const { addArticle } = useArticles();
  const [selectedOutline, setSelectedOutline] = useState<Outline | null>(null);
  const [movingToTable, setMovingToTable] = useState<string | null>(null);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteOutline(id);
    } catch (error) {
      console.error('Failed to delete outline:', error);
    }
  };

  const handleOutlineClick = (outline: Outline) => {
    setSelectedOutline(outline);
  };

  const handleGenerateArticle = async () => {
    if (!selectedOutline) return;
    
    let isProcessing = false;
    setMovingToTable(selectedOutline.id);
    const webhookUrls = [
      'https://hook.eu2.make.com/ux47aj42iy2kmndvwswve3lhex6euwq3',
      'https://hook.eu2.make.com/8bky5ordgch9t0l5m2h8k1819grmi1rc',
      'https://hook.eu2.make.com/apvlo8ypq3so84xubzeijhlniv53ng8k',
      'https://hook.eu2.make.com/l96xav6ca3itrat1mc8w4x4rxktm636e',
      'https://hook.eu2.make.com/c7carqx1e7uynnsqdkcuqypg5mh04ov2',
      'https://hook.eu2.make.com/6einqegvaq6cmapfvfnuj5dt1y6st4z3',
      'https://hook.eu2.make.com/mjc6t35qoz47wzbd0yf710g2l9c1bcwg'
    ];

    try {
      showToast('Starting article generation...', 'info');

      // Send requests to all webhooks simultaneously
      const payload = JSON.stringify({
        id: selectedOutline.id,
        title: selectedOutline.title,
        outline: selectedOutline.content
      });

      const requests = webhookUrls.map(url =>
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload
        })
      );

      // Wait for all requests to complete
      const responses = await Promise.all(requests);
      
      // Process responses
      for (const response of responses) {
        if (!response.ok) continue;

        try {
          const text = await response.text();
          
          // Handle "Accepted" response
          if (text.includes('Accepted')) {
            isProcessing = true;
            continue;
          }
          
          try {
            const data = JSON.parse(text);
            if (data.ArticleTitle && data.ArticleLink) {
              const article = await addArticle({
                title: data.ArticleTitle,
                link: data.ArticleLink
              });
              showToast('Article generated and saved successfully', 'success');
              setSelectedOutline(null);
              return;
            }
          } catch (jsonError) {
            console.error('Error parsing JSON response:', jsonError);
          }
        } catch (error) {
          console.error('Error processing response:', error);
        }
      }

      if (isProcessing) {
        showToast('Article generation started. It will appear in the Articles list when ready.', 'info');
        setSelectedOutline(null);
      } else {
        throw new Error('No valid article response received');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate article';
      showToast(errorMessage, 'error');
      console.error('Article generation error:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="outline-modal" role="dialog" aria-modal="true">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" aria-hidden="true" onClick={onClose} />

        <div className="relative w-[70vw] max-h-[85vh] bg-white rounded-xl shadow-2xl transform transition-all flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Generated Outlines</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {outlines.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No outlines generated yet</p>
              </div>
            ) : (
              outlines.map((outline) => (
                <div
                  key={outline.id}
                  className="relative bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-primary/50 cursor-pointer transition-colors"
                  onClick={() => handleOutlineClick(outline)}
                >
                  <div className="flex items-start justify-between gap-4 w-full">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 break-words">{outline.title}</h3>
                      {movingToTable === outline.id && (
                        <p className="text-xs text-primary mt-1">Moving to Content Table...</p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(outline.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDelete(outline.id, e)}
                      className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      {selectedOutline && (
        <OutlineEditor
          title={selectedOutline.title}
          outlineId={selectedOutline.id}
          content={selectedOutline.content}
          onClose={() => setSelectedOutline(null)}
          onGenerateArticle={handleGenerateArticle}
        />
      )}
    </div>
  );
}