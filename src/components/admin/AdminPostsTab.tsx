import React, { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import type { BlogPost } from '../../types/portfolio';
import { pickLang, slugify, validatePostInput } from '../../utils/validation';
import { MarkdownRenderer } from '../MarkdownRenderer';

interface AdminPostsTabProps {
  posts: BlogPost[];
  getToken: () => Promise<string | null>;
  onRefresh: () => Promise<void>;
}

const emptyPostForm = {
  slug: '',
  titleUz: '',
  titleEn: '',
  excerptUz: '',
  excerptEn: '',
  contentUz: '# Sarlavha\n\nMaqola matnini **Markdown** formatida yozing.',
  contentEn: '# Heading\n\nWrite your article in **Markdown** format.',
  category: 'AI Engineering',
  coverUrl: '/src/assets/images/blog_ai_workflow_1795451003929.jpg',
  published: true,
};

export function AdminPostsTab({
  posts,
  getToken,
  onRefresh,
}: AdminPostsTabProps) {
  const { lang, t } = useLanguage();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editorLang, setEditorLang] = useState<'uz' | 'en'>('uz');
  const [form, setForm] = useState(emptyPostForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState('');

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyPostForm);
    setErrors({});
    setActionError('');
    setShowEditor(true);
  };

  const openEdit = (post: BlogPost) => {
    setEditingId(post.id);
    setForm({
      slug: post.slug,
      titleUz: post.titleUz,
      titleEn: post.titleEn,
      excerptUz: post.excerptUz,
      excerptEn: post.excerptEn,
      contentUz: post.contentUz,
      contentEn: post.contentEn,
      category: post.category,
      coverUrl: post.coverUrl,
      published: post.published,
    });
    setErrors({});
    setActionError('');
    setShowEditor(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError('');
    const computedSlug = form.slug.trim() || slugify(form.titleEn || form.titleUz);
    const payload = { ...form, slug: computedSlug };
    const validation = validatePostInput(payload);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setSaving(true);
    try {
      const token = await getToken();
      if (!token) throw new Error('Authentication expired.');
      const url = editingId
        ? `/api/admin/posts/${editingId}`
        : '/api/admin/posts';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setActionError(data.error || 'Failed to save article.');
        return;
      }
      setShowEditor(false);
      setEditingId(null);
      await onRefresh();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (post: BlogPost) => {
    setActionError('');
    try {
      const token = await getToken();
      if (!token) throw new Error('Authentication expired.');
      const res = await fetch(`/api/admin/posts/${post.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setActionError(data.error || 'Failed to delete article.');
        return;
      }
      await onRefresh();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Delete failed.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-xl font-bold text-zinc-950 dark:text-zinc-50">
          {t.admin.tabs.posts}
        </h2>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t.admin.postsTab.add}</span>
        </button>
      </div>

      {actionError ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-xs text-red-700 dark:text-red-300"
        >
          {actionError}
        </div>
      ) : null}

      {showEditor ? (
        <form
          onSubmit={handleSave}
          className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
            <h3 className="font-display text-base font-semibold text-zinc-950 dark:text-zinc-50">
              {editingId ? t.admin.postsTab.edit : t.admin.postsTab.add}
            </h3>

            <div className="flex items-center gap-3">
              <div className="inline-flex p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                <button
                  type="button"
                  onClick={() => setEditorLang('uz')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md cursor-pointer ${
                    editorLang === 'uz'
                      ? 'bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-100 shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  UZ Markdown
                </button>
                <button
                  type="button"
                  onClick={() => setEditorLang('en')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md cursor-pointer ${
                    editorLang === 'en'
                      ? 'bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-100 shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  EN Markdown
                </button>
              </div>
              <button
                type="button"
                onClick={() => setShowEditor(false)}
                className="text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 cursor-pointer"
              >
                {t.admin.postsTab.cancel}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="post-title-uz" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Maqola sarlavhasi (UZ)
              </label>
              <input
                id="post-title-uz"
                type="text"
                value={form.titleUz}
                onChange={(e) => setForm({ ...form, titleUz: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-100 focus:outline-none focus:border-blue-600 dark:focus:border-blue-400"
              />
              {errors.titleUz ? (
                <p className="text-xs text-red-600 dark:text-red-400">{errors.titleUz}</p>
              ) : null}
            </div>
            <div className="space-y-1">
              <label htmlFor="post-title-en" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Article Title (EN)
              </label>
              <input
                id="post-title-en"
                type="text"
                value={form.titleEn}
                onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-100 focus:outline-none focus:border-blue-600 dark:focus:border-blue-400"
              />
              {errors.titleEn ? (
                <p className="text-xs text-red-600 dark:text-red-400">{errors.titleEn}</p>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label htmlFor="post-slug" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Slug
              </label>
              <input
                id="post-slug"
                type="text"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="auto-generated-slug"
                className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-blue-600 dark:focus:border-blue-400"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="post-category" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Kategoriya / Category
              </label>
              <input
                id="post-category"
                type="text"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-100 focus:outline-none focus:border-blue-600 dark:focus:border-blue-400"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="post-cover" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Cover URL
              </label>
              <input
                id="post-cover"
                type="text"
                value={form.coverUrl}
                onChange={(e) => setForm({ ...form, coverUrl: e.target.value })}
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-100 focus:outline-none focus:border-blue-600 dark:focus:border-blue-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="post-excerpt-uz" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Qisqa mazmun (UZ)
              </label>
              <input
                id="post-excerpt-uz"
                type="text"
                value={form.excerptUz}
                onChange={(e) => setForm({ ...form, excerptUz: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-100 focus:outline-none focus:border-blue-600 dark:focus:border-blue-400"
              />
              {errors.excerptUz ? (
                <p className="text-xs text-red-600 dark:text-red-400">{errors.excerptUz}</p>
              ) : null}
            </div>
            <div className="space-y-1">
              <label htmlFor="post-excerpt-en" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Short Excerpt (EN)
              </label>
              <input
                id="post-excerpt-en"
                type="text"
                value={form.excerptEn}
                onChange={(e) => setForm({ ...form, excerptEn: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-100 focus:outline-none focus:border-blue-600 dark:focus:border-blue-400"
              />
              {errors.excerptEn ? (
                <p className="text-xs text-red-600 dark:text-red-400">{errors.excerptEn}</p>
              ) : null}
            </div>
          </div>

          {/* Split Markdown Editor + Live Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            <div className="space-y-2">
              <label
                htmlFor="post-markdown-editor"
                className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
              >
                {t.admin.postsTab.editorTitle} ({editorLang.toUpperCase()})
              </label>
              <textarea
                id="post-markdown-editor"
                rows={14}
                value={editorLang === 'uz' ? form.contentUz : form.contentEn}
                onChange={(e) =>
                  setForm(
                    editorLang === 'uz'
                      ? { ...form, contentUz: e.target.value }
                      : { ...form, contentEn: e.target.value }
                  )
                }
                className="w-full px-3.5 py-3 text-xs sm:text-sm font-mono rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-950 dark:text-zinc-100 focus:outline-none focus:border-blue-600 dark:focus:border-blue-400"
              />
              {errors.contentUz || errors.contentEn ? (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {errors.contentUz || errors.contentEn}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                {t.admin.postsTab.previewTitle} ({editorLang.toUpperCase()})
              </div>
              <div className="h-[348px] overflow-y-auto rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 p-5">
                <MarkdownRenderer
                  content={editorLang === 'uz' ? form.contentUz : form.contentEn}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <label className="inline-flex items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm({ ...form, published: e.target.checked })}
                className="rounded border-zinc-300 dark:border-zinc-600 accent-blue-600"
              />
              <span>{t.admin.postsTab.published}</span>
            </label>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowEditor(false)}
                className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer"
              >
                {t.admin.postsTab.cancel}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-60 cursor-pointer"
              >
                {t.admin.postsTab.save}
              </button>
            </div>
          </div>
        </form>
      ) : null}

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
          {t.admin.postsTab.empty}
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400">
                <th className="py-3 px-4 font-medium">Maqola / Article</th>
                <th className="py-3 px-4 font-medium">Kategoriya</th>
                <th className="py-3 px-4 font-medium">Holat</th>
                <th className="py-3 px-4 font-medium text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-sm">
              {posts.map((post) => {
                const title = pickLang(lang, post.titleUz, post.titleEn);
                return (
                  <tr key={post.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-zinc-950 dark:text-zinc-100">{title}</div>
                      <div className="text-xs font-mono text-zinc-400 dark:text-zinc-500">
                        {post.slug} · {post.readTimeMin}m
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-zinc-600 dark:text-zinc-400">{post.category}</td>
                    <td className="py-3 px-4 text-xs">
                      <span
                        className={
                          post.published
                            ? 'text-emerald-700 dark:text-emerald-400 font-medium'
                            : 'text-amber-700 dark:text-amber-400'
                        }
                      >
                        {post.published
                          ? t.admin.postsTab.published
                          : t.admin.postsTab.draft}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(post)}
                          aria-label={`Edit '${title}'`}
                          className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(post)}
                          aria-label={`Delete '${title}'`}
                          className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
