import React from 'react';
import { Check, Clock, FileEdit, AlertTriangle, HelpCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StatusBadge({ status, size = 'md', className = '' }: StatusBadgeProps) {
  let bgColor = 'bg-gray-100';
  let textColor = 'text-gray-700';
  let borderColor = 'border-gray-200';
  let icon = <HelpCircle className="w-3 h-3" />;
  
  switch (status.toLowerCase()) {
    case 'draft':
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-700';
      borderColor = 'border-gray-200';
      icon = <FileEdit className="w-3 h-3" />;
      break;
    case 'ready':
      bgColor = 'bg-blue-50';
      textColor = 'text-blue-700';
      borderColor = 'border-blue-200';
      icon = <Clock className="w-3 h-3" />;
      break;
    case 'pending':
      bgColor = 'bg-yellow-50';
      textColor = 'text-yellow-700';
      borderColor = 'border-yellow-200';
      icon = <Clock className="w-3 h-3" />;
      break;
    case 'published':
      bgColor = 'bg-green-50';
      textColor = 'text-green-700';
      borderColor = 'border-green-200';
      icon = <Check className="w-3 h-3" />;
      break;
    case 'approved':
      bgColor = 'bg-green-50';
      textColor = 'text-green-700';
      borderColor = 'border-green-200';
      icon = <Check className="w-3 h-3" />;
      break;
    case 'error':
    case 'failed':
      bgColor = 'bg-red-50';
      textColor = 'text-red-700';
      borderColor = 'border-red-200';
      icon = <AlertTriangle className="w-3 h-3" />;
      break;
    default:
      break;
  }

  let paddingClasses = 'px-2.5 py-0.5';
  let fontSizeClass = 'text-xs';
  
  if (size === 'sm') {
    paddingClasses = 'px-2 py-0.5';
    fontSizeClass = 'text-xs';
  } else if (size === 'lg') {
    paddingClasses = 'px-3 py-1';
    fontSizeClass = 'text-sm';
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border ${paddingClasses} ${fontSizeClass} font-medium ${bgColor} ${textColor} ${borderColor} ${className}`}
    >
      {icon}
      {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
    </span>
  );
}