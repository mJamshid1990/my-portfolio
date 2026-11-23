import type { Language } from '../types/portfolio';

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function estimateReadTime(markdown: string): number {
  const words = markdown
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  if (words === 0) return 1;
  return Math.max(1, Math.ceil(words / 180));
}

export function sanitizeExternalUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('/src/assets/')) {
    return trimmed;
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
    return '';
  } catch {
    return '';
  }
}

export function pickLang(lang: Language, uz: string, en: string): string {
  if (lang === 'en') {
    return en.trim() ? en : uz;
  }
  return uz.trim() ? uz : en;
}

const UZ_MONTHS = [
  'yanvar',
  'fevral',
  'mart',
  'aprel',
  'may',
  'iyun',
  'iyul',
  'avgust',
  'sentabr',
  'oktabr',
  'noyabr',
  'dekabr',
];

const EN_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export function formatDisplayDate(dateInput: string | Date, lang: Language): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (Number.isNaN(date.getTime())) return '';
  const day = date.getUTCDate();
  const monthIdx = date.getUTCMonth();
  const year = date.getUTCFullYear();
  if (lang === 'uz') {
    return `${day}-${UZ_MONTHS[monthIdx]}, ${year}`;
  }
  return `${EN_MONTHS[monthIdx]} ${day}, ${year}`;
}

export interface ContactInput {
  senderName: string;
  senderEmail: string;
  subject: string;
  body: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContactInput(input: ContactInput): ValidationResult {
  const errors: Record<string, string> = {};
  if (!input.senderName || input.senderName.trim().length < 2) {
    errors.senderName = 'Name must be at least 2 characters.';
  }
  if (!input.senderEmail || !EMAIL_REGEX.test(input.senderEmail.trim())) {
    errors.senderEmail = 'A valid email address is required.';
  }
  if (!input.subject || input.subject.trim().length < 3) {
    errors.subject = 'Subject must be at least 3 characters.';
  }
  if (!input.body || input.body.trim().length < 10) {
    errors.body = 'Message must be at least 10 characters.';
  }
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export interface ProjectInput {
  slug: string;
  titleUz: string;
  titleEn: string;
  summaryUz: string;
  summaryEn: string;
  detailsUz: string;
  detailsEn: string;
  category: string;
  techStack: string;
  imageUrl?: string;
  liveUrl?: string;
  repoUrl?: string;
}

export function validateProjectInput(input: ProjectInput): ValidationResult {
  const errors: Record<string, string> = {};
  if (!input.titleUz?.trim()) errors.titleUz = 'Uzbek title is required.';
  if (!input.titleEn?.trim()) errors.titleEn = 'English title is required.';
  if (!input.summaryUz?.trim()) errors.summaryUz = 'Uzbek summary is required.';
  if (!input.summaryEn?.trim()) errors.summaryEn = 'English summary is required.';
  if (!input.detailsUz?.trim()) errors.detailsUz = 'Uzbek details are required.';
  if (!input.detailsEn?.trim()) errors.detailsEn = 'English details are required.';
  if (!input.category?.trim()) errors.category = 'Category is required.';
  if (!input.techStack?.trim()) errors.techStack = 'Tech stack is required.';
  const computedSlug = slugify(input.slug || input.titleEn || input.titleUz);
  if (!computedSlug) errors.slug = 'A valid URL slug is required.';
  if (input.liveUrl && !sanitizeExternalUrl(input.liveUrl)) {
    errors.liveUrl = 'Live URL must use http:// or https://.';
  }
  if (input.repoUrl && !sanitizeExternalUrl(input.repoUrl)) {
    errors.repoUrl = 'Repository URL must use http:// or https://.';
  }
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export interface PostInput {
  slug: string;
  titleUz: string;
  titleEn: string;
  excerptUz: string;
  excerptEn: string;
  contentUz: string;
  contentEn: string;
  category: string;
  coverUrl?: string;
}

export function validatePostInput(input: PostInput): ValidationResult {
  const errors: Record<string, string> = {};
  if (!input.titleUz?.trim()) errors.titleUz = 'Uzbek title is required.';
  if (!input.titleEn?.trim()) errors.titleEn = 'English title is required.';
  if (!input.excerptUz?.trim()) errors.excerptUz = 'Uzbek excerpt is required.';
  if (!input.excerptEn?.trim()) errors.excerptEn = 'English excerpt is required.';
  if (!input.contentUz?.trim()) errors.contentUz = 'Uzbek markdown content is required.';
  if (!input.contentEn?.trim()) errors.contentEn = 'English markdown content is required.';
  if (!input.category?.trim()) errors.category = 'Category is required.';
  const computedSlug = slugify(input.slug || input.titleEn || input.titleUz);
  if (!computedSlug) errors.slug = 'A valid URL slug is required.';
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
