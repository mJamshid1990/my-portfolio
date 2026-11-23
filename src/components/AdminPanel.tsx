import { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft,
  FileText,
  FolderKanban,
  LogOut,
  Mail,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import type { BlogPost, ContactMessage, Project } from '../types/portfolio';
import { AdminMessagesTab } from './admin/AdminMessagesTab';
import { AdminPostsTab } from './admin/AdminPostsTab';
import { AdminProjectsTab } from './admin/AdminProjectsTab';

interface AdminPanelProps {
  onBackToSite: () => void;
  onPublicDataChanged: () => Promise<void>;
}

type AdminTab = 'projects' | 'posts' | 'messages';

export function AdminPanel({
  onBackToSite,
  onPublicDataChanged,
}: AdminPanelProps) {
  const { t } = useLanguage();
  const { firebaseUser, profile, loading, error, signInWithGoogle, logout, getToken } =
    useAuth();

  const [activeTab, setActiveTab] = useState<AdminTab>('projects');
  const [adminProjects, setAdminProjects] = useState<Project[]>([]);
  const [adminPosts, setAdminPosts] = useState<BlogPost[]>([]);
  const [adminMessages, setAdminMessages] = useState<ContactMessage[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  const loadAdminData = useCallback(async () => {
    if (!profile?.isAdmin) return;
    setDataLoading(true);
    try {
      const token = await getToken();
      if (!token) return;
      const headers = { Authorization: `Bearer ${token}` };
      const [projRes, postRes, msgRes] = await Promise.all([
        fetch('/api/admin/projects', { headers }),
        fetch('/api/admin/posts', { headers }),
        fetch('/api/admin/messages', { headers }),
      ]);
      if (projRes.ok) {
        const d = await projRes.json();
        setAdminProjects(d.projects ?? []);
      }
      if (postRes.ok) {
        const d = await postRes.json();
        setAdminPosts(d.posts ?? []);
      }
      if (msgRes.ok) {
        const d = await msgRes.json();
        setAdminMessages(d.messages ?? []);
      }
    } finally {
      setDataLoading(false);
    }
  }, [profile?.isAdmin, getToken]);

  useEffect(() => {
    if (profile?.isAdmin) {
      void loadAdminData();
    }
  }, [profile?.isAdmin, loadAdminData]);

  const handleRefreshAll = async () => {
    await loadAdminData();
    await onPublicDataChanged();
  };

  if (loading) {
    return (
      <main className="min-h-[75vh] flex items-center justify-center p-6">
        <div className="text-sm text-zinc-500 dark:text-zinc-400">Loading workspace...</div>
      </main>
    );
  }

  if (!firebaseUser) {
    return (
      <main className="min-h-[75vh] flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 space-y-6">
          <div className="space-y-2">
            <h1 className="font-display text-2xl font-bold text-zinc-950 dark:text-zinc-50 tracking-tight">
              {t.admin.signInTitle}
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {t.admin.signInSubtitle}
            </p>
          </div>

          {error ? (
            <div
              role="alert"
              className="rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-xs text-red-700 dark:text-red-300"
            >
              {error}
            </div>
          ) : null}

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => void signInWithGoogle()}
              className="w-full px-5 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
            >
              {t.admin.signInButton}
            </button>

            <button
              type="button"
              onClick={onBackToSite}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t.admin.backToSite}</span>
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!profile?.isAdmin) {
    return (
      <main className="min-h-[75vh] flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 space-y-5">
          <div className="flex items-center gap-3 text-amber-700 dark:text-amber-400">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <h1 className="font-display text-xl font-bold text-zinc-950 dark:text-zinc-50">
              {t.admin.unauthorizedTitle}
            </h1>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {t.admin.unauthorizedBody}
          </p>
          <div className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
            {firebaseUser.email}
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => void logout()}
              className="px-4 py-2 rounded-xl bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 cursor-pointer"
            >
              {t.admin.signOut}
            </button>
            <button
              type="button"
              onClick={onBackToSite}
              className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer"
            >
              {t.admin.backToSite}
            </button>
          </div>
        </div>
      </main>
    );
  }

  const unreadCount = adminMessages.filter((m) => !m.isRead).length;

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Navigation (240px-280px equivalent) */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-4">
            <div className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
                {t.admin.title}
              </div>
              <div className="text-xs font-mono text-zinc-700 dark:text-zinc-300 truncate mt-1">
                {profile.email}
              </div>
            </div>

            <nav aria-label="Admin sections" className="space-y-1">
              <button
                type="button"
                onClick={() => setActiveTab('projects')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === 'projects'
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                }`}
              >
                <span className="inline-flex items-center gap-2.5">
                  <FolderKanban className="w-4 h-4" />
                  <span>{t.admin.tabs.projects}</span>
                </span>
                <span className="font-mono tabular-nums text-zinc-500 dark:text-zinc-400">
                  {adminProjects.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('posts')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === 'posts'
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                }`}
              >
                <span className="inline-flex items-center gap-2.5">
                  <FileText className="w-4 h-4" />
                  <span>{t.admin.tabs.posts}</span>
                </span>
                <span className="font-mono tabular-nums text-zinc-500 dark:text-zinc-400">
                  {adminPosts.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('messages')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === 'messages'
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                }`}
              >
                <span className="inline-flex items-center gap-2.5">
                  <Mail className="w-4 h-4" />
                  <span>{t.admin.tabs.messages}</span>
                </span>
                <span className="font-mono tabular-nums text-zinc-500 dark:text-zinc-400">
                  {unreadCount}
                </span>
              </button>
            </nav>

            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
              <button
                type="button"
                onClick={onBackToSite}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t.admin.backToSite}</span>
              </button>
              <button
                type="button"
                onClick={() => void logout()}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t.admin.signOut}</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Workspace Content */}
        <section className="lg:col-span-9">
          {dataLoading ? (
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
              Loading admin records...
            </div>
          ) : activeTab === 'projects' ? (
            <AdminProjectsTab
              projects={adminProjects}
              getToken={getToken}
              onRefresh={handleRefreshAll}
            />
          ) : activeTab === 'posts' ? (
            <AdminPostsTab
              posts={adminPosts}
              getToken={getToken}
              onRefresh={handleRefreshAll}
            />
          ) : (
            <AdminMessagesTab
              messages={adminMessages}
              getToken={getToken}
              onRefresh={handleRefreshAll}
            />
          )}
        </section>
      </div>
    </main>
  );
}
