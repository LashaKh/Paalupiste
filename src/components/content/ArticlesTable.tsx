import React, { useState, useEffect } from 'react';
import { FileText, ExternalLink, Edit, Trash2, Eye, Copy } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { EditableField } from './EditableField';
import { EnhancedTable } from './EnhancedTable';
import { ContentTableArticle } from '../../types/content';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../hooks/useToast';

interface ArticlesTableProps {
  articles: ContentTableArticle[];
  loading: boolean;
  onAction: (action: string, itemType: string) => void;
  onRefresh: () => void;
}

export function ArticlesTable({ articles, loading, onAction, onRefresh }: ArticlesTableProps) {
  const { showToast } = useToast();
  const [updatingApproval, setUpdatingApproval] = useState<string | null>(null);
  const [selectedArticles, setSelectedArticles] = useState<ContentTableArticle[]>([]);
  const [viewingArticle, setViewingArticle] = useState<ContentTableArticle | null>(null);

  const handleFieldEdit = async (articleId: string, field: keyof ContentTableArticle, value: string) => {
    try {
      // For array fields like keywords, we need to convert the string to an array
      const fieldValue = field === 'keywords' ? value.split(',').map(k => k.trim()) : value;
      
      const { error } = await supabase
        .from('content_table_articles')
        .update({ [field]: fieldValue })
        .eq('id', articleId);

      if (error) throw error;

      // Update article in the local state
      const updatedArticles = articles.map(article => 
        article.id === articleId 
          ? { 
              ...article, 
              [field]: field === 'keywords' ? value.split(',').map(k => k.trim()) : value
            }
          : article
      );

      showToast('Article updated successfully', 'success');
      onRefresh(); // Refresh the data
    } catch (error) {
      console.error('Error updating article:', error);
      showToast('Failed to update article', 'error');
    }
  };

  const handleApproveToggle = async (article: ContentTableArticle) => {
    try {
      setUpdatingApproval(article.id);
      const newApprovalStatus = !article.is_approved;

      const { error } = await supabase
        .from('content_table_articles')
        .update({ is_approved: newApprovalStatus })
        .eq('id', article.id);

      if (error) {
        throw error;
      }

      showToast(`Article ${newApprovalStatus ? 'approved' : 'unapproved'} successfully`, 'success');
      onRefresh(); // Refresh the data
    } catch (error) {
      console.error('Error updating approval status:', error);
      showToast('Failed to update approval status', 'error');
    } finally {
      setUpdatingApproval(null);
    }
  };

  const handleDelete = async (article: ContentTableArticle) => {
    try {
      onAction('Delete', 'article');
      
      const { error } = await supabase
        .from('content_table_articles')
        .delete()
        .eq('id', article.id);

      if (error) throw error;

      showToast('Article deleted successfully', 'success');
      onRefresh(); // Refresh the list
    } catch (error) {
      console.error('Error deleting article:', error);
      showToast('Failed to delete article', 'error');
    }
  };

  const handleDuplicate = async (article: ContentTableArticle) => {
    try {
      // Remove id so a new one will be generated
      const { id, created_at, ...articleData } = article;
      
      // Create a copy of the article
      const { data, error } = await supabase
        .from('content_table_articles')
        .insert({
          ...articleData,
          title: `${article.title} (Copy)`,
          status: 'Draft',
          created_at: new Date().toISOString()
        })
        .select();

      if (error) throw error;

      showToast('Article duplicated successfully', 'success');
      onRefresh(); // Refresh the list
    } catch (error) {
      console.error('Error duplicating article:', error);
      showToast('Failed to duplicate article', 'error');
    }
  };

  const handleViewArticle = (article: ContentTableArticle) => {
    setViewingArticle(article);
  };

  const handleSelectRow = (article: ContentTableArticle, selected: boolean) => {
    if (selected) {
      setSelectedArticles(prev => [...prev, article]);
    } else {
      setSelectedArticles(prev => prev.filter(a => a.id !== article.id));
    }
  };

  const columns = [
    {
      header: 'Title',
      accessor: 'title',
      sortable: true,
      cell: (value: string, article: ContentTableArticle) => (
        <EditableField
          value={value}
          onSave={(newValue) => handleFieldEdit(article.id, 'title', newValue)}
          placeholder="Add a title"
          className="font-medium text-gray-900"
        />
      )
    },
    {
      header: 'Topic',
      accessor: 'topic',
      sortable: true,
      cell: (value: string, article: ContentTableArticle) => (
        <EditableField
          value={value || ''}
          onSave={(newValue) => handleFieldEdit(article.id, 'topic', newValue)}
          placeholder="Add a topic"
        />
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      cell: (value: string, article: ContentTableArticle) => (
        <EditableField
          value={value}
          onSave={(newValue) => handleFieldEdit(article.id, 'status', newValue)}
          type="select"
          options={[
            { label: 'Draft', value: 'Draft' },
            { label: 'Ready', value: 'Ready' },
            { label: 'Published', value: 'Published' }
          ]}
          displayComponent={<StatusBadge status={value} />}
        />
      )
    },
    {
      header: 'Link',
      accessor: 'link',
      cell: (value: string, article: ContentTableArticle) => (
        value ? (
          <div className="flex">
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary-hover flex items-center"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="sr-only">Open link</span>
            </a>
            <EditableField
              value={value}
              onSave={(newValue) => handleFieldEdit(article.id, 'link', newValue)}
              className="ml-2 text-xs text-gray-500 max-w-[150px] truncate"
            />
          </div>
        ) : (
          <EditableField
            value=""
            onSave={(newValue) => handleFieldEdit(article.id, 'link', newValue)}
            placeholder="Add a link"
            className="text-gray-500"
          />
        )
      )
    },
    {
      header: 'Created',
      accessor: 'created_at',
      sortable: true,
      cell: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      header: 'Keywords',
      accessor: 'keywords',
      cell: (value: string[], article: ContentTableArticle) => (
        <EditableField
          value={Array.isArray(value) ? value.join(', ') : ''}
          onSave={(newValue) => handleFieldEdit(article.id, 'keywords', newValue)}
          placeholder="Add keywords"
          className="text-xs text-gray-500"
        />
      )
    },
    {
      header: 'Approved',
      accessor: 'is_approved',
      sortable: true,
      cell: (value: boolean, article: ContentTableArticle) => (
        <div className="flex justify-center">
          <button
            onClick={() => handleApproveToggle(article)}
            disabled={updatingApproval === article.id}
            className={`w-5 h-5 rounded ${
              value ? 'bg-green-500 text-white' : 'bg-gray-200'
            } flex items-center justify-center transition-colors focus:outline-none hover:opacity-80`}
            aria-label={value ? 'Approved' : 'Not approved'}
          >
            {value && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
          </button>
        </div>
      )
    }
  ];

  // Define custom row classes based on article status
  const getRowClass = (article: ContentTableArticle) => {
    if (article.status === 'Published') return 'bg-green-50/50';
    if (article.status === 'Ready') return 'bg-blue-50/50';
    return '';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center">
          <div className="bg-primary/10 p-2 rounded-lg mr-3">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Articles</h2>
            <p className="text-sm text-gray-500 mt-1">Manage your blog articles and content</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {selectedArticles.length > 0 && (
            <span className="text-sm text-gray-500">{selectedArticles.length} selected</span>
          )}
          
          <button
            onClick={onRefresh}
            className="px-3 py-1.5 text-sm bg-white text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 flex items-center"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            Refresh
          </button>
          
          <button
            onClick={() => {
              // Logic to add a new article
              onAction('Create', 'article');
            }}
            className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary/20 flex items-center"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            New Article
          </button>
        </div>
      </div>

      <EnhancedTable
        data={articles}
        columns={columns}
        loading={loading}
        keyField="id"
        onEdit={(article) => handleViewArticle(article)}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
        onView={handleViewArticle}
        selectable={true}
        selectedRows={selectedArticles}
        onSelectRow={handleSelectRow}
        customRowClass={getRowClass}
        emptyMessage="No articles found. Create your first article by clicking the 'New Article' button."
      />

      {/* Article View Modal */}
      {viewingArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Article Details</h3>
                <button
                  onClick={() => setViewingArticle(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <EditableField
                    value={viewingArticle.title}
                    onSave={(value) => {
                      handleFieldEdit(viewingArticle.id, 'title', value);
                      setViewingArticle({...viewingArticle, title: value});
                    }}
                    className="text-lg font-medium"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                  <EditableField
                    value={viewingArticle.topic || ''}
                    onSave={(value) => {
                      handleFieldEdit(viewingArticle.id, 'topic', value);
                      setViewingArticle({...viewingArticle, topic: value});
                    }}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <EditableField
                    value={viewingArticle.status}
                    onSave={(value) => {
                      handleFieldEdit(viewingArticle.id, 'status', value);
                      setViewingArticle({...viewingArticle, status: value as 'Draft' | 'Ready' | 'Published'});
                    }}
                    type="select"
                    options={[
                      { label: 'Draft', value: 'Draft' },
                      { label: 'Ready', value: 'Ready' },
                      { label: 'Published', value: 'Published' }
                    ]}
                    displayComponent={<StatusBadge status={viewingArticle.status} size="lg" />}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Link</label>
                  <EditableField
                    value={viewingArticle.link || ''}
                    onSave={(value) => {
                      handleFieldEdit(viewingArticle.id, 'link', value);
                      setViewingArticle({...viewingArticle, link: value});
                    }}
                  />
                  {viewingArticle.link && (
                    <a
                      href={viewingArticle.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center text-sm text-primary hover:text-primary-hover"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Open Link
                    </a>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Keywords</label>
                  <EditableField
                    value={Array.isArray(viewingArticle.keywords) ? viewingArticle.keywords.join(', ') : ''}
                    onSave={(value) => {
                      const keywords = value.split(',').map(k => k.trim());
                      handleFieldEdit(viewingArticle.id, 'keywords', value);
                      setViewingArticle({...viewingArticle, keywords});
                    }}
                    placeholder="Add comma-separated keywords"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Creation Date</label>
                  <p className="text-gray-900">
                    {new Date(viewingArticle.created_at).toLocaleDateString()} {new Date(viewingArticle.created_at).toLocaleTimeString()}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Approval Status</label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleApproveToggle(viewingArticle)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-lg flex items-center ${
                        viewingArticle.is_approved
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {viewingArticle.is_approved ? (
                        <>
                          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          Approved
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          Not Approved
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-between">
              <button
                onClick={() => {
                  handleDuplicate(viewingArticle);
                  setViewingArticle(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 flex items-center"
              >
                <Copy className="w-4 h-4 mr-1.5" />
                Duplicate
              </button>
              
              <div className="space-x-2">
                <button
                  onClick={() => setViewingArticle(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  Close
                </button>
                
                <button
                  onClick={() => {
                    handleDelete(viewingArticle);
                    setViewingArticle(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-1.5" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}