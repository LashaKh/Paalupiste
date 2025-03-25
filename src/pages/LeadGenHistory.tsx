import React, { useState, useMemo, useEffect } from 'react';
import { 
  useReactTable, 
  getCoreRowModel, 
  getSortedRowModel, 
  getFilteredRowModel, 
  getPaginationRowModel,
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  HeaderContext,
  CellContext
} from '@tanstack/react-table';
import * as XLSX from 'xlsx';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Building, 
  Briefcase, 
  FileText, 
  CheckCircle,
  File, 
  MoreHorizontal, 
  ChevronDown, 
  ChevronsUpDown, 
  Download, 
  CloudOff, 
  Search,
  X,
  Loader2,
  Eye,
  PenLine,
  BarChart,
  User,
  FileDown,
  Settings,
  Trash2,
  DownloadCloud,
  FileUp,
  CheckCircle as CheckCircleIcon,
  Users as UsersIcon,
  Link,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  Package,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import { useGenerationHistory } from '../contexts/GenerationHistoryContext';
import { enrichLeads, enrichCompanyDetails } from '../lib/api';
import Modal from '../components/ui/Modal';
import { useLeadImports } from '../hooks/useLeadImports';
import { useNavigate } from 'react-router-dom';
import { LeadGenerationService } from '../lib/LeadGenerationService';

// Define types
interface GenerationEntry {
  id: string;
  location: string | {
    country: string;
    state?: string;
  };
  industries: string[];
  companySize: string;
  additionalIndustries?: string;
  timestamp: string;
  status: 'success' | 'error';
  sheetLink?: string;
  sheetId?: string;
  errorMessage?: string;
  productName: string;
  productDescription: string;
  leadCount?: number;
  convertedLeads?: number;
}

interface StatCard {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description: string;
  percentChange?: number;
  color: string;
}

// Helper function to format location
const formatLocation = (location: string | { country: string; state?: string }): string => {
  if (typeof location === 'object') {
    return `${location.country}${location.state ? `, ${location.state}` : ''}`;
  }
  
  if (typeof location === 'string' && (location.startsWith('{') || location.startsWith('{"'))) {
    try {
      const parsed = JSON.parse(location);
      if (parsed && typeof parsed === 'object' && 'country' in parsed) {
        return `${parsed.country}${parsed.state ? `, ${parsed.state}` : ''}`;
      }
    } catch (e) {
      return String(location);
    }
  }
  
  return String(location);
};

// Status badge component
const StatusBadge = ({ status }: { status: 'success' | 'error' }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
    status === 'success' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800'
  }`}>
    {status === 'success' ? (
      <CheckCircle className="w-3 h-3 mr-1" />
    ) : (
      <X className="w-3 h-3 mr-1" />
    )}
    {status === 'success' ? 'Success' : 'Error'}
  </span>
);

// Stat card component
const StatCard = ({ title, value, icon: Icon, description, percentChange, color }: StatCard) => (
  <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
    <div className="flex items-center">
      <div className={`p-3 rounded-md ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="ml-5">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className="flex items-end">
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {percentChange !== undefined && (
            <span className={`ml-2 text-sm font-medium ${percentChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {percentChange >= 0 ? '+' : ''}{percentChange}%
            </span>
          )}
        </div>
      </div>
    </div>
    <p className="mt-2 text-sm text-gray-500">{description}</p>
  </div>
);

// Filter dropdown component
const FilterDropdown = ({ 
  label, 
  options, 
  value, 
  onChange 
}: { 
  label: string; 
  options: {value: string; label: string}[]; 
  value: string; 
  onChange: (value: string) => void 
}) => (
  <div className="relative">
    <button
      className="flex items-center space-x-1 px-3 py-2 bg-white rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
      onClick={(e) => {
        e.currentTarget.nextElementSibling?.classList.toggle('hidden');
      }}
    >
      <span>{label}</span>
      <ChevronDown className="w-4 h-4" />
    </button>
    <div className="hidden absolute z-10 mt-1 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
      <div className="py-1" role="menu" aria-orientation="vertical">
        {options.map((option) => (
          <button
            key={option.value}
            className={`block px-4 py-2 text-sm w-full text-left ${
              value === option.value ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => {
              onChange(option.value);
              (document.activeElement as HTMLElement)?.blur();
            }}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  </div>
);

// Helper function to extract sheet ID from a Google Sheets URL
function extractSheetId(url: string): string | null {
  if (!url) return null;
  
  try {
    const match = url.match(/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return match[1];
    }
    
    const fallbackMatch = url.match(/([a-zA-Z0-9_-]{25,})/);
    if (fallbackMatch && fallbackMatch[1]) {
      return fallbackMatch[1];
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

export default function LeadGenHistory() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { history = [], deleteGeneration, addGeneration, ensureHistoryEntries, loading: contextLoading, refreshGenerations } = useGenerationHistory();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<GenerationEntry[]>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState('all');
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [stats, setStats] = useState({
    totalGenerations: 0,
    totalLeads: 0,
    successRate: 0,
    averageLeadsPerGeneration: 0
  });
  const [activeTab, setActiveTab] = useState<'analytics' | 'history'>('history');
  const [showEnrichModal, setShowEnrichModal] = useState<'contacts' | 'company' | null>(null);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [isEnriching, setIsEnriching] = useState<'contacts' | 'company' | null>(null);
  const [importedEntries, setImportedEntries] = useState<Set<string>>(new Set());
  const { createImport, importLeadsToImport } = useLeadImports();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!user) return;
    
    const loadData = async () => {
      try {
        await ensureHistoryEntries();
        const processedHistory = history
          .filter(entry => entry.productName && (entry.status === 'success' || entry.status === 'error' || entry.status === 'completed'))
          .map(entry => ({
            id: entry.id,
            location: entry.location,
            industries: entry.industries || [],
            companySize: entry.companySize,
            additionalIndustries: entry.additionalIndustries,
            timestamp: entry.timestamp,
            status: entry.status === 'completed' ? 'success' : entry.status as 'success' | 'error',
            sheetLink: entry.sheetLink,
            sheetId: entry.sheetId,
            errorMessage: entry.errorMessage,
            productName: entry.productName || '',
            productDescription: entry.productDescription || '',
            leadCount: entry.leadsCount || 0,
            convertedLeads: entry.results?.convertedLeads || 0 // Get converted leads from results if available
          }));
        setData(processedHistory);
      } catch (error) {
        showToast('Failed to load history data', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, history, ensureHistoryEntries, showToast]);
  
  // Filter data based on status and date range
  const filteredData = useMemo(() => {
    let filtered = [...data];
    
    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(entry => entry.status === statusFilter);
    }
    
    // Filter by date range
    const now = new Date();
    if (dateRangeFilter === 'last7days') {
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(entry => new Date(entry.timestamp) >= lastWeek);
    } else if (dateRangeFilter === 'last30days') {
      const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(entry => new Date(entry.timestamp) >= lastMonth);
    } else if (dateRangeFilter === 'last90days') {
      const lastQuarter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(entry => new Date(entry.timestamp) >= lastQuarter);
    }
    
    return filtered;
  }, [data, statusFilter, dateRangeFilter]);
  
  // Calculate stats when filteredData changes
  useEffect(() => {
    const successfulGenerations = filteredData.filter(entry => entry.status === 'success');
    const totalLeads = filteredData.reduce((sum, entry) => sum + (entry.leadCount || 0), 0);
    
    setStats({
      totalGenerations: filteredData.length,
      totalLeads,
      successRate: filteredData.length > 0 ? (successfulGenerations.length / filteredData.length) * 100 : 0,
      averageLeadsPerGeneration: successfulGenerations.length > 0 ? totalLeads / successfulGenerations.length : 0
    });
  }, [filteredData]);
  
  // Handle export
  const handleExport = () => {
    try {
      const exportData = filteredData.map(entry => ({
        Date: new Date(entry.timestamp).toLocaleDateString(),
        Location: formatLocation(entry.location),
        Industries: entry.industries.join(', '),
        CompanySize: entry.companySize,
        Status: entry.status,
        TotalLeads: entry.leadCount || 0,
        ConvertedLeads: entry.convertedLeads || 0,
        ProductName: entry.productName,
        ConversionRate: entry.leadCount 
          ? `${((entry.convertedLeads || 0) / entry.leadCount * 100).toFixed(1)}%` 
          : '0%'
      }));
      
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'LeadGenHistory');
      XLSX.writeFile(workbook, `Lead_Generation_History_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      showToast('Export completed successfully', 'success');
    } catch (error) {
      console.error('Export error:', error);
      showToast('Failed to export data', 'error');
    }
  };
  
  // Table columns
  const columns = useMemo<ColumnDef<GenerationEntry>[]>(
    () => [
      {
        accessorKey: 'timestamp',
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center"
          >
            Date
            <ChevronsUpDown className="ml-2 h-4 w-4" />
          </button>
        ),
        cell: ({ row }) => (
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>{format(new Date(row.original.timestamp), 'MMM d, yyyy')}</span>
          </div>
        ),
      },
      {
        accessorKey: 'location',
        header: 'Location',
        cell: ({ row }) => {
          const formattedLocation = formatLocation(row.original.location);
          return (
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span title={formattedLocation}>{formattedLocation}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'industries',
        header: 'Industries',
        cell: ({ row }) => (
          <div className="max-w-[200px] truncate">
            <div className="flex items-center space-x-2">
              <Building className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <span title={row.original.industries.join(', ')}>
                {row.original.industries.join(', ')}
              </span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'leadCount',
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center"
          >
            Leads
            <ChevronsUpDown className="ml-2 h-4 w-4" />
          </button>
        ),
        cell: ({ row }) => (
          <div className="text-center font-medium">
            {row.original.leadCount || 0}
          </div>
        ),
      },
      {
        accessorKey: 'convertedLeads',
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center"
          >
            Converted
            <ChevronsUpDown className="ml-2 h-4 w-4" />
          </button>
        ),
        cell: ({ row }) => (
          <div className="text-center font-medium">
            {row.original.convertedLeads || 0}
          </div>
        ),
      },
      {
        id: 'conversionRate',
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center"
          >
            Conversion
            <ChevronsUpDown className="ml-2 h-4 w-4" />
          </button>
        ),
        cell: ({ row }) => {
          const rate = row.original.leadCount 
            ? ((row.original.convertedLeads || 0) / row.original.leadCount * 100).toFixed(1)
            : 0;
          return (
            <div className={`text-center font-medium ${
              parseFloat(rate as string) > 15 ? 'text-green-600' : 
              parseFloat(rate as string) > 5 ? 'text-amber-600' : 'text-gray-600'
            }`}>
              {rate}%
            </div>
          );
        },
        accessorFn: (row) => {
          return row.leadCount ? ((row.convertedLeads || 0) / row.leadCount * 100) : 0;
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'sheetLink',
        header: 'Google Sheet',
        cell: ({ row }) => (
          <div className="flex justify-center">
            {row.original.sheetLink ? (
              <a
                href={row.original.sheetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 flex items-center"
              >
                <span className="mr-1.5">View Sheet</span>
                <Link className="h-3.5 w-3.5" />
              </a>
            ) : (
              <span className="text-gray-400 text-sm">No link available</span>
            )}
          </div>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.open(`/app/leads/table?historyId=${row.original.id}`, '_blank');
              }}
              className="p-1 rounded-full hover:bg-gray-100"
              title="View Leads"
            >
              <Eye className="h-4 w-4 text-gray-500" />
            </button>
            
            {/* Show different button based on import status */}
            {importedEntries.has(row.original.id) ? (
              <span
                className="p-1 rounded-full"
                title="Leads already imported"
              >
                <CheckCircleIcon className="h-4 w-4 text-green-500" />
              </span>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedEntryId(row.original.id);
                  setShowImportModal(true);
                }}
                className="p-1 rounded-full hover:bg-gray-100"
                title="Import Leads"
              >
                <FileUp className="h-4 w-4 text-gray-500" />
              </button>
            )}
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteConfirm(row.original.id);
              }}
              className="p-1 rounded-full hover:bg-gray-100 hover:text-red-500"
              title="Delete Entry"
            >
              <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
            </button>
          </div>
        ),
      },
    ],
    []
  );
  
  // Initialize table
  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    onColumnVisibilityChange: setColumnVisibility,
  });
  
  // Generate data for selected entry details
  const selectedEntry = selectedEntryId 
    ? data.find(entry => entry.id === selectedEntryId) 
    : null;
  
  // Import leads from webhook
  const importLeads = async () => {
    if (!selectedEntry || !user) return;
    
    setIsImporting(true);
    let leadsData: any[] = [];
    
    try {
      const sheetId = selectedEntry.sheetId;
      if (!sheetId) {
        throw new Error('No sheet ID found for this entry');
      }

      // Get the webhook response
      const response = await fetch(`https://hook.eu2.make.com/neljqr5sqfmzh0cfagnkzdl8a9nmtr3b?sheetId=${sheetId}`);
      const result = await response.text(); // Get response as text instead of JSON
      
      console.log('Raw webhook response:', result);
      
      try {
        // Clean up the response by removing empty arrays and trailing commas
        const cleanedResult = result
          .split('\n')
          .filter(line => line.trim() !== '["","","","","","",""]' && line.trim() !== '')
          .join('\n');
        
        // Parse the cleaned result as JSON
        leadsData = JSON.parse(`[${cleanedResult}]`);
        
        console.log('Parsed leads data:', leadsData);
      } catch (parseError: unknown) {
        console.error('JSON Parse Error:', parseError);
        throw new Error('Failed to parse API response');
      }
      
      // Filter out any remaining empty or invalid entries
      leadsData = leadsData.filter(lead => 
        Array.isArray(lead) && 
        lead.some(field => field !== '') && 
        lead.length === 7
      );
      
      if (leadsData.length === 0) {
        throw new Error('No valid leads found in the response');
      }

      // Create a new import record
      const newImport = await createImport({
        name: `${selectedEntry.productName} - ${format(new Date(selectedEntry.timestamp), 'PP')}`,
        source: 'Lead Generation',
        sourceDetails: {
          sheetId,
          productName: selectedEntry.productName,
          location: selectedEntry.location,
          industries: selectedEntry.industries
        },
        notes: `Imported from lead generation for ${selectedEntry.productName} in ${formatLocation(selectedEntry.location)}`,
        tags: ['automated', ...selectedEntry.industries],
        historyId: selectedEntry.id
      });
      
      if (!newImport) {
        throw new Error('Failed to create import record');
      }

      // Format the leads data to match the database schema
      const formattedLeads = leadsData.map(lead => ({
        companyName: lead[0] || '',
        website: lead[1] || '',
        company_description: lead[2] || '',
        decisionMakerName: lead[3] || '',
        decisionMakerTitle: lead[4] || '',
        decisionMakerEmail: lead[5] || '',
        decisionMakerLinkedIn: lead[6] || '',
        status: 'new' as const,
        priority: 'medium' as const,
        lastContactDate: new Date().toISOString(),
        notes: `Imported from "${selectedEntry.productName}" lead generation`,
        import_id: newImport.id,
        history_id: selectedEntry.id,
        user_id: user.id
      }));
      
      // Import leads using the new function with formatted data
      const importSuccess = await importLeadsToImport(newImport.id, formattedLeads);
      
      if (!importSuccess) {
        throw new Error('Failed to import leads');
      }

      // Update UI state
      setImportedEntries(prev => new Set([...prev, selectedEntry.id]));
      setShowImportModal(false);
      showToast('Leads imported successfully', 'success');

      // Navigate to the leads table
      navigate('/app/leads/table');
    } catch (error) {
      console.error('Error importing leads:', error);
      showToast('Failed to import leads: ' + (error instanceof Error ? error.message : 'Unknown error'), 'error');
    } finally {
      setIsImporting(false);
    }
  };
  
  // Delete entry function
  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(true);
      await deleteGeneration(id);
      
      showToast('Generation history deleted successfully', 'success');
      setShowDeleteConfirm(null);
      
      // If the deleted entry was selected, clear the selection
      if (selectedEntryId === id) {
        setSelectedEntryId(null);
      }
      
      // Refresh the data
      await refreshGenerations();
    } catch (error) {
      console.error('Error deleting generation history:', error);
      showToast('Failed to delete generation history', 'error');
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Enrich leads with additional data
  const enrichData = async (type: 'contacts' | 'company') => {
    if (!selectedEntry || !user) {
      showToast('No entry selected or user not logged in', 'error');
      return;
    }
    
    if (!selectedEntry.sheetId) {
      showToast('No sheet ID found for this entry', 'error');
      return;
    }

    setIsEnriching(type);
    try {
      // Get the webhook response for enrichment
      const response = await fetch('https://hook.eu2.make.com/onkwar3s8ivyyz8wjve5g4x4pnp1l18j', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sheetId: selectedEntry.sheetId,
          userEmail: user.email,
          location: selectedEntry.location,
          industries: selectedEntry.industries
        })
      });
      
      console.log('Enrichment webhook response:', response);
      
      if (!response.ok) {
        throw new Error(`Failed to start enrichment process: ${response.status}`);
      }

      const result = await response.text();
      console.log('Enrichment result:', result);

      showToast('Decision maker search process started', 'success');
      setShowEnrichModal(null);
    } catch (error) {
      console.error('Enrichment error:', error);
      showToast('Failed to start enrichment process: ' + (error instanceof Error ? error.message : 'Unknown error'), 'error');
    } finally {
      setIsEnriching(null);
    }
  };
  
  // Import Modal Component
  const ImportConfirmModal = () => (
    <Modal onClose={() => setShowImportModal(false)}>
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
            <DownloadCloud className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Import Leads
          </h2>
          <p className="text-gray-600 max-w-sm mx-auto">
            This will import the generated leads directly into your leads table.
            The process will take a few moments to complete.
          </p>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={() => setShowImportModal(false)}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium"
            disabled={isImporting}
          >
            Cancel
          </button>
          <button
            onClick={importLeads}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-primary to-primary-hover text-white hover:opacity-90 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-[1.02] flex items-center"
            disabled={isImporting}
          >
            {isImporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <DownloadCloud className="w-4 h-4 mr-2" />
                Import Leads
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
  
  // Enrich Modal Component
  const EnrichConfirmModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Confirm Decision Maker Search
        </h2>
        <p className="text-gray-600 mb-6">
          This will initiate a comprehensive decision-maker contact detail research process.
          The enrichment may take 5-10 minutes before the lead list is updated.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setShowEnrichModal(null)}
            className="px-4 py-2 rounded-lg border border-primary text-primary hover:bg-primary/10"
            disabled={isEnriching !== null}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              console.log('Starting enrichment for entry:', selectedEntry);
              enrichData('contacts');
            }}
            className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover flex items-center"
            disabled={isEnriching !== null}
          >
            {isEnriching === 'contacts' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enriching...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Enrich with Decision Makers
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
  
  // Delete Confirmation Modal
  const DeleteConfirmModal = () => {
    if (!showDeleteConfirm) return null;
    
    const entryToDelete = data.find(entry => entry.id === showDeleteConfirm);
    if (!entryToDelete) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Confirm Deletion
          </h2>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete the generation entry for{' '}
            <span className="font-medium">{formatLocation(entryToDelete.location)}</span> created on{' '}
            <span className="font-medium">{format(new Date(entryToDelete.timestamp), 'MMM d, yyyy')}</span>?
            <br /><br />
            This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowDeleteConfirm(null)}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              onClick={() => handleDelete(showDeleteConfirm)}
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 flex items-center"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Entry
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Lead Generation History</h1>
        <p className="mt-2 text-sm text-gray-600">
          Track, analyze and optimize your lead generation campaigns.
        </p>
      </div>
      
      {/* Tab navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-2 px-4 mr-2 text-sm font-medium ${
            activeTab === 'history'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setActiveTab('history')}
        >
          Generation History
        </button>
        <button
          className={`py-2 px-4 text-sm font-medium ${
            activeTab === 'analytics'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics Dashboard
        </button>
      </div>
      
      {activeTab === 'analytics' ? (
        <>
          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
            <StatCard 
              title="Total Generations"
              value={stats.totalGenerations}
              icon={BarChart}
              description={`Across ${filteredData.length} campaigns`}
              color="bg-blue-500"
            />
            <StatCard 
              title="Total Leads"
              value={stats.totalLeads}
              icon={Users}
              description="Generated from all campaigns"
              percentChange={7.2}
              color="bg-teal-500"
            />
            <StatCard 
              title="Success Rate"
              value={`${stats.successRate.toFixed(1)}%`}
              icon={CheckCircle}
              description="Of all lead generation attempts"
              color="bg-green-500"
            />
            <StatCard 
              title="Avg. Leads"
              value={stats.averageLeadsPerGeneration.toFixed(1)}
              icon={Building}
              description="Leads per successful generation"
              percentChange={-2.3}
              color="bg-purple-500"
            />
          </div>
          
          {/* Export action */}
          <div className="flex justify-end mb-5">
            <button
              onClick={handleExport}
              className="flex items-center space-x-1 px-3 py-2 bg-primary text-white rounded-md hover:bg-primary-hover"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </>
      ) : null}
      
      {/* Main table - only show in history tab */}
      {activeTab === 'history' && (
        <>
          {/* Filters and actions */}
          <div className="bg-white rounded-lg shadow p-4 mb-5">
            <div className="flex flex-wrap gap-3 items-center justify-between">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search generations..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full sm:w-[250px] border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                />
              </div>
              
              <div className="flex flex-wrap gap-3">
                <FilterDropdown 
                  label="Status"
                  options={[
                    { value: 'all', label: 'All Statuses' },
                    { value: 'success', label: 'Success' },
                    { value: 'error', label: 'Error' }
                  ]}
                  value={statusFilter}
                  onChange={setStatusFilter}
                />
                
                <FilterDropdown 
                  label="Time Period"
                  options={[
                    { value: 'all', label: 'All Time' },
                    { value: 'last7days', label: 'Last 7 Days' },
                    { value: 'last30days', label: 'Last 30 Days' },
                    { value: 'last90days', label: 'Last 90 Days' }
                  ]}
                  value={dateRangeFilter}
                  onChange={setDateRangeFilter}
                />
                
                <button
                  onClick={handleExport}
                  className="flex items-center space-x-1 px-3 py-2 bg-primary text-white rounded-md hover:bg-primary-hover"
                >
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
              </div>
            </div>
          </div>
        
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto" style={{ maxHeight: 'calc(100vh - 320px)' }}>
              <table className="w-full">
                <thead className="bg-gray-50">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                          style={{ minWidth: header.column.id === 'industries' ? '200px' : 'auto' }}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={columns.length} className="px-4 py-4 text-center">
                        <div className="flex justify-center items-center">
                          <Loader2 className="w-5 h-5 text-primary mr-2 animate-spin" />
                          <span>Loading data...</span>
                        </div>
                      </td>
                    </tr>
                  ) : table.getRowModel().rows.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length} className="px-4 py-16 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <CloudOff className="w-16 h-16 text-gray-300 mb-4" />
                          <p className="text-gray-600 text-lg font-medium">No lead generation history found</p>
                          <p className="text-gray-400 text-sm mt-2">
                            All history entries have been deleted. 
                            <br />Generate new leads to see your history here.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    table.getRowModel().rows.map((row) => (
                      <tr 
                        key={row.id} 
                        className={`hover:bg-gray-50 cursor-pointer ${
                          selectedEntryId === row.original.id ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => {
                          // Provide visual feedback
                          const tr = document.querySelector(`tr[data-id="${row.id}"]`);
                          if (tr) {
                            tr.classList.add('bg-blue-100');
                            setTimeout(() => {
                              tr.classList.remove('bg-blue-100');
                            }, 200);
                          }
                          
                          // Set selected entry ID
                          setSelectedEntryId(row.original.id === selectedEntryId ? null : row.original.id);
                        }}
                        data-id={row.id}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className="px-4 py-3 text-sm text-gray-900"
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{' '}
                    <span className="font-medium">{table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}</span>{' '}
                    to{' '}
                    <span className="font-medium">
                      {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)}
                    </span>{' '}
                    of <span className="font-medium">{table.getFilteredRowModel().rows.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                    </button>
                    {Array.from(
                      { length: Math.min(5, table.getPageCount()) },
                      (_, i) => {
                        const pageIndex = i;
                        const isCurrent = pageIndex === table.getState().pagination.pageIndex;
                        
                        return (
                          <button
                            key={i}
                            onClick={() => table.setPageIndex(pageIndex)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              isCurrent
                                ? 'z-10 bg-primary text-white border-primary'
                                : 'bg-white text-gray-500 hover:bg-gray-50 border-gray-300'
                            }`}
                          >
                            {pageIndex + 1}
                          </button>
                        );
                      }
                    )}
                    <button
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRight className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* Selected entry details in modal */}
      {selectedEntry && (
        <Modal onClose={() => setSelectedEntryId(null)}>
          <div className="space-y-6 max-h-[70vh] overflow-y-auto px-2">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Generation Details
              </h2>
              <div className="flex items-center space-x-3">
                <StatusBadge status={selectedEntry.status} />
                {selectedEntry.sheetLink && (
                  <a
                    href={selectedEntry.sheetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-primary-hover text-white hover:opacity-90 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    View Results
                  </a>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Location Information */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Location</h3>
                    <p className="text-gray-600">{formatLocation(selectedEntry.location)}</p>
                  </div>
                </div>
              </div>

              {/* Company Size */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Company Size</h3>
                    <p className="text-gray-600">{selectedEntry.companySize}</p>
                  </div>
                </div>
              </div>

              {/* Industries */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 shadow-sm md:col-span-2">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Building className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-2">Target Industries</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedEntry.industries.map((industry) => (
                        <span
                          key={industry}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/10 text-primary font-medium"
                        >
                          {industry}
                        </span>
                      ))}
                    </div>
                    {selectedEntry.additionalIndustries && (
                      <p className="mt-2 text-gray-600 text-sm">{selectedEntry.additionalIndustries}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 shadow-sm md:col-span-2">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Product Details</h3>
                    <p className="text-gray-600">{selectedEntry.productDescription}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  console.log('Starting enrichment for entry:', selectedEntry);
                  enrichData('contacts');
                }}
                className="w-full inline-flex items-center justify-center px-4 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium hover:border-primary/30 hover:text-primary"
                disabled={isEnriching !== null}
              >
                {isEnriching === 'contacts' ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Enriching...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5 mr-2" />
                    Enrich with Decision Makers
                  </>
                )}
              </button>
            </div>
            
            <button
              onClick={() => setShowImportModal(true)}
              className="w-full mt-3 inline-flex items-center justify-center px-4 py-3.5 rounded-xl bg-gradient-to-r from-green-600 to-green-500 text-white hover:from-green-700 hover:to-green-600 transition-all duration-200 text-base font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.01]"
            >
              <DownloadCloud className="w-5 h-5 mr-2" />
              Import Leads to Table
            </button>
          </div>
        </Modal>
      )}
      
      {/* Modals */}
      {showImportModal && <ImportConfirmModal />}
      {showEnrichModal && <EnrichConfirmModal />}
      {showDeleteConfirm && <DeleteConfirmModal />}
    </div>
  );
} 