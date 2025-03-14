import React, { useState, useEffect } from 'react';
import { FileText, ExternalLink } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { ContentTableArticle } from '../../types/content';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../hooks/useToast';
import { TableLoader } from './TableLoader'; 

interface ArticlesTableProps {
  articles: ContentTableArticle[];
  loading: boolean;
  onAction: (action: string, itemType: string) => void;
  onRefresh: () => void;
}

export function ArticlesTable({ articles, loading, onAction, onRefresh }: ArticlesTableProps) {
  const { showToast } = useToast();
  const [updatingApproval, setUpdatingApproval] = useState<string | null>(null);
  const [localArticles, setLocalArticles] = useState(articles);
  const [editingField, setEditingField] = useState<{
    id: string;
    field: keyof ContentTableArticle;
    value: string;
  } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setLocalArticles(articles);
  }, [articles]);

  const handleFieldEdit = async (articleId: string, field: keyof ContentTableArticle, value: string) => {
    try {
      const { error } = await supabase
        .from('content_table_articles')
        .update({ [field]: field === 'keywords' ? value.split(',').map(k => k.trim()) : value })
        .eq('id', articleId);

      if (error) throw error;

      setLocalArticles(prev => prev.map(article => 
        article.id === articleId 
          ? { 
              ...article, 
              [field]: field === 'keywords' ? value.split(',').map(k => k.trim()) : value,
              updated_at: new Date().toISOString()
            }
          : article
      ));

      showToast('Article updated successfully', 'success');
    } catch (error) {
      console.error('Error updating article:', error);
      showToast('Failed to update article', 'error');
    } finally {
      setEditingField(null);
    }
  };

  const handleApproveToggle = async (articleId: string, currentValue: boolean) => {
    try {
      setUpdatingApproval(articleId);

      const { error } = await supabase
        .from('content_table_articles')
        .update({ is_approved: !currentValue })
        .eq('id', articleId);

      if (error) {
        throw error;
      }

      // Update local state after successful database update
      setLocalArticles(prev => prev.map(article => 
        article.id === articleId 
          ? { ...article, is_approved: !currentValue }
          : article
      ));

      showToast('Article approval status updated', 'success');
    } catch (error) {
      console.error('Error updating approval status:', error);
      showToast('Failed to update approval status', 'error');
    } finally {
      setUpdatingApproval(null);
    }
  };

  const handleDelete = async (articleId: string) => {
    try {
      setDeletingId(articleId);
      
      const { error } = await supabase
        .from('content_table_articles')
        .delete()
        .eq('id', articleId);

      if (error) throw error;

      setLocalArticles(prev => prev.filter(article => article.id !== articleId));
      showToast('Article deleted successfully', 'success');
      onRefresh(); // Refresh the list
    } catch (error) {
      console.error('Error deleting article:', error);
      showToast('Failed to delete article', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  // Fetch latest articles data when component mounts
  useEffect(() => {
    const fetchLatestArticles = async () => {
      try {
        const { data, error } = await supabase
          .from('content_table_articles')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setLocalArticles(data || []);
      } catch (error) {
        console.error('Error fetching latest articles:', error);
        showToast('Failed to fetch latest articles', 'error');
      }
    };

    fetchLatestArticles();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow mb-8 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-primary" />
          Articles
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Topic</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Link</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Creation Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Keywords</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Approved</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <TableLoader colSpan={8} />
            ) : articles.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                  No articles found
                </td>
              </tr>
            ) : (
              localArticles.map((article) => (
                <tr key={article.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {editingField?.id === article.id && editingField?.field === 'title' ? (
                      <input
                        type="text"
                        value={editingField.value}
                        onChange={(e) => setEditingField({ ...editingField, value: e.target.value })}
                        onBlur={() => handleFieldEdit(article.id, 'title', editingField.value)}
                        className="w-full px-2 py-1 border border-primary rounded focus:outline-none focus:ring-1 focus:ring-primary"
                        autoFocus
                      />
                    ) : (
                      <div
                        onClick={() => setEditingField({ id: article.id, field: 'title', value: article.title })}
                        className="cursor-pointer hover:text-primary"
                      >
                        {article.title}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {editingField?.id === article.id && editingField?.field === 'topic' ? (
                      <input
                        type="text"
                        value={editingField.value}
                        onChange={(e) => setEditingField({ ...editingField, value: e.target.value })}
                        onBlur={() => handleFieldEdit(article.id, 'topic', editingField.value)}
                        className="w-full px-2 py-1 border border-primary rounded focus:outline-none focus:ring-1 focus:ring-primary"
                        autoFocus
                      />
                    ) : (
                      <div
                        onClick={() => setEditingField({ id: article.id, field: 'topic', value: article.topic || '' })}
                        className="cursor-pointer hover:text-primary"
                      >
                        {article.topic || 'Click to add topic'}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingField?.id === article.id && editingField?.field === 'status' ? (
                      <select
                        value={editingField.value}
                        onChange={(e) => handleFieldEdit(article.id, 'status', e.target.value)}
                        className="w-full px-2 py-1 border border-primary rounded focus:outline-none focus:ring-1 focus:ring-primary"
                        autoFocus
                      >
                        <option value="Draft">Draft</option>
                        <option value="Ready">Ready</option>
                        <option value="Published">Published</option>
                      </select>
                    ) : (
                      <div
                        onClick={() => setEditingField({ id: article.id, field: 'status', value: article.status })}
                        className="cursor-pointer"
                      >
                        <StatusBadge status={article.status} />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {article.link && (
                      <a
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-primary hover:text-primary-hover"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(article.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {editingField?.id === article.id && editingField?.field === 'keywords' ? (
                      <input
                        type="text"
                        value={editingField.value}
                        onChange={(e) => setEditingField({ ...editingField, value: e.target.value })}
                        onBlur={() => handleFieldEdit(article.id, 'keywords', editingField.value)}
                        placeholder="Comma-separated keywords"
                        className="w-full px-2 py-1 border border-primary rounded focus:outline-none focus:ring-1 focus:ring-primary"
                        autoFocus
                      />
                    ) : (
                      <div
                        onClick={() => setEditingField({ 
                          id: article.id, 
                          field: 'keywords', 
                          value: article.keywords?.join(', ') || '' 
                        })}
                        className="cursor-pointer hover:text-primary"
                      >
                        <div className="flex flex-wrap gap-1">
                          {article.keywords?.map((keyword, idx) => (
                            <span key={idx} className="px-2 py-1 rounded-full bg-gray-100 text-xs">
                              {keyword}
                            </span>
                          ))}
                          {(!article.keywords || article.keywords.length === 0) && (
                            <span className="text-gray-400">Click to add keywords</span>
                          )}
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleApproveToggle(article.id, article.is_approved)}
                      disabled={updatingApproval === article.id}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                        article.is_approved ? 'bg-primary' : 'bg-gray-200'
                      } ${updatingApproval === article.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span 
                        className={`${
                          article.is_approved ? 'translate-x-5' : 'translate-x-0'
                        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                      ></span>
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => onAction('Publish', 'article')}
                      className="text-primary hover:text-primary-hover font-medium mr-3"
                    >
                      Publish Now
                    </button>
                    <button
                      onClick={() => handleDelete(article.id)}
                      disabled={deletingId === article.id}
                      className={`text-red-600 hover:text-red-800 font-medium ${
                        deletingId === article.id ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {deletingId === article.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}