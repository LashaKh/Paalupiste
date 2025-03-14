import React, { useState, useEffect, useRef } from 'react';
import { FileText, Video, Facebook, Linkedin, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../hooks/useToast';
import { ArticlesTable } from '../components/content/ArticlesTable';
import { SocialPostsTable } from '../components/content/SocialPostsTable';
import { NewsletterTable } from '../components/content/NewsletterTable';
import { VideosTable } from '../components/content/VideosTable';
import { ContentTableArticle } from '../types/content';

interface ContentCounts {
  articles: number;
  linkedinPosts: number;
  facebookPosts: number;
  videos: number;
  newsletters: number;
}

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  action: string;
  itemType: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, onClose, onConfirm, action, itemType }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm {action}</h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to {action.toLowerCase()} this {itemType}? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const ContentTable: React.FC = () => {
  const articlesRef = useRef<HTMLDivElement>(null);
  const linkedinRef = useRef<HTMLDivElement>(null);
  const facebookRef = useRef<HTMLDivElement>(null);
  const newslettersRef = useRef<HTMLDivElement>(null);
  const videosRef = useRef<HTMLDivElement>(null);

  const scrollToTable = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const [counts, setCounts] = useState<ContentCounts>({
    articles: 0,
    linkedinPosts: 0,
    facebookPosts: 0,
    videos: 0,
    newsletters: 0
  });

  useEffect(() => {
    fetchContentCounts();
  }, []);

  const fetchContentCounts = async () => {
    try {
      setLoading(true);
      
      // Fetch counts from all tables
      const [
        { count: articlesCount },
        { count: linkedinCount },
        { count: facebookCount },
        { count: newslettersCount }
      ] = await Promise.all([
        supabase.from('content_table_articles').select('*', { count: 'exact', head: true }),
        supabase.from('content_table_social_posts').select('*', { count: 'exact', head: true }).eq('platform', 'linkedin'),
        supabase.from('content_table_social_posts').select('*', { count: 'exact', head: true }).eq('platform', 'facebook'),
        supabase.from('content_table_newsletters').select('*', { count: 'exact', head: true })
      ]);

      setCounts({
        articles: articlesCount || 0,
        linkedinPosts: linkedinCount || 0,
        facebookPosts: facebookCount || 0,
        videos: 0, // Set to 0 since video table isn't implemented yet
        newsletters: newslettersCount || 0
      });
    } catch (error) {
      console.error('Error fetching content counts:', error);
      showToast('Failed to fetch content statistics', 'error');
    } finally {
      setLoading(false);
    }
  };

  const [articles, setArticles] = useState<ContentTableArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    action: string;
    itemType: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    action: '',
    itemType: '',
    onConfirm: () => {},
  });
  const { showToast } = useToast();

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('content_table_articles')
        .select('id, title, topic, status, link, created_at, keywords')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
      showToast('Failed to load articles', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (action: string, itemType: string) => {
    setConfirmModal({
      isOpen: true,
      action,
      itemType,
      onConfirm: () => {
        // Handle the action here
        console.log(`Confirmed ${action} for ${itemType}`);
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[98vw] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Content Management Dashboard</h1>
              <p className="mt-2 text-sm text-gray-500">
                Manage and publish your content across multiple platforms
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => scrollToTable(articlesRef)}
                  className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-primary/90 to-primary hover:from-primary hover:to-primary-hover text-white shadow-sm hover:shadow transition-all duration-200">
                  <FileText className="w-4 h-4 mr-1.5" />
                  Article
                </button>
                <button 
                  onClick={() => scrollToTable(linkedinRef)}
                  className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-[#0A66C2]/90 to-[#0A66C2] hover:from-[#0A66C2] hover:to-[#084d91] text-white shadow-sm hover:shadow transition-all duration-200">
                  <Linkedin className="w-4 h-4 mr-1.5" />
                  LinkedIn
                </button>
                <button 
                  onClick={() => scrollToTable(facebookRef)}
                  className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-[#1877F2]/90 to-[#1877F2] hover:from-[#1877F2] hover:to-[#1261c9] text-white shadow-sm hover:shadow transition-all duration-200">
                  <Facebook className="w-4 h-4 mr-1.5" />
                  Facebook
                </button>
                <button 
                  onClick={() => scrollToTable(newslettersRef)}
                  className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-purple-500/90 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white shadow-sm hover:shadow transition-all duration-200">
                  <Mail className="w-4 h-4 mr-1.5" />
                  Newsletter
                </button>
                <button 
                  onClick={() => scrollToTable(videosRef)}
                  className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-red-500/90 to-red-500 hover:from-red-500 hover:to-red-600 text-white shadow-sm hover:shadow transition-all duration-200">
                  <Video className="w-4 h-4 mr-1.5" />
                  Video
                </button>
              </div>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-8">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Articles</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {loading ? '...' : counts.articles}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-[#0A66C2]/10 rounded-lg">
                  <Linkedin className="w-5 h-5 text-[#0A66C2]" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">LinkedIn Posts</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {loading ? '...' : counts.linkedinPosts}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-[#1877F2]/10 rounded-lg">
                  <Facebook className="w-5 h-5 text-[#1877F2]" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Facebook Posts</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {loading ? '...' : counts.facebookPosts}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <Video className="w-5 h-5 text-red-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Videos</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {loading ? '...' : counts.videos}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Mail className="w-5 h-5 text-purple-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Newsletters</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {loading ? '...' : counts.newsletters}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tables */}
        <div className="space-y-8">
          <div ref={articlesRef}>
          <ArticlesTable 
            articles={articles}
            loading={loading}
            onAction={handleAction}
            onRefresh={fetchArticles}
          />
          </div>

          {/* Social Media Posts */}
          <div className="space-y-8">
            <div ref={linkedinRef}>
            <SocialPostsTable platform="linkedin" onAction={handleAction} />
            </div>
            <div ref={facebookRef}>
            <SocialPostsTable platform="facebook" onAction={handleAction} />
            </div>
          </div>

          <div ref={newslettersRef}>
          <NewsletterTable onAction={handleAction} />
          </div>

          <div ref={videosRef}>
          <VideosTable onAction={handleAction} />
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        action={confirmModal.action}
        itemType={confirmModal.itemType}
      />
    </div>
  );
};

export default ContentTable;