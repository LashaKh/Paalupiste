import React, { useState } from 'react';
import { Eye, Edit, Trash2, MoreHorizontal, ExternalLink, ArrowDown, ArrowUp, Loader2, Check, X, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ColumnDef<T> {
  header: string;
  accessor: keyof T | string;
  cell?: (value: any, item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface EnhancedTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;
  emptyMessage?: string;
  keyField: keyof T;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  onRowClick?: (item: T) => void;
  onDuplicate?: (item: T) => void;
  actionButtons?: (item: T) => React.ReactNode;
  selectedRows?: T[];
  onSelectRow?: (item: T, selected: boolean) => void;
  selectable?: boolean;
  customRowClass?: (item: T) => string;
}

export function EnhancedTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  emptyMessage = 'No data found',
  keyField,
  onEdit,
  onDelete,
  onView,
  onRowClick,
  onDuplicate,
  actionButtons,
  selectedRows = [],
  onSelectRow,
  selectable = false,
  customRowClass,
}: EnhancedTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{ field: string; direction: 'asc' | 'desc' } | null>(null);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  // Sort data based on the current sort configuration
  const sortedData = React.useMemo(() => {
    if (!sortConfig) return data;
    
    return [...data].sort((a, b) => {
      const fieldA = a[sortConfig.field];
      const fieldB = b[sortConfig.field];

      if (fieldA === undefined || fieldB === undefined) return 0;
      
      if (fieldA < fieldB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (fieldA > fieldB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  // Function to toggle sort direction
  const toggleSort = (field: string) => {
    setSortConfig((current) => {
      if (!current || current.field !== field) {
        return { field, direction: 'asc' };
      }
      return { 
        field, 
        direction: current.direction === 'asc' ? 'desc' : 'asc' 
      };
    });
  };

  const isSelected = (item: T) => {
    return selectedRows.some(row => row[keyField] === item[keyField]);
  };

  const handleRowClick = (item: T) => {
    if (onRowClick) {
      onRowClick(item);
    }
  };

  const handleSelectRow = (item: T, event: React.ChangeEvent<HTMLInputElement>) => {
    if (onSelectRow) {
      onSelectRow(item, event.target.checked);
    }
  };

  return (
    <div className="w-full overflow-hidden rounded-lg shadow bg-white">
      <div className="w-full overflow-x-auto">
        <table className="w-full whitespace-nowrap">
          <thead>
            <tr className="text-xs font-semibold tracking-wide text-left text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
              {selectable && (
                <th className="px-4 py-3 w-10">
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="form-checkbox h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                    />
                  </div>
                </th>
              )}
              {columns.map((column, index) => (
                <th 
                  key={index} 
                  className="px-4 py-3"
                  style={{ width: column.width }}
                >
                  {column.sortable ? (
                    <button
                      className="flex items-center space-x-1 group"
                      onClick={() => toggleSort(column.accessor as string)}
                    >
                      <span>{column.header}</span>
                      <span className="transform transition-all duration-200">
                        {sortConfig?.field === column.accessor ? (
                          sortConfig.direction === 'asc' ? (
                            <ArrowUp className="h-3.5 w-3.5 text-primary" />
                          ) : (
                            <ArrowDown className="h-3.5 w-3.5 text-primary" />
                          )
                        ) : (
                          <ArrowDown className="h-3.5 w-3.5 text-gray-400 opacity-0 group-hover:opacity-100" />
                        )}
                      </span>
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td 
                  colSpan={columns.length + (selectable ? 2 : 1)} 
                  className="px-4 py-10 text-center text-gray-500"
                >
                  <div className="flex justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                  <p className="mt-2">Loading data...</p>
                </td>
              </tr>
            ) : sortedData.length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length + (selectable ? 2 : 1)} 
                  className="px-4 py-10 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              sortedData.map((item) => (
                <motion.tr 
                  key={String(item[keyField])}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`
                    text-gray-700 hover:bg-gray-50 transition-colors 
                    ${isSelected(item) ? 'bg-primary/5' : ''}
                    ${onRowClick ? 'cursor-pointer' : ''}
                    ${customRowClass ? customRowClass(item) : ''}
                  `}
                  onClick={onRowClick ? () => handleRowClick(item) : undefined}
                >
                  {selectable && (
                    <td 
                      className="px-4 py-3 w-10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          className="form-checkbox h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                          checked={isSelected(item)}
                          onChange={(e) => handleSelectRow(item, e)}
                        />
                      </div>
                    </td>
                  )}
                  
                  {columns.map((column, index) => {
                    const value = typeof column.accessor === 'string' && column.accessor.includes('.') 
                      ? column.accessor.split('.').reduce((obj: any, key: string) => obj?.[key], item)
                      : item[column.accessor as keyof T];
                    
                    return (
                      <td key={index} className="px-4 py-3">
                        {column.cell ? column.cell(value, item) : String(value || '')}
                      </td>
                    );
                  })}
                  
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end items-center space-x-2 relative">
                      {actionButtons ? (
                        actionButtons(item)
                      ) : (
                        <>
                          {onView && (
                            <button 
                              title="View"
                              onClick={(e) => {
                                e.stopPropagation();
                                onView(item);
                              }}
                              className="p-1 rounded-md text-gray-400 hover:text-primary hover:bg-primary/10"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          
                          {onEdit && (
                            <button 
                              title="Edit"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(item);
                              }}
                              className="p-1 rounded-md text-gray-400 hover:text-primary hover:bg-primary/10"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          
                          {onDuplicate && (
                            <button 
                              title="Duplicate"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDuplicate(item);
                              }}
                              className="p-1 rounded-md text-gray-400 hover:text-primary hover:bg-primary/10"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          )}
                          
                          {onDelete && (
                            <button 
                              title="Delete"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(item);
                              }}
                              className="p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          
                          <div className="relative">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setActionMenuOpen(actionMenuOpen === String(item[keyField]) ? null : String(item[keyField]));
                              }}
                              className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                            
                            <AnimatePresence>
                              {actionMenuOpen === String(item[keyField]) && (
                                <motion.div 
                                  initial={{ opacity: 0, y: -5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -5 }}
                                  transition={{ duration: 0.15 }}
                                  className="absolute right-0 z-10 mt-1 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                                >
                                  <div className="py-1">
                                    {onView && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onView(item);
                                          setActionMenuOpen(null);
                                        }}
                                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                      >
                                        <Eye className="w-4 h-4 mr-2" />
                                        View Details
                                      </button>
                                    )}
                                    
                                    {onEdit && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onEdit(item);
                                          setActionMenuOpen(null);
                                        }}
                                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                      >
                                        <Edit className="w-4 h-4 mr-2" />
                                        Edit
                                      </button>
                                    )}
                                    
                                    {onDuplicate && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onDuplicate(item);
                                          setActionMenuOpen(null);
                                        }}
                                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                      >
                                        <Copy className="w-4 h-4 mr-2" />
                                        Duplicate
                                      </button>
                                    )}
                                    
                                    <a
                                      href="#"
                                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        navigator.clipboard.writeText(String(item[keyField]));
                                        setActionMenuOpen(null);
                                      }}
                                    >
                                      <ExternalLink className="w-4 h-4 mr-2" />
                                      Copy Link
                                    </a>
                                    
                                    {onDelete && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onDelete(item);
                                          setActionMenuOpen(null);
                                        }}
                                        className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                      >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete
                                      </button>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 