import React, { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import { useLeadsTable } from '../hooks/useLeadsTable';
import { getColumns } from '../components/leads/LeadTableColumns';
import { LeadTableHeader } from '../components/leads/LeadTableHeader';
import { LeadTableBody } from '../components/leads/LeadTableBody';
import { LeadTablePagination } from '../components/leads/LeadTablePagination';
import { LeadHistoryList } from '../components/leads/LeadHistoryList';
import { LeadDetailsModal } from '../components/leads/LeadDetailsModal';
import { History, Trash2 } from 'lucide-react';
import { Lead } from '../types/leads';
import { useState } from 'react';
import { useGenerationHistory, GenerationHistory } from '../contexts/GenerationHistoryContext';

export default function LeadsTable() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const { history, deleteGeneration } = useGenerationHistory();
  const { importedHistoryIds } = useLeadsTable();

  // Filter history to only show imported entries
  const importedHistory = history.filter(entry => importedHistoryIds.has(entry.id));

  const handleDeleteHistory = async (id: string) => {
    try {
      await deleteGeneration(id);
      showToast('History entry deleted successfully', 'success');
      if (selectedHistoryId === id) {
        setSelectedHistoryId(null);
      }
    } catch (error) {
      showToast('Failed to delete history entry', 'error');
    }
  };

  const {
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
    selectedHistoryId,
    setSelectedHistoryId,
  } = useLeadsTable();

  const columns = useMemo(
    () => getColumns({
      editingCell,
      setEditingCell,
      handleSaveEdit,
      handleEditClick,
      handleView: (lead: Lead) => setSelectedLead(lead),
      handleDelete,
      handleConvert,
    }),
    [editingCell, setSelectedLead]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="max-w-[98vw] mx-auto px-2 sm:px-4 lg:px-6 py-6 flex gap-4">
      {/* History List */}
      <div className="flex-shrink-0">
        <LeadHistoryList
          entries={importedHistory}
          selectedEntryId={selectedHistoryId}
          onSelectEntry={(entry) => setSelectedHistoryId(entry.id)}
          onDeleteEntry={handleDeleteHistory}
        />
      </div>

      {/* Leads Table */}
      <div className="flex-1 min-w-0 transition-all duration-300">
        <div className="mb-4">
          <h1 className="text-xl font-bold text-gray-900">
            {selectedHistoryId ? (
              <>
                Leads from {new Date(importedHistory.find(h => h.id === selectedHistoryId)?.timestamp || '').toLocaleDateString()}
                <span className="ml-2 text-sm font-normal text-gray-600">
                  {importedHistory.find(h => h.id === selectedHistoryId)?.location}
                </span>
              </>
            ) : (
              'Select a Lead Generation Entry'
            )}
          </h1>
          {selectedHistoryId && (
            <p className="mt-2 text-gray-600">
              Generated leads for {importedHistory.find(h => h.id === selectedHistoryId)?.industries.join(', ')}
            </p>
          )}
        </div>

        {selectedHistoryId ? (
          <div>
            <LeadTableHeader
              table={table}
              globalFilter={globalFilter}
              setGlobalFilter={setGlobalFilter}
              onRefresh={fetchLeads}
              onExport={handleExport}
              onAddLead={handleAddLead}
              onDeleteSelected={handleDeleteSelected}
              isDeletingSelected={isDeletingSelected}
            />

            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
              <LeadTableBody
                table={table}
                loading={loading}
              />
              <LeadTablePagination table={table} />
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              Select a Lead Generation entry from the list to view its leads
            </p>
          </div>
        )}
      </div>
      
      {selectedLead && (
        <LeadDetailsModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
        />
      )}
    </div>
  );
}