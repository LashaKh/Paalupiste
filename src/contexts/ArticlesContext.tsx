import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

export interface Article {
  id: string;
  title: string;
  link: string;
  timestamp: string;
}

interface ArticlesContextType {
  articles: Article[];
  addArticle: (article: Omit<Article, 'id' | 'timestamp'>) => Promise<void>;
  deleteArticle: (id: string) => Promise<void>;
}

const ArticlesContext = createContext<ArticlesContextType>({
  articles: [],
  addArticle: async () => {},
  deleteArticle: async () => {},
});

export function ArticlesProvider({ children }: { children: React.ReactNode }) {
  const [articles, setArticles] = useState<Article[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadArticles();
    } else {
      setArticles([]);
    }
  }, [user]);

  const loadArticles = async () => {
    try {
      if (!user) {
        setArticles([]);
        return;
      }

      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading articles:', error);
        setArticles([]);
        return;
      }

      if (!data) {
        console.warn('No articles found');
        setArticles([]);
        return;
      }

      const mappedArticles: Article[] = data.map(article => ({
        id: article.id,
        title: article.title,
        link: article.link,
        timestamp: article.created_at
      }));

      setArticles(mappedArticles);
    } catch (error) {
      console.error('Error loading articles:', error);
    }
  };

  const addArticle = async (article: Omit<Article, 'id' | 'timestamp'>) => {
    if (!user) return;

    let retries = 0;
    const maxRetries = 3;

    while (retries < maxRetries) {
      try {
        const { data, error } = await supabase
          .from('articles')
          .insert({
            user_id: user.id,
            title: article.title,
            link: article.link,
          })
          .select()
          .single();

        if (error) {
          if (retries < maxRetries - 1) {
            retries++;
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
            continue;
          }
          throw error;
        }

        const newArticle: Article = {
          id: data.id,
          title: data.title,
          link: data.link,
          timestamp: data.created_at,
        };

        setArticles(prev => [newArticle, ...prev]);
        break;
      } catch (error) {
        console.error('Error saving article:', error);
        if (retries === maxRetries - 1) {
          throw error;
        }
      }
    }
  };

  const deleteArticle = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setArticles(prev => prev.filter(article => article.id !== id));
    } catch (error) {
      console.error('Error deleting article:', error);
      throw error;
    }
  };

  return (
    <ArticlesContext.Provider value={{ articles, addArticle, deleteArticle }}>
      {children}
    </ArticlesContext.Provider>
  );
}

export const useArticles = () => useContext(ArticlesContext);