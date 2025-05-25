import React, { useState } from 'react';
import ProductForm from '../components/forms/ProductForm';
import { Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GenerateLeads() {
  const [leadGenerationMode, setLeadGenerationMode] = useState<'broad' | 'sniper'>('broad');

  const webhookUrls = {
    broad: 'https://hook.eu2.make.com/8xqjvc4pyrhei7f1nc3w6364sqahzkj5',
    sniper: 'https://hook.eu2.make.com/wh3w87fc6ews112in8wgyb8o7jiel226',
  };

  const webhookUrl = webhookUrls[leadGenerationMode];

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
            
            {/* Lead Generation Mode Selection */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-3 text-center">Select Lead Generation Mode:</h3>
              <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto"> {/* Changed flex to grid for better layout with descriptions */}
                <div className="flex flex-col"> {/* Wrapper div for Broad mode and its description */}
                <label className="flex items-center space-x-2 p-3 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 cursor-pointer transition-colors duration-150">
                  <input
                    type="radio"
                    name="leadGenerationMode"
                    value="broad"
                    checked={leadGenerationMode === 'broad'}
                    onChange={() => setLeadGenerationMode('broad')}
                    className="form-radio h-5 w-5 text-primary focus:ring-primary border-gray-300"
                  />
                  <span className="text-gray-700 font-medium">Broad Lead Generation</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1 pl-7 pr-2">Our AI identifies the closest business industries to your selected ones. It expands the search to up to 10 industries (your selections + AI-identified similar ones) to maximize lead collection.</p>
                </div>
                <div className="flex flex-col">
                  <label className="flex items-center space-x-2 p-3 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 cursor-pointer transition-colors duration-150">
                  <input
                    type="radio"
                    name="leadGenerationMode"
                    value="sniper"
                    checked={leadGenerationMode === 'sniper'}
                    onChange={() => setLeadGenerationMode('sniper')}
                    className="form-radio h-5 w-5 text-primary focus:ring-primary border-gray-300"
                  />
                  <span className="text-gray-700 font-medium">Sniper Lead Generation</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1 pl-7 pr-2">The AI focuses exclusively on the industries you select, providing a targeted lead search.</p>
                </div>
              </div>
            </div>

            <ProductForm webhookUrl={webhookUrl} />
          </div>
          
          <div className="mt-6 text-center text-sm text-gray-500">
            Protected by enterprise-grade security 🔒
          </div>
        </motion.div>
      </div>
    </div>
  );
}