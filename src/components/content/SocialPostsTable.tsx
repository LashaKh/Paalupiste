import React, { useState, useEffect } from 'react';
import { Image, Video, ExternalLink } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../hooks/useToast';
import { TableLoader } from './TableLoader';

interface EditingField {
  id: string;
  field: keyof SocialPost;
  value: string;
}

interface SocialPost {
  id: string;
  title: string;
  content: string;
  platform: 'linkedin' | 'facebook';
  media_type?: 'image' | 'video' | 'none';
  status: 'Draft' | 'Ready' | 'Posted';
  is_approved: boolean;
  created_at: string;
}

interface SocialPostsTableProps {
  platform: 'linkedin' | 'facebook';
  onAction: (action: string, itemType: string) => void;
}

export function SocialPostsTable({ platform, onAction }: SocialPostsTableProps) {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState<EditingField | null>(null);
  const [updatingApproval, setUpdatingApproval] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { showToast } = useToast();

  const getPlatformColor = () => {
    return platform === 'linkedin' ? '#0A66C2' : '#1877F2';
  };

  const getPlatformName = () => {
    return platform === 'linkedin' ? 'LinkedIn' : 'Facebook';
  };

  useEffect(() => {
    fetchPosts();
  }, [platform]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('content_table_social_posts')
        .select('*')
        .eq('platform', platform)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching social posts:', error);
      showToast(`Failed to load ${getPlatformName()} posts`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldEdit = async (postId: string, field: keyof SocialPost, value: string) => {
    try {
      const { error } = await supabase
        .from('content_table_social_posts')
        .update({ [field]: value })
        .eq('id', postId);

      if (error) throw error;

      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, [field]: value, updated_at: new Date().toISOString() }
          : post
      ));

      showToast('Post updated successfully', 'success');
    } catch (error) {
      console.error('Error updating post:', error);
      showToast('Failed to update post', 'error');
    } finally {
      setEditingField(null);
    }
  };

  const handleApproveToggle = async (postId: string, currentValue: boolean) => {
    try {
      setUpdatingApproval(postId);

      const { error } = await supabase
        .from('content_table_social_posts')
        .update({ is_approved: !currentValue })
        .eq('id', postId);

      if (error) throw error;

      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, is_approved: !currentValue }
          : post
      ));

      showToast('Post approval status updated', 'success');
    } catch (error) {
      console.error('Error updating approval status:', error);
      showToast('Failed to update approval status', 'error');
    } finally {
      setUpdatingApproval(null);
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      setDeletingId(postId);
      
      const { error } = await supabase
        .from('content_table_social_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      setPosts(prev => prev.filter(post => post.id !== postId));
      showToast('Post deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting post:', error);
      showToast('Failed to delete post', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <ExternalLink className={`w-5 h-5 mr-2 text-[${getPlatformColor()}]`} />
          {getPlatformName()} Posts
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Post Text</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Media</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Approved</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <TableLoader colSpan={6} />
            ) : posts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  No {getPlatformName()} posts found
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post.id}>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                    {editingField?.id === post.id && editingField?.field === 'title' ? (
                      <input
                        type="text"
                        value={editingField.value}
                        onChange={(e) => setEditingField({ ...editingField, value: e.target.value })}
                        onBlur={() => handleFieldEdit(post.id, 'title', editingField.value)}
                        className="w-full min-w-[300px] px-3 py-2 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                        autoFocus
                      />
                    ) : (
                      <button
                        onClick={() => setEditingField({ id: post.id, field: 'title', value: post.title })}
                        className="text-left w-full px-3 py-2 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <div className="line-clamp-2 text-gray-900">
                          {post.title}
                        </div>
                        <div className="text-xs text-primary mt-1">
                          Click to edit
                        </div>
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-md">
                    {editingField?.id === post.id && editingField?.field === 'content' ? (
                      <textarea
                        value={editingField.value}
                        onChange={(e) => setEditingField({ ...editingField, value: e.target.value })}
                        onBlur={() => handleFieldEdit(post.id, 'content', editingField.value)}
                        className="w-full min-w-[300px] px-3 py-2 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                        rows={4}
                        style={{ resize: 'both' }}
                        autoFocus
                      />
                    ) : (
                      <button
                        onClick={() => setEditingField({ id: post.id, field: 'content', value: post.content })}
                        className="text-left w-full px-3 py-2 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <div className="line-clamp-2 text-gray-600">
                          {post.content}
                        </div>
                        <div className="text-xs text-primary mt-1">
                          Click to edit
                        </div>
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {post.media_type === 'image' ? (
                      <Image className="w-4 h-4" />
                    ) : post.media_type === 'video' ? (
                      <Video className="w-4 h-4" />
                    ) : (
                      <span className="text-xs text-gray-400">None</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingField?.id === post.id && editingField?.field === 'status' ? (
                      <select
                        value={editingField.value}
                        onChange={(e) => handleFieldEdit(post.id, 'status', e.target.value)}
                        className="w-full px-2 py-1 border border-primary rounded focus:outline-none focus:ring-1 focus:ring-primary"
                        autoFocus
                      >
                        <option value="Draft">Draft</option>
                        <option value="Ready">Ready</option>
                        <option value="Posted">Posted</option>
                      </select>
                    ) : (
                      <div
                        onClick={() => setEditingField({ id: post.id, field: 'status', value: post.status })}
                        className="cursor-pointer"
                      >
                        <StatusBadge status={post.status} />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleApproveToggle(post.id, post.is_approved)}
                      disabled={updatingApproval === post.id}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                        post.is_approved ? 'bg-primary' : 'bg-gray-200'
                      } ${updatingApproval === post.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span 
                        className={`${
                          post.is_approved ? 'translate-x-5' : 'translate-x-0'
                        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                      ></span>
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(post.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => onAction('Post', `${getPlatformName()} post`)}
                      className="text-primary hover:text-primary-hover font-medium mr-3"
                    >
                      Post Now
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      disabled={deletingId === post.id}
                      className={`text-red-600 hover:text-red-800 font-medium ${
                        deletingId === post.id ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {deletingId === post.id ? 'Deleting...' : 'Delete'}
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