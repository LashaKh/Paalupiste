import React, { useState, useEffect } from 'react';
import { Mail, Loader2 } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../hooks/useToast';
import { TableLoader } from './TableLoader';

interface Newsletter {
  id: string;
  title: string;
  subject_line: string;
  preview_text: string;
  content: string;
  status: 'Draft' | 'Ready' | 'Sent';
  scheduled_for: string | null;
  is_approved: boolean;
  created_at: string;
}

interface EditingField {
  id: string;
  field: keyof Newsletter;
  value: string;
}

interface NewsletterTableProps {
  onAction: (action: string, itemType: string) => void;
  loading?: boolean;
  onRefresh?: () => void;
}

export function NewsletterTable({ onAction, loading: propLoading, onRefresh }: NewsletterTableProps) {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState<boolean>(propLoading !== undefined ? propLoading : true);
  const [editingField, setEditingField] = useState<EditingField | null>(null);
  const [updatingApproval, setUpdatingApproval] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchNewsletters();
  }, []);

  useEffect(() => {
    if (propLoading !== undefined) {
      setLoading(propLoading);
    }
  }, [propLoading]);

  const fetchNewsletters = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('content_table_newsletters')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNewsletters(data || []);
      
      // If there's an external refresh callback, we don't set loading state here
      if (!onRefresh) {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching newsletters:', error);
      showToast('Failed to load newsletters', 'error');
      setLoading(false);
    } finally {
      if (onRefresh) {
        // If there's an external refresh callback, let parent component manage loading state
        onRefresh();
      }
    }
  };

  const handleFieldEdit = async (newsletterId: string, field: keyof Newsletter, value: string) => {
    try {
      const { error } = await supabase
        .from('content_table_newsletters')
        .update({ [field]: value })
        .eq('id', newsletterId);

      if (error) throw error;

      setNewsletters(prev => prev.map(newsletter =>
        newsletter.id === newsletterId
          ? { ...newsletter, [field]: value }
          : newsletter
      ));

      showToast('Newsletter updated successfully', 'success');
    } catch (error) {
      console.error('Error updating newsletter:', error);
      showToast('Failed to update newsletter', 'error');
    } finally {
      setEditingField(null);
    }
  };

  const handleApproveToggle = async (newsletterId: string, currentValue: boolean) => {
    try {
      setUpdatingApproval(newsletterId);

      const { error } = await supabase
        .from('content_table_newsletters')
        .update({ is_approved: !currentValue })
        .eq('id', newsletterId);

      if (error) throw error;

      setNewsletters(prev => prev.map(newsletter =>
        newsletter.id === newsletterId
          ? { ...newsletter, is_approved: !currentValue }
          : newsletter
      ));

      showToast('Newsletter approval status updated', 'success');
    } catch (error) {
      console.error('Error updating approval status:', error);
      showToast('Failed to update approval status', 'error');
    } finally {
      setUpdatingApproval(null);
    }
  };

  const handleDelete = async (newsletterId: string) => {
    try {
      setDeletingId(newsletterId);
      
      const { error } = await supabase
        .from('content_table_newsletters')
        .delete()
        .eq('id', newsletterId);

      if (error) throw error;

      setNewsletters(prev => prev.filter(newsletter => newsletter.id !== newsletterId));
      showToast('Newsletter deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting newsletter:', error);
      showToast('Failed to delete newsletter', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow mb-8 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <Mail className="w-5 h-5 mr-2 text-primary" />
          Newsletters
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject Line</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Content</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Approved</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <TableLoader colSpan={6} />
            ) : newsletters.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  No newsletters found
                </td>
              </tr>
            ) : (
              newsletters.map((newsletter) => (
                <tr key={newsletter.id}>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {editingField?.id === newsletter.id && editingField?.field === 'title' ? (
                      <textarea
                        value={editingField.value}
                        onChange={(e) => setEditingField({ ...editingField, value: e.target.value })}
                        onBlur={() => handleFieldEdit(newsletter.id, 'title', editingField.value)}
                        className="w-full min-w-[300px] px-3 py-2 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                        rows={2}
                        style={{ resize: 'both' }}
                        autoFocus
                      />
                    ) : (
                      <div
                        onClick={() => setEditingField({
                          id: newsletter.id,
                          field: 'title',
                          value: newsletter.title
                        })}
                        className="text-left w-full px-3 py-2 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <div className="line-clamp-2 text-gray-900">
                          {newsletter.title}
                        </div>
                        <div className="text-xs text-primary mt-1">
                          Click to edit
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {editingField?.id === newsletter.id && editingField?.field === 'subject_line' ? (
                      <textarea
                        value={editingField.value}
                        onChange={(e) => setEditingField({ ...editingField, value: e.target.value })}
                        onBlur={() => handleFieldEdit(newsletter.id, 'subject_line', editingField.value)}
                        className="w-full min-w-[300px] px-3 py-2 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                        rows={2}
                        style={{ resize: 'both' }}
                        autoFocus
                      />
                    ) : (
                      <div
                        onClick={() => setEditingField({
                          id: newsletter.id,
                          field: 'subject_line',
                          value: newsletter.subject_line
                        })}
                        className="text-left w-full px-3 py-2 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <div className="line-clamp-2 text-gray-600">
                          {newsletter.subject_line}
                        </div>
                        <div className="text-xs text-primary mt-1">
                          Click to edit
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {editingField?.id === newsletter.id && editingField?.field === 'content' ? (
                      <textarea
                        value={editingField.value}
                        onChange={(e) => setEditingField({ ...editingField, value: e.target.value })}
                        onBlur={() => handleFieldEdit(newsletter.id, 'content', editingField.value)}
                        className="w-full min-w-[300px] px-3 py-2 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                        rows={4}
                        style={{ resize: 'both' }}
                        autoFocus
                      />
                    ) : (
                      <div
                        onClick={() => setEditingField({
                          id: newsletter.id,
                          field: 'content',
                          value: newsletter.content
                        })}
                        className="text-left w-full px-3 py-2 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <div className="line-clamp-3 text-gray-600">
                          {newsletter.content}
                        </div>
                        <div className="text-xs text-primary mt-1">
                          Click to edit
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingField?.id === newsletter.id && editingField?.field === 'status' ? (
                      <select
                        value={editingField.value}
                        onChange={(e) => handleFieldEdit(newsletter.id, 'status', e.target.value)}
                        className="w-full px-2 py-1 border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary"
                        autoFocus
                      >
                        <option value="Draft">Draft</option>
                        <option value="Ready">Ready</option>
                        <option value="Sent">Sent</option>
                      </select>
                    ) : (
                      <div
                        onClick={() => setEditingField({
                          id: newsletter.id,
                          field: 'status',
                          value: newsletter.status
                        })}
                        className="cursor-pointer"
                      >
                        <StatusBadge status={newsletter.status} />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleApproveToggle(newsletter.id, newsletter.is_approved)}
                      disabled={updatingApproval === newsletter.id}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                        newsletter.is_approved ? 'bg-primary' : 'bg-gray-200'
                      } ${updatingApproval === newsletter.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span 
                        className={`${
                          newsletter.is_approved ? 'translate-x-5' : 'translate-x-0'
                        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                      ></span>
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(newsletter.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => onAction('Send', 'newsletter')}
                      className="text-primary hover:text-primary-hover font-medium mr-3"
                    >
                      Send Now
                    </button>
                    <button
                      onClick={() => handleDelete(newsletter.id)}
                      disabled={deletingId === newsletter.id}
                      className={`text-red-600 hover:text-red-800 font-medium ${
                        deletingId === newsletter.id ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {deletingId === newsletter.id ? 'Deleting...' : 'Delete'}
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