export interface GenerationEntry {
  id: string;
  location: string | { country: string; state: string };
  sheetLink?: string;
  leadCount: number;
  convertedLeads: number;
  industries: string[];
  companySize: string;
  additionalIndustries?: string;
  status: 'success' | 'error' | 'completed';
  results?: any;
} 