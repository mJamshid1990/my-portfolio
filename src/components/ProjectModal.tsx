import { useEffect } from 'react';
import { ExternalLink, Github, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import type { Project } from '../types/portfolio';
import { pickLang, sanitizeExternalUrl } from '../utils/validation';
import { MediaImage } from './MediaImage';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  const { lang, t } = useLanguage();

  useEffect(() => {
    if (!project) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [project, onClose]);

  if (!project) return null;

  const title = pickLang(lang, project.titleUz, project.titleEn);
  const summary = pickLang(lang, project.summaryUz, project.summaryEn);
  const details = pickLang(lang, project.detailsUz, project.detailsEn);
  const safeLiveUrl = sanitizeExternalUrl(project.liveUrl);
  const safeRepoUrl = sanitizeExternalUrl(project.repoUrl);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-zinc-950/70 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xs border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <span>{project.category}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">
              {new Date(project.createdAt).getFullYear()}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.projects.modal.close}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div className="aspect-[16/9] rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800">
            <MediaImage
              src={project.imageUrl}
              alt={title}
              fallbackTitle={title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-3">
            <h2
              id="project-modal-title"
              className="font-serif text-2xl sm:text-3xl font-semibold text-zinc-950 dark:text-zinc-100 tracking-tight"
            >
              {title}
            </h2>
            <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">{summary}</p>
          </div>

          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {t.projects.modal.stack}
            </div>
            <div className="text-sm font-mono text-zinc-900 dark:text-zinc-100">
              {project.techStack}
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
            {details.split('\n\n').map((paragraph, index) => (
              <p
                key={index}
                className="text-sm sm:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line"
              >
                {paragraph}
              </p>
            ))}
          </div>

          {safeLiveUrl || safeRepoUrl ? (
            <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center gap-4">
              {safeLiveUrl ? (
                <a
                  href={safeLiveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0"
                >
                  <span>{t.projects.modal.liveSite}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              ) : null}
              {safeRepoUrl ? (
                <a
                  href={safeRepoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors whitespace-nowrap shrink-0"
                >
                  <Github className="w-4 h-4" />
                  <span>{t.projects.modal.sourceCode}</span>
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
