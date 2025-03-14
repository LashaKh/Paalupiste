import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

export interface Outline {
  id: string;
  title: string;
  description: string;
  content: string;
  timestamp: string;
}

interface OutlineContextType {
  outlines: Outline[];
  addOutline: (outline: Omit<Outline, 'id' | 'timestamp'>) => Promise<void>;
  deleteOutline: (id: string) => Promise<void>;
  updateOutline: (id: string, content: string) => Promise<void>;
}

const OutlineContext = createContext<OutlineContextType>({
  outlines: [],
  addOutline: async () => {},
  deleteOutline: async () => {},
  updateOutline: async () => {},
});

export function OutlineProvider({ children }: { children: React.ReactNode }) {
  const [outlines, setOutlines] = useState<Outline[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadOutlines();
    } else {
      setOutlines([]);
    }
  }, [user]);

  const loadOutlines = async () => {
    try {
      const { data, error } = await supabase
        .from('article_outlines')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedOutlines: Outline[] = data.map(outline => ({
        id: outline.id,
        title: outline.title,
        description: outline.description,
        content: outline.content,
        timestamp: outline.created_at
      }));

      setOutlines(mappedOutlines);
    } catch (error) {
      console.error('Error loading outlines:', error);
    }
  };
  const addOutline = async (outline: Omit<Outline, 'id' | 'timestamp'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('article_outlines')
        .insert({
          user_id: user.id,
          title: outline.title,
          description: outline.description,
          content: outline.content,
        })
        .select()
        .single();

      if (error) throw error;

      const newOutline: Outline = {
        id: data.id,
        title: data.title,
        description: data.description,
        content: data.content,
        timestamp: data.created_at,
      };

      setOutlines(prev => [newOutline, ...prev]);
    } catch (error) {
      console.error('Error saving outline:', error);
      throw error;
    }
  };
  const updateOutline = async (id: string, content: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('article_outlines')
        .update({ content })
        .eq('id', id);

      if (error) throw error;

      setOutlines(prev =>
        prev.map(outline =>
          outline.id === id ? { ...outline, content } : outline
        )
      );
    } catch (error) {
      console.error('Error updating outline:', error);
      throw error;
    }
  };

  const deleteOutline = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('article_outlines')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setOutlines(prev => prev.filter(outline => outline.id !== id));
    } catch (error) {
      console.error('Error deleting outline:', error);
      throw error;
    }
  };

  return (
    <OutlineContext.Provider value={{ outlines, addOutline, deleteOutline, updateOutline }}>
      {children}
    </OutlineContext.Provider>
  );
}

export const useOutlines = () => useContext(OutlineContext);