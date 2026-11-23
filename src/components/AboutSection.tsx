import { useLanguage } from '../context/LanguageContext';

export function AboutSection() {
  const { t } = useLanguage();

  return (
    <section id="about" className="py-16 sm:py-24 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 space-y-12">
        <div className="max-w-2xl space-y-3">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-zinc-950 dark:text-zinc-100 tracking-tight">
            {t.about.sectionTitle}
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {t.about.sectionSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          {t.about.pillars.map((pillar) => (
            <div key={pillar.number} className="space-y-3 pt-4">
              <div className="font-mono text-xs font-medium text-blue-600 dark:text-blue-400 tabular-nums">
                {pillar.number}
              </div>
              <h3 className="font-display text-lg font-semibold text-zinc-950 dark:text-zinc-100 tracking-tight">
                {pillar.title}
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {pillar.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
