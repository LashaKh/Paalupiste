import React from 'react';
import { CheckCircle, ExternalLink, Clock, BarChart, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';
import { SuccessModalProps } from '../../types';

export function SuccessModal({ isOpen, sheetLink, onClose }: SuccessModalProps) {
  const navigate = useNavigate();
  
  if (!isOpen) return null;

  const handleViewHistory = () => {
    onClose();
    navigate('/app/leads/history');
  };

  return (
    <Modal onClose={onClose}>
      <div className="text-center relative">
        {/* Background pattern with enhanced gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-blue-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-lg -z-10 opacity-80" />
        <div className="absolute inset-0 bg-[radial-gradient(#e0e7ff_1px,transparent_1px)] [background-size:16px_16px] opacity-30 -z-10" />
        
        {/* Success icon with enhanced animation */}
        <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-tr from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 mb-8 shadow-xl animate-bounce-subtle relative">
          <div className="absolute inset-0 rounded-full bg-green-400 dark:bg-green-500 opacity-20 animate-pulse" />
          <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" strokeWidth={2} />
        </div>

        <div className="space-y-6">
          {/* Title with enhanced gradient text */}
          <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-gray-700 dark:from-white dark:via-blue-200 dark:to-gray-200 bg-clip-text text-transparent">
            Lead Generation Started!
          </h3>

          {/* Status card with improved visuals */}
          <div className="mx-auto max-w-md p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#e0e7ff_1px,transparent_1px)] [background-size:16px_16px] opacity-10 -z-10" />
            
            <div className="flex items-center justify-center space-x-3 text-amber-600 dark:text-amber-400 mb-4">
              <div className="relative">
                <Clock className="h-5 w-5 animate-spin-slow" strokeWidth={2} />
                <div className="absolute inset-0 rounded-full bg-amber-400 dark:bg-amber-500 opacity-20 animate-pulse" />
              </div>
              <p className="text-base font-semibold">Processing in progress</p>
            </div>
            
            {/* Animated progress bar */}
            <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-5">
              <div className="h-full bg-gradient-to-r from-blue-500 via-green-400 to-blue-500 w-1/3 animate-progress-pulse rounded-full" />
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300 text-base font-medium">
                Your leads are being generated. You'll be notified when they're ready.
              </p>
              
              {/* Google Sheets information */}
              <div className="p-4 bg-blue-50 dark:bg-gray-700/50 rounded-lg border border-blue-100 dark:border-gray-600">
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Once processing is complete, your leads will be available:
                </p>
                <ul className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mr-2"></span>
                    In your Lead Generation History
                  </li>
                  <li className="flex items-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mr-2"></span>
                    As a downloadable Google Sheets document
                  </li>
                  <li className="flex items-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mr-2"></span>
                    With detailed contact information
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Action buttons with enhanced styles */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
            {/* View in Google Sheets button (only shown if sheetLink is available) */}
            {sheetLink && (
              <a
                href={sheetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                <span className="font-semibold">View in Google Sheets</span>
              </a>
            )}
            
            {/* Go to History button */}
            <button
              onClick={handleViewHistory}
              className="flex-1 inline-flex items-center justify-center px-6 py-3 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 dark:from-gray-700 dark:to-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            >
              <BarChart className="w-5 h-5 mr-2" />
              <span className="font-semibold">View Generation History</span>
            </button>
          </div>
          
          {/* Enhanced footer text */}
          <div className="text-sm text-gray-600 dark:text-gray-400 pt-2 flex items-center justify-center">
            <Clock className="w-4 h-4 mr-1.5 text-blue-500" />
            <p className="font-medium">
              Processing takes approximately 5-10 minutes
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}