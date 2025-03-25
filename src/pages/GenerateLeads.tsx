import React from 'react';
import ProductForm from '../components/forms/ProductForm';
import { Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GenerateLeads() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-6 backdrop-blur-sm">
            <Sparkles className="h-7 w-7 text-primary" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            AI-Powered Lead Generation
          </h1>
          
          <div className="flex items-center justify-center gap-3 mb-8">
            <span className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">
              Intelligent Matching
            </span>
            <span className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">
              Real-time Results
            </span>
            <span className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">
              Qualified Leads
            </span>
          </div>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Enter your product details and let our AI find the perfect target companies
            for Paalupiste's screw pile solutions. Get detailed insights and qualified leads instantly.
          </p>
          
          <div className="mt-8 flex items-center justify-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              Smart Filtering
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              Data-Driven Matches
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              Instant Results
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-semibold text-gray-900">
                Target Market Information
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                AI Assistant Active
              </div>
            </div>
            
            <ProductForm />
          </div>
          
          <div className="mt-6 text-center text-sm text-gray-500">
            Protected by enterprise-grade security 🔒
          </div>
        </motion.div>
      </div>
    </div>
  );
}