import React, { createContext, useContext, useState } from 'react';
import { useEffect } from 'react';
import { GenerationHistory } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface GenerationHistoryContextType {
  history: GenerationHistory[];
  addGeneration: (generation: Omit<GenerationHistory, 'id'>) => void;
  deleteGeneration: (id: string) => Promise<void>;
}

const GenerationHistoryContext = createContext<GenerationHistoryContextType>({
  history: [],
  addGeneration: () => {},
  deleteGeneration: async () => {},
});

export const GenerationHistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<GenerationHistory[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user]);

  const loadHistory = async () => {
    try {
      if (!user) {
        return;
      }

      const { data, error } = await supabase
        .from('lead_history') 
        .select(`
          id,
          user_id,
          product_name,
          product_description,
          location,
          industries,
          company_size,
          additional_industries,
          status,
          sheet_link,
          sheet_id,
          error_message,
          timestamp
        `)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        setHistory([]);
        return;
      }
      
      // Map database fields to frontend model
      const mappedHistory: GenerationHistory[] = (data || []).map(item => ({
        id: item.id,
        industries: item.industries || [],
        companySize: item.company_size || '',
        additionalIndustries: item.additional_industries || '',
        productName: item.product_name,
        productDescription: item.product_description,
        location: item.location,
        status: item.status as 'success' | 'error',
        sheetLink: item.sheet_link,
        sheetId: item.sheet_id,
        errorMessage: item.error_message,
        timestamp: item.timestamp
      }));
      
      setHistory(mappedHistory);
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error loading history:', error.message);
      } else {
        console.error('Unknown error loading history:', error);
      }
      // Set empty history on error to prevent UI issues
      setHistory([]);
    }
  };

  const addGeneration = async (generation: Omit<GenerationHistory, 'id'>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('lead_history')
        .insert({
          user_id: user.id,
          product_name: generation.productName,
          product_description: generation.productDescription,
          industries: generation.industries,
          company_size: generation.companySize,
          additional_industries: generation.additionalIndustries,
          location: generation.location,
          status: generation.status,
          sheet_link: generation.sheetLink,
          sheet_id: generation.sheetId,
          error_message: generation.errorMessage,
          timestamp: generation.timestamp
        });

      if (error) throw error;
      
      // Reload history to get the server-generated ID
      await loadHistory();
    } catch (error) {
      console.error('Error saving history:', error);
      
      // Fallback to local state if save fails
      const newEntry: GenerationHistory = {
        id: crypto.randomUUID(),
        ...generation,
      };
      setHistory(prev => [newEntry, ...prev]);
    }
  };

  const deleteGeneration = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('lead_history')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setHistory(prev => prev.filter(entry => entry.id !== id));
    } catch (error) {
      console.error('Error deleting history entry:', error);
      throw error;
    }
  };

  return (
    <GenerationHistoryContext.Provider value={{ history, addGeneration, deleteGeneration }}>
      {children}
    </GenerationHistoryContext.Provider>
  );
};

export const useGenerationHistory = () => useContext(GenerationHistoryContext);
