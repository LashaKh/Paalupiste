import React, { useState } from 'react';
import { FileText, Trash2, X, Loader2, MoveRight, Code, Eye } from 'lucide-react';
import { useNewsletters, Newsletter } from '../../contexts/NewsletterContext';
import { OutlineEditor } from '../forms/OutlineEditor';
import { useToast } from '../../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

interface NewsletterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewsletterSidebar({ isOpen, onClose }: NewsletterSidebarProps) {
  const { newsletters, deleteNewsletter } = useNewsletters();
  const [selectedNewsletter, setSelectedNewsletter] = useState<Newsletter | null>(null);
  const { showToast } = useToast();
  const [movingNewsletter, setMovingNewsletter] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteNewsletter(id);
      showToast('Newsletter deleted successfully', 'success');
    } catch (error) {
      showToast('Failed to delete newsletter', 'error');
    }
  };

  const handleNewsletterClick = (newsletter: Newsletter) => {
    setSelectedNewsletter(newsletter);
  };

  const handleMoveToTable = async (newsletter: Newsletter, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setMovingNewsletter(newsletter.id);

      // Get the current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Insert the newsletter into content_table_newsletters
      const { error } = await supabase
        .from('content_table_newsletters')
        .insert({
          title: newsletter.title,
          subject_line: newsletter.title,
          content: newsletter.content,
          status: 'Ready',
          created_at: newsletter.timestamp,
          user_id: user.id
        });

      if (error) throw error;
      
      // Navigate to content table
      navigate('/app/content/table');
      
      showToast('Newsletter moved to content table successfully', 'success');
    } catch (error) {
      showToast('Failed to move newsletter to content table', 'error');
    } finally {
      setMovingNewsletter(null);
    }
  };

  const handleGenerateNewsletter = async () => {
    if (!selectedNewsletter) return;
    
    try {
      const response = await fetch('https://hook.eu2.make.com/ux47aj42iy2kmndvwswve3lhex6euwq3', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: selectedNewsletter.title,
          outline: selectedNewsletter.content,
          type: 'newsletter'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate newsletter');
      }

      showToast('Newsletter generation started successfully', 'success');
      setSelectedNewsletter(null);
    } catch (error) {
      showToast('Failed to generate newsletter', 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="newsletter-modal" role="dialog" aria-modal="true">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" aria-hidden="true" onClick={onClose} />

        <div className="relative w-[70vw] max-h-[85vh] bg-white rounded-xl shadow-2xl transform transition-all flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Generated Newsletters</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {newsletters.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No newsletters generated yet</p>
              </div>
            ) : (
              newsletters.map((newsletter) => (
                <div
                  key={newsletter.id}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-primary/50 cursor-pointer transition-colors"
                  onClick={() => handleNewsletterClick(newsletter)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{newsletter.title}</h3>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(newsletter.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleMoveToTable(newsletter, e)}
                        disabled={movingNewsletter === newsletter.id}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-all ${
                          movingNewsletter === newsletter.id ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        title="Move this newsletter to the Content Table for publishing"
                      >
                        {movingNewsletter === newsletter.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <MoveRight className="h-4 w-4" />
                            <span className="text-sm">Move to Content</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={(e) => handleDelete(newsletter.id, e)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {selectedNewsletter && (
        <OutlineEditor
          title={selectedNewsletter.title}
          outlineId={selectedNewsletter.id}
          content={selectedNewsletter.content}
          onClose={() => setSelectedNewsletter(null)}
          onGenerateArticle={handleGenerateNewsletter}
        />
      )}
    </div>
  );
}