import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

export interface ArticleIdea {
  id: string;
  title: string;
  description: string;
  timestamp: string;
}

interface IdeasContextType {
  ideas: ArticleIdea[];
  addIdea: (idea: Omit<ArticleIdea, 'id' | 'timestamp'>) => Promise<void>;
  deleteIdea: (id: string) => Promise<void>;
}

const IdeasContext = createContext<IdeasContextType>({
  ideas: [],
  addIdea: async () => {},
  deleteIdea: async () => {},
});

export function IdeasProvider({ children }: { children: React.ReactNode }) {
  const [ideas, setIdeas] = useState<ArticleIdea[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadIdeas();
    } else {
      setIdeas([]);
    }
  }, [user]);

  const loadIdeas = async () => {
    try {
      if (!user) {
        setIdeas([]);
        return;
      }

      const { data, error } = await supabase
        .from('article_ideas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading ideas:', error);
        setIdeas([]);
        return;
      }

      if (!data) {
        console.warn('No ideas found');
        setIdeas([]);
        return;
      }

      const mappedIdeas: ArticleIdea[] = data.map(idea => ({
        id: idea.id,
        title: idea.title,
        description: idea.description,
        timestamp: idea.created_at
      }));

      setIdeas(mappedIdeas);
    } catch (error) {
      console.error('Error loading ideas:', error);
    }
  };

  const addIdea = async (idea: Omit<ArticleIdea, 'id' | 'timestamp'>) => {
    if (!user) return;

    let retries = 0;
    const maxRetries = 3;

    while (retries < maxRetries) {
      try {
        const { data, error } = await supabase
          .from('article_ideas')
          .insert({
            user_id: user.id,
            title: idea.title,
            description: idea.description,
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

        const newIdea: ArticleIdea = {
          id: data.id,
          title: data.title,
          description: data.description,
          timestamp: data.created_at,
        };

        setIdeas(prev => [newIdea, ...prev]);
        break;
      } catch (error) {
        console.error('Error saving idea:', error);
        if (retries === maxRetries - 1) {
          throw error;
        }
      }
    }
  };

  const deleteIdea = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('article_ideas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setIdeas(prev => prev.filter(idea => idea.id !== id));
    } catch (error) {
      console.error('Error deleting idea:', error);
      throw error;
    }
  };

  return (
    <IdeasContext.Provider value={{ ideas, addIdea, deleteIdea }}>
      {children}
    </IdeasContext.Provider>
  );
}

export const useIdeas = () => useContext(IdeasContext);