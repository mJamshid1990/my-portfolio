import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { MediaImage } from './MediaImage';

export function Hero() {
  const { t } = useLanguage();

  return (
    <section id="top" className="pt-12 pb-16 sm:pt-16 sm:pb-20 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          {/* Left Column: Typographic hierarchy */}
          <div className="lg:col-span-7 flex flex-col justify-between py-2">
            <div className="space-y-6">
              <p className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400 tracking-wide">
                {t.hero.kicker}
              </p>

              <h1
                className="font-serif text-zinc-950 dark:text-zinc-100 font-medium tracking-tight leading-[1.08]"
                style={{
                  fontSize: 'clamp(2.25rem, 4vw, 3.5rem)',
                  textWrap: 'balance',
                }}
              >
                {t.hero.headline}
              </h1>

              <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-[60ch]">
                {t.hero.lead}
              </p>
            </div>

            <div className="pt-8 flex flex-wrap items-center gap-6">
              <a
                href="#projects"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                <span>{t.hero.primaryCta}</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="#contact"
                className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 underline underline-offset-8 decoration-zinc-300 dark:decoration-zinc-700 hover:decoration-blue-600 transition-colors whitespace-nowrap shrink-0"
              >
                {t.hero.secondaryCta}
              </a>
            </div>
          </div>

          {/* Right Column: Matching-height editorial visual */}
          <div className="lg:col-span-5">
            <div className="h-72 sm:h-96 lg:h-full min-h-[340px] rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900">
              <MediaImage
                src="/src/assets/images/hero_developer_workspace_1795451001751.jpg"
                alt={t.hero.imageAlt}
                fallbackTitle={t.brand}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Full-width 4-column metrics strip below hero split */}
        <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {t.hero.metrics.map((metric, idx) => (
            <div key={idx} className="space-y-1">
              <div className="font-display text-xl sm:text-2xl font-bold text-zinc-950 dark:text-zinc-100 tabular-nums tracking-tight">
                {metric.value}
              </div>
              <div className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                {metric.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
