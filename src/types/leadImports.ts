import { Lead } from './leads';

export interface LeadImport {
  id: string;
  name: string;
  source: string;
  sourceDetails: Record<string, any>;
  importDate: string;
  leadCount: number;
  notes?: string;
  tags: string[];
  userId: string;
  historyId?: string;
  createdAt: string;
  updatedAt: string;
  
  // Virtual properties (not stored in DB)
  leads?: Lead[];
  convertedCount?: number;
}

// Simpler version for creating new imports
export interface LeadImportCreate {
  name: string;
  source: string;
  sourceDetails?: Record<string, any>;
  notes?: string;
  tags?: string[];
  historyId?: string; 
} 