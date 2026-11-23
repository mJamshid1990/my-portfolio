import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  displayName: text('display_name').notNull().default(''),
  role: text('role').notNull().default('viewer'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  titleUz: text('title_uz').notNull(),
  titleEn: text('title_en').notNull(),
  summaryUz: text('summary_uz').notNull(),
  summaryEn: text('summary_en').notNull(),
  detailsUz: text('details_uz').notNull(),
  detailsEn: text('details_en').notNull(),
  category: text('category').notNull(),
  techStack: text('tech_stack').notNull(),
  imageUrl: text('image_url').notNull().default(''),
  liveUrl: text('live_url').notNull().default(''),
  repoUrl: text('repo_url').notNull().default(''),
  featured: boolean('featured').notNull().default(false),
  published: boolean('published').notNull().default(true),
  authorId: integer('author_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const blogPosts = pgTable('blog_posts', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  titleUz: text('title_uz').notNull(),
  titleEn: text('title_en').notNull(),
  excerptUz: text('excerpt_uz').notNull(),
  excerptEn: text('excerpt_en').notNull(),
  contentUz: text('content_uz').notNull(),
  contentEn: text('content_en').notNull(),
  category: text('category').notNull(),
  readTimeMin: integer('read_time_min').notNull().default(4),
  coverUrl: text('cover_url').notNull().default(''),
  published: boolean('published').notNull().default(true),
  authorId: integer('author_id').references(() => users.id, { onDelete: 'set null' }),
  publishedAt: timestamp('published_at').defaultNow().notNull(),
});

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  senderName: text('sender_name').notNull(),
  senderEmail: text('sender_email').notNull(),
  subject: text('subject').notNull(),
  body: text('body').notNull(),
  isRead: boolean('is_read').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  blogPosts: many(blogPosts),
}));

export const projectsRelations = relations(projects, ({ one }) => ({
  author: one(users, {
    fields: [projects.authorId],
    references: [users.id],
  }),
}));

export const blogPostsRelations = relations(blogPosts, ({ one }) => ({
  author: one(users, {
    fields: [blogPosts.authorId],
    references: [users.id],
  }),
}));
