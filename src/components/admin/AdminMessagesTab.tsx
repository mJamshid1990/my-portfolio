import { useState } from 'react';
import { Check, MailOpen, Trash2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import type { ContactMessage } from '../../types/portfolio';
import { formatDisplayDate } from '../../utils/validation';

interface AdminMessagesTabProps {
  messages: ContactMessage[];
  getToken: () => Promise<string | null>;
  onRefresh: () => Promise<void>;
}

export function AdminMessagesTab({
  messages,
  getToken,
  onRefresh,
}: AdminMessagesTabProps) {
  const { lang, t } = useLanguage();
  const [actionError, setActionError] = useState('');

  const unreadCount = messages.filter((m) => !m.isRead).length;

  const toggleRead = async (msg: ContactMessage) => {
    setActionError('');
    try {
      const token = await getToken();
      if (!token) throw new Error('Authentication expired.');
      const res = await fetch(`/api/admin/messages/${msg.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isRead: !msg.isRead }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setActionError(data.error || 'Failed to update message.');
        return;
      }
      await onRefresh();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Update failed.');
    }
  };

  const deleteMessage = async (msg: ContactMessage) => {
    setActionError('');
    try {
      const token = await getToken();
      if (!token) throw new Error('Authentication expired.');
      const res = await fetch(`/api/admin/messages/${msg.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setActionError(data.error || 'Failed to delete message.');
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
        <div className="flex items-baseline gap-3">
          <h2 className="font-display text-xl font-bold text-zinc-950 dark:text-zinc-50">
            {t.admin.tabs.messages}
          </h2>
          <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 tabular-nums">
            {unreadCount} {t.admin.messagesTab.unreadCount}
          </span>
        </div>
      </div>

      {actionError ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-xs text-red-700 dark:text-red-300"
        >
          {actionError}
        </div>
      ) : null}

      {messages.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
          {t.admin.messagesTab.empty}
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => {
            const dateStr = formatDisplayDate(msg.createdAt, lang);

            return (
              <div
                key={msg.id}
                className={`rounded-2xl border p-6 space-y-4 ${
                  msg.isRead
                    ? 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900'
                    : 'border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-950/30'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                      <span className="font-semibold text-zinc-950 dark:text-zinc-100 text-sm">
                        {msg.senderName}
                      </span>
                      <span aria-hidden="true">·</span>
                      <a
                        href={`mailto:${msg.senderEmail}`}
                        className="font-mono text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {msg.senderEmail}
                      </a>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{dateStr}</span>
                    </div>
                    <h3 className="font-display text-base font-semibold text-zinc-950 dark:text-zinc-100">
                      {msg.subject}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => void toggleRead(msg)}
                      aria-label={`${
                        msg.isRead
                          ? t.admin.messagesTab.markUnread
                          : t.admin.messagesTab.markRead
                      } '${msg.subject}'`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer"
                    >
                      {msg.isRead ? (
                        <MailOpen className="w-3.5 h-3.5" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {msg.isRead
                          ? t.admin.messagesTab.markUnread
                          : t.admin.messagesTab.markRead}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => void deleteMessage(msg)}
                      aria-label={`Delete message '${msg.subject}'`}
                      className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                  {msg.body}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
