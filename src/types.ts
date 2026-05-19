export type Category = 'Islamic' | 'Name' | 'Wedding';

export interface Template {
  id: string;
  name: string;
  category: Category;
  imageUrl: string;
  description?: string;
  price?: number;
  createdAt: number;
  storagePath?: string;
}

export interface SiteConfig {
  heroTitle: string;
  heroSubtitle: string;
  conceptText: string;
  conceptImageUrl?: string;
  heroImageUrl?: string;
  whatsappNumber: string;
  orderEmail: string;
}
