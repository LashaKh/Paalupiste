import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

export interface SocialPost {
  id: string;
  title: string;
  content: string;
  platform: 'linkedin' | 'facebook';
  timestamp: string;
}

interface SocialPostsContextType {
  posts: SocialPost[];
  addPost: (post: Omit<SocialPost, 'id' | 'timestamp'>) => Promise<void>;
  updatePost: (id: string, content: string) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
}

const SocialPostsContext = createContext<SocialPostsContextType>({
  posts: [],
  addPost: async () => {},
  updatePost: async () => {},
  deletePost: async () => {},
});

export function SocialPostsProvider({ children }: { children: React.ReactNode }) {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadPosts();
    } else {
      setPosts([]);
    }
  }, [user]);

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('social_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedPosts: SocialPost[] = data.map(post => ({
        id: post.id,
        title: post.title,
        content: post.content,
        platform: post.platform,
        timestamp: post.created_at
      }));

      setPosts(mappedPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  };

  const addPost = async (post: Omit<SocialPost, 'id' | 'timestamp'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('social_posts')
        .insert({
          user_id: user.id,
          title: post.title,
          content: post.content,
          platform: post.platform,
        })
        .select()
        .single();

      if (error) throw error;

      const newPost: SocialPost = {
        id: data.id,
        title: data.title,
        content: data.content,
        platform: data.platform,
        timestamp: data.created_at,
      };

      setPosts(prev => [newPost, ...prev]);
    } catch (error) {
      console.error('Error saving post:', error);
      throw error;
    }
  };

  const updatePost = async (id: string, content: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('social_posts')
        .update({ content })
        .eq('id', id);

      if (error) throw error;

      setPosts(prev =>
        prev.map(post =>
          post.id === id ? { ...post, content } : post
        )
      );
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  };

  const deletePost = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('social_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPosts(prev => prev.filter(post => post.id !== id));
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  };

  return (
    <SocialPostsContext.Provider value={{ posts, addPost, updatePost, deletePost }}>
      {children}
    </SocialPostsContext.Provider>
  );
}

export const useSocialPosts = () => useContext(SocialPostsContext);