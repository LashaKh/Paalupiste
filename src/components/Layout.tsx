import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Logo } from './Logo';
import LeadSidebar from './LeadSidebar';

const SIDEBAR_WIDTH = '16rem';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Check if we're in the content generation flow
  const isContentFlow = location.pathname.includes('/content');
  
  // Check if we're in any lead-related pages to show the sidebar
  const isLeadRelated = location.pathname.includes('/leads') || 
                        location.pathname.includes('/history') ||
                        location.pathname === '/app';                        

  return (
    <div className="min-h-screen bg-white flex overflow-hidden">
      {/* Sidebar for lead-related pages */}
      <div 
        className={`fixed top-0 left-0 h-screen z-40 transform transition-transform duration-300 ease-in-out ${
          !isLeadRelated || isContentFlow ? 'translate-x-[-100%]' : 
          sidebarOpen ? 'translate-x-0' : 'translate-x-[-100%]'
        }`}
        style={{ width: SIDEBAR_WIDTH }}
      >
        <div className="h-full flex flex-col">
          <LeadSidebar 
            isOpen={sidebarOpen} 
            setIsOpen={setSidebarOpen} 
            currentPath={location.pathname}
          />
        </div>
      </div>

      {/* Toggle button */}
      {isLeadRelated && !isContentFlow && (
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`fixed top-20 z-50 bg-white border border-gray-200 rounded-full p-1 shadow-lg transition-all duration-300 ease-in-out ${
            sidebarOpen ? 'left-[253px]' : 'left-0'
          }`}
        >
          {sidebarOpen ? (
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-600" />
          )}
        </button>
      )}
      
      <div 
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isLeadRelated && !isContentFlow && sidebarOpen ? `ml-[16rem]` : 'ml-0'
        }`}
      >
        <nav className="border-b border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center">
                <Link to="/app" className="flex items-center">
                  <Logo />
                  <span className="ml-2 text-xl font-bold text-gray-900">Lead & Content Generation</span>
                </Link>
              </div>
              <div className="flex items-center">
                {!isContentFlow && (
                  <button
                    onClick={handleSignOut}
                    className="inline-flex items-center px-4 py-2 ml-4 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </button>
                )}
              </div>
            </div>
          </div>
        </nav>

        <main className={`flex-1 ${isLeadRelated && !isContentFlow ? 'ml-0' : ''}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}