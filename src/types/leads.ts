export interface Lead {
  id: string;
  // Company information - camelCase and snake_case variants
  companyName: string;
  company_name?: string;
  companyAddress: string;
  company_address?: string;
  website: string;
  company_description: string;
  
  // Decision maker information - camelCase and snake_case variants
  decisionMakerName: string;
  decision_maker_name?: string;
  decisionMakerTitle: string;
  decision_maker_title?: string;
  decisionMakerEmail: string;
  decision_maker_email?: string;
  decisionMakerLinkedIn: string;
  decision_maker_linkedin?: string;
  
  // Status and other metadata
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  priority: 'low' | 'medium' | 'high';
  lastContactDate: string;
  last_contact_date?: string;
  notes: string;
  
  // Source tracking
  historyId?: string;
  history_id?: string;
  importId?: string;
  import_id?: string;
  
  // Additional properties that might be present
  [key: string]: any;
}