export interface FormData {
  location: string;
  country: string;
  state: string;
  industries: string[];
  companySize: string;
  additionalIndustries?: string;
}

export interface GenerationHistory {
  id: string;
  location: string;
  industries: string[];
  companySize: string;
  additionalIndustries?: string;
  timestamp: string;
  status: 'success' | 'error';
  leadsCount?: number;
  sheetLink?: string;
  sheetId?: string;
  errorMessage?: string;
}
