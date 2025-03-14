import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

export interface Newsletter {
  id: string;
  title: string;
  description: string;
  content: string;
  timestamp: string;
}

interface NewsletterContextType {
  newsletters: Newsletter[];
  addNewsletter: (newsletter: Omit<Newsletter, 'id' | 'timestamp'>) => Promise<void>;
  deleteNewsletter: (id: string) => Promise<void>;
  updateNewsletter: (id: string, content: string) => Promise<void>;
}

const NewsletterContext = createContext<NewsletterContextType>({
  newsletters: [],
  addNewsletter: async () => {},
  deleteNewsletter: async () => {},
  updateNewsletter: async () => {},
});

export function NewsletterProvider({ children }: { children: React.ReactNode }) {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadNewsletters();
    } else {
      setNewsletters([]);
    }
  }, [user]);

  const loadNewsletters = async () => {
    try {
      const { data, error } = await supabase
        .from('newsletter_outlines')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedNewsletters: Newsletter[] = data.map(newsletter => ({
        id: newsletter.id,
        title: newsletter.title,
        description: newsletter.description,
        content: newsletter.content,
        timestamp: newsletter.created_at
      }));

      setNewsletters(mappedNewsletters);
    } catch (error) {
      console.error('Error loading newsletters:', error);
    }
  };

  const addNewsletter = async (newsletter: Omit<Newsletter, 'id' | 'timestamp'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('newsletter_outlines')
        .insert({
          user_id: user.id,
          title: newsletter.title,
          description: newsletter.description,
          content: newsletter.content,
        })
        .select()
        .single();

      if (error) throw error;

      const newNewsletter: Newsletter = {
        id: data.id,
        title: data.title,
        description: data.description,
        content: data.content,
        timestamp: data.created_at,
      };

      setNewsletters(prev => [newNewsletter, ...prev]);
    } catch (error) {
      console.error('Error saving newsletter:', error);
      throw error;
    }
  };

  const updateNewsletter = async (id: string, content: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('newsletter_outlines')
        .update({ content })
        .eq('id', id);

      if (error) throw error;

      setNewsletters(prev =>
        prev.map(newsletter =>
          newsletter.id === id ? { ...newsletter, content } : newsletter
        )
      );
    } catch (error) {
      console.error('Error updating newsletter:', error);
      throw error;
    }
  };

  const deleteNewsletter = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('newsletter_outlines')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setNewsletters(prev => prev.filter(newsletter => newsletter.id !== id));
    } catch (error) {
      console.error('Error deleting newsletter:', error);
      throw error;
    }
  };

  return (
    <NewsletterContext.Provider value={{ newsletters, addNewsletter, deleteNewsletter, updateNewsletter }}>
      {children}
    </NewsletterContext.Provider>
  );
}

export const useNewsletters = () => useContext(NewsletterContext);