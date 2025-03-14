import React, { useState } from 'react';
import { FileText, Trash2, X, ExternalLink, MoveRight, Loader2 } from 'lucide-react';
import { useArticles, Article } from '../contexts/ArticlesContext';
import { useToast } from '../contexts/ToastContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface ArticlesSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ArticlesSidebar({ isOpen, onClose }: ArticlesSidebarProps) {
  const { articles, deleteArticle } = useArticles();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [movingArticle, setMovingArticle] = useState<string | null>(null);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteArticle(id);
      showToast('Article deleted successfully', 'success');
    } catch (error) {
      showToast('Failed to delete article', 'error');
    }
  };

  const handleMoveToTable = async (article: Article, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setMovingArticle(article.id);

      // Get the current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Insert the article into content_table_articles
      const { error } = await supabase
        .from('content_table_articles')
        .insert({
          title: article.title,
          link: article.link,
          status: 'Ready',
          topic: 'Foundation Technology',
          created_at: article.timestamp,
          user_id: user.id
        });

      if (error) throw error;
      
      // Navigate to content table
      navigate('/app/content/table');
      
      showToast('Article moved to content table successfully', 'success');
    } catch (error) {
      showToast('Failed to move article to content table', 'error');
    } finally {
      setMovingArticle(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="articles-modal" role="dialog" aria-modal="true">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" aria-hidden="true" onClick={onClose} />

        <div className="relative w-[70vw] max-h-[85vh] bg-white rounded-xl shadow-2xl transform transition-all flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Generated Articles</h2>
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
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No articles generated yet</p>
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
                          onClick={(e) => handleMoveToTable(article, e)}
                          disabled={movingArticle === article.id}
                          className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                            movingArticle === article.id
                              ? 'bg-primary/5 text-primary/50 cursor-not-allowed'
                              : 'text-primary hover:bg-primary/10'
                          }`}
                        >
                          {movingArticle === article.id ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                              Moving...
                            </>
                          ) : (
                            <>
                              <MoveRight className="w-4 h-4 mr-1.5" />
                              Move to Content Table
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <a
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary-hover transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                      <button
                        onClick={(e) => handleDelete(article.id, e)}
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