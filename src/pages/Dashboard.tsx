import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Target, ArrowRight, Database, Table } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNewsletters } from '../contexts/NewsletterContext';
import { useArticles } from '../contexts/ArticlesContext';
import { useSocialPosts } from '../contexts/SocialPostsContext';

export default function Dashboard() {
  const { user } = useAuth();
  const { newsletters } = useNewsletters();
  const { articles } = useArticles();
  const { posts: socialPosts } = useSocialPosts();
  const firstName = user?.email?.split('@')[0] || 'there';

  // Fade-in animation on mount
  useEffect(() => {
    document.querySelector('.dashboard-content')?.classList.add('opacity-100');
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="dashboard-content opacity-0 transition-opacity duration-1000">
        {/* Welcome Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome back, <span className="text-primary">{firstName}</span>
          </h1>
          <p className="text-xl text-gray-600">
            Choose a tool to get started with your next project
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Content Generation Card */}
          <Link 
            to="/app/content"
            className="group relative bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:border-primary/50 transition-all duration-300 hover:scale-105"
          >
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative">
              <div className="bg-primary/10 rounded-xl w-14 h-14 flex items-center justify-center mb-6">
                <FileText className="h-7 w-7 text-primary" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Content Generation
              </h2>
              
              <p className="text-gray-600 mb-8">
                Create compelling content for Paalupiste's screw pile solutions, from technical specifications to marketing materials.
              </p>
              
              <div className="flex items-center text-primary font-medium group-hover:translate-x-2 transition-transform duration-300">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </div>
            </div>
          </Link>

          {/* Lead Generation Card */}
          <Link 
            to="/app/leads"
            className="group relative bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:border-primary/50 transition-all duration-300 hover:scale-105"
          >
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative">
              <div className="bg-primary/10 rounded-xl w-14 h-14 flex items-center justify-center mb-6">
                <Target className="h-7 w-7 text-primary" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Lead Generation
              </h2>
              
              <p className="text-gray-600 mb-8">
                Find and connect with businesses that need Paalupiste's foundation solutions using AI-powered targeting.
              </p>
              
              <div className="flex items-center text-primary font-medium group-hover:translate-x-2 transition-transform duration-300">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </div>
            </div>
          </Link>
            
          {/* KB Files Card */}
          <Link 
            to="/app/kb"
            className="group relative bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:border-primary/50 transition-all duration-300 hover:scale-105"
          >
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative">
              <div className="bg-primary/10 rounded-xl w-14 h-14 flex items-center justify-center mb-6">
                <Database className="h-7 w-7 text-primary" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Knowledge Base
              </h2>
              
              <p className="text-gray-600 mb-8">
                Upload and manage documents to enhance AI's understanding of your business context.
              </p>
              
              <div className="flex items-center text-primary font-medium group-hover:translate-x-2 transition-transform duration-300">
                Manage Files
                <ArrowRight className="ml-2 h-5 w-5" />
              </div>
            </div>
          </Link>
        </div>

        {/* Content Table Button */}
        <div className="mt-8 max-w-4xl mx-auto">
          <Link
            to="/app/content/table"
            className="group relative w-full flex items-center justify-center px-8 py-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.01]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="flex items-center space-x-3">
              <Table className="w-5 h-5 text-primary" />
              <span className="text-lg font-medium bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                View Content Table
              </span>
            </div>
            
            <div className="absolute right-8 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300">
              <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
            <div className="text-3xl font-bold text-primary mb-2">{articles.length}</div>
            <div className="text-gray-600">Generated Leads</div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
            <div className="text-3xl font-bold text-primary mb-2">{socialPosts.length}</div>
            <div className="text-gray-600">Social Posts</div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
            <div className="text-3xl font-bold text-primary mb-2">{newsletters.length}</div>
            <div className="text-gray-600">Newsletters</div>
            <div className="mt-2 text-xs text-gray-500">
              Total Generated
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}