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
  blobUrl?: string;
}

export interface SiteConfig {
  heroTitle: string;
  heroSubtitle: string;
  conceptText: string;
  conceptImageUrl?: string;
  heroImageUrl?: string;
  logoUrl?: string;
  faviconUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  whatsappNumber: string;
  orderEmail: string;
}

export interface WorkImage {
  id: string;
  imageUrl: string;
  createdAt: number;
}
