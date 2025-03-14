import React, { useState } from 'react';
import { Building2 } from 'lucide-react';

interface LogoProps {
  className?: string;
  variant?: 'dark' | 'light';
  showFallbackIcon?: boolean;
}

export function Logo({ className = 'h-8', variant = 'dark', showFallbackIcon = false }: LogoProps) {
  const [imageError, setImageError] = useState(false);

  if (imageError && showFallbackIcon) {
    return (
      <div className={`flex items-center justify-center bg-primary/10 rounded-lg ${className}`}>
        <Building2 className="w-5 h-5 text-primary" />
      </div>
    );
  }

  return (
    <img 
      src="https://iili.io/3BTVZPV.jpg"
      alt="Paalupiste" 
      className={className}
      onError={(e) => {
        e.currentTarget.onerror = null; // Prevent infinite loop
        setImageError(true);
      }}
    />
  );
}