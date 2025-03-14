import React from 'react';
import { History, MapPin, Building2, Calendar, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

interface LeadHistoryEntry {
  id: string;
  timestamp: string;
  location: string;
  industries: string[];
  status: 'success' | 'error';
  sheetId?: string;
}

interface LeadHistoryListProps {
  entries: LeadHistoryEntry[];
  selectedEntryId: string | null;
  onSelectEntry: (entry: LeadHistoryEntry) => void;
  onDeleteEntry: (id: string) => void;
}

export function LeadHistoryList({ entries, selectedEntryId, onSelectEntry, onDeleteEntry }: LeadHistoryListProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (deletingId) return;
    
    if (!confirm('Are you sure you want to delete this history entry? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingId(id);
      await onDeleteEntry(id);
    } catch (error) {
      console.error('Error deleting history entry:', error);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className={`relative flex transition-all duration-300 ease-in-out ${isCollapsed ? 'w-12' : 'w-64'}`}>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex-1">
        <div className="p-2 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center min-w-0">
            <History className="w-4 h-4 text-primary flex-shrink-0" />
            {!isCollapsed && (
              <>
                <span className="ml-2 text-xs font-medium text-gray-900 truncate">
                  Lead Generation History
                </span>
                <span className="ml-2 text-xs text-gray-500">
                  {entries.length}
                </span>
              </>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-3 h-3 text-gray-400" />
            ) : (
              <ChevronLeft className="w-3 h-3 text-gray-400" />
            )}
          </button>
        </div>
        
        {!isCollapsed && (
          <div className="divide-y divide-gray-100 max-h-[calc(100vh-180px)] overflow-y-auto">
            {entries.map((entry) => (
              <div
                key={entry.id}
                onClick={() => onSelectEntry(entry)}
                className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                  selectedEntryId === entry.id ? 'bg-primary/5 hover:bg-primary/10 relative' : 'relative'
                } space-y-1.5 cursor-pointer group`}
              >
                <div className="flex items-center text-xs font-medium text-gray-900">
                  <Calendar className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
                  {new Date(entry.timestamp).toLocaleDateString()}
                </div>
                
                <div className="flex items-center text-xs text-gray-600">
                  <MapPin className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                  {entry.location}
                </div>
                
                <div className="flex flex-wrap gap-1 mt-1">
                  {entry.industries.slice(0, 2).map((industry, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary"
                    >
                      <Building2 className="w-2.5 h-2.5 mr-1" />
                      {industry}
                    </span>
                  ))}
                  {entry.industries.length > 2 && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600">
                      +{entry.industries.length - 2} more
                    </span>
                  )}
                </div>
                
                <div
                  onClick={(e) => handleDelete(entry.id, e)}
                  className={`absolute top-2 right-2 p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer ${
                    deletingId === entry.id ? 'animate-pulse' : ''
                  } ${deletingId === entry.id ? 'pointer-events-none' : ''}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}