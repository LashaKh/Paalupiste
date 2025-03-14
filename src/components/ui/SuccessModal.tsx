import React from 'react';
import { CheckCircle, ExternalLink } from 'lucide-react';
import Modal from './Modal';

interface SuccessModalProps {
  sheetLink: string;
  onClose: () => void;
}

export function SuccessModal({ sheetLink, onClose }: SuccessModalProps) {
  return (
    <Modal onClose={onClose}>
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>
        <div className="mt-3 text-center sm:mt-5">
          <h3 className="text-2xl font-semibold leading-6 text-white">
            Lead Generation Started!
          </h3>
          <div className="mt-4">
            <p className="text-gray-300">
              Your leads will be available in approximately 10 minutes at:
            </p>
            <a
              href={sheetLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center px-4 py-2 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-colors"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View in Google Sheets
            </a>
          </div>
        </div>
      </div>
    </Modal>
  );
}