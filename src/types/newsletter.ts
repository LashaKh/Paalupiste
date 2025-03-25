export interface Newsletter {
  id: string;
  title: string;
  content: string;
  status: 'Draft' | 'Ready' | 'Sent';
  createdAt: string;
  updatedAt: string;
} 