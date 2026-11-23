import express from 'express';
import * as dotenv from 'dotenv';
import {
  createContactMessage,
  createPostAdmin,
  createProjectAdmin,
  deleteMessageAdmin,
  deletePostAdmin,
  deleteProjectAdmin,
  getAllMessagesAdmin,
  getAllPostsAdmin,
  getAllProjectsAdmin,
  getPublishedPostBySlug,
  getPublishedPosts,
  getPublishedProjectBySlug,
  getPublishedProjects,
  markMessageReadAdmin,
  updatePostAdmin,
  updateProjectAdmin,
} from './db/portfolio.ts';
import { AuthRequest, requireAdmin, requireAuth } from './middleware/auth.ts';
import {
  validateContactInput,
  validatePostInput,
  validateProjectInput,
} from './utils/validation.ts';

dotenv.config();

function parsePositiveId(rawId: string): number | null {
  const parsed = Number(rawId);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
}

export function createApiApp() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Public Portfolio & Blog Endpoints
  app.get('/api/projects', async (_req, res) => {
    try {
      const items = await getPublishedProjects();
      res.json({ projects: items });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to load projects.';
      res.status(500).json({ error: msg });
    }
  });

  app.get('/api/projects/:slug', async (req, res) => {
    try {
      const project = await getPublishedProjectBySlug(req.params.slug);
      if (!project) {
        return res.status(404).json({ error: 'Project not found.' });
      }
      res.json({ project });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to load project.';
      res.status(500).json({ error: msg });
    }
  });

  app.get('/api/posts', async (_req, res) => {
    try {
      const items = await getPublishedPosts();
      res.json({ posts: items });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to load blog posts.';
      res.status(500).json({ error: msg });
    }
  });

  app.get('/api/posts/:slug', async (req, res) => {
    try {
      const post = await getPublishedPostBySlug(req.params.slug);
      if (!post) {
        return res.status(404).json({ error: 'Article not found.' });
      }
      res.json({ post });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to load article.';
      res.status(500).json({ error: msg });
    }
  });

  app.post('/api/messages', async (req, res) => {
    const body = req.body || {};
    const validation = validateContactInput({
      senderName: typeof body.senderName === 'string' ? body.senderName : '',
      senderEmail: typeof body.senderEmail === 'string' ? body.senderEmail : '',
      subject: typeof body.subject === 'string' ? body.subject : '',
      body: typeof body.body === 'string' ? body.body : '',
    });

    if (!validation.valid) {
      return res.status(422).json({
        error: 'Validation failed.',
        details: validation.errors,
      });
    }

    try {
      const saved = await createContactMessage({
        senderName: body.senderName,
        senderEmail: body.senderEmail,
        subject: body.subject,
        body: body.body,
      });
      res.status(201).json({ message: saved });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to send message.';
      res.status(500).json({ error: msg });
    }
  });

  // Authenticated User Profile
  app.get('/api/auth/me', requireAuth, (req: AuthRequest, res) => {
    if (!req.dbUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    res.json({
      user: {
        uid: req.dbUser.uid,
        email: req.dbUser.email,
        displayName: req.dbUser.displayName,
        role: req.dbUser.role,
        isAdmin: req.dbUser.role === 'admin',
      },
    });
  });

  // Admin Projects CRUD
  app.get('/api/admin/projects', requireAuth, requireAdmin, async (_req, res) => {
    try {
      const items = await getAllProjectsAdmin();
      res.json({ projects: items });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to load projects.';
      res.status(500).json({ error: msg });
    }
  });

  app.post('/api/admin/projects', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
    const body = req.body || {};
    const validation = validateProjectInput(body);
    if (!validation.valid) {
      return res.status(422).json({
        error: 'Validation failed.',
        details: validation.errors,
      });
    }

    try {
      const created = await createProjectAdmin({
        ...body,
        authorId: req.dbUser?.id,
      });
      res.status(201).json({ project: created });
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'DUPLICATE_SLUG') {
        return res.status(409).json({ error: 'A project with this slug already exists.' });
      }
      const msg = error instanceof Error ? error.message : 'Failed to create project.';
      res.status(500).json({ error: msg });
    }
  });

  app.put('/api/admin/projects/:id', requireAuth, requireAdmin, async (req, res) => {
    const id = parsePositiveId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: 'Invalid project ID.' });
    }
    const body = req.body || {};
    const validation = validateProjectInput(body);
    if (!validation.valid) {
      return res.status(422).json({
        error: 'Validation failed.',
        details: validation.errors,
      });
    }

    try {
      const updated = await updateProjectAdmin(id, body);
      if (!updated) {
        return res.status(404).json({ error: 'Project not found.' });
      }
      res.json({ project: updated });
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'DUPLICATE_SLUG') {
        return res.status(409).json({ error: 'A project with this slug already exists.' });
      }
      const msg = error instanceof Error ? error.message : 'Failed to update project.';
      res.status(500).json({ error: msg });
    }
  });

  app.delete('/api/admin/projects/:id', requireAuth, requireAdmin, async (req, res) => {
    const id = parsePositiveId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: 'Invalid project ID.' });
    }
    try {
      const deleted = await deleteProjectAdmin(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Project not found.' });
      }
      res.json({ deletedId: deleted.id });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to delete project.';
      res.status(500).json({ error: msg });
    }
  });

  // Admin Blog Posts CRUD
  app.get('/api/admin/posts', requireAuth, requireAdmin, async (_req, res) => {
    try {
      const items = await getAllPostsAdmin();
      res.json({ posts: items });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to load blog posts.';
      res.status(500).json({ error: msg });
    }
  });

  app.post('/api/admin/posts', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
    const body = req.body || {};
    const validation = validatePostInput(body);
    if (!validation.valid) {
      return res.status(422).json({
        error: 'Validation failed.',
        details: validation.errors,
      });
    }

    try {
      const created = await createPostAdmin({
        ...body,
        authorId: req.dbUser?.id,
      });
      res.status(201).json({ post: created });
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'DUPLICATE_SLUG') {
        return res.status(409).json({ error: 'An article with this slug already exists.' });
      }
      const msg = error instanceof Error ? error.message : 'Failed to create article.';
      res.status(500).json({ error: msg });
    }
  });

  app.put('/api/admin/posts/:id', requireAuth, requireAdmin, async (req, res) => {
    const id = parsePositiveId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: 'Invalid post ID.' });
    }
    const body = req.body || {};
    const validation = validatePostInput(body);
    if (!validation.valid) {
      return res.status(422).json({
        error: 'Validation failed.',
        details: validation.errors,
      });
    }

    try {
      const updated = await updatePostAdmin(id, body);
      if (!updated) {
        return res.status(404).json({ error: 'Article not found.' });
      }
      res.json({ post: updated });
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'DUPLICATE_SLUG') {
        return res.status(409).json({ error: 'An article with this slug already exists.' });
      }
      const msg = error instanceof Error ? error.message : 'Failed to update article.';
      res.status(500).json({ error: msg });
    }
  });

  app.delete('/api/admin/posts/:id', requireAuth, requireAdmin, async (req, res) => {
    const id = parsePositiveId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: 'Invalid post ID.' });
    }
    try {
      const deleted = await deletePostAdmin(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Article not found.' });
      }
      res.json({ deletedId: deleted.id });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to delete article.';
      res.status(500).json({ error: msg });
    }
  });

  // Admin Contact Messages
  app.get('/api/admin/messages', requireAuth, requireAdmin, async (_req, res) => {
    try {
      const items = await getAllMessagesAdmin();
      res.json({ messages: items });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to load messages.';
      res.status(500).json({ error: msg });
    }
  });

  app.patch('/api/admin/messages/:id', requireAuth, requireAdmin, async (req, res) => {
    const id = parsePositiveId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: 'Invalid message ID.' });
    }
    const isRead = Boolean(req.body?.isRead);
    try {
      const updated = await markMessageReadAdmin(id, isRead);
      if (!updated) {
        return res.status(404).json({ error: 'Message not found.' });
      }
      res.json({ message: updated });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to update message.';
      res.status(500).json({ error: msg });
    }
  });

  app.delete('/api/admin/messages/:id', requireAuth, requireAdmin, async (req, res) => {
    const id = parsePositiveId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: 'Invalid message ID.' });
    }
    try {
      const deleted = await deleteMessageAdmin(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Message not found.' });
      }
      res.json({ deletedId: deleted.id });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to delete message.';
      res.status(500).json({ error: msg });
    }
  });

  return app;
}
