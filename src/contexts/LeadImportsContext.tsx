import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useLeadImports } from '../hooks/useLeadImports';
import { LeadImport } from '../types/leadImports';

interface LeadImportsContextType {
  imports: LeadImport[];
  loading: boolean;
  fetchImports: () => Promise<void>;
  createImport: Function;
  updateImport: Function;
  deleteImport: Function;
  importLeadsToImport: Function;
}

const LeadImportsContext = createContext<LeadImportsContextType | undefined>(undefined);

export const useLeadImportsContext = () => {
  const context = useContext(LeadImportsContext);
  if (context === undefined) {
    throw new Error('useLeadImportsContext must be used within a LeadImportsProvider');
  }
  return context;
};

interface LeadImportsProviderProps {
  children: ReactNode;
}

export const LeadImportsProvider: React.FC<LeadImportsProviderProps> = ({ children }) => {
  const {
    imports,
    loading,
    fetchImports,
    createImport,
    updateImport,
    deleteImport,
    importLeadsToImport
  } = useLeadImports();

  // Fetch imports on initial load
  useEffect(() => {
    fetchImports();
  }, []);

  return (
    <LeadImportsContext.Provider
      value={{
        imports,
        loading,
        fetchImports,
        createImport,
        updateImport,
        deleteImport,
        importLeadsToImport
      }}
    >
      {children}
    </LeadImportsContext.Provider>
  );
}; 