export interface ContentTableArticle {
  id: string;
  title: string;
  topic: string;
  status: 'Draft' | 'Ready' | 'Published';
  link?: string;
  created_at: string;
  keywords: string[];
  is_approved: boolean;
}