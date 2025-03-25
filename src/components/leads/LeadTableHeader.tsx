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
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    try {
      onRefresh();
      // Set a timeout to reset the refreshing state in case onRefresh doesn't complete
      setTimeout(() => {
        setIsRefreshing(false);
      }, 5000);
    } catch (error) {
      console.error('Error during refresh:', error);
      setIsRefreshing(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center flex-1 max-w-2xl">
        <div className="relative flex-1">
          <input
            value={globalFilter || ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search leads..."
            className="w-full h-10 pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition duration-150 ease-in-out"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
        <button
          onClick={() => setIsFiltersOpen(true)}
          className="relative inline-flex justify-center items-center h-10 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition duration-150 ease-in-out"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {table.getState().columnFilters.length > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-primary text-white text-xs font-bold rounded-full">
              {table.getState().columnFilters.length}
            </span>
          )}
        </button>
      </div>
      
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={handleRefresh}
          className={`relative inline-flex justify-center items-center h-10 px-4 py-2 rounded-lg text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-150 ${
            isRefreshing 
              ? 'bg-green-600 text-white border-transparent focus:ring-green-500' 
              : 'border border-green-600 text-green-600 bg-white hover:bg-green-50 focus:ring-green-500'
          }`}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </>
          )}
        </button>

        <div className="hidden sm:block w-px h-6 bg-gray-300 mx-2"></div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onExport('csv')}
            className="inline-flex justify-center items-center h-10 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition duration-150 ease-in-out"
          >
            <Download className="w-4 h-4 mr-2" />
            CSV
          </button>
          <button
            onClick={() => onExport('excel')}
            className="inline-flex justify-center items-center h-10 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition duration-150 ease-in-out"
          >
            <Download className="w-4 h-4 mr-2" />
            Excel
          </button>
        </div>

        <div className="hidden sm:block w-px h-6 bg-gray-300 mx-2"></div>

        <button
          onClick={onAddLead}
          className="inline-flex justify-center items-center h-10 px-4 py-2 bg-primary border border-transparent rounded-lg text-sm font-medium text-white hover:bg-primary-hover shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition duration-150 ease-in-out"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Lead
        </button>

        {Object.keys(table.getState().rowSelection).length > 0 && (
          <button
            onClick={onDeleteSelected}
            className="inline-flex justify-center items-center h-10 px-4 py-2 bg-red-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-red-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-150 ease-in-out"
            disabled={isDeletingSelected}
          >
            {isDeletingSelected ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Selected ({Object.keys(table.getState().rowSelection).length})
              </>
            )}
          </button>
        )}
      </div>

      {isFiltersOpen && (
        <LeadFiltersModal
          isOpen={isFiltersOpen}
          onClose={() => setIsFiltersOpen(false)}
          columns={table.getAllColumns()}
          columnFilters={table.getState().columnFilters}
          onFilter={(filters) => table.setColumnFilters(filters)}
        />
      )}
    </div>
  );
}