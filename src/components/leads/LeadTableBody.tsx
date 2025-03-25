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
  
  // Handle loading state with timeout to prevent infinite loading
  useEffect(() => {
    setLocalLoading(loading);
    
    // If loading is true, set a timeout to force it to false after 10 seconds
    // This prevents infinite loading states
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

  // Debug logging
  console.log('LeadTableBody render:', {
    loading,
    localLoading,
    loadingTimeout,
    dataLength: table.options.data.length,
    rowsLength: table.getRowModel().rows.length,
    data: table.options.data,
    rows: table.getRowModel().rows
  });
  
  // Log table data for debugging
  console.log('LeadTableBody data length:', table.options.data.length);
  
  // Check if any rows have company_description
  const hasCompanyDescriptions = Array.isArray(table.options.data) &&
    table.options.data.some((row) => 
      (row as any).company_description
    );
  console.log('Has company descriptions:', hasCompanyDescriptions);
  
  if (table.options.data.length > 0) {
    const firstRow = table.options.data[0] as any;
    console.log('DEBUG - Full sample row data:', JSON.stringify(firstRow, null, 2));
    console.log('Sample row data keys:', Object.keys(firstRow));
    console.log('Sample company_description value:', firstRow.company_description);
  }
  
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

  // Check if there's no data or rows
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