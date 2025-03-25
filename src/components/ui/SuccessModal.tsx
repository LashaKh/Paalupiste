import React from 'react';
import { CheckCircle, ExternalLink, Clock } from 'lucide-react';
import Modal from './Modal';
import { SuccessModalProps } from '../../types';

export function SuccessModal({ isOpen, sheetLink, onClose }: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <Modal onClose={onClose}>
      <div className="text-center relative">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-blue-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-lg -z-10" />
        
        {/* Success icon with enhanced animation */}
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-tr from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 mb-8 shadow-lg animate-bounce-subtle relative">
          <div className="absolute inset-0 rounded-full bg-green-400 dark:bg-green-500 opacity-20 animate-pulse" />
          <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
        </div>

        <div className="space-y-6">
          {/* Title with gradient text */}
          <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
            Lead Generation Started!
          </h3>

          {/* Status card with improved contrast */}
          <div className="mx-auto max-w-md p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-center space-x-3 text-amber-600 dark:text-amber-400 mb-3">
              <div className="relative">
                <Clock className="h-5 w-5 animate-spin-slow" />
                <div className="absolute inset-0 rounded-full bg-amber-400 dark:bg-amber-500 opacity-20 animate-pulse" />
              </div>
              <p className="text-base font-semibold">Processing in progress</p>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-green-500 w-1/3 animate-progress rounded-full" />
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-base mt-4 font-medium">
              {sheetLink ? (
                <>Your leads will be available in approximately 10 minutes at:</>
              ) : (
                <>Your leads are being generated. You'll be notified when they're ready.</>
              )}
            </p>
          </div>
          
          {/* Enhanced button with gradient */}
          {sheetLink && (
            <div className="pt-4">
              <a
                href={sheetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                <span className="font-semibold">View in Google Sheets</span>
              </a>
            </div>
          )}
          
          {/* Footer text with improved contrast */}
          <p className="text-sm text-gray-600 dark:text-gray-400 pt-4 font-medium">
            You'll be able to view and manage your leads once processing is complete
          </p>
        </div>
      </div>
    </Modal>
  );
}