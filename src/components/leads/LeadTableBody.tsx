import React, { useEffect, useState } from 'react';
import { Table, flexRender } from '@tanstack/react-table';
import { Lead } from '../../types/leads';
import { RefreshCw, AlertCircle, AlertTriangle } from 'lucide-react';

interface LeadTableBodyProps {
  table: Table<Lead>;
  loading: boolean;
  onRefresh?: () => void;
}

export function LeadTableBody({ table, loading, onRefresh }: LeadTableBodyProps) {
  const [localLoading, setLocalLoading] = useState(loading);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
  useEffect(() => {
    setLocalLoading(loading);
    
    if (loading) {
      const timer = setTimeout(() => {
        setLoadingTimeout(true);
        setLocalLoading(false);
      }, 10000);
      
      return () => clearTimeout(timer);
    } else {
      setLoadingTimeout(false);
    }
  }, [loading]);
  
  if (localLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white/50 backdrop-blur-sm">
        <RefreshCw className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-sm text-gray-600">Loading leads...</p>
      </div>
    );
  }
  
  if (loadingTimeout) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-amber-50/50">
        <AlertTriangle className="w-8 h-8 text-amber-500 mb-4" />
        <p className="text-amber-700 font-medium">Loading took too long</p>
        <p className="text-sm text-amber-600 mt-1">Please try refreshing the page</p>
        {onRefresh && (
          <button 
            onClick={onRefresh}
            className="mt-4 px-4 py-2 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition duration-150 ease-in-out"
          >
            <RefreshCw className="w-4 h-4 inline mr-2" />
            Refresh Data
          </button>
        )}
      </div>
    );
  }

  if (table.getRowModel().rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-gray-50/50">
        <AlertCircle className="w-8 h-8 text-gray-400 mb-4" />
        <p className="text-gray-600 font-medium">No leads available</p>
        <p className="text-sm text-gray-500 mt-1">Try creating new leads or selecting a different history entry</p>
        {onRefresh && (
          <button 
            onClick={onRefresh}
            className="mt-4 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-150 ease-in-out"
          >
            <RefreshCw className="w-4 h-4 inline mr-2" />
            Refresh Data
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50/80 sticky top-0 z-10">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap bg-white/80 backdrop-blur-sm border-b border-gray-200"
                  style={{ width: header.getSize() }}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className={`group transition-colors ${
                row.getIsSelected() 
                  ? 'bg-primary/5 hover:bg-primary/10' 
                  : 'hover:bg-gray-50/80'
              } cursor-pointer`}
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="px-3 py-2.5 whitespace-nowrap text-sm text-gray-600 border-b border-gray-100 group-hover:text-gray-900 transition-colors"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}