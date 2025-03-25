import React from 'react';
import { Table } from '@tanstack/react-table';
import { Lead } from '../../types/leads';

interface LeadTablePaginationProps {
  table: Table<Lead>;
}

export function LeadTablePagination({ table }: LeadTablePaginationProps) {
  return (
    <div className="px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-gray-200 bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4 sm:mb-0">
        <select
          value={table.getState().pagination.pageSize}
          onChange={(e) => table.setPageSize(Number(e.target.value))}
          className="h-9 pl-3 pr-8 inline-flex items-center text-sm border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary cursor-pointer hover:bg-gray-50 transition-colors"
        >
          {[10, 25, 50, 100].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize} entries
            </option>
          ))}
        </select>
        <span className="text-sm text-gray-700">
          Page <span className="font-medium">{table.getState().pagination.pageIndex + 1}</span> of{' '}
          <span className="font-medium">{table.getPageCount()}</span>
        </span>
      </div>
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
          className="inline-flex items-center justify-center h-9 px-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 disabled:opacity-50 disabled:hover:bg-white disabled:cursor-not-allowed transition-colors"
        >
          First
        </button>
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="inline-flex items-center justify-center h-9 px-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 disabled:opacity-50 disabled:hover:bg-white disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        <div className="flex items-center gap-1">
          {Array.from(
            { length: Math.min(5, table.getPageCount()) },
            (_, i) => {
              const pageIndex = i;
              const isCurrent = pageIndex === table.getState().pagination.pageIndex;
              
              return (
                <button
                  key={i}
                  onClick={() => table.setPageIndex(pageIndex)}
                  className={`inline-flex items-center justify-center h-9 w-9 text-sm font-medium border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 transition-colors ${
                    isCurrent
                      ? 'bg-primary text-white border-primary hover:bg-primary-hover'
                      : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageIndex + 1}
                </button>
              );
            }
          )}
        </div>
        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="inline-flex items-center justify-center h-9 px-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 disabled:opacity-50 disabled:hover:bg-white disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
        <button
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
          className="inline-flex items-center justify-center h-9 px-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 disabled:opacity-50 disabled:hover:bg-white disabled:cursor-not-allowed transition-colors"
        >
          Last
        </button>
      </div>
    </div>
  );
}