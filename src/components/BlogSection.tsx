import { useMemo, useState } from 'react';
import { ArrowRight, Search } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import type { BlogPost } from '../types/portfolio';
import { pickLang, formatDisplayDate } from '../utils/validation';
import { MediaImage } from './MediaImage';

interface BlogSectionProps {
  posts: BlogPost[];
  loading: boolean;
  error: string | null;
  onSelectPost: (post: BlogPost) => void;
}

export function BlogSection({
  posts,
  loading,
  error,
  onSelectPost,
}: BlogSectionProps) {
  const { lang, t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [query, setQuery] = useState('');

  const categories = useMemo(() => {
    const unique = Array.from(new Set(posts.map((p) => p.category))).filter(Boolean);
    return ['ALL', ...unique];
  }, [posts]);

  const filteredPosts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((post) => {
      const catMatch =
        selectedCategory === 'ALL' || post.category === selectedCategory;
      if (!catMatch) return false;
      if (!q) return true;
      const title = pickLang(lang, post.titleUz, post.titleEn).toLowerCase();
      const excerpt = pickLang(lang, post.excerptUz, post.excerptEn).toLowerCase();
      return title.includes(q) || excerpt.includes(q) || post.category.toLowerCase().includes(q);
    });
  }, [posts, selectedCategory, query, lang]);

  return (
    <section id="blog" className="py-16 sm:py-24 border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 space-y-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-zinc-950 dark:text-zinc-100 tracking-tight">
              {t.blog.sectionTitle}
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
              {t.blog.sectionSubtitle}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative">
              <label htmlFor="blog-search" className="sr-only">
                {t.blog.searchPlaceholder}
              </label>
              <Search className="w-4 h-4 text-zinc-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="blog-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.blog.searchPlaceholder}
                className="w-full sm:w-56 pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div
              role="group"
              aria-label="Blog categories"
              className="flex items-center gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 max-w-full overflow-x-auto flex-nowrap"
            >
              {categories.map((cat) => {
                const label = cat === 'ALL' ? t.blog.allFilter : cat;
                const active = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      active
                        ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-100 shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-72 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 animate-pulse space-y-4"
              >
                <div className="h-36 rounded-xl bg-zinc-100 dark:bg-zinc-800" />
                <div className="h-5 w-3/4 rounded bg-zinc-100 dark:bg-zinc-800" />
                <div className="h-4 w-full rounded bg-zinc-100 dark:bg-zinc-800" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 text-sm text-zinc-700 dark:text-zinc-300">
            {t.blog.error}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-12 text-center">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{t.blog.empty}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredPosts.map((post) => {
              const title = pickLang(lang, post.titleUz, post.titleEn);
              const excerpt = pickLang(lang, post.excerptUz, post.excerptEn);
              const formattedDate = formatDisplayDate(post.publishedAt, lang);

              return (
                <article
                  key={post.id}
                  className="group rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden transition-colors duration-150 hover:border-zinc-300 dark:hover:border-zinc-700 flex flex-col"
                >
                  <div className="aspect-[16/10] bg-zinc-100 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-800 overflow-hidden">
                    <MediaImage
                      src={post.coverUrl}
                      alt={title}
                      fallbackTitle={title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between gap-5">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                        <span>{post.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">{formattedDate}</span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">
                          {post.readTimeMin} {t.blog.minRead}
                        </span>
                      </div>

                      <h3 className="font-serif text-xl font-semibold text-zinc-950 dark:text-zinc-100 tracking-tight leading-snug">
                        {title}
                      </h3>

                      <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-3">
                        {excerpt}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                      <button
                        type="button"
                        onClick={() => onSelectPost(post)}
                        aria-label={`${t.blog.readArticle}: ${title}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-950 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <span>{t.blog.readArticle}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
