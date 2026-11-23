import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import type { BlogPost } from '../types/portfolio';
import { formatDisplayDate, pickLang } from '../utils/validation';
import { MarkdownRenderer } from './MarkdownRenderer';
import { MediaImage } from './MediaImage';

interface BlogReaderModalProps {
  post: BlogPost | null;
  onClose: () => void;
}

export function BlogReaderModal({ post, onClose }: BlogReaderModalProps) {
  const { lang, t } = useLanguage();

  useEffect(() => {
    if (!post) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [post, onClose]);

  if (!post) return null;

  const title = pickLang(lang, post.titleUz, post.titleEn);
  const content = pickLang(lang, post.contentUz, post.contentEn);
  const formattedDate = formatDisplayDate(post.publishedAt, lang);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="blog-reader-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-zinc-950/70 backdrop-blur-xs"
      onClick={onClose}
    >
      <article
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xs border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <span>{post.category}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{formattedDate}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">
              {post.readTimeMin} {t.blog.minRead}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.blog.closeReader}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 sm:p-10 space-y-8">
          <h1
            id="blog-reader-title"
            className="font-serif text-2xl sm:text-4xl font-semibold text-zinc-950 dark:text-zinc-100 tracking-tight leading-tight"
          >
            {title}
          </h1>

          {post.coverUrl ? (
            <div className="aspect-[16/9] rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800">
              <MediaImage
                src={post.coverUrl}
                alt={title}
                fallbackTitle={title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : null}

          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <MarkdownRenderer content={content} />
          </div>
        </div>
      </article>
    </div>
  );
}
