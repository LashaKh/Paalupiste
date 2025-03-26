import React from 'react';
import { Video, Loader2 } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface VideosTableProps {
  onAction: (action: string, itemType: string) => void;
  loading?: boolean;
  onRefresh?: () => void;
}

export function VideosTable({ onAction, loading = false, onRefresh }: VideosTableProps) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <Video className="w-5 h-5 mr-2 text-primary" />
          Videos
        </h2>
        <div>
          {onRefresh && (
            <button 
              onClick={onRefresh}
              className="text-sm text-primary hover:text-primary-hover flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          )}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Platform(s)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="flex justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                  <p className="mt-3 text-sm text-gray-500">Loading videos...</p>
                </td>
              </tr>
            ) : (
              <tr>
                <td className="px-6 py-4 text-sm text-gray-900">
                  Screw Pile Installation Process
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  3:45
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div className="flex space-x-1">
                    <span className="px-2 py-1 rounded-full bg-[#FF0000]/10 text-[#FF0000] text-xs">YouTube</span>
                    <span className="px-2 py-1 rounded-full bg-[#0A66C2]/10 text-[#0A66C2] text-xs">LinkedIn</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Tutorial
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status="Ready" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={() => onAction('Publish', 'video')}
                    className="text-primary hover:text-primary-hover font-medium"
                  >
                    Publish Now
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}