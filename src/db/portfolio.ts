import { desc, eq } from 'drizzle-orm';
import { db } from './index.ts';
import { blogPosts, messages, projects } from './schema.ts';
import {
  estimateReadTime,
  sanitizeExternalUrl,
  slugify,
} from '../utils/validation.ts';

export interface ProjectPayload {
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
  featured?: boolean;
  published?: boolean;
  authorId?: number;
}

export interface PostPayload {
  slug: string;
  titleUz: string;
  titleEn: string;
  excerptUz: string;
  excerptEn: string;
  contentUz: string;
  contentEn: string;
  category: string;
  coverUrl?: string;
  published?: boolean;
  authorId?: number;
}

export interface MessagePayload {
  senderName: string;
  senderEmail: string;
  subject: string;
  body: string;
}

export async function getPublishedProjects() {
  try {
    return await db
      .select()
      .from(projects)
      .where(eq(projects.published, true))
      .orderBy(desc(projects.featured), desc(projects.createdAt));
  } catch (error) {
    console.error('Database query failed in getPublishedProjects:', error);
    throw new Error('Failed to load portfolio projects.', { cause: error });
  }
}

export async function getPublishedProjectBySlug(slug: string) {
  try {
    const rows = await db
      .select()
      .from(projects)
      .where(eq(projects.slug, slug));
    const project = rows[0];
    if (!project || !project.published) return null;
    return project;
  } catch (error) {
    console.error('Database query failed in getPublishedProjectBySlug:', error);
    throw new Error('Failed to load project details.', { cause: error });
  }
}

export async function getPublishedPosts() {
  try {
    return await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.published, true))
      .orderBy(desc(blogPosts.publishedAt));
  } catch (error) {
    console.error('Database query failed in getPublishedPosts:', error);
    throw new Error('Failed to load blog posts.', { cause: error });
  }
}

export async function getPublishedPostBySlug(slug: string) {
  try {
    const rows = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.slug, slug));
    const post = rows[0];
    if (!post || !post.published) return null;
    return post;
  } catch (error) {
    console.error('Database query failed in getPublishedPostBySlug:', error);
    throw new Error('Failed to load blog article.', { cause: error });
  }
}

export async function createContactMessage(payload: MessagePayload) {
  try {
    const rows = await db
      .insert(messages)
      .values({
        senderName: payload.senderName.trim(),
        senderEmail: payload.senderEmail.trim(),
        subject: payload.subject.trim(),
        body: payload.body.trim(),
      })
      .returning();
    return rows[0];
  } catch (error) {
    console.error('Database insert failed in createContactMessage:', error);
    throw new Error('Failed to save contact message.', { cause: error });
  }
}

export async function getAllProjectsAdmin() {
  try {
    return await db
      .select()
      .from(projects)
      .orderBy(desc(projects.createdAt));
  } catch (error) {
    console.error('Database query failed in getAllProjectsAdmin:', error);
    throw new Error('Failed to load admin projects.', { cause: error });
  }
}

export async function createProjectAdmin(payload: ProjectPayload) {
  try {
    const cleanSlug = slugify(payload.slug || payload.titleEn || payload.titleUz);
    const rows = await db
      .insert(projects)
      .values({
        slug: cleanSlug,
        titleUz: payload.titleUz.trim(),
        titleEn: payload.titleEn.trim(),
        summaryUz: payload.summaryUz.trim(),
        summaryEn: payload.summaryEn.trim(),
        detailsUz: payload.detailsUz.trim(),
        detailsEn: payload.detailsEn.trim(),
        category: payload.category.trim(),
        techStack: payload.techStack.trim(),
        imageUrl: sanitizeExternalUrl(payload.imageUrl || ''),
        liveUrl: sanitizeExternalUrl(payload.liveUrl || ''),
        repoUrl: sanitizeExternalUrl(payload.repoUrl || ''),
        featured: Boolean(payload.featured),
        published: payload.published !== false,
        authorId: payload.authorId ?? null,
      })
      .returning();
    return rows[0];
  } catch (error: unknown) {
    console.error('Database insert failed in createProjectAdmin:', error);
    const errObj = error as { code?: string };
    if (errObj?.code === '23505') {
      throw new Error('DUPLICATE_SLUG', { cause: error });
    }
    throw new Error('Failed to create project.', { cause: error });
  }
}

export async function updateProjectAdmin(id: number, payload: ProjectPayload) {
  try {
    const cleanSlug = slugify(payload.slug || payload.titleEn || payload.titleUz);
    const rows = await db
      .update(projects)
      .set({
        slug: cleanSlug,
        titleUz: payload.titleUz.trim(),
        titleEn: payload.titleEn.trim(),
        summaryUz: payload.summaryUz.trim(),
        summaryEn: payload.summaryEn.trim(),
        detailsUz: payload.detailsUz.trim(),
        detailsEn: payload.detailsEn.trim(),
        category: payload.category.trim(),
        techStack: payload.techStack.trim(),
        imageUrl: sanitizeExternalUrl(payload.imageUrl || ''),
        liveUrl: sanitizeExternalUrl(payload.liveUrl || ''),
        repoUrl: sanitizeExternalUrl(payload.repoUrl || ''),
        featured: Boolean(payload.featured),
        published: Boolean(payload.published),
      })
      .where(eq(projects.id, id))
      .returning();
    return rows[0] ?? null;
  } catch (error: unknown) {
    console.error('Database update failed in updateProjectAdmin:', error);
    const errObj = error as { code?: string };
    if (errObj?.code === '23505') {
      throw new Error('DUPLICATE_SLUG', { cause: error });
    }
    throw new Error('Failed to update project.', { cause: error });
  }
}

export async function deleteProjectAdmin(id: number) {
  try {
    const rows = await db
      .delete(projects)
      .where(eq(projects.id, id))
      .returning();
    return rows[0] ?? null;
  } catch (error) {
    console.error('Database delete failed in deleteProjectAdmin:', error);
    throw new Error('Failed to delete project.', { cause: error });
  }
}

export async function getAllPostsAdmin() {
  try {
    return await db
      .select()
      .from(blogPosts)
      .orderBy(desc(blogPosts.publishedAt));
  } catch (error) {
    console.error('Database query failed in getAllPostsAdmin:', error);
    throw new Error('Failed to load admin blog posts.', { cause: error });
  }
}

export async function createPostAdmin(payload: PostPayload) {
  try {
    const cleanSlug = slugify(payload.slug || payload.titleEn || payload.titleUz);
    const readTimeMin = Math.max(
      estimateReadTime(payload.contentUz),
      estimateReadTime(payload.contentEn)
    );
    const rows = await db
      .insert(blogPosts)
      .values({
        slug: cleanSlug,
        titleUz: payload.titleUz.trim(),
        titleEn: payload.titleEn.trim(),
        excerptUz: payload.excerptUz.trim(),
        excerptEn: payload.excerptEn.trim(),
        contentUz: payload.contentUz.trim(),
        contentEn: payload.contentEn.trim(),
        category: payload.category.trim(),
        readTimeMin,
        coverUrl: sanitizeExternalUrl(payload.coverUrl || ''),
        published: payload.published !== false,
        authorId: payload.authorId ?? null,
      })
      .returning();
    return rows[0];
  } catch (error: unknown) {
    console.error('Database insert failed in createPostAdmin:', error);
    const errObj = error as { code?: string };
    if (errObj?.code === '23505') {
      throw new Error('DUPLICATE_SLUG', { cause: error });
    }
    throw new Error('Failed to create blog post.', { cause: error });
  }
}

export async function updatePostAdmin(id: number, payload: PostPayload) {
  try {
    const cleanSlug = slugify(payload.slug || payload.titleEn || payload.titleUz);
    const readTimeMin = Math.max(
      estimateReadTime(payload.contentUz),
      estimateReadTime(payload.contentEn)
    );
    const rows = await db
      .update(blogPosts)
      .set({
        slug: cleanSlug,
        titleUz: payload.titleUz.trim(),
        titleEn: payload.titleEn.trim(),
        excerptUz: payload.excerptUz.trim(),
        excerptEn: payload.excerptEn.trim(),
        contentUz: payload.contentUz.trim(),
        contentEn: payload.contentEn.trim(),
        category: payload.category.trim(),
        readTimeMin,
        coverUrl: sanitizeExternalUrl(payload.coverUrl || ''),
        published: Boolean(payload.published),
      })
      .where(eq(blogPosts.id, id))
      .returning();
    return rows[0] ?? null;
  } catch (error: unknown) {
    console.error('Database update failed in updatePostAdmin:', error);
    const errObj = error as { code?: string };
    if (errObj?.code === '23505') {
      throw new Error('DUPLICATE_SLUG', { cause: error });
    }
    throw new Error('Failed to update blog post.', { cause: error });
  }
}

export async function deletePostAdmin(id: number) {
  try {
    const rows = await db
      .delete(blogPosts)
      .where(eq(blogPosts.id, id))
      .returning();
    return rows[0] ?? null;
  } catch (error) {
    console.error('Database delete failed in deletePostAdmin:', error);
    throw new Error('Failed to delete blog post.', { cause: error });
  }
}

export async function getAllMessagesAdmin() {
  try {
    return await db
      .select()
      .from(messages)
      .orderBy(desc(messages.createdAt));
  } catch (error) {
    console.error('Database query failed in getAllMessagesAdmin:', error);
    throw new Error('Failed to load messages.', { cause: error });
  }
}

export async function markMessageReadAdmin(id: number, isRead: boolean) {
  try {
    const rows = await db
      .update(messages)
      .set({ isRead })
      .where(eq(messages.id, id))
      .returning();
    return rows[0] ?? null;
  } catch (error) {
    console.error('Database update failed in markMessageReadAdmin:', error);
    throw new Error('Failed to update message status.', { cause: error });
  }
}

export async function deleteMessageAdmin(id: number) {
  try {
    const rows = await db
      .delete(messages)
      .where(eq(messages.id, id))
      .returning();
    return rows[0] ?? null;
  } catch (error) {
    console.error('Database delete failed in deleteMessageAdmin:', error);
    throw new Error('Failed to delete message.', { cause: error });
  }
}
