import React, { useMemo, useState, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import { useLeadsTable } from '../hooks/useLeadsTable';
import { getColumns } from '../components/leads/LeadTableColumns';
import { LeadTableHeader } from '../components/leads/LeadTableHeader';
import { LeadTableBody } from '../components/leads/LeadTableBody';
import { LeadTablePagination } from '../components/leads/LeadTablePagination';
import { LeadDetailsModal } from '../components/leads/LeadDetailsModal';
import { Lead } from '../types/leads';
import { useLeadImports } from '../hooks/useLeadImports';
import { Trash2, Calendar, Users, CheckCircleIcon, MapPin, Building } from 'lucide-react';
import { Package } from 'lucide-react';

// Helper function to format location
const formatLocation = (location: string | { country: string; state?: string } | undefined): string => {
  if (!location) return 'Unknown location';
  
  // If location is a string and looks like JSON, try to parse it
  if (typeof location === 'string' && location.startsWith('{')) {
    try {
      const parsed = JSON.parse(location);
      if (parsed && typeof parsed === 'object') {
        return `${parsed.country}${parsed.state ? `, ${parsed.state}` : ''}`;
      }
    } catch (e) {
      // If parsing fails, return the original string
      return location;
    }
  }
  
  // If location is already an object
  if (typeof location === 'object') {
    return `${location.country}${location.state ? `, ${location.state}` : ''}`;
  }
  
  // If it's a plain string
  return location;
};

export default function LeadsTable() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDeletingSelected, setIsDeletingSelected] = useState(false);
  
  const { 
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
    handleSaveEdit,
    handleAddLead,
    handleDeleteSelected,
    handleExport,
    handleEditClick,
    handleView,
    handleDelete,
    handleConvert,
    fetchImportedLeads,
    fetchLeadsByImport
  } = useLeadsTable();

  const { imports, loading: importsLoading, fetchImports } = useLeadImports();

  // Reset scroll position when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Handle import deletion
  const handleDeleteImport = async (id: string) => {
    try {
      // First, delete all leads associated with this import
      const { error: leadsError } = await supabase
        .from('leads')
        .delete()
        .eq('import_id', id)
        .eq('user_id', user?.id);

      if (leadsError) throw leadsError;

      // Then delete the import entry
      const { error: importError } = await supabase
        .from('lead_imports')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (importError) throw importError;
      
      // Clear all related state
      setSelectedImportId(null);
      setData([]); // Clear the leads data
      setSelectedLead(null); // Clear any selected lead
      
      // Refresh both the imports and leads data
      await Promise.all([
        fetchImports(),
        fetchImportedLeads()
      ]);
      
      showToast('Import and associated leads deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting import:', error);
      showToast('Failed to delete import and leads', 'error');
    }
  };

  // Wrapper function for handleAddLead to match the expected type
  const handleAddLeadWrapper = () => {
    handleAddLead({
      companyName: '',
      companyAddress: '',
      website: '',
      company_description: '',
      decisionMakerName: '',
      decisionMakerTitle: '',
      decisionMakerEmail: '',
      decisionMakerLinkedIn: '',
      status: 'new',
      priority: 'medium',
      lastContactDate: new Date().toISOString(),
      notes: '',
      import_id: selectedImportId || undefined
    });
  };

  // Set up table columns
  const columns = useMemo(
    () => getColumns({
      editingCell,
      setEditingCell,
      handleSaveEdit,
      handleEditClick: (lead: Lead) => handleEditClick(lead.id, 'companyName', lead.companyName),
      handleView: (lead: Lead) => setSelectedLead(lead),
      handleDelete,
      handleConvert,
    }),
    [editingCell, setSelectedLead]
  );

  // Set up table instance
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
    <div className="max-w-[98vw] mx-auto px-2 sm:px-4 lg:px-6 py-6 space-y-6">
      {/* Imports List */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200/50 p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Imported Lead Tables</h2>
              <p className="mt-1 text-sm text-gray-500">Select a table to view and manage its leads</p>
            </div>
            {imports.length > 0 && (
              <div className="text-sm text-gray-500">
                {imports.length} {imports.length === 1 ? 'table' : 'tables'} imported
              </div>
            )}
          </div>
          
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {imports.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <div className="rounded-full bg-gray-100 p-3 mb-3">
                  <Package className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-sm font-medium text-gray-900">No imported tables</h3>
                <p className="mt-1 text-sm text-gray-500 text-center">Import your first lead table to get started</p>
              </div>
            ) : (
              imports.map((importItem) => (
                <div
                  key={importItem.id}
                  className={`group relative p-5 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                    selectedImportId === importItem.id
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                      : 'border-gray-200 hover:border-primary/50'
                  } cursor-pointer`}
                  onClick={() => {
                    setSelectedImportId(importItem.id);
                    fetchLeadsByImport(importItem.id);
                  }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col gap-2">
                        <h3 className="font-medium text-gray-900 truncate">{importItem.name}</h3>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            <Calendar className="w-3.5 h-3.5 mr-1" />
                            {new Date(importItem.importDate).toLocaleDateString(undefined, { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                          {importItem.sourceDetails?.location && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                              <MapPin className="w-3.5 h-3.5 mr-1" />
                              {formatLocation(importItem.sourceDetails.location)}
                            </span>
                          )}
                          {importItem.sourceDetails?.industries && importItem.sourceDetails.industries.length > 0 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                              <Building className="w-3.5 h-3.5 mr-1" />
                              {Array.isArray(importItem.sourceDetails.industries) 
                                ? importItem.sourceDetails.industries[0] + (importItem.sourceDetails.industries.length > 1 ? ` +${importItem.sourceDetails.industries.length - 1}` : '')
                                : importItem.sourceDetails.industries
                              }
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteImport(importItem.id);
                      }}
                      className="absolute top-4 right-4 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-100"
                      title="Delete table"
                    >
                      <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700">
                      <Users className="w-3.5 h-3.5" />
                      {importItem.leadCount} {importItem.leadCount === 1 ? 'lead' : 'leads'}
                    </div>
                    {selectedImportId === importItem.id && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 rounded-full text-xs font-medium text-primary">
                        <CheckCircleIcon className="w-3.5 h-3.5" />
                        Selected
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="flex-1 min-w-0 transition-all duration-300">
        <div className="max-w-[1600px] mx-auto space-y-6">
          <div className="flex flex-col gap-4">
            {/* Table Header */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200/50 p-4">
              <LeadTableHeader
                table={table}
                globalFilter={globalFilter}
                setGlobalFilter={setGlobalFilter}
                onRefresh={() => selectedImportId ? fetchLeadsByImport(selectedImportId) : fetchImportedLeads()}
                onExport={handleExport}
                onAddLead={handleAddLeadWrapper}
                onDeleteSelected={handleDeleteSelected}
                isDeletingSelected={isDeletingSelected}
              />
            </div>

            {/* Table Body */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200/50">
              <LeadTableBody
                table={table}
                loading={loading}
                onRefresh={() => selectedImportId ? fetchLeadsByImport(selectedImportId) : fetchImportedLeads()}
              />
            </div>

            {/* Table Pagination */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200/50 p-4">
              <LeadTablePagination
                table={table}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Lead Details Modal */}
      {selectedLead && (
        <LeadDetailsModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
        />
      )}
    </div>
  );
}