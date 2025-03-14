import { useState } from 'react';
import { SortingState, ColumnFiltersState } from '@tanstack/react-table';
import { supabase } from '../lib/supabase';
import { Lead } from '../types/leads';
import { useToast } from '../hooks/useToast';
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useGenerationHistory } from '../contexts/GenerationHistoryContext';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export function useLeadsTable() {
  const [data, setData] = useState<Lead[]>([]);
  const [importedHistoryIds, setImportedHistoryIds] = useState<Set<string>>(new Set());
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [rowSelection, setRowSelection] = useState({});
  const [editingCell, setEditingCell] = useState<{
    id: string;
    field: keyof Lead;
    value: string;
  } | null>(null);
  const [isDeletingSelected, setIsDeletingSelected] = useState(false);
  const { showToast } = useToast();
  const { user } = useAuth();

  // Load imported history IDs on mount
  useEffect(() => {
    const loadImportedHistoryIds = async () => {
      try {
        const { data: leads, error } = await supabase
          .from('leads')
          .select('history_id')
          .not('history_id', 'is', null);

        if (error) throw error;

        // Get unique history IDs
        const historyIds = new Set(leads?.map(lead => lead.history_id));
        setImportedHistoryIds(historyIds);
      } catch (error) {
        console.error('Error loading imported history IDs:', error);
      }
    };

    loadImportedHistoryIds();
  }, []);

  // Track imported history entries
  const trackImportedHistory = (historyId: string) => {
    setImportedHistoryIds(prev => new Set([...prev, historyId]));
  };

  // Check if a history entry has been imported
  const isHistoryImported = (historyId: string) => {
    return importedHistoryIds.has(historyId);
  };

  useEffect(() => {
    if (selectedHistoryId) fetchLeadsByHistoryId(selectedHistoryId);
  }, []);
  
  useEffect(() => {
    if (selectedHistoryId) {
      fetchLeadsByHistoryId(selectedHistoryId);
    }
  }, [selectedHistoryId]);
  
  const fetchLeads = async () => {
    try {
      if (!selectedHistoryId) {
        setData([]);
        setLoading(false);
        return;
      }

      const { data: leads, error } = await supabase
        .from('leads')
        .select('*') 
        .eq('history_id', selectedHistoryId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setData(leads || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
      showToast('Failed to fetch leads', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeadsByHistoryId = async (historyId: string) => {
    setLoading(true);
    try {
      const { data: leads, error } = await supabase
        .from('leads')
        .select('*')
        .eq('history_id', historyId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setData(leads || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
      showToast('Failed to fetch leads', 'error');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async (id: string, field: keyof Lead, value: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ [field]: value })
        .eq('id', id)
        .select();

      if (error) throw error;

      setData(prev =>
        prev.map(lead =>
          lead.id === id ? { ...lead, [field]: value } : lead
        )
      );

      setEditingCell(null);
      showToast('Lead updated successfully', 'success');
    } catch (error) {
      showToast('Failed to update lead', 'error');
    }
  };

  const handleAddLead = async () => {
    try {
      const newLead = {
        companyName: 'New Company',
        status: 'new',
        priority: 'medium',
        user_id: user?.id
      };

      const { data: lead, error } = await supabase
        .from('leads')
        .insert([newLead])
        .select()
        .single();

      if (error) throw error;

      setData(prev => [lead, ...prev]);
      showToast('Lead added successfully', 'success');
    } catch (error) {
      console.error('Error adding lead:', error);
      showToast('Failed to add lead', 'error');
    }
  };

  const handleDeleteSelected = async () => {
    try {
      setIsDeletingSelected(true);
      
      // Get the actual lead IDs from the selected rows
      const selectedLeads = data.filter((_, index) => rowSelection[index]);
      const selectedIds = selectedLeads.map(lead => lead.id);
      
      if (selectedIds.length === 0) {
        showToast('No leads selected', 'error');
        return;
      }
      
      const { error } = await supabase
        .from('leads')
        .delete()
        .in('id', selectedIds); // This now uses valid UUIDs

      if (error) throw error;

      // Update local data
      setData(prev => prev.filter(lead => !selectedIds.includes(lead.id)));
      
      setRowSelection({});
      showToast('Selected leads deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting leads:', error);
      showToast('Failed to delete selected leads', 'error');
    } finally {
      setIsDeletingSelected(false);
    }
  };

  const handleExport = (format: 'csv' | 'excel') => {
    // Get selected rows from the table
    const selectedLeads = Object.keys(rowSelection).length > 0 
      ? data.filter((_, index) => rowSelection[index])
      : data;

    if (format === 'csv') {
      const csv = Papa.unparse(selectedLeads);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'leads.csv';
      a.click();
    } else {
      const ws = XLSX.utils.json_to_sheet(selectedLeads);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Leads');
      XLSX.writeFile(wb, 'leads.xlsx');
    }
  };

  const handleEditClick = (lead: Lead) => {
    setEditingCell({
      id: lead.id,
      field: 'companyName',
      value: lead.companyName
    });
  };

  const handleView = (lead: Lead) => {
    // Implement view functionality
    console.log('View lead:', lead);
  };

  const handleDelete = async (lead: Lead) => {
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', lead.id);

      if (error) throw error;

      setData(prev => prev.filter(l => l.id !== lead.id));
      showToast('Lead deleted successfully', 'success');
    } catch (error) {
      showToast('Failed to delete lead', 'error');
    }
  };

  const handleConvert = async (lead: Lead) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({
          status: 'converted',
          lastContactDate: new Date().toISOString()
        })
        .eq('id', lead.id);

      if (error) throw error;

      setData(prev =>
        prev.map(l =>
          l.id === lead.id
            ? { ...l, status: 'converted', lastContactDate: new Date().toISOString() }
            : l
        )
      );
      showToast('Lead converted successfully', 'success');
    } catch (error) {
      showToast('Failed to convert lead', 'error');
    }
  };

  return {
    data,
    loading,
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    globalFilter,
    setGlobalFilter,
    rowSelection,
    setRowSelection,
    editingCell,
    setEditingCell,
    selectedHistoryId,
    setSelectedHistoryId,
    importedHistoryIds,
    trackImportedHistory,
    isHistoryImported,
    isDeletingSelected,
    setIsDeletingSelected,
    fetchLeads,
    handleSaveEdit,
    handleAddLead,
    handleDeleteSelected,
    handleExport,
    handleEditClick,
    handleView,
    handleDelete,
    handleConvert,
  };
}