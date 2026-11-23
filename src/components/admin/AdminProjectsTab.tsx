import React, { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import type { Project } from '../../types/portfolio';
import { pickLang, slugify, validateProjectInput } from '../../utils/validation';

interface AdminProjectsTabProps {
  projects: Project[];
  getToken: () => Promise<string | null>;
  onRefresh: () => Promise<void>;
}

const emptyForm = {
  slug: '',
  titleUz: '',
  titleEn: '',
  summaryUz: '',
  summaryEn: '',
  detailsUz: '',
  detailsEn: '',
  category: 'Web App',
  techStack: 'React · FastAPI · PostgreSQL',
  imageUrl: '/src/assets/images/project_api_architecture_1795451002577.jpg',
  liveUrl: '',
  repoUrl: '',
  featured: false,
  published: true,
};

export function AdminProjectsTab({
  projects,
  getToken,
  onRefresh,
}: AdminProjectsTabProps) {
  const { lang, t } = useLanguage();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState('');

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
    setActionError('');
    setShowForm(true);
  };

  const openEdit = (p: Project) => {
    setEditingId(p.id);
    setForm({
      slug: p.slug,
      titleUz: p.titleUz,
      titleEn: p.titleEn,
      summaryUz: p.summaryUz,
      summaryEn: p.summaryEn,
      detailsUz: p.detailsUz,
      detailsEn: p.detailsEn,
      category: p.category,
      techStack: p.techStack,
      imageUrl: p.imageUrl,
      liveUrl: p.liveUrl,
      repoUrl: p.repoUrl,
      featured: p.featured,
      published: p.published,
    });
    setErrors({});
    setActionError('');
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError('');
    const computedSlug = form.slug.trim() || slugify(form.titleEn || form.titleUz);
    const payload = { ...form, slug: computedSlug };
    const validation = validateProjectInput(payload);
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
        ? `/api/admin/projects/${editingId}`
        : '/api/admin/projects';
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
        setActionError(data.error || 'Failed to save project.');
        return;
      }
      setShowForm(false);
      setEditingId(null);
      await onRefresh();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p: Project) => {
    setActionError('');
    try {
      const token = await getToken();
      if (!token) throw new Error('Authentication expired.');
      const res = await fetch(`/api/admin/projects/${p.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setActionError(data.error || 'Failed to delete project.');
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
          {t.admin.tabs.projects}
        </h2>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t.admin.projectsTab.add}</span>
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

      {showForm ? (
        <form
          onSubmit={handleSave}
          className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-5"
        >
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
            <h3 className="font-display text-base font-semibold text-zinc-950 dark:text-zinc-50">
              {editingId ? t.admin.projectsTab.edit : t.admin.projectsTab.add}
            </h3>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 cursor-pointer"
            >
              {t.admin.projectsTab.cancel}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="proj-title-uz" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Sarlavha (UZ)
              </label>
              <input
                id="proj-title-uz"
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
              <label htmlFor="proj-title-en" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Title (EN)
              </label>
              <input
                id="proj-title-en"
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
              <label htmlFor="proj-slug" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Slug
              </label>
              <input
                id="proj-slug"
                type="text"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="auto-generated-slug"
                className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-blue-600 dark:focus:border-blue-400"
              />
              {errors.slug ? <p className="text-xs text-red-600 dark:text-red-400">{errors.slug}</p> : null}
            </div>
            <div className="space-y-1">
              <label htmlFor="proj-category" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Kategoriya / Category
              </label>
              <input
                id="proj-category"
                type="text"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-100 focus:outline-none focus:border-blue-600 dark:focus:border-blue-400"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="proj-stack" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Tech Stack
              </label>
              <input
                id="proj-stack"
                type="text"
                value={form.techStack}
                onChange={(e) => setForm({ ...form, techStack: e.target.value })}
                className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-100 focus:outline-none focus:border-blue-600 dark:focus:border-blue-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="proj-summary-uz" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Qisqa tavsif (UZ)
              </label>
              <textarea
                id="proj-summary-uz"
                rows={2}
                value={form.summaryUz}
                onChange={(e) => setForm({ ...form, summaryUz: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-100 focus:outline-none focus:border-blue-600 dark:focus:border-blue-400"
              />
              {errors.summaryUz ? (
                <p className="text-xs text-red-600 dark:text-red-400">{errors.summaryUz}</p>
              ) : null}
            </div>
            <div className="space-y-1">
              <label htmlFor="proj-summary-en" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Short Summary (EN)
              </label>
              <textarea
                id="proj-summary-en"
                rows={2}
                value={form.summaryEn}
                onChange={(e) => setForm({ ...form, summaryEn: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-100 focus:outline-none focus:border-blue-600 dark:focus:border-blue-400"
              />
              {errors.summaryEn ? (
                <p className="text-xs text-red-600 dark:text-red-400">{errors.summaryEn}</p>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="proj-details-uz" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Batafsil matn (UZ)
              </label>
              <textarea
                id="proj-details-uz"
                rows={4}
                value={form.detailsUz}
                onChange={(e) => setForm({ ...form, detailsUz: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-100 focus:outline-none focus:border-blue-600 dark:focus:border-blue-400"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="proj-details-en" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Full Details (EN)
              </label>
              <textarea
                id="proj-details-en"
                rows={4}
                value={form.detailsEn}
                onChange={(e) => setForm({ ...form, detailsEn: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-100 focus:outline-none focus:border-blue-600 dark:focus:border-blue-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label htmlFor="proj-img" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Image URL
              </label>
              <input
                id="proj-img"
                type="text"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-100 focus:outline-none focus:border-blue-600 dark:focus:border-blue-400"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="proj-live" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Live URL
              </label>
              <input
                id="proj-live"
                type="url"
                value={form.liveUrl}
                onChange={(e) => setForm({ ...form, liveUrl: e.target.value })}
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-100 focus:outline-none focus:border-blue-600 dark:focus:border-blue-400"
              />
              {errors.liveUrl ? (
                <p className="text-xs text-red-600 dark:text-red-400">{errors.liveUrl}</p>
              ) : null}
            </div>
            <div className="space-y-1">
              <label htmlFor="proj-repo" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                GitHub URL
              </label>
              <input
                id="proj-repo"
                type="url"
                value={form.repoUrl}
                onChange={(e) => setForm({ ...form, repoUrl: e.target.value })}
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-100 focus:outline-none focus:border-blue-600 dark:focus:border-blue-400"
              />
              {errors.repoUrl ? (
                <p className="text-xs text-red-600 dark:text-red-400">{errors.repoUrl}</p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-2">
            <label className="inline-flex items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                className="rounded border-zinc-300 dark:border-zinc-600 accent-blue-600"
              />
              <span>{t.admin.projectsTab.featured}</span>
            </label>
            <label className="inline-flex items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm({ ...form, published: e.target.checked })}
                className="rounded border-zinc-300 dark:border-zinc-600 accent-blue-600"
              />
              <span>{t.admin.projectsTab.published}</span>
            </label>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-60 cursor-pointer"
            >
              {t.admin.projectsTab.save}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer"
            >
              {t.admin.projectsTab.cancel}
            </button>
          </div>
        </form>
      ) : null}

      {projects.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
          {t.admin.projectsTab.empty}
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400">
                <th className="py-3 px-4 font-medium">Loyiha / Project</th>
                <th className="py-3 px-4 font-medium">Kategoriya</th>
                <th className="py-3 px-4 font-medium">Holat</th>
                <th className="py-3 px-4 font-medium text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-sm">
              {projects.map((p) => {
                const title = pickLang(lang, p.titleUz, p.titleEn);
                return (
                  <tr key={p.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-zinc-950 dark:text-zinc-100">{title}</div>
                      <div className="text-xs font-mono text-zinc-400 dark:text-zinc-500">{p.slug}</div>
                    </td>
                    <td className="py-3 px-4 text-xs text-zinc-600 dark:text-zinc-400">{p.category}</td>
                    <td className="py-3 px-4 text-xs">
                      <span
                        className={
                          p.published
                            ? 'text-emerald-700 dark:text-emerald-400 font-medium'
                            : 'text-amber-700 dark:text-amber-400'
                        }
                      >
                        {p.published
                          ? t.admin.projectsTab.published
                          : t.admin.projectsTab.draft}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(p)}
                          aria-label={`Edit '${title}'`}
                          className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(p)}
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
