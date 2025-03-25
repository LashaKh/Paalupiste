import { createColumnHelper, ColumnDef, Table, Row } from '@tanstack/react-table';
import { ArrowUpDown, Edit, Eye, Trash2, UserCheck, FileText, Building, Globe, FileText as Description, User } from 'lucide-react';
import { Lead } from '../../types/leads';
import { useState } from 'react';
import { LeadNotesModal } from './LeadNotesModal';

interface EditingCell {
  id: string;
  field: keyof Lead;
  value: string;
}

interface GetColumnsProps {
  editingCell: EditingCell | null;
  setEditingCell: (cell: EditingCell | null) => void;
  handleSaveEdit: (id: string, field: keyof Lead, value: string) => void;
  handleEditClick: (lead: Lead) => void;
  handleView: (lead: Lead) => void;
  handleDelete: (lead: Lead) => void;
  handleConvert: (lead: Lead) => void;
}

const columnHelper = createColumnHelper<Lead>();

export function getColumns({
  editingCell,
  setEditingCell,
  handleSaveEdit,
  handleEditClick,
  handleView,
  handleDelete,
  handleConvert,
}: GetColumnsProps): ColumnDef<Lead, any>[] {
  // Debug logging
  console.log('getColumns called with:', {
    editingCell,
    hasSetEditingCell: !!setEditingCell,
    hasHandleSaveEdit: !!handleSaveEdit,
    hasHandleEditClick: !!handleEditClick,
    hasHandleView: !!handleView,
    hasHandleDelete: !!handleDelete,
    hasHandleConvert: !!handleConvert
  });

  const columns = [
    {
      id: 'select',
      header: ({ table }: { table: Table<Lead> }) => (
        <div className="px-1">
          <input
            type="checkbox"
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
          />
        </div>
      ),
      cell: ({ row }: { row: Row<Lead> }) => (
        <div className="px-1">
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onChange={row.getToggleSelectedHandler()}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
          />
        </div>
      ),
      enableSorting: false,
      size: 40,
    },
    columnHelper.accessor('companyName', {
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <Building className="w-4 h-4" />
          Company Name
          {column.getCanSort() && (
            <ArrowUpDown className="w-4 h-4 cursor-pointer" />
          )}
        </div>
      ),
      cell: (info) => (
        editingCell?.id === info.row.original.id && editingCell?.field === 'companyName' ? (
          <input
            type="text"
            value={editingCell.value}
            onChange={(e) => setEditingCell({ ...editingCell, value: e.target.value })}
            onBlur={() => handleSaveEdit(info.row.original.id, 'companyName', editingCell.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSaveEdit(info.row.original.id, 'companyName', editingCell.value);
              } else if (e.key === 'Escape') {
                setEditingCell(null);
              }
            }}
            className="w-full px-2 py-1 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            autoFocus
          />
        ) : (
          <div
            className="font-medium cursor-pointer hover:text-primary"
            onClick={() => setEditingCell({
              id: info.row.original.id,
              field: 'companyName',
              value: info.getValue()
            })}
          >
            {info.getValue()}
          </div>
        )
      ),
      enableSorting: true,
    }),
    columnHelper.accessor('website', {
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4" />
          Website
        </div>
      ),
      cell: (info) => {
        const websiteValue = info.getValue();
        console.log('Website cell value:', websiteValue, typeof websiteValue);
        
        // Helper function to format website URL
        const formatWebsiteUrl = (url: string) => {
          if (!url || typeof url !== 'string' || url.trim() === '') {
            return null;
          }
          return url.startsWith('http') ? url : `https://${url}`;
        };
        
        return editingCell?.id === info.row.original.id && editingCell?.field === 'website' ? (
          <input
            type="url"
            value={editingCell.value}
            onChange={(e) => setEditingCell({ ...editingCell, value: e.target.value })}
            onBlur={() => handleSaveEdit(info.row.original.id, 'website', editingCell.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSaveEdit(info.row.original.id, 'website', editingCell.value);
              } else if (e.key === 'Escape') {
                setEditingCell(null);
              }
            }}
            className="w-full px-2 py-1 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            autoFocus
          />
        ) : (
          <a
            href={formatWebsiteUrl(websiteValue as string) || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
            onClick={(e) => {
              if (!formatWebsiteUrl(websiteValue as string)) {
                e.preventDefault();
                setEditingCell({
                  id: info.row.original.id,
                  field: 'website',
                  value: websiteValue || ''
                });
              }
            }}
          >
            {websiteValue && typeof websiteValue === 'string' && websiteValue.trim() !== '' ? websiteValue : '-'}
          </a>
        );
      },
    }),
    columnHelper.accessor('company_description', {
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <Description className="w-4 h-4" />
          Company Description
        </div>
      ),
      cell: (info) => {
        // Get description directly from company_description field only
        const description = info.getValue();
        console.log('DEBUG - Description cell access path:', 'company_description');
        console.log('DEBUG - Description getValue():', description);
        console.log('DEBUG - Description from row.original:', info.row.original.company_description);
        console.log('DEBUG - Row original keys:', Object.keys(info.row.original));
        
        return editingCell?.id === info.row.original.id && editingCell?.field === 'company_description' ? (
          <textarea
            value={editingCell.value}
            onChange={(e) => setEditingCell({ ...editingCell, value: e.target.value })}
            onBlur={() => handleSaveEdit(info.row.original.id, 'company_description', editingCell.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                handleSaveEdit(info.row.original.id, 'company_description', editingCell.value);
              } else if (e.key === 'Escape') {
                setEditingCell(null);
              }
            }}
            className="w-full px-2 py-1 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            autoFocus
            rows={3}
          />
        ) : (
          <div
            className="cursor-pointer hover:text-primary max-w-xs truncate"
            title={description ? String(description) : ''}
            onClick={() => setEditingCell({
              id: info.row.original.id,
              field: 'company_description',
              value: description ? String(description) : ''
            })}
          >
            {description && typeof description === 'string' && description.trim() !== '' 
              ? description.length > 50 
                ? description.substring(0, 50) + '...' 
                : description 
              : '-'}
          </div>
        );
      },
    }),
    columnHelper.accessor('decisionMakerName', {
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <User className="w-4 h-4" />
          Decision Maker
        </div>
      ),
      cell: (info) => (
        editingCell?.id === info.row.original.id && editingCell?.field === 'decisionMakerName' ? (
          <input
            type="text"
            value={editingCell.value}
            onChange={(e) => setEditingCell({ ...editingCell, value: e.target.value })}
            onBlur={() => handleSaveEdit(info.row.original.id, 'decisionMakerName', editingCell.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSaveEdit(info.row.original.id, 'decisionMakerName', editingCell.value);
              } else if (e.key === 'Escape') {
                setEditingCell(null);
              }
            }}
            className="w-full px-2 py-1 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            autoFocus
          />
        ) : (
          <div
            className="cursor-pointer hover:text-primary"
            onClick={() => setEditingCell({
              id: info.row.original.id,
              field: 'decisionMakerName',
              value: info.getValue() || ''
            })}
          >
            {info.getValue() || '-'}
          </div>
        )
      ),
    }),
    columnHelper.accessor('decisionMakerTitle', {
      header: 'Title',
      cell: (info) => (
        editingCell?.id === info.row.original.id && editingCell?.field === 'decisionMakerTitle' ? (
          <input
            type="text"
            value={editingCell.value}
            onChange={(e) => setEditingCell({ ...editingCell, value: e.target.value })}
            onBlur={() => handleSaveEdit(info.row.original.id, 'decisionMakerTitle', editingCell.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSaveEdit(info.row.original.id, 'decisionMakerTitle', editingCell.value);
              } else if (e.key === 'Escape') {
                setEditingCell(null);
              }
            }}
            className="w-full px-2 py-1 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            autoFocus
          />
        ) : (
          <div
            className="cursor-pointer hover:text-primary"
            onClick={() => setEditingCell({
              id: info.row.original.id,
              field: 'decisionMakerTitle',
              value: info.getValue() || ''
            })}
          >
            {info.getValue() || '-'}
          </div>
        )
      ),
    }),
    columnHelper.accessor('decisionMakerEmail', {
      header: 'Email',
      cell: (info) => (
        editingCell?.id === info.row.original.id && editingCell?.field === 'decisionMakerEmail' ? (
          <input
            type="email"
            value={editingCell.value}
            onChange={(e) => setEditingCell({ ...editingCell, value: e.target.value })}
            onBlur={() => handleSaveEdit(info.row.original.id, 'decisionMakerEmail', editingCell.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSaveEdit(info.row.original.id, 'decisionMakerEmail', editingCell.value);
              } else if (e.key === 'Escape') {
                setEditingCell(null);
              }
            }}
            className="w-full px-2 py-1 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            autoFocus
          />
        ) : (
          <a
            href={`mailto:${info.getValue()}`}
            className="text-primary hover:underline"
            onClick={(e) => {
              if (!info.getValue()) {
                e.preventDefault();
                setEditingCell({
                  id: info.row.original.id,
                  field: 'decisionMakerEmail',
                  value: info.getValue() || ''
                });
              }
            }}
          >
            {info.getValue() || '-'}
          </a>
        )
      ),
    }),
    columnHelper.accessor('decisionMakerLinkedIn', {
      header: 'LinkedIn',
      cell: (info) => (
        editingCell?.id === info.row.original.id && editingCell?.field === 'decisionMakerLinkedIn' ? (
          <input
            type="url"
            value={editingCell.value}
            onChange={(e) => setEditingCell({ ...editingCell, value: e.target.value })}
            onBlur={() => handleSaveEdit(info.row.original.id, 'decisionMakerLinkedIn', editingCell.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSaveEdit(info.row.original.id, 'decisionMakerLinkedIn', editingCell.value);
              } else if (e.key === 'Escape') {
                setEditingCell(null);
              }
            }}
            className="w-full px-2 py-1 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            autoFocus
          />
        ) : (
          <a
            href={info.getValue()}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
            onClick={(e) => {
              if (!info.getValue()) {
                e.preventDefault();
                setEditingCell({
                  id: info.row.original.id,
                  field: 'decisionMakerLinkedIn',
                  value: info.getValue() || ''
                });
              }
            }}
          >
            {info.getValue() ? 'View Profile' : '-'}
          </a>
        )
      ),
    }),
    columnHelper.accessor('lastContactDate', {
      header: 'Last Contact',
      cell: (info) => (
        editingCell?.id === info.row.original.id && editingCell?.field === 'lastContactDate' ? (
          <input
            type="date"
            value={editingCell.value.split('T')[0]}
            onChange={(e) => setEditingCell({ ...editingCell, value: new Date(e.target.value).toISOString() })}
            onBlur={() => handleSaveEdit(info.row.original.id, 'lastContactDate', editingCell.value)}
            className="w-full px-2 py-1 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            autoFocus
          />
        ) : (
          <div
            className="cursor-pointer hover:text-primary"
            onClick={() => setEditingCell({
              id: info.row.original.id,
              field: 'lastContactDate',
              value: info.getValue() || new Date().toISOString()
            })}
          >
            {info.getValue() ? new Date(info.getValue()).toLocaleDateString() : '-'}
          </div>
        )
      ),
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => (
        editingCell?.id === info.row.original.id && editingCell?.field === 'status' ? (
          <select
            value={editingCell.value}
            onChange={(e) => {
              handleSaveEdit(info.row.original.id, 'status', e.target.value);
            }}
            className="w-full px-2 py-1 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            autoFocus
          >
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="converted">Converted</option>
            <option value="lost">Lost</option>
          </select>
        ) : (
          <span
            onClick={() => setEditingCell({
              id: info.row.original.id,
              field: 'status',
              value: info.getValue()
            })}
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize cursor-pointer
              ${
                info.getValue() === 'new'
                  ? 'bg-blue-100 text-blue-800'
                  : info.getValue() === 'contacted'
                  ? 'bg-yellow-100 text-yellow-800'
                  : info.getValue() === 'qualified'
                  ? 'bg-green-100 text-green-800'
                  : info.getValue() === 'converted'
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-red-100 text-red-800'
              }
            `}>
            {info.getValue()}
          </span>
        )
      ),
    }),
    columnHelper.accessor('priority', {
      header: 'Priority',
      cell: (info) => (
        editingCell?.id === info.row.original.id && editingCell?.field === 'priority' ? (
          <select
            value={editingCell.value}
            onChange={(e) => {
              handleSaveEdit(info.row.original.id, 'priority', e.target.value);
            }}
            className="w-full px-2 py-1 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            autoFocus
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        ) : (
          <span
            onClick={() => setEditingCell({
              id: info.row.original.id,
              field: 'priority',
              value: info.getValue()
            })}
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize cursor-pointer
              ${
                info.getValue() === 'high'
                  ? 'bg-red-100 text-red-800'
                  : info.getValue() === 'medium'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-green-100 text-green-800'
              }
            `}>
            {info.getValue()}
          </span>
        )
      ),
    }),
    columnHelper.accessor('notes', {
      header: 'Notes',
      cell: (info) => {
        const [isModalOpen, setIsModalOpen] = useState(false);

        const handleSaveNotes = async (id: string, notes: string) => {
          await handleSaveEdit(id, 'notes', notes);
        };

        return (
          <>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center text-left text-sm text-gray-600 hover:text-primary"
            >
              <FileText className="w-4 h-4 mr-1.5" />
              {info.getValue() ? 'View Notes' : 'Add Notes'}
            </button>

            {isModalOpen && (
              <LeadNotesModal
                leadId={info.row.original.id}
                initialNotes={info.getValue() || ''}
                onSave={handleSaveNotes}
                onClose={() => setIsModalOpen(false)}
              />
            )}
          </>
        );
      },
      size: 200,
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: (info) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEditClick(info.row.original)}
            className="p-1 hover:bg-gray-100 rounded-lg"
            title="Edit"
          >
            <Edit className="w-4 h-4 text-gray-500" />
          </button>
          <button
            onClick={() => handleView(info.row.original)}
            className="p-1 hover:bg-gray-100 rounded-lg"
            title="View"
          >
            <Eye className="w-4 h-4 text-gray-500" />
          </button>
          <button
            onClick={() => handleDelete(info.row.original)}
            className="p-1 hover:bg-gray-100 rounded-lg"
            title="Delete"
          >
            <Trash2 className="w-4 h-4 text-gray-500" />
          </button>
          <button
            onClick={() => handleConvert(info.row.original)}
            className="p-1 hover:bg-gray-100 rounded-lg"
            title="Convert"
          >
            <UserCheck className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      ),
    }),
  ];

  console.log('getColumns returning columns:', columns);
  return columns;
}