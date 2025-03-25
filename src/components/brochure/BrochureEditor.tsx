import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Download, Eye, Code, Loader2, X } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import html2pdf from 'html2pdf.js';

interface BrochureEditorProps {
  initialContent?: string;
  onContentChange?: (content: string) => void;
}

export function BrochureEditor({ initialContent = '', onContentChange }: BrochureEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const previewRef = useRef<HTMLIFrameElement>(null);
  const [view, setView] = useState<'split' | 'editor' | 'preview'>('split');

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setContent(value);
      updatePreview(value);
      onContentChange?.(value);
    }
  };

  const updatePreview = (htmlContent: string) => {
    if (previewRef.current) {
      const previewDocument = previewRef.current.contentDocument;
      if (previewDocument) {
        previewDocument.open();
        previewDocument.write(htmlContent);
        previewDocument.close();
      }
    }
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    const iframe = previewRef.current;
    
    try {
      if (!iframe) throw new Error('Preview iframe not available');
      const previewDoc = iframe.contentDocument;
      if (!previewDoc) throw new Error('Preview document not available');
      
      const element = previewDoc.documentElement;
      
      const opt = {
        margin: 10,
        filename: 'brochure.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { 
          unit: 'mm' as const, 
          format: 'a4' as const, 
          orientation: 'portrait' as 'portrait' | 'landscape'
        }
      };

      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please check if all images are loading correctly.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setView('editor')}
            className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              view === 'editor' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Code className="w-4 h-4 mr-1.5" />
            Editor
          </button>
          <button
            onClick={() => setView('preview')}
            className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              view === 'preview' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Eye className="w-4 h-4 mr-1.5" />
            Preview
          </button>
          <button
            onClick={() => setView('split')}
            className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              view === 'split' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Split View
          </button>
        </div>
        <button
          onClick={handleDownloadPDF}
          disabled={isGeneratingPDF}
          className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGeneratingPDF ? (
            <>
              <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-1.5" />
              Download PDF
            </>
          )}
        </button>
      </div>

      {/* Editor and Preview */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Panel */}
        {(view === 'editor' || view === 'split') && (
          <div className={`${view === 'split' ? 'w-1/2' : 'w-full'} border-r border-gray-200`}>
            <Editor
              height="100%"
              defaultLanguage="html"
              theme="vs-light"
              value={content}
              onChange={handleEditorChange}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                wordWrap: 'on',
                wrappingIndent: 'indent',
                automaticLayout: true
              }}
            />
          </div>
        )}

        {/* Preview Panel */}
        {(view === 'preview' || view === 'split') && (
          <div className={view === 'split' ? 'w-1/2' : 'w-full'}>
            <iframe
              ref={previewRef}
              title="Brochure Preview"
              className="w-full h-full bg-white"
              srcDoc={content}
            />
          </div>
        )}
      </div>
    </div>
  );
}