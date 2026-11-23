var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/apiApp.ts
import express from "express";
import * as dotenv from "dotenv";

// src/db/portfolio.ts
import { desc, eq } from "drizzle-orm";

// src/db/index.ts
import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// src/db/schema.ts
var schema_exports = {};
__export(schema_exports, {
  blogPosts: () => blogPosts,
  blogPostsRelations: () => blogPostsRelations,
  messages: () => messages,
  projects: () => projects,
  projectsRelations: () => projectsRelations,
  users: () => users,
  usersRelations: () => usersRelations
});
import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp
} from "drizzle-orm/pg-core";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  uid: text("uid").notNull().unique(),
  email: text("email").notNull(),
  displayName: text("display_name").notNull().default(""),
  role: text("role").notNull().default("viewer"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  titleUz: text("title_uz").notNull(),
  titleEn: text("title_en").notNull(),
  summaryUz: text("summary_uz").notNull(),
  summaryEn: text("summary_en").notNull(),
  detailsUz: text("details_uz").notNull(),
  detailsEn: text("details_en").notNull(),
  category: text("category").notNull(),
  techStack: text("tech_stack").notNull(),
  imageUrl: text("image_url").notNull().default(""),
  liveUrl: text("live_url").notNull().default(""),
  repoUrl: text("repo_url").notNull().default(""),
  featured: boolean("featured").notNull().default(false),
  published: boolean("published").notNull().default(true),
  authorId: integer("author_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  titleUz: text("title_uz").notNull(),
  titleEn: text("title_en").notNull(),
  excerptUz: text("excerpt_uz").notNull(),
  excerptEn: text("excerpt_en").notNull(),
  contentUz: text("content_uz").notNull(),
  contentEn: text("content_en").notNull(),
  category: text("category").notNull(),
  readTimeMin: integer("read_time_min").notNull().default(4),
  coverUrl: text("cover_url").notNull().default(""),
  published: boolean("published").notNull().default(true),
  authorId: integer("author_id").references(() => users.id, { onDelete: "set null" }),
  publishedAt: timestamp("published_at").defaultNow().notNull()
});
var messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderName: text("sender_name").notNull(),
  senderEmail: text("sender_email").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  blogPosts: many(blogPosts)
}));
var projectsRelations = relations(projects, ({ one }) => ({
  author: one(users, {
    fields: [projects.authorId],
    references: [users.id]
  })
}));
var blogPostsRelations = relations(blogPosts, ({ one }) => ({
  author: one(users, {
    fields: [blogPosts.authorId],
    references: [users.id]
  })
}));

// src/db/index.ts
var createPool = () => {
  if (!global._postgresPool) {
    const rawUrl = process.env.DATABASE_URL?.trim().replace(/^["']|["']$/g, "");
    global._postgresPool = rawUrl ? new Pool({
      connectionString: rawUrl,
      ssl: rawUrl.includes("sslmode=require") || rawUrl.includes("neon.tech") || process.env.VERCEL === "1" ? { rejectUnauthorized: false } : void 0,
      max: 5,
      connectionTimeoutMillis: 15e3
    }) : new Pool({
      host: process.env.SQL_HOST,
      user: process.env.SQL_USER,
      password: process.env.SQL_PASSWORD,
      database: process.env.SQL_DB_NAME,
      max: 10,
      connectionTimeoutMillis: 15e3
    });
    global._postgresPool.on("error", (err) => {
      console.error("Unexpected error on idle SQL pool client:", err);
    });
  }
  return global._postgresPool;
};
var pool = createPool();
var db = drizzle(pool, { schema: schema_exports });

// src/utils/validation.ts
function slugify(input) {
  return input.toLowerCase().trim().replace(/['"`]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function estimateReadTime(markdown) {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  if (words === 0) return 1;
  return Math.max(1, Math.ceil(words / 180));
}
function sanitizeExternalUrl(url) {
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("/src/assets/")) {
    return trimmed;
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
    return "";
  } catch {
    return "";
  }
}
var EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function validateContactInput(input) {
  const errors = {};
  if (!input.senderName || input.senderName.trim().length < 2) {
    errors.senderName = "Name must be at least 2 characters.";
  }
  if (!input.senderEmail || !EMAIL_REGEX.test(input.senderEmail.trim())) {
    errors.senderEmail = "A valid email address is required.";
  }
  if (!input.subject || input.subject.trim().length < 3) {
    errors.subject = "Subject must be at least 3 characters.";
  }
  if (!input.body || input.body.trim().length < 10) {
    errors.body = "Message must be at least 10 characters.";
  }
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}
function validateProjectInput(input) {
  const errors = {};
  if (!input.titleUz?.trim()) errors.titleUz = "Uzbek title is required.";
  if (!input.titleEn?.trim()) errors.titleEn = "English title is required.";
  if (!input.summaryUz?.trim()) errors.summaryUz = "Uzbek summary is required.";
  if (!input.summaryEn?.trim()) errors.summaryEn = "English summary is required.";
  if (!input.detailsUz?.trim()) errors.detailsUz = "Uzbek details are required.";
  if (!input.detailsEn?.trim()) errors.detailsEn = "English details are required.";
  if (!input.category?.trim()) errors.category = "Category is required.";
  if (!input.techStack?.trim()) errors.techStack = "Tech stack is required.";
  const computedSlug = slugify(input.slug || input.titleEn || input.titleUz);
  if (!computedSlug) errors.slug = "A valid URL slug is required.";
  if (input.liveUrl && !sanitizeExternalUrl(input.liveUrl)) {
    errors.liveUrl = "Live URL must use http:// or https://.";
  }
  if (input.repoUrl && !sanitizeExternalUrl(input.repoUrl)) {
    errors.repoUrl = "Repository URL must use http:// or https://.";
  }
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}
function validatePostInput(input) {
  const errors = {};
  if (!input.titleUz?.trim()) errors.titleUz = "Uzbek title is required.";
  if (!input.titleEn?.trim()) errors.titleEn = "English title is required.";
  if (!input.excerptUz?.trim()) errors.excerptUz = "Uzbek excerpt is required.";
  if (!input.excerptEn?.trim()) errors.excerptEn = "English excerpt is required.";
  if (!input.contentUz?.trim()) errors.contentUz = "Uzbek markdown content is required.";
  if (!input.contentEn?.trim()) errors.contentEn = "English markdown content is required.";
  if (!input.category?.trim()) errors.category = "Category is required.";
  const computedSlug = slugify(input.slug || input.titleEn || input.titleUz);
  if (!computedSlug) errors.slug = "A valid URL slug is required.";
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

// src/db/portfolio.ts
async function getPublishedProjects() {
  try {
    return await db.select().from(projects).where(eq(projects.published, true)).orderBy(desc(projects.featured), desc(projects.createdAt));
  } catch (error) {
    console.error("Database query failed in getPublishedProjects:", error);
    throw new Error("Failed to load portfolio projects.", { cause: error });
  }
}
async function getPublishedProjectBySlug(slug) {
  try {
    const rows = await db.select().from(projects).where(eq(projects.slug, slug));
    const project = rows[0];
    if (!project || !project.published) return null;
    return project;
  } catch (error) {
    console.error("Database query failed in getPublishedProjectBySlug:", error);
    throw new Error("Failed to load project details.", { cause: error });
  }
}
async function getPublishedPosts() {
  try {
    return await db.select().from(blogPosts).where(eq(blogPosts.published, true)).orderBy(desc(blogPosts.publishedAt));
  } catch (error) {
    console.error("Database query failed in getPublishedPosts:", error);
    throw new Error("Failed to load blog posts.", { cause: error });
  }
}
async function getPublishedPostBySlug(slug) {
  try {
    const rows = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    const post = rows[0];
    if (!post || !post.published) return null;
    return post;
  } catch (error) {
    console.error("Database query failed in getPublishedPostBySlug:", error);
    throw new Error("Failed to load blog article.", { cause: error });
  }
}
async function createContactMessage(payload) {
  try {
    const rows = await db.insert(messages).values({
      senderName: payload.senderName.trim(),
      senderEmail: payload.senderEmail.trim(),
      subject: payload.subject.trim(),
      body: payload.body.trim()
    }).returning();
    return rows[0];
  } catch (error) {
    console.error("Database insert failed in createContactMessage:", error);
    throw new Error("Failed to save contact message.", { cause: error });
  }
}
async function getAllProjectsAdmin() {
  try {
    return await db.select().from(projects).orderBy(desc(projects.createdAt));
  } catch (error) {
    console.error("Database query failed in getAllProjectsAdmin:", error);
    throw new Error("Failed to load admin projects.", { cause: error });
  }
}
async function createProjectAdmin(payload) {
  try {
    const cleanSlug = slugify(payload.slug || payload.titleEn || payload.titleUz);
    const rows = await db.insert(projects).values({
      slug: cleanSlug,
      titleUz: payload.titleUz.trim(),
      titleEn: payload.titleEn.trim(),
      summaryUz: payload.summaryUz.trim(),
      summaryEn: payload.summaryEn.trim(),
      detailsUz: payload.detailsUz.trim(),
      detailsEn: payload.detailsEn.trim(),
      category: payload.category.trim(),
      techStack: payload.techStack.trim(),
      imageUrl: sanitizeExternalUrl(payload.imageUrl || ""),
      liveUrl: sanitizeExternalUrl(payload.liveUrl || ""),
      repoUrl: sanitizeExternalUrl(payload.repoUrl || ""),
      featured: Boolean(payload.featured),
      published: payload.published !== false,
      authorId: payload.authorId ?? null
    }).returning();
    return rows[0];
  } catch (error) {
    console.error("Database insert failed in createProjectAdmin:", error);
    const errObj = error;
    if (errObj?.code === "23505") {
      throw new Error("DUPLICATE_SLUG", { cause: error });
    }
    throw new Error("Failed to create project.", { cause: error });
  }
}
async function updateProjectAdmin(id, payload) {
  try {
    const cleanSlug = slugify(payload.slug || payload.titleEn || payload.titleUz);
    const rows = await db.update(projects).set({
      slug: cleanSlug,
      titleUz: payload.titleUz.trim(),
      titleEn: payload.titleEn.trim(),
      summaryUz: payload.summaryUz.trim(),
      summaryEn: payload.summaryEn.trim(),
      detailsUz: payload.detailsUz.trim(),
      detailsEn: payload.detailsEn.trim(),
      category: payload.category.trim(),
      techStack: payload.techStack.trim(),
      imageUrl: sanitizeExternalUrl(payload.imageUrl || ""),
      liveUrl: sanitizeExternalUrl(payload.liveUrl || ""),
      repoUrl: sanitizeExternalUrl(payload.repoUrl || ""),
      featured: Boolean(payload.featured),
      published: Boolean(payload.published)
    }).where(eq(projects.id, id)).returning();
    return rows[0] ?? null;
  } catch (error) {
    console.error("Database update failed in updateProjectAdmin:", error);
    const errObj = error;
    if (errObj?.code === "23505") {
      throw new Error("DUPLICATE_SLUG", { cause: error });
    }
    throw new Error("Failed to update project.", { cause: error });
  }
}
async function deleteProjectAdmin(id) {
  try {
    const rows = await db.delete(projects).where(eq(projects.id, id)).returning();
    return rows[0] ?? null;
  } catch (error) {
    console.error("Database delete failed in deleteProjectAdmin:", error);
    throw new Error("Failed to delete project.", { cause: error });
  }
}
async function getAllPostsAdmin() {
  try {
    return await db.select().from(blogPosts).orderBy(desc(blogPosts.publishedAt));
  } catch (error) {
    console.error("Database query failed in getAllPostsAdmin:", error);
    throw new Error("Failed to load admin blog posts.", { cause: error });
  }
}
async function createPostAdmin(payload) {
  try {
    const cleanSlug = slugify(payload.slug || payload.titleEn || payload.titleUz);
    const readTimeMin = Math.max(
      estimateReadTime(payload.contentUz),
      estimateReadTime(payload.contentEn)
    );
    const rows = await db.insert(blogPosts).values({
      slug: cleanSlug,
      titleUz: payload.titleUz.trim(),
      titleEn: payload.titleEn.trim(),
      excerptUz: payload.excerptUz.trim(),
      excerptEn: payload.excerptEn.trim(),
      contentUz: payload.contentUz.trim(),
      contentEn: payload.contentEn.trim(),
      category: payload.category.trim(),
      readTimeMin,
      coverUrl: sanitizeExternalUrl(payload.coverUrl || ""),
      published: payload.published !== false,
      authorId: payload.authorId ?? null
    }).returning();
    return rows[0];
  } catch (error) {
    console.error("Database insert failed in createPostAdmin:", error);
    const errObj = error;
    if (errObj?.code === "23505") {
      throw new Error("DUPLICATE_SLUG", { cause: error });
    }
    throw new Error("Failed to create blog post.", { cause: error });
  }
}
async function updatePostAdmin(id, payload) {
  try {
    const cleanSlug = slugify(payload.slug || payload.titleEn || payload.titleUz);
    const readTimeMin = Math.max(
      estimateReadTime(payload.contentUz),
      estimateReadTime(payload.contentEn)
    );
    const rows = await db.update(blogPosts).set({
      slug: cleanSlug,
      titleUz: payload.titleUz.trim(),
      titleEn: payload.titleEn.trim(),
      excerptUz: payload.excerptUz.trim(),
      excerptEn: payload.excerptEn.trim(),
      contentUz: payload.contentUz.trim(),
      contentEn: payload.contentEn.trim(),
      category: payload.category.trim(),
      readTimeMin,
      coverUrl: sanitizeExternalUrl(payload.coverUrl || ""),
      published: Boolean(payload.published)
    }).where(eq(blogPosts.id, id)).returning();
    return rows[0] ?? null;
  } catch (error) {
    console.error("Database update failed in updatePostAdmin:", error);
    const errObj = error;
    if (errObj?.code === "23505") {
      throw new Error("DUPLICATE_SLUG", { cause: error });
    }
    throw new Error("Failed to update blog post.", { cause: error });
  }
}
async function deletePostAdmin(id) {
  try {
    const rows = await db.delete(blogPosts).where(eq(blogPosts.id, id)).returning();
    return rows[0] ?? null;
  } catch (error) {
    console.error("Database delete failed in deletePostAdmin:", error);
    throw new Error("Failed to delete blog post.", { cause: error });
  }
}
async function getAllMessagesAdmin() {
  try {
    return await db.select().from(messages).orderBy(desc(messages.createdAt));
  } catch (error) {
    console.error("Database query failed in getAllMessagesAdmin:", error);
    throw new Error("Failed to load messages.", { cause: error });
  }
}
async function markMessageReadAdmin(id, isRead) {
  try {
    const rows = await db.update(messages).set({ isRead }).where(eq(messages.id, id)).returning();
    return rows[0] ?? null;
  } catch (error) {
    console.error("Database update failed in markMessageReadAdmin:", error);
    throw new Error("Failed to update message status.", { cause: error });
  }
}
async function deleteMessageAdmin(id) {
  try {
    const rows = await db.delete(messages).where(eq(messages.id, id)).returning();
    return rows[0] ?? null;
  } catch (error) {
    console.error("Database delete failed in deleteMessageAdmin:", error);
    throw new Error("Failed to delete message.", { cause: error });
  }
}

// src/lib/firebase-admin.ts
import crypto from "node:crypto";

// firebase-applet-config.json
var firebase_applet_config_default = {
  projectId: "spheric-runway-d91ww",
  appId: "1:17443042825:web:97d09890f6a49cafa76ad8",
  apiKey: "AIzaSyDjwCU_APTKJdl0jEqqocnAREJiM3jAV1I",
  authDomain: "spheric-runway-d91ww.firebaseapp.com",
  storageBucket: "spheric-runway-d91ww.firebasestorage.app",
  messagingSenderId: "17443042825",
  measurementId: "",
  oAuthClientId: "17443042825-lovub6ljl5mf9lv9bmib9smlld8a0hem.apps.googleusercontent.com",
  recaptchaSiteKey: ""
};

// src/lib/firebase-admin.ts
var FIREBASE_CERTS_URL = "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";
var cachedCerts = null;
function parseMaxAgeMs(cacheControl) {
  if (!cacheControl) return 3600 * 1e3;
  const match = cacheControl.match(/max-age=(\d+)/i);
  if (!match) return 3600 * 1e3;
  const seconds = Math.max(60, Number(match[1]));
  return seconds * 1e3;
}
function decodeBase64UrlJson(segment) {
  const json = Buffer.from(segment, "base64url").toString("utf8");
  return JSON.parse(json);
}
async function getFirebasePublicCerts(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && cachedCerts && cachedCerts.expiresAtMs > now) {
    return cachedCerts.certs;
  }
  const response = await fetch(FIREBASE_CERTS_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch Firebase public certificates (${response.status}).`);
  }
  const certs = await response.json();
  const maxAgeMs = parseMaxAgeMs(response.headers.get("cache-control"));
  cachedCerts = {
    certs,
    expiresAtMs: now + maxAgeMs
  };
  return certs;
}
function verifyFirebaseJwtWithCerts(token, projectId, certs, nowSeconds = Math.floor(Date.now() / 1e3)) {
  const parts = token.split(".");
  if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) {
    throw new Error("Malformed Firebase ID token.");
  }
  const [headerB64, payloadB64, signatureB64] = parts;
  const header = decodeBase64UrlJson(headerB64);
  if (header.alg !== "RS256" || typeof header.kid !== "string" || !header.kid) {
    throw new Error("Unsupported Firebase token algorithm or missing key ID.");
  }
  const certPem = certs[header.kid];
  if (!certPem) {
    throw new Error("MISSING_KID");
  }
  const verifier = crypto.createVerify("RSA-SHA256");
  verifier.update(`${headerB64}.${payloadB64}`);
  verifier.end();
  const signatureBuf = Buffer.from(signatureB64, "base64url");
  if (!verifier.verify(certPem, signatureBuf)) {
    throw new Error("Invalid Firebase token signature.");
  }
  const payload = decodeBase64UrlJson(payloadB64);
  const expectedIssuer = `https://securetoken.google.com/${projectId}`;
  if (payload.aud !== projectId) {
    throw new Error("Firebase token audience mismatch.");
  }
  if (payload.iss !== expectedIssuer) {
    throw new Error("Firebase token issuer mismatch.");
  }
  if (typeof payload.sub !== "string" || !payload.sub || payload.sub.length > 128) {
    throw new Error("Firebase token missing valid subject.");
  }
  if (typeof payload.exp !== "number" || payload.exp <= nowSeconds) {
    throw new Error("Firebase token has expired.");
  }
  if (typeof payload.iat !== "number" || payload.iat > nowSeconds + 60) {
    throw new Error("Firebase token issued-at timestamp is invalid.");
  }
  if (typeof payload.auth_time === "number" && payload.auth_time > nowSeconds + 60) {
    throw new Error("Firebase token auth_time is invalid.");
  }
  return {
    uid: payload.sub,
    email: typeof payload.email === "string" ? payload.email : void 0,
    name: typeof payload.name === "string" ? payload.name : void 0,
    aud: payload.aud,
    iss: payload.iss,
    sub: payload.sub,
    exp: payload.exp,
    iat: payload.iat,
    auth_time: payload.auth_time
  };
}
var adminAuth = {
  async verifyIdToken(token) {
    const projectId = firebase_applet_config_default.projectId;
    const certs = await getFirebasePublicCerts(false);
    try {
      return verifyFirebaseJwtWithCerts(token, projectId, certs);
    } catch (err) {
      if (err instanceof Error && err.message === "MISSING_KID") {
        const refreshed = await getFirebasePublicCerts(true);
        return verifyFirebaseJwtWithCerts(token, projectId, refreshed);
      }
      throw err;
    }
  }
};

// src/db/users.ts
import { eq as eq2 } from "drizzle-orm";
var DEFAULT_ADMIN_EMAIL = "jamshid.mahmudov29091990@gmail.com";
function isAdminEmail(email) {
  const configuredAdmin = (process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).trim().toLowerCase();
  return email.trim().toLowerCase() === configuredAdmin;
}
async function getOrCreateUser(uid, email, displayName = "") {
  try {
    const role = isAdminEmail(email) ? "admin" : "viewer";
    const result = await db.insert(users).values({
      uid,
      email,
      displayName,
      role
    }).onConflictDoUpdate({
      target: users.uid,
      set: {
        email,
        displayName,
        role
      }
    }).returning();
    return result[0];
  } catch (error) {
    console.error("Database query failed in getOrCreateUser:", error);
    throw new Error("Failed to synchronize user account.", { cause: error });
  }
}

// src/middleware/auth.ts
var requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Missing token" });
  }
  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) {
    return res.status(401).json({ error: "Unauthorized: Empty token" });
  }
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    const email = decodedToken.email || "";
    const displayName = typeof decodedToken.name === "string" ? decodedToken.name : "";
    const syncedUser = await getOrCreateUser(
      decodedToken.uid,
      email,
      displayName
    );
    req.dbUser = syncedUser;
    next();
  } catch (error) {
    console.error("Error verifying Firebase ID token:", error);
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};
var requireAdmin = (req, res, next) => {
  if (!req.dbUser || req.dbUser.role !== "admin") {
    return res.status(403).json({
      error: "Forbidden: Admin privileges are required for this action."
    });
  }
  next();
};

// src/apiApp.ts
dotenv.config();
function parsePositiveId(rawId) {
  const parsed = Number(rawId);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
}
function createApiApp() {
  const app2 = express();
  app2.use(express.json({ limit: "1mb" }));
  app2.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });
  app2.get("/api/projects", async (_req, res) => {
    try {
      const items = await getPublishedProjects();
      res.json({ projects: items });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to load projects.";
      res.status(500).json({ error: msg });
    }
  });
  app2.get("/api/projects/:slug", async (req, res) => {
    try {
      const project = await getPublishedProjectBySlug(req.params.slug);
      if (!project) {
        return res.status(404).json({ error: "Project not found." });
      }
      res.json({ project });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to load project.";
      res.status(500).json({ error: msg });
    }
  });
  app2.get("/api/posts", async (_req, res) => {
    try {
      const items = await getPublishedPosts();
      res.json({ posts: items });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to load blog posts.";
      res.status(500).json({ error: msg });
    }
  });
  app2.get("/api/posts/:slug", async (req, res) => {
    try {
      const post = await getPublishedPostBySlug(req.params.slug);
      if (!post) {
        return res.status(404).json({ error: "Article not found." });
      }
      res.json({ post });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to load article.";
      res.status(500).json({ error: msg });
    }
  });
  app2.post("/api/messages", async (req, res) => {
    const body = req.body || {};
    const validation = validateContactInput({
      senderName: typeof body.senderName === "string" ? body.senderName : "",
      senderEmail: typeof body.senderEmail === "string" ? body.senderEmail : "",
      subject: typeof body.subject === "string" ? body.subject : "",
      body: typeof body.body === "string" ? body.body : ""
    });
    if (!validation.valid) {
      return res.status(422).json({
        error: "Validation failed.",
        details: validation.errors
      });
    }
    try {
      const saved = await createContactMessage({
        senderName: body.senderName,
        senderEmail: body.senderEmail,
        subject: body.subject,
        body: body.body
      });
      res.status(201).json({ message: saved });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to send message.";
      res.status(500).json({ error: msg });
    }
  });
  app2.get("/api/auth/me", requireAuth, (req, res) => {
    if (!req.dbUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    res.json({
      user: {
        uid: req.dbUser.uid,
        email: req.dbUser.email,
        displayName: req.dbUser.displayName,
        role: req.dbUser.role,
        isAdmin: req.dbUser.role === "admin"
      }
    });
  });
  app2.get("/api/admin/projects", requireAuth, requireAdmin, async (_req, res) => {
    try {
      const items = await getAllProjectsAdmin();
      res.json({ projects: items });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to load projects.";
      res.status(500).json({ error: msg });
    }
  });
  app2.post("/api/admin/projects", requireAuth, requireAdmin, async (req, res) => {
    const body = req.body || {};
    const validation = validateProjectInput(body);
    if (!validation.valid) {
      return res.status(422).json({
        error: "Validation failed.",
        details: validation.errors
      });
    }
    try {
      const created = await createProjectAdmin({
        ...body,
        authorId: req.dbUser?.id
      });
      res.status(201).json({ project: created });
    } catch (error) {
      if (error instanceof Error && error.message === "DUPLICATE_SLUG") {
        return res.status(409).json({ error: "A project with this slug already exists." });
      }
      const msg = error instanceof Error ? error.message : "Failed to create project.";
      res.status(500).json({ error: msg });
    }
  });
  app2.put("/api/admin/projects/:id", requireAuth, requireAdmin, async (req, res) => {
    const id = parsePositiveId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "Invalid project ID." });
    }
    const body = req.body || {};
    const validation = validateProjectInput(body);
    if (!validation.valid) {
      return res.status(422).json({
        error: "Validation failed.",
        details: validation.errors
      });
    }
    try {
      const updated = await updateProjectAdmin(id, body);
      if (!updated) {
        return res.status(404).json({ error: "Project not found." });
      }
      res.json({ project: updated });
    } catch (error) {
      if (error instanceof Error && error.message === "DUPLICATE_SLUG") {
        return res.status(409).json({ error: "A project with this slug already exists." });
      }
      const msg = error instanceof Error ? error.message : "Failed to update project.";
      res.status(500).json({ error: msg });
    }
  });
  app2.delete("/api/admin/projects/:id", requireAuth, requireAdmin, async (req, res) => {
    const id = parsePositiveId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "Invalid project ID." });
    }
    try {
      const deleted = await deleteProjectAdmin(id);
      if (!deleted) {
        return res.status(404).json({ error: "Project not found." });
      }
      res.json({ deletedId: deleted.id });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to delete project.";
      res.status(500).json({ error: msg });
    }
  });
  app2.get("/api/admin/posts", requireAuth, requireAdmin, async (_req, res) => {
    try {
      const items = await getAllPostsAdmin();
      res.json({ posts: items });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to load blog posts.";
      res.status(500).json({ error: msg });
    }
  });
  app2.post("/api/admin/posts", requireAuth, requireAdmin, async (req, res) => {
    const body = req.body || {};
    const validation = validatePostInput(body);
    if (!validation.valid) {
      return res.status(422).json({
        error: "Validation failed.",
        details: validation.errors
      });
    }
    try {
      const created = await createPostAdmin({
        ...body,
        authorId: req.dbUser?.id
      });
      res.status(201).json({ post: created });
    } catch (error) {
      if (error instanceof Error && error.message === "DUPLICATE_SLUG") {
        return res.status(409).json({ error: "An article with this slug already exists." });
      }
      const msg = error instanceof Error ? error.message : "Failed to create article.";
      res.status(500).json({ error: msg });
    }
  });
  app2.put("/api/admin/posts/:id", requireAuth, requireAdmin, async (req, res) => {
    const id = parsePositiveId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "Invalid post ID." });
    }
    const body = req.body || {};
    const validation = validatePostInput(body);
    if (!validation.valid) {
      return res.status(422).json({
        error: "Validation failed.",
        details: validation.errors
      });
    }
    try {
      const updated = await updatePostAdmin(id, body);
      if (!updated) {
        return res.status(404).json({ error: "Article not found." });
      }
      res.json({ post: updated });
    } catch (error) {
      if (error instanceof Error && error.message === "DUPLICATE_SLUG") {
        return res.status(409).json({ error: "An article with this slug already exists." });
      }
      const msg = error instanceof Error ? error.message : "Failed to update article.";
      res.status(500).json({ error: msg });
    }
  });
  app2.delete("/api/admin/posts/:id", requireAuth, requireAdmin, async (req, res) => {
    const id = parsePositiveId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "Invalid post ID." });
    }
    try {
      const deleted = await deletePostAdmin(id);
      if (!deleted) {
        return res.status(404).json({ error: "Article not found." });
      }
      res.json({ deletedId: deleted.id });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to delete article.";
      res.status(500).json({ error: msg });
    }
  });
  app2.get("/api/admin/messages", requireAuth, requireAdmin, async (_req, res) => {
    try {
      const items = await getAllMessagesAdmin();
      res.json({ messages: items });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to load messages.";
      res.status(500).json({ error: msg });
    }
  });
  app2.patch("/api/admin/messages/:id", requireAuth, requireAdmin, async (req, res) => {
    const id = parsePositiveId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "Invalid message ID." });
    }
    const isRead = Boolean(req.body?.isRead);
    try {
      const updated = await markMessageReadAdmin(id, isRead);
      if (!updated) {
        return res.status(404).json({ error: "Message not found." });
      }
      res.json({ message: updated });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to update message.";
      res.status(500).json({ error: msg });
    }
  });
  app2.delete("/api/admin/messages/:id", requireAuth, requireAdmin, async (req, res) => {
    const id = parsePositiveId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "Invalid message ID." });
    }
    try {
      const deleted = await deleteMessageAdmin(id);
      if (!deleted) {
        return res.status(404).json({ error: "Message not found." });
      }
      res.json({ deletedId: deleted.id });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to delete message.";
      res.status(500).json({ error: msg });
    }
  });
  return app2;
}

// src/vercelHandler.ts
var app = createApiApp();
var vercelHandler_default = app;
export {
  vercelHandler_default as default
};
