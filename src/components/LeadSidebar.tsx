import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Table2, 
  History, 
  Home,
  Settings,
  BarChart3,
  Users,
  Plus
} from 'lucide-react';

interface LeadSidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  currentPath: string;
}

const LeadSidebar: React.FC<LeadSidebarProps> = ({ isOpen, setIsOpen, currentPath }) => {
  // Define navigation items
  const navItems = [
    { 
      path: '/app', 
      icon: <Home className="w-5 h-5" />, 
      label: 'Dashboard',
      exact: true
    },
    { 
      path: '/app/leads', 
      icon: <Sparkles className="w-5 h-5" />, 
      label: 'Generate',
      exact: true
    },
    { 
      path: '/app/leads/table', 
      icon: <Table2 className="w-5 h-5" />, 
      label: 'Leads Table',
    },
    { 
      path: '/app/history', 
      icon: <History className="w-5 h-5" />, 
      label: 'Lead-Gen History',
    },
    { 
      path: '/app/leads/analytics', 
      icon: <BarChart3 className="w-5 h-5" />, 
      label: 'Analytics',
      soon: true
    },
    { 
      path: '/app/leads/contacts', 
      icon: <Users className="w-5 h-5" />, 
      label: 'Contacts',
      soon: true
    },
  ];

  // Check if path is active
  const isActive = (path: string, exact = false) => {
    if (exact) return currentPath === path;
    return currentPath.startsWith(path);
  };

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      {/* Sidebar Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Lead Generation</h2>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.soon ? '#' : item.path}
            className={`
              group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg
              transition-all duration-200 relative
              ${isActive(item.path, item.exact) 
                ? 'text-primary bg-primary/5 border-l-4 border-primary pl-2' 
                : 'text-gray-700 hover:bg-gray-100'}
              ${item.soon ? 'opacity-60 cursor-not-allowed' : ''}
            `}
            onClick={e => item.soon && e.preventDefault()}
          >
            <span className={`${isActive(item.path, item.exact) ? 'text-primary' : 'text-gray-500 group-hover:text-primary'} mr-3`}>
              {item.icon}
            </span>
            {item.label}
            {item.soon && (
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                Soon
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* Sidebar Actions */}
      <div className="p-4 border-t border-gray-200">
        <Link
          to="/app/leads"
          className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Generate Leads
        </Link>
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Settings className="h-4 w-4 text-primary" />
            </div>
          </div>
          <div className="ml-3">
            <p className="text-xs font-medium text-gray-700">Lead Generation Settings</p>
            <Link to="/app/settings" className="text-xs text-primary hover:underline">
              Configure
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadSidebar;