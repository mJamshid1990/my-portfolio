export type Language = 'uz' | 'en';

export interface Project {
  id: number;
  slug: string;
  titleUz: string;
  titleEn: string;
  summaryUz: string;
  summaryEn: string;
  detailsUz: string;
  detailsEn: string;
  category: string;
  techStack: string;
  imageUrl: string;
  liveUrl: string;
  repoUrl: string;
  featured: boolean;
  published: boolean;
  createdAt: string;
}

export interface BlogPost {
  id: number;
  slug: string;
  titleUz: string;
  titleEn: string;
  excerptUz: string;
  excerptEn: string;
  contentUz: string;
  contentEn: string;
  category: string;
  readTimeMin: number;
  coverUrl: string;
  published: boolean;
  publishedAt: string;
}

export interface ContactMessage {
  id: number;
  senderName: string;
  senderEmail: string;
  subject: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuthProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'viewer';
  isAdmin: boolean;
}
