import React from 'react';
import { GenerationHistory } from '../../types';
import { format } from 'date-fns';
import { Building, Calendar, MapPin, History, Trash2 } from 'lucide-react';

// Helper function to format location
const formatLocation = (location: string | { country: string; state?: string } | undefined): string => {
  if (!location) return 'Unknown location';
  
  // If location is a string and looks like JSON, try to parse it
  if (typeof location === 'string' && location.startsWith('{')) {
    try {
      const parsed = JSON.parse(location);
      if (parsed && typeof parsed === 'object') {
        return `${parsed.country}${parsed.state ? `, ${parsed.state}` : ''}`;
      }
    } catch (e) {
      // If parsing fails, return the original string
      return location;
    }
  }
  
  // If location is already an object
  if (typeof location === 'object') {
    return `${location.country}${location.state ? `, ${location.state}` : ''}`;
  }
  
  // If it's a plain string
  return location;
};

interface LeadHistoryListProps {
  entries: GenerationHistory[];
  selectedEntryId: string | null;
  onSelectEntry: (entry: GenerationHistory | null) => void;
  onDeleteEntry: (entryId: string) => void;
}

export function LeadHistoryList({
  entries,
  selectedEntryId,
  onSelectEntry,
  onDeleteEntry,
}: LeadHistoryListProps) {
  const handleDelete = (e: React.MouseEvent, entryId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this imported table?')) {
      onDeleteEntry(entryId);
      onSelectEntry(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <h2 className="text-lg font-semibold text-gray-900">Imported Tables</h2>
      </div>

      <div className="relative">
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-3">
            {entries.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg border border-gray-200 min-w-[200px]">
                <History className="w-6 h-6 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 text-center">No imported tables yet</p>
              </div>
            ) : (
              entries.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => onSelectEntry(entry)}
                  className={`flex flex-col min-w-[280px] p-3 rounded-lg border transition-all ${
                    selectedEntryId === entry.id
                      ? 'bg-primary/5 border-primary shadow-sm'
                      : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                      <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      {format(new Date(entry.timestamp || ''), 'PP')}
                    </div>
                    <button
                      onClick={(e) => handleDelete(e, entry.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                      title="Delete table"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{formatLocation(entry.location)}</span>
                  </div>

                  <div className="mt-2 flex items-start gap-2">
                    <Building className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div className="flex flex-wrap gap-1">
                      {entry.industries.map((industry, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {industry}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
        
        {entries.length > 0 && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center">
            <div className="w-20 h-full bg-gradient-to-l from-white to-transparent pointer-events-none" />
          </div>
        )}
      </div>
    </div>
  );
}