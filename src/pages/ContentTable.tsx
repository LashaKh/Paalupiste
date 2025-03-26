import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FileText, Video, Facebook, Linkedin, Mail, Calendar, TrendingUp, Search, Filter, Download, Upload, Trash2, RefreshCw, Settings, MoreHorizontal, Clock, ArrowUpDown, Check, X, ChevronDown, Eye, Edit, Copy } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../hooks/useToast';
import { ArticlesTable } from '../components/content/ArticlesTable';
import { SocialPostsTable } from '../components/content/SocialPostsTable';
import { NewsletterTable } from '../components/content/NewsletterTable';
import { VideosTable } from '../components/content/VideosTable';
import { ContentTableArticle } from '../types/content';

// Animation utilities
import { motion, AnimatePresence } from 'framer-motion';

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
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm {action}</h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to {action.toLowerCase()} this {itemType}? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition duration-200 flex items-center"
          >
            <X className="w-4 h-4 mr-2" /> Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition duration-200 flex items-center"
          >
            <Check className="w-4 h-4 mr-2" /> Confirm
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const ContentTable: React.FC = () => {
  // Refs for table navigation
  const articlesRef = useRef<HTMLDivElement>(null);
  const linkedinRef = useRef<HTMLDivElement>(null);
  const facebookRef = useRef<HTMLDivElement>(null);
  const newslettersRef = useRef<HTMLDivElement>(null);
  const videosRef = useRef<HTMLDivElement>(null);

  // Active section tracking
  const [activeSection, setActiveSection] = useState<string>('articles');

  const scrollToTable = (ref: React.RefObject<HTMLDivElement>, sectionName: string) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveSection(sectionName);
  };

  // State for content counts, filters, and searching
  const [counts, setCounts] = useState<ContentCounts>({
    articles: 0,
    linkedinPosts: 0,
    facebookPosts: 0,
    videos: 0,
    newsletters: 0
  });

  const [dateRange, setDateRange] = useState<{start?: Date, end?: Date}>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch content statistics
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

  // Articles data and loading states
  const [articles, setArticles] = useState<ContentTableArticle[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Confirmation modal state
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
      setRefreshing(true);
      
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
      setTimeout(() => setRefreshing(false), 500); // Add small delay for animation
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

  // Filter articles based on search and filters
  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      // Apply search filter
      const matchesSearch = searchQuery === '' || 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (article.keywords && article.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase())));
      
      // Apply status filter
      const matchesStatus = statusFilter === 'all' || article.status === statusFilter;
      
      // Apply date filter if set
      let matchesDate = true;
      if (dateRange.start) {
        const articleDate = new Date(article.created_at);
        matchesDate = articleDate >= dateRange.start;
        
        if (dateRange.end) {
          matchesDate = matchesDate && articleDate <= dateRange.end;
        }
      }
      
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [articles, searchQuery, statusFilter, dateRange]);

  // Calculate total content for the header
  const totalContent = counts.articles + counts.linkedinPosts + counts.facebookPosts + counts.newsletters;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[98vw] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header with advanced metrics */}
        <motion.div 
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Management Dashboard</h1>
              <p className="text-sm text-gray-500 flex items-center">
                <Clock className="w-4 h-4 mr-1.5 text-gray-400" /> 
                Last updated: {new Date().toLocaleDateString()} | 
                <span className="ml-2 text-primary font-medium">{totalContent} total content items</span>
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button 
                onClick={fetchArticles} 
                className={`p-2 text-gray-500 rounded-lg hover:bg-gray-100 transition-all duration-200 ${refreshing ? 'animate-spin text-primary' : ''}`}
                title="Refresh data"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              
              <button 
                onClick={() => setFilterOpen(!filterOpen)}
                className={`p-2 rounded-lg transition-all duration-200 ${filterOpen ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:bg-gray-100'}`}
                title="Filter options"
              >
                <Filter className="w-5 h-5" />
              </button>
              
              <div className="relative">
                <button className="p-2 text-gray-500 rounded-lg hover:bg-gray-100 transition-all duration-200" title="More options">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Filter panel */}
          <AnimatePresence>
            {filterOpen && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-5 pt-5 border-t border-gray-100">
                  <div className="flex flex-wrap gap-4 items-end">
                    <div className="w-full sm:w-auto">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Search Content</label>
                      <div className="relative">
                        <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search by title, topic, keywords..."
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary w-full"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary appearance-none bg-white"
                      >
                        <option value="all">All Statuses</option>
                        <option value="Draft">Draft</option>
                        <option value="Ready">Ready</option>
                        <option value="Published">Published</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                      <div className="flex space-x-2">
                        <input
                          type="date"
                          onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value ? new Date(e.target.value) : undefined }))}
                          className="pl-3 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                        />
                        <input
                          type="date"
                          onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value ? new Date(e.target.value) : undefined }))}
                          className="pl-3 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                        />
                      </div>
                    </div>
                    
                    <div className="ml-auto">
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setStatusFilter('all');
                          setDateRange({});
                        }}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 focus:outline-none"
                      >
                        Reset Filters
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Content Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-8">
            <motion.div 
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
              onClick={() => scrollToTable(articlesRef, 'articles')}
            >
              <div className="flex items-center justify-between">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <span className={`px-2 py-1 rounded-md text-xs font-medium ${activeSection === 'articles' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-600'}`}>
                  {activeSection === 'articles' ? 'Active' : 'View'}
                </span>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : counts.articles}
                </p>
                <p className="text-sm font-medium text-gray-600">Articles</p>
              </div>
              <div className="mt-2 flex items-center text-xs text-green-600">
                <TrendingUp className="w-3 h-3 mr-1" />
                <span>15% increase this month</span>
              </div>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
              onClick={() => scrollToTable(linkedinRef, 'linkedin')}
            >
              <div className="flex items-center justify-between">
                <div className="p-2 bg-[#0A66C2]/10 rounded-lg">
                  <Linkedin className="w-6 h-6 text-[#0A66C2]" />
                </div>
                <span className={`px-2 py-1 rounded-md text-xs font-medium ${activeSection === 'linkedin' ? 'bg-[#0A66C2]/10 text-[#0A66C2]' : 'bg-gray-100 text-gray-600'}`}>
                  {activeSection === 'linkedin' ? 'Active' : 'View'}
                </span>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : counts.linkedinPosts}
                </p>
                <p className="text-sm font-medium text-gray-600">LinkedIn Posts</p>
              </div>
              <div className="mt-2 flex items-center text-xs text-green-600">
                <TrendingUp className="w-3 h-3 mr-1" />
                <span>8% increase this month</span>
              </div>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
              onClick={() => scrollToTable(facebookRef, 'facebook')}
            >
              <div className="flex items-center justify-between">
                <div className="p-2 bg-[#1877F2]/10 rounded-lg">
                  <Facebook className="w-6 h-6 text-[#1877F2]" />
                </div>
                <span className={`px-2 py-1 rounded-md text-xs font-medium ${activeSection === 'facebook' ? 'bg-[#1877F2]/10 text-[#1877F2]' : 'bg-gray-100 text-gray-600'}`}>
                  {activeSection === 'facebook' ? 'Active' : 'View'}
                </span>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : counts.facebookPosts}
                </p>
                <p className="text-sm font-medium text-gray-600">Facebook Posts</p>
              </div>
              <div className="mt-2 flex items-center text-xs text-green-600">
                <TrendingUp className="w-3 h-3 mr-1" />
                <span>12% increase this month</span>
              </div>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
              onClick={() => scrollToTable(newslettersRef, 'newsletters')}
            >
              <div className="flex items-center justify-between">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Mail className="w-6 h-6 text-purple-500" />
                </div>
                <span className={`px-2 py-1 rounded-md text-xs font-medium ${activeSection === 'newsletters' ? 'bg-purple-500/10 text-purple-500' : 'bg-gray-100 text-gray-600'}`}>
                  {activeSection === 'newsletters' ? 'Active' : 'View'}
                </span>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : counts.newsletters}
                </p>
                <p className="text-sm font-medium text-gray-600">Newsletters</p>
              </div>
              <div className="mt-2 flex items-center text-xs text-green-600">
                <TrendingUp className="w-3 h-3 mr-1" />
                <span>5% increase this month</span>
              </div>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
              onClick={() => scrollToTable(videosRef, 'videos')}
            >
              <div className="flex items-center justify-between">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <Video className="w-6 h-6 text-red-500" />
                </div>
                <span className={`px-2 py-1 rounded-md text-xs font-medium ${activeSection === 'videos' ? 'bg-red-500/10 text-red-500' : 'bg-gray-100 text-gray-600'}`}>
                  {activeSection === 'videos' ? 'Active' : 'View'}
                </span>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : counts.videos}
                </p>
                <p className="text-sm font-medium text-gray-600">Videos</p>
              </div>
              <div className="mt-2 flex items-center text-xs text-yellow-600">
                <TrendingUp className="w-3 h-3 mr-1" />
                <span>Coming soon</span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Fixed navigation for content sections */}
        <div className="sticky top-4 z-10 mb-8 bg-white rounded-xl shadow-sm p-2 border border-gray-200 flex items-center justify-between overflow-x-auto">
          <div className="flex items-center space-x-1">
            <button 
              onClick={() => scrollToTable(articlesRef, 'articles')}
              className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeSection === 'articles' 
                ? 'bg-primary text-white shadow' 
                : 'hover:bg-gray-100 text-gray-700'}`}
            >
              <FileText className="w-4 h-4 mr-1.5 inline-block" />
              Articles
            </button>
            <button 
              onClick={() => scrollToTable(linkedinRef, 'linkedin')}
              className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeSection === 'linkedin' 
                ? 'bg-[#0A66C2] text-white shadow' 
                : 'hover:bg-gray-100 text-gray-700'}`}
            >
              <Linkedin className="w-4 h-4 mr-1.5 inline-block" />
              LinkedIn
            </button>
            <button 
              onClick={() => scrollToTable(facebookRef, 'facebook')}
              className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeSection === 'facebook' 
                ? 'bg-[#1877F2] text-white shadow' 
                : 'hover:bg-gray-100 text-gray-700'}`}
            >
              <Facebook className="w-4 h-4 mr-1.5 inline-block" />
              Facebook
            </button>
            <button 
              onClick={() => scrollToTable(newslettersRef, 'newsletters')}
              className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeSection === 'newsletters' 
                ? 'bg-purple-500 text-white shadow' 
                : 'hover:bg-gray-100 text-gray-700'}`}
            >
              <Mail className="w-4 h-4 mr-1.5 inline-block" />
              Newsletter
            </button>
            <button 
              onClick={() => scrollToTable(videosRef, 'videos')}
              className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeSection === 'videos' 
                ? 'bg-red-500 text-white shadow' 
                : 'hover:bg-gray-100 text-gray-700'}`}
            >
              <Video className="w-4 h-4 mr-1.5 inline-block" />
              Video
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-600 rounded-lg hover:bg-gray-100 transition-all duration-200">
              <Download className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-600 rounded-lg hover:bg-gray-100 transition-all duration-200">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content sections */}
        <div ref={articlesRef} className="mb-12">
          <ArticlesTable 
            articles={filteredArticles} 
            loading={loading} 
            onAction={handleAction}
            onRefresh={fetchArticles}
          />
        </div>
        
        <div ref={linkedinRef} className="mb-12">
          <SocialPostsTable platform="linkedin" loading={loading} onAction={handleAction} onRefresh={fetchContentCounts} />
        </div>
        
        <div ref={facebookRef} className="mb-12">
          <SocialPostsTable platform="facebook" loading={loading} onAction={handleAction} onRefresh={fetchContentCounts} />
        </div>
        
        <div ref={newslettersRef} className="mb-12">
          <NewsletterTable loading={loading} onAction={handleAction} onRefresh={fetchContentCounts} />
        </div>
        
        <div ref={videosRef} className="mb-12">
          <VideosTable loading={loading} onAction={handleAction} onRefresh={fetchContentCounts} />
        </div>
        
        {/* Action Confirmation Modal */}
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
          onConfirm={confirmModal.onConfirm}
          action={confirmModal.action}
          itemType={confirmModal.itemType}
        />
      </div>
    </div>
  );
};

export default ContentTable;