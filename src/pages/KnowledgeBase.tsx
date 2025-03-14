import React, { useState, useCallback } from 'react';
import { Database, Upload, Loader2, FileText, CheckCircle, AlertCircle, Info, BookOpen, FileUp, Settings } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { VectorizationService } from '../lib/vectorization';

interface UploadStatus {
  status: 'idle' | 'uploading' | 'success' | 'error';
  message?: string;
  progress: number;
}

export default function KnowledgeBase() {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    status: 'idle',
    progress: 0
  });
  const [isDragging, setIsDragging] = useState(false);
  const { showToast } = useToast();

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileProcess(files[0]);
    }
  };

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    handleFileProcess(file);
    event.target.value = '';
  }, []);

  const handleFileProcess = async (file: File) => {
    setUploadStatus({ status: 'uploading', progress: 0 });
    
    try {
      const result = await VectorizationService.processFile(
        file,
        (progress) => setUploadStatus(prev => ({ ...prev, progress }))
      );
      
      if (result.success) {
        setUploadStatus({
          status: 'success',
          progress: 100,
          message: 'File processed successfully!'
        });
        showToast('File uploaded and processed successfully', 'success');
      } else {
        throw new Error(result.error || 'Failed to process file');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setUploadStatus({
        status: 'error',
        progress: 0,
        message: errorMessage
      });
      showToast(errorMessage, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full mb-6 transform hover:scale-105 transition-all duration-300">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Knowledge Base
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed mb-8">
            Upload documents to enhance AI's understanding of your business context
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {/* Upload Section */}
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200 backdrop-blur-sm mb-8">
            <div className="text-center">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleFileUpload}
                accept=".txt,.doc,.docx,.pdf"
                disabled={uploadStatus.status === 'uploading'}
              />
              
              <label
                onDragEnter={handleDragEnter}
                onDragOver={(e) => e.preventDefault()}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                htmlFor="file-upload"
                className={`relative group cursor-pointer w-full h-64 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl transition-all duration-300 ${
                  isDragging ? 'border-primary bg-primary/10 scale-[1.02]' :
                  uploadStatus.status === 'uploading'
                    ? 'border-primary bg-primary/5 cursor-not-allowed'
                    : uploadStatus.status === 'success'
                    ? 'border-green-500 bg-green-50'
                    : uploadStatus.status === 'error'
                    ? 'border-red-500 bg-red-50'
                    : 'border-primary/30 hover:border-primary hover:bg-primary/5 hover:scale-[1.01]'
                }`}
              >
                {uploadStatus.status === 'uploading' ? (
                  <div className="text-center px-6">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                    <div className="text-gray-600 mb-2">Processing file...</div>
                    <div className="w-48 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${uploadStatus.progress}%` }}
                      />
                    </div>
                    <div className="text-sm text-gray-500 mt-2">
                      {Math.round(uploadStatus.progress)}%
                    </div>
                  </div>
                ) : uploadStatus.status === 'success' ? (
                  <div className="text-center px-6">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <p className="text-lg font-medium text-green-700 mb-1">
                      {uploadStatus.message}
                    </p>
                    <p className="text-sm text-green-600">
                      Click or drag to upload another file
                    </p>
                  </div>
                ) : uploadStatus.status === 'error' ? (
                  <div className="text-center px-6">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-lg font-medium text-red-700 mb-1">
                      {uploadStatus.message}
                    </p>
                    <p className="text-sm text-red-600">
                      Click or drag to try again
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="text-center px-6">
                      <Upload className="w-12 h-12 text-primary mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-2">
                        Click to upload a file
                      </p>
                      <p className="text-sm text-gray-500">
                        or drag and drop your file here
                      </p>
                      <div className="mt-4 flex flex-wrap justify-center gap-2">
                        <span className="px-3 py-1 bg-primary/5 text-primary text-sm rounded-full">.txt</span>
                        <span className="px-3 py-1 bg-primary/5 text-primary text-sm rounded-full">.pdf</span>
                        <span className="px-3 py-1 bg-primary/5 text-primary text-sm rounded-full">.doc</span>
                        <span className="px-3 py-1 bg-primary/5 text-primary text-sm rounded-full">.docx</span>
                      </div>
                      <div className="mt-3 text-xs text-gray-400">
                        PDF files up to 10MB
                        <br />
                        TXT files up to 5MB
                      </div>
                    </div>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* File Upload Recommendations */}
          <div className="bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10 rounded-2xl p-8 mb-8 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 rounded-xl p-2">
                <Info className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-gray-900 font-semibold text-lg mb-4">File Upload Guidelines</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3 bg-white/80 p-4 rounded-lg border border-primary/10 hover:border-primary/30 transition-colors">
                    <FileText className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900 mb-1">File Size Limits</p>
                      <ul className="space-y-2 text-gray-600 text-sm">
                        <li>• PDF files: Maximum 10MB</li>
                        <li>• TXT files: Maximum 5MB</li>
                        <li>• For larger files, split into smaller chunks</li>
                      </ul>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 bg-white/80 p-4 rounded-lg border border-primary/10 hover:border-primary/30 transition-colors">
                    <FileText className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900 mb-1">Supported Formats</p>
                      <p className="text-gray-600 text-sm">TXT, PDF, DOC, DOCX</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 bg-white/80 p-4 rounded-lg border border-primary/10 hover:border-primary/30 transition-colors">
                    <FileText className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900 mb-1">Best Practices</p>
                      <p className="text-gray-600 text-sm">Convert large PDF files to TXT format for optimal processing</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}