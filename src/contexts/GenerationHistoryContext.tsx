import React, { createContext, useContext, useState, useEffect } from 'react';
import { GenerationHistory } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useToast } from '../hooks/useToast';

interface GenerationHistoryContextType {
  history: GenerationHistory[];
  addGeneration: (generation: Omit<GenerationHistory, 'id'>) => void;
  deleteGeneration: (id: string) => Promise<void>;
  ensureHistoryEntries: () => Promise<void>;
  loading: boolean;
  error: Error | null;
  refreshGenerations: () => Promise<void>;
  updateEnrichmentStatus: (id: string, status: 'not_started' | 'in_progress' | 'completed') => Promise<void>;
  checkEnrichmentStatus: (id: string) => Promise<{ status: string; count: number; timestamp: string | null }>;
}

const GenerationHistoryContext = createContext<GenerationHistoryContextType | undefined>(undefined);

export function GenerationHistoryProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useState<GenerationHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();
  const { showToast } = useToast();

  const fetchGenerations = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('lead_history')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false });

      if (error) throw error;

      // Map snake_case to camelCase
      const mappedData = (data || []).map(entry => ({
        id: entry.id,
        productName: entry.product_name,
        productDescription: entry.product_description,
        industries: entry.industries || [],
        companySize: typeof entry.company_size === 'string' && entry.company_size.startsWith('[') ? JSON.parse(entry.company_size) : (Array.isArray(entry.company_size) ? entry.company_size : []),
        additionalIndustries: entry.additional_industries || '',
        location: entry.location,
        status: entry.status,
        sheetLink: entry.sheet_link,
        sheetId: entry.sheet_id,
        errorMessage: entry.error_message,
        timestamp: entry.timestamp,
        enrichmentStatus: entry.enrichment_status || 'not_started',
        enrichmentTimestamp: entry.enrichment_timestamp,
        enrichmentCount: entry.enrichment_count || 0
      }));

      setHistory(mappedData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch generations'));
      showToast('Failed to load generation history', 'error');
    } finally {
      setLoading(false);
    }
  };

  const addGeneration = async (generation: Omit<GenerationHistory, 'id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('lead_history')
        .insert({
          user_id: user.id,
          product_name: generation.productName,
          product_description: generation.productDescription,
          industries: generation.industries,
          company_size: generation.companySize,
          additional_industries: generation.additionalIndustries,
          location: typeof generation.location === 'string'
            ? generation.location
            : {
                country: generation.location.country,
                state: generation.location.state || ''
              },
          status: generation.status,
          sheet_link: generation.sheetLink,
          sheet_id: generation.sheetId,
          error_message: generation.errorMessage,
          timestamp: generation.timestamp
        })
        .select();

      if (error) throw error;
      
      // Add the new entry to the state with the server-generated ID
      if (data && data.length > 0) {
        const newEntry: GenerationHistory = {
          id: data[0].id,
          industries: generation.industries || [],
          companySize: generation.companySize || [],
          additionalIndustries: generation.additionalIndustries || '',
          productName: generation.productName,
          productDescription: generation.productDescription,
          location: generation.location,
          status: generation.status,
          sheetLink: generation.sheetLink,
          sheetId: generation.sheetId,
          errorMessage: generation.errorMessage,
          timestamp: generation.timestamp
        };
        setHistory(prev => [newEntry, ...prev]);
      } else {
        // Fallback: reload history to ensure consistency
        await fetchGenerations();
      }
    } catch (error) {
      console.error('Error saving history:', error);
      
      // Fallback to local state if save fails
      const newEntry: GenerationHistory = {
        id: crypto.randomUUID(),
        ...generation,
      };
      setHistory(prev => [newEntry, ...prev]);
      
      // Reload to ensure consistency
      setTimeout(fetchGenerations, 1000);
    }
  };

  const deleteGeneration = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('lead_history')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setHistory(prev => prev.filter(entry => entry.id !== id));
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete generation');
    }
  };

  // Fetch generations on mount and when user changes
  useEffect(() => {
    fetchGenerations();
  }, [user]);

  // This function is simplified to no longer create default entries
  const ensureHistoryEntries = async () => {
    try {
      if (!user) {
        console.log("GenerationHistoryContext: No user available for ensureHistoryEntries");
        return;
      }

      console.log("GenerationHistoryContext: Checking if history entries exist");
      
      const { count, error } = await supabase
        .from('lead_history')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      
      if (error) {
        console.error('GenerationHistoryContext: Error checking history entries:', error);
        return;
      }
      
      // No longer creating default entries, just logging the count
      console.log(`GenerationHistoryContext: Found ${count} existing entries`);
    } catch (error) {
      console.error('GenerationHistoryContext: Error in ensureHistoryEntries:', error);
    }
  };

  // New method to update enrichment status
  const updateEnrichmentStatus = async (id: string, status: 'not_started' | 'in_progress' | 'completed') => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('lead_history')
        .update({ 
          enrichment_status: status, 
          enrichment_timestamp: new Date().toISOString()
          // The enrichment_count will be updated automatically by the trigger
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setHistory(prev => prev.map(entry => 
        entry.id === id 
          ? { 
              ...entry, 
              enrichmentStatus: status, 
              enrichmentTimestamp: new Date().toISOString(),
              // Only increment the count for in_progress status, like the trigger does
              enrichmentCount: status === 'in_progress' ? (entry.enrichmentCount || 0) + 1 : entry.enrichmentCount
            } 
          : entry
      ));
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update enrichment status');
    }
  };

  // New method to check enrichment status
  const checkEnrichmentStatus = async (id: string) => {
    if (!user) return { status: 'not_started', count: 0, timestamp: null };

    try {
      const { data, error } = await supabase
        .from('lead_history')
        .select('enrichment_status, enrichment_count, enrichment_timestamp')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      return { 
        status: data.enrichment_status || 'not_started',
        count: data.enrichment_count || 0,
        timestamp: data.enrichment_timestamp 
      };
    } catch (err) {
      console.error('Error checking enrichment status:', err);
      return { status: 'not_started', count: 0, timestamp: null };
    }
  };

  return (
    <GenerationHistoryContext.Provider
      value={{
        history,
        addGeneration,
        deleteGeneration,
        ensureHistoryEntries,
        loading,
        error,
        refreshGenerations: fetchGenerations,
        updateEnrichmentStatus,
        checkEnrichmentStatus
      }}
    >
      {children}
    </GenerationHistoryContext.Provider>
  );
}

export function useGenerationHistory() {
  const context = useContext(GenerationHistoryContext);
  if (context === undefined) {
    throw new Error('useGenerationHistory must be used within a GenerationHistoryProvider');
  }
  return context;
}
