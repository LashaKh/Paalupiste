export interface Lead {
  id: string;
  companyName: string;
  companyAddress: string;
  website: string;
  company_description: string;
  decisionMakerName: string;
  decisionMakerTitle: string;
  decisionMakerEmail: string;
  decisionMakerLinkedIn: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  priority: 'low' | 'medium' | 'high';
  lastContactDate: string;
  notes: string;
}