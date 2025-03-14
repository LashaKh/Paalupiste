import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Column } from '@tanstack/react-table';
import { Lead } from '../../types/leads';

interface LeadFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  columns: Column<Lead, unknown>[];
  columnFilters: { id: string; value: any }[];
  onFilter: (filters: { id: string; value: any }[]) => void;
}

export function LeadFiltersModal({
  isOpen,
  onClose,
  columns,
  columnFilters,
  onFilter,
}: LeadFiltersModalProps) {
  const [filters, setFilters] = useState(columnFilters);

  const handleFilterChange = (columnId: string, value: string) => {
    setFilters(prev => {
      const existing = prev.find(f => f.id === columnId);
      if (existing) {
        return prev.map(f => f.id === columnId ? { ...f, value } : f);
      }
      return [...prev, { id: columnId, value }];
    });
  };

  const handleApplyFilters = () => {
    onFilter(filters.filter(f => f.value));
    onClose();
  };

  const clearFilters = () => {
    setFilters([]);
    onFilter([]);
    onClose();
  };

  if (!isOpen) return null;

  const filterableColumns = columns.filter(
    column => column.id !== 'select' && column.id !== 'actions'
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="filters-modal" role="dialog">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        
        <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Filter Leads</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {filterableColumns.map(column => (
                <div key={column.id} className="grid grid-cols-2 gap-4 items-center">
                  <label className="text-sm font-medium text-gray-700">
                    {column.id === 'companyName' ? 'Company Name' :
                     column.id === 'decisionMakerName' ? 'Decision Maker' :
                     column.id.charAt(0).toUpperCase() + column.id.slice(1)}
                  </label>
                  {column.id === 'status' ? (
                    <select
                      value={filters.find(f => f.id === column.id)?.value || ''}
                      onChange={(e) => handleFilterChange(column.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    >
                      <option value="">All</option>
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="qualified">Qualified</option>
                      <option value="converted">Converted</option>
                      <option value="lost">Lost</option>
                    </select>
                  ) : column.id === 'priority' ? (
                    <select
                      value={filters.find(f => f.id === column.id)?.value || ''}
                      onChange={(e) => handleFilterChange(column.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    >
                      <option value="">All</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={filters.find(f => f.id === column.id)?.value || ''}
                      onChange={(e) => handleFilterChange(column.id, e.target.value)}
                      placeholder={`Filter by ${column.id}`}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Clear Filters
              </button>
              <button
                onClick={handleApplyFilters}
                className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}