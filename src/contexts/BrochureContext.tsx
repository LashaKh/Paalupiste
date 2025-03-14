import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

export interface Brochure {
  id: string;
  title: string;
  description: string;
  templateId: string;
  pdfUrl: string;
  html_content: string;
  timestamp: string;
}

interface BrochureContextType {
  brochures: Brochure[];
  addBrochure: (brochure: Omit<Brochure, 'id' | 'timestamp'>) => Promise<void>;
  deleteBrochure: (id: string) => Promise<void>;
}

const BrochureContext = createContext<BrochureContextType>({
  brochures: [],
  addBrochure: async () => {},
  deleteBrochure: async () => {},
});

export function BrochureProvider({ children }: { children: React.ReactNode }) {
  const [brochures, setBrochures] = useState<Brochure[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadBrochures();
    } else {
      setBrochures([]);
    }
  }, [user]);

  const loadBrochures = async () => {
    try {
      if (!user) {
        console.log('No user logged in, clearing brochures');
        setBrochures([]);
        return;
      }

      console.log('Fetching brochures from Supabase...');
      const { data, error } = await supabase
        .from('brochures')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        if (error.message.includes('Failed to fetch')) {
          console.warn('Supabase connection not initialized yet. Please connect to Supabase first.');
        } else {
          console.error('Error loading brochures:', error);
        }
        setBrochures([]);
        return;
      }

      if (!data) {
        console.warn('No brochures found');
        setBrochures([]);
        return;
      }

      const mappedBrochures: Brochure[] = data.map(brochure => ({
        id: brochure.id,
        title: brochure.title,
        description: brochure.description,
        templateId: brochure.template_id,
        pdfUrl: brochure.pdf_url,
        html_content: brochure.html_content || '',
        timestamp: brochure.created_at
      }));

      setBrochures(mappedBrochures);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          console.warn('Network error while loading brochures. Please check your connection.');
        } else {
          console.error('Unexpected error loading brochures:', error.message);
        }
      } else {
        console.error('Unknown error loading brochures:', error);
      }
      setBrochures([]);
    }
  };

  const addBrochure = async (brochure: Omit<Brochure, 'id' | 'timestamp'>) => {
    if (!user) return;

    let retries = 0;
    const maxRetries = 3;

    while (retries < maxRetries) {
      try {
        const { data, error } = await supabase
          .from('brochures')
          .insert({
            user_id: user.id,
            title: brochure.title,
            description: brochure.description,
            template_id: brochure.templateId,
            pdf_url: brochure.pdfUrl,
            html_content: brochure.html_content,
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

        const newBrochure: Brochure = {
          id: data.id,
          title: data.title,
          description: data.description,
          templateId: data.template_id,
          pdfUrl: data.pdf_url,
          html_content: data.html_content || '',
          timestamp: data.created_at,
        };

        setBrochures(prev => [newBrochure, ...prev]);
        break;
      } catch (error) {
        console.error('Error saving brochure to database:', error);
        if (error instanceof Error) {
          console.error('Error details:', error.message);
        }
        if (retries === maxRetries - 1) {
          throw error;
        }
      }
    }
  };

  const deleteBrochure = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('brochures')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setBrochures(prev => prev.filter(brochure => brochure.id !== id));
    } catch (error) {
      console.error('Error deleting brochure:', error);
      throw error;
    }
  };

  return (
    <BrochureContext.Provider value={{ brochures, addBrochure, deleteBrochure }}>
      {children}
    </BrochureContext.Provider>
  );
}

export const useBrochures = () => useContext(BrochureContext);