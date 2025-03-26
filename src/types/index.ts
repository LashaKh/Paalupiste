export interface FormData {
  location: {
    country: string;
    state: string;
  };
  industries: string[];
  companySize: string;
  additionalIndustries?: string;
  sheetLink?: string;
}

export interface GenerationHistory {
  id: string;
  location: {
    country: string;
    state: string;
  } | string;
  industries: string[];
  companySize: string;
  additionalIndustries?: string;
  timestamp: string;
  status: 'success' | 'error' | 'completed';
  leadsCount?: number;
  sheetLink?: string;
  sheetId?: string;
  errorMessage?: string;
  productName?: string;
  productDescription?: string;
  formData?: FormData;
  results?: {
    convertedLeads?: number;
    [key: string]: any;
  };
  enrichmentStatus?: 'not_started' | 'in_progress' | 'completed';
  enrichmentTimestamp?: string;
  enrichmentCount?: number;
}

export interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  sheetLink?: string;
}

export interface GenerationHistoryContextType {
  history: GenerationHistory[];
  addToHistory: (entry: GenerationHistory) => void;
  addGeneration: (entry: GenerationHistory) => void;
  clearHistory: () => void;
}
