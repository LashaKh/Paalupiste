import React, { useState } from 'react';
import { Edit3, X } from 'lucide-react';
import { useArticles } from '../../contexts/ArticlesContext';
import { ArticleRevisionChat } from '../chat/ArticleRevisionChat';

interface RevisionSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RevisionSidebar({ isOpen, onClose }: RevisionSidebarProps) {
  const { articles } = useArticles();
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Find the selected article content if any
  const selectedArticle = articles.find(article => article.id === selectedArticleId);
  
  const handleOpenChat = (articleId: string) => {
    setSelectedArticleId(articleId);
    setIsChatOpen(true);
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="revision-modal" role="dialog" aria-modal="true">
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" aria-hidden="true" onClick={onClose} />

          <div className="relative w-[70vw] max-h-[85vh] bg-white rounded-xl shadow-2xl transform transition-all flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Article Revision</h2>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {articles.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  <Edit3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No articles available for revision</p>
                </div>
              ) : (
                articles.map((article) => (
                  <div
                    key={article.id}
                    className="relative bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4 w-full">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 break-words">{article.title}</h3>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(article.timestamp).toLocaleString()}
                        </p>
                        <div className="mt-3 flex items-center gap-2">
                          <button
                            onClick={() => handleOpenChat(article.id)}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg transition-colors text-primary hover:bg-primary/10"
                          >
                            <Edit3 className="w-4 h-4 mr-1.5" />
                            Start Revision
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Render the chat component if an article is selected and chat is open */}
      {selectedArticle && isChatOpen && (
        <ArticleRevisionChat 
          isOpen={isChatOpen} 
          onClose={handleCloseChat} 
          initialArticleContent={selectedArticle.content || 'No content available for this article.'}
        />
      )}
    </>
  );
}
