export type Category = 'Islamic' | 'Name' | 'Wedding';

export interface Template {
  id: string;
  name: string;
  category: Category;
  imageUrl: string;
  description?: string;
  price?: number;
  createdAt: number;
}

export interface SiteConfig {
  heroTitle: string;
  heroSubtitle: string;
  conceptText: string;
  whatsappNumber: string;
  orderEmail: string;
}
