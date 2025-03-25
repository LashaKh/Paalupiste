import { useState } from 'react';
import { SortingState, ColumnFiltersState } from '@tanstack/react-table';
import { supabase } from '../lib/supabase';
import { Lead } from '../types/leads';
import { useToast } from '../hooks/useToast';
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as XLSX from 'xlsx';
// @ts-ignore - Ignore the missing type definitions for papaparse
import Papa from 'papaparse';

export function useLeadsTable() {
  const [data, setData] = useState<Lead[]>([]);
  const [selectedImportId, setSelectedImportId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [rowSelection, setRowSelection] = useState<Record<number, boolean>>({});
  const [editingCell, setEditingCell] = useState<{
    id: string;
    field: keyof Lead;
    value: string;
  } | null>(null);
  const [isDeletingSelected, setIsDeletingSelected] = useState(false);
  const { showToast } = useToast();
  const { user } = useAuth();

  // Fetch all imported leads for the user
  const fetchImportedLeads = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data: leads, error } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', user.id)
        .not('import_id', 'is', null);
        
      if (error) throw error;
      
      if (leads) {
        const processedLeads = leads.map(lead => ({
          id: lead.id,
          companyName: lead.companyName || lead.company_name || '',
          companyAddress: lead.companyAddress || lead.company_address || '',
          website: lead.website || '',
          company_description: lead.company_description || lead.companyDescription || '',
          decisionMakerName: lead.decisionMakerName || lead.decision_maker_name || '',
          decisionMakerTitle: lead.decisionMakerTitle || lead.decision_maker_title || '',
          decisionMakerEmail: lead.decisionMakerEmail || lead.decision_maker_email || '',
          decisionMakerLinkedIn: lead.decisionMakerLinkedIn || lead.decision_maker_linkedin || '',
          status: lead.status || 'new',
          priority: lead.priority || 'medium',
          lastContactDate: lead.lastContactDate || lead.last_contact_date || new Date().toISOString(),
          notes: lead.notes || '',
          import_id: lead.import_id,
          importId: lead.import_id
        }));
        
        setData(processedLeads);
      }
    } catch (error) {
      console.error('Error fetching imported leads:', error);
      showToast('Failed to fetch imported leads', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch leads by import ID
  const fetchLeadsByImport = async (importId: string) => {
    if (!user || !importId) return;
    
    setLoading(true);
    try {
      const { data: leads, error } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', user.id)
        .eq('import_id', importId);
        
      if (error) throw error;
      
      if (leads) {
        const processedLeads = leads.map(lead => ({
          id: lead.id,
          companyName: lead.companyName || lead.company_name || '',
          companyAddress: lead.companyAddress || lead.company_address || '',
          website: lead.website || '',
          company_description: lead.company_description || lead.companyDescription || '',
          decisionMakerName: lead.decisionMakerName || lead.decision_maker_name || '',
          decisionMakerTitle: lead.decisionMakerTitle || lead.decision_maker_title || '',
          decisionMakerEmail: lead.decisionMakerEmail || lead.decision_maker_email || '',
          decisionMakerLinkedIn: lead.decisionMakerLinkedIn || lead.decision_maker_linkedin || '',
          status: lead.status || 'new',
          priority: lead.priority || 'medium',
          lastContactDate: lead.lastContactDate || lead.last_contact_date || new Date().toISOString(),
          notes: lead.notes || '',
          import_id: lead.import_id,
          importId: lead.import_id
        }));
        
        setData(processedLeads);
      }
    } catch (error) {
      console.error('Error fetching leads by import:', error);
      showToast('Failed to fetch leads for this import', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchImportedLeads();
  }, [user]);

  // Handle saving edits
  const handleSaveEdit = async (id: string, field: keyof Lead, value: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ [field]: value })
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      setData(prev =>
        prev.map(lead =>
          lead.id === id ? { ...lead, [field]: value } : lead
        )
      );
      showToast('Lead updated successfully', 'success');
    } catch (error) {
      showToast('Failed to update lead', 'error');
    }
  };

  // Handle adding new lead
  const handleAddLead = async (newLead: Partial<Lead>) => {
    try {
      const { data: inserted, error } = await supabase
        .from('leads')
        .insert([{ ...newLead, user_id: user?.id }])
        .select();

      if (error) throw error;

      if (inserted && inserted.length > 0) {
        setData(prev => [...prev, inserted[0] as Lead]);
        showToast('Lead added successfully', 'success');
      }
    } catch (error) {
      showToast('Failed to add lead', 'error');
    }
  };

  // Handle deleting selected leads
  const handleDeleteSelected = async () => {
    const selectedIds = Object.keys(rowSelection).map(
      index => data[parseInt(index)].id
    );

    if (selectedIds.length === 0) return;

    setIsDeletingSelected(true);
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .in('id', selectedIds)
        .eq('user_id', user?.id);

      if (error) throw error;

      setData(prev => prev.filter(lead => !selectedIds.includes(lead.id)));
      setRowSelection({});
      showToast('Selected leads deleted successfully', 'success');
    } catch (error) {
      showToast('Failed to delete selected leads', 'error');
    } finally {
      setIsDeletingSelected(false);
    }
  };

  // Handle exporting leads
  const handleExport = async (format: 'csv' | 'excel') => {
    const exportData = data.map(lead => ({
      'Company Name': lead.companyName,
      'Company Address': lead.companyAddress,
      'Website': lead.website,
      'Company Description': lead.company_description,
      'Decision Maker Name': lead.decisionMakerName,
      'Decision Maker Title': lead.decisionMakerTitle,
      'Decision Maker Email': lead.decisionMakerEmail,
      'Decision Maker LinkedIn': lead.decisionMakerLinkedIn,
      'Status': lead.status,
      'Priority': lead.priority,
      'Last Contact Date': lead.lastContactDate,
      'Notes': lead.notes
    }));

    if (format === 'csv') {
      const csv = Papa.unparse(exportData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'leads_export.csv';
      link.click();
    } else {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(wb, ws, 'Leads');
      XLSX.writeFile(wb, 'leads_export.xlsx');
    }
  };

  const handleEditClick = (id: string, field: keyof Lead, value: string) => {
    setEditingCell({ id, field, value });
  };

  const handleView = (lead: Lead) => {
    console.log('View lead:', lead);
  };

  const handleDelete = async (lead: Lead) => {
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', lead.id)
        .eq('user_id', user?.id);

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
        .eq('id', lead.id)
        .eq('user_id', user?.id);

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
    setData,
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
    selectedImportId,
    setSelectedImportId,
    isDeletingSelected,
    setIsDeletingSelected,
    fetchImportedLeads,
    fetchLeadsByImport,
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