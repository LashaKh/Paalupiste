import React, { useState } from 'react';
import { FileText, Trash2, X, Facebook, Linkedin, Edit2, Save, XCircle, ChevronDown, ChevronRight, MoveRight, Loader2 } from 'lucide-react';
import { useSocialPosts, SocialPost } from '../contexts/SocialPostsContext';
import { useToast } from '../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface SocialPostsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SocialPostsSidebar({ isOpen, onClose }: SocialPostsSidebarProps) {
  const { posts, deletePost, updatePost } = useSocialPosts();
  const { showToast } = useToast();
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const navigate = useNavigate();
  const [movingPost, setMovingPost] = useState<string | null>(null);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deletePost(id);
      showToast('Post deleted successfully', 'success');
    } catch (error) {
      showToast('Failed to delete post', 'error');
    }
  };

  const handleEdit = (post: SocialPost) => {
    setEditingPost(post.id);
    setEditContent(post.content);
  };

  const handleSave = async (post: SocialPost) => {
    try {
      await updatePost(post.id, editContent);
      setEditingPost(null);
      showToast('Post updated successfully', 'success');
    } catch (error) {
      showToast('Failed to update post', 'error');
    }
  };

  const handleCancel = () => {
    setEditingPost(null);
    setEditContent('');
  };

  const handleMoveToTable = async (post: SocialPost, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setMovingPost(post.id);

      // Get the current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Insert the post into content_table_social_posts
      const { error } = await supabase
        .from('content_table_social_posts')
        .insert({
          title: post.title,
          content: post.content,
          platform: post.platform,
          status: 'Ready',
          created_at: post.timestamp,
          user_id: user.id
        });

      if (error) throw error;
      
      // Navigate to content table
      navigate('/app/content/table');
      
      showToast('Post moved to content table successfully', 'success');
    } catch (error) {
      showToast('Failed to move post to content table', 'error');
    } finally {
      setMovingPost(null);
    }
  };

  const handlePostClick = (postId: string) => {
    if (editingPost) return; // Don't toggle if editing
    setExpandedPost(expandedPost === postId ? null : postId);
  };

  const getPlatformIcon = (platform: SocialPost['platform']) => {
    switch (platform) {
      case 'linkedin':
        return <Linkedin className="h-4 w-4 text-[#0A66C2]" />;
      case 'facebook':
        return <Facebook className="h-4 w-4 text-[#1877F2]" />;
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="posts-modal" role="dialog" aria-modal="true">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" aria-hidden="true" onClick={onClose} />

        <div className="relative w-[70vw] max-h-[85vh] bg-white rounded-xl shadow-2xl transform transition-all flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Generated Social Media Posts</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {posts.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No posts generated yet</p>
              </div>
            ) : (
              posts.map((post) => (
                <div
                  key={post.id}
                  className={`relative bg-gray-50 rounded-lg border border-gray-200 hover:border-primary/50 transition-all duration-200 ${
                    expandedPost === post.id ? 'shadow-md' : ''
                  }`}
                  onClick={() => handlePostClick(post.id)}
                >
                  {/* Header - Always visible */}
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {expandedPost === post.id ? (
                        <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      )}
                      {getPlatformIcon(post.platform)}
                      <h3 className="font-medium text-gray-900 truncate">{post.title}</h3>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!editingPost) handleEdit(post);
                        }}
                        className="text-blue-600 hover:text-blue-700 transition-colors p-1"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(post.id, e)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => handleMoveToTable(post, e)}
                        disabled={movingPost === post.id}
                        className={`text-primary hover:text-primary-hover transition-colors p-1 ${
                          movingPost === post.id ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {movingPost === post.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <MoveRight className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedPost === post.id && (
                    <div className="px-4 pb-4 pt-2 border-t border-gray-100">
                      {editingPost === post.id ? (
                        <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full h-32 p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleSave(post)}
                              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                            >
                              <Save className="h-4 w-4 mr-1.5" />
                              Save
                            </button>
                            <button
                              onClick={handleCancel}
                              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                              <XCircle className="h-4 w-4 mr-1.5" />
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-gray-600 text-sm whitespace-pre-wrap">{post.content}</p>
                          <p className="text-xs text-gray-400 mt-3">
                            {new Date(post.timestamp).toLocaleString()}
                          </p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}