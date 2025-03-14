import React, { useState } from 'react';
import { Filter, Settings, RefreshCw, Download, Plus, Loader2, Trash2 } from 'lucide-react';
import { Table, Column } from '@tanstack/react-table';
import { Lead } from '../../types/leads';
import { LeadFiltersModal } from './LeadFiltersModal';

interface LeadTableHeaderProps {
  table: Table<Lead>;
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  onRefresh: () => void;
  onExport: (format: 'csv' | 'excel') => void;
  onAddLead: () => void;
  onDeleteSelected: () => void;
  isDeletingSelected: boolean;
}

export function LeadTableHeader({
  table,
  globalFilter,
  setGlobalFilter,
  onRefresh,
  onExport,
  onAddLead,
  onDeleteSelected,
  isDeletingSelected
}: LeadTableHeaderProps) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {table.getSelectedRowModel().rows.length} selected
          </span>
          {table.getSelectedRowModel().rows.length > 0 && !isDeletingSelected && (
            <div className="flex items-center gap-2">
              <button
                onClick={onDeleteSelected}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-1.5" />
                Delete Selected
              </button>
              <button
                onClick={() => table.resetRowSelection()}
                className="text-sm text-primary hover:text-primary-hover"
              >
                Clear selection
              </button>
            </div>
          )}
          {table.getSelectedRowModel().rows.length > 0 && isDeletingSelected && (
            <button
              disabled
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-500 bg-gray-100 rounded-lg cursor-not-allowed"
            >
              <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              Deleting...
            </button>
          )}
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search leads..."
            className="w-60 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setIsFiltersOpen(true)}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </button>
        <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
          <Settings className="w-4 h-4 mr-2" />
          Columns
        </button>
        <button
          onClick={onRefresh}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={() => onExport('csv')}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </button>
        <button
          onClick={() => onExport('excel')}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Excel
        </button>
        <button
          onClick={onAddLead}
          className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-hover">
          <Plus className="w-4 h-4 mr-2" />
          Add Lead
        </button>
      </div>
      
      <LeadFiltersModal
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        columns={table.getAllColumns()}
        columnFilters={table.getState().columnFilters}
        onFilter={(filters) => {
          table.setColumnFilters(filters);
        }}
      />
    </div>
  );
}