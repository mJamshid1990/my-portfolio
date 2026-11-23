import { useMemo, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import type { Project } from '../types/portfolio';
import { pickLang } from '../utils/validation';
import { MediaImage } from './MediaImage';

interface ProjectsSectionProps {
  projects: Project[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onSelectProject: (project: Project) => void;
}

export function ProjectsSection({
  projects,
  loading,
  error,
  onRetry,
  onSelectProject,
}: ProjectsSectionProps) {
  const { lang, t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = useMemo(() => {
    const unique = Array.from(new Set(projects.map((p) => p.category))).filter(Boolean);
    return ['ALL', ...unique];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (selectedCategory === 'ALL') return projects;
    return projects.filter((p) => p.category === selectedCategory);
  }, [projects, selectedCategory]);

  return (
    <section id="projects" className="py-16 sm:py-24 border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-zinc-950 dark:text-zinc-100 tracking-tight">
              {t.projects.sectionTitle}
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
              {t.projects.sectionSubtitle}
            </p>
          </div>

          {/* Interactive Filter Controls */}
          <div
            role="group"
            aria-label="Project categories"
            className="flex items-center gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 max-w-full overflow-x-auto flex-nowrap"
          >
            {categories.map((cat) => {
              const label = cat === 'ALL' ? t.projects.allFilter : cat;
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

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-80 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 animate-pulse space-y-4"
              >
                <div className="h-44 rounded-xl bg-zinc-100 dark:bg-zinc-800" />
                <div className="h-5 w-2/3 rounded bg-zinc-100 dark:bg-zinc-800" />
                <div className="h-4 w-full rounded bg-zinc-100 dark:bg-zinc-800" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-sm text-zinc-700 dark:text-zinc-300">{t.projects.error}</p>
            <button
              type="button"
              onClick={onRetry}
              className="px-4 py-2 rounded-lg bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 cursor-pointer"
            >
              {t.projects.retry}
            </button>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-12 text-center">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{t.projects.empty}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProjects.map((project, index) => {
              const title = pickLang(lang, project.titleUz, project.titleEn);
              const summary = pickLang(lang, project.summaryUz, project.summaryEn);
              const isHeroFeature =
                project.featured && index === 0 && filteredProjects.length >= 3;

              if (isHeroFeature) {
                return (
                  <article
                    key={project.id}
                    className="group md:col-span-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden transition-colors duration-150 hover:border-zinc-300 dark:hover:border-zinc-700 grid grid-cols-1 lg:grid-cols-12 items-stretch"
                  >
                    <div className="lg:col-span-7 aspect-[16/10] lg:aspect-auto lg:min-h-[340px] bg-zinc-100 dark:bg-zinc-800 border-b lg:border-b-0 lg:border-r border-zinc-200 dark:border-zinc-800 overflow-hidden">
                      <MediaImage
                        src={project.imageUrl}
                        alt={title}
                        fallbackTitle={title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                    </div>

                    <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                          <span>{project.category}</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-blue-600 dark:text-blue-400 font-medium">
                            {t.projects.featuredLabel}
                          </span>
                        </div>

                        <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-zinc-950 dark:text-zinc-100 tracking-tight leading-snug">
                          {title}
                        </h3>

                        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
                          {summary}
                        </p>
                      </div>

                      <div className="pt-5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-4">
                        <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 truncate">
                          {project.techStack}
                        </span>

                        <button
                          type="button"
                          onClick={() => onSelectProject(project)}
                          aria-label={`${t.projects.viewDetails}: ${title}`}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-950 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          <span>{t.projects.viewDetails}</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              }

              return (
                <article
                  key={project.id}
                  className="group rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden transition-colors duration-150 hover:border-zinc-300 dark:hover:border-zinc-700 flex flex-col"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-zinc-100 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-800">
                    <MediaImage
                      src={project.imageUrl}
                      alt={title}
                      fallbackTitle={title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between gap-5">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                        <span>{project.category}</span>
                        {project.featured ? (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-blue-600 dark:text-blue-400 font-medium">
                              {t.projects.featuredLabel}
                            </span>
                          </>
                        ) : null}
                      </div>

                      <h3 className="font-display text-lg sm:text-xl font-semibold text-zinc-950 dark:text-zinc-100 tracking-tight">
                        {title}
                      </h3>

                      <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-3">
                        {summary}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-4">
                      <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 truncate">
                        {project.techStack}
                      </span>

                      <button
                        type="button"
                        onClick={() => onSelectProject(project)}
                        aria-label={`${t.projects.viewDetails}: ${title}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-950 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <span>{t.projects.viewDetails}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
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
