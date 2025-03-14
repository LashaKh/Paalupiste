import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Mail, Share2, ArrowRight, FileType, Video } from 'lucide-react';

export default function ContentGeneration() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-xl mb-4">
          <FileText className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Content Generation
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Create compelling content for Paalupiste's screw pile solutions using AI-powered tools
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 max-w-6xl mx-auto">
        {/* Article Generation */}
        <Link 
          to="/app/content/article"
          className="group relative bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:border-primary/50 transition-all duration-300 hover:scale-105"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="relative">
            <div className="bg-primary/10 rounded-xl w-14 h-14 flex items-center justify-center mb-6">
              <FileText className="h-7 w-7 text-primary" />
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Article Generation
            </h2>
            
            <p className="text-gray-600 mb-8">
              Create in-depth articles about screw pile technology, applications, and benefits.
            </p>
            
            <div className="flex items-center text-primary font-medium group-hover:translate-x-2 transition-transform duration-300">
              Create Article
              <ArrowRight className="ml-2 h-5 w-5" />
            </div>
          </div>
        </Link>

        {/* Newsletter Generation */}
        <Link 
          to="/app/content/newsletter"
          className="group relative bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:border-primary/50 transition-all duration-300 hover:scale-105"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="relative">
            <div className="bg-primary/10 rounded-xl w-14 h-14 flex items-center justify-center mb-6">
              <Mail className="h-7 w-7 text-primary" />
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Newsletter Generation
            </h2>
            
            <p className="text-gray-600 mb-8">
              Design engaging newsletters to keep clients updated on latest developments.
            </p>
            
            <div className="flex items-center text-primary font-medium group-hover:translate-x-2 transition-transform duration-300">
              Create Newsletter
              <ArrowRight className="ml-2 h-5 w-5" />
            </div>
          </div>
        </Link>

        {/* Social Media Post Generation */}
        <Link 
          to="/app/content/social"
          className="group relative bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:border-primary/50 transition-all duration-300 hover:scale-105"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="relative">
            <div className="bg-primary/10 rounded-xl w-14 h-14 flex items-center justify-center mb-6">
              <Share2 className="h-7 w-7 text-primary" />
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Social Media Posts
            </h2>
            
            <p className="text-gray-600 mb-8">
              Generate engaging posts for LinkedIn and Facebook to boost social presence.
            </p>
            
            <div className="flex items-center text-primary font-medium group-hover:translate-x-2 transition-transform duration-300">
              Create Posts
              <ArrowRight className="ml-2 h-5 w-5" />
            </div>
          </div>
        </Link>

        {/* Brochure Generation */}
        <Link 
          to="/app/content/brochure"
          className="group relative bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:border-primary/50 transition-all duration-300 hover:scale-105"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="relative">
            <div className="bg-primary/10 rounded-xl w-14 h-14 flex items-center justify-center mb-6">
              <FileType className="h-7 w-7 text-primary" />
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Brochure Generation
            </h2>
            
            <p className="text-gray-600 mb-8">
              Create professional brochures showcasing Paalupiste's solutions and benefits.
            </p>
            
            <div className="flex items-center text-primary font-medium group-hover:translate-x-2 transition-transform duration-300">
              Create Brochure
              <ArrowRight className="ml-2 h-5 w-5" />
            </div>
          </div>
        </Link>

        {/* Video Generation - NEW */}
        <Link 
          to="/app/content/video"
          className="group relative bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:border-primary/50 transition-all duration-300 hover:scale-105"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="relative">
            <div className="bg-primary/10 rounded-xl w-14 h-14 flex items-center justify-center mb-6">
              <Video className="h-7 w-7 text-primary" />
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Video Generation
            </h2>
            
            <p className="text-gray-600 mb-8">
              Create professional videos with AI-generated scripts and voice-overs for your products.
            </p>
            
            <div className="flex items-center text-primary font-medium group-hover:translate-x-2 transition-transform duration-300">
              Create Video
              <ArrowRight className="ml-2 h-5 w-5" />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}