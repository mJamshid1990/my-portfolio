import { useState } from 'react';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  activeView: 'public' | 'admin';
  onNavigateView: (view: 'public' | 'admin') => void;
}

export function Header({ activeView, onNavigateView }: HeaderProps) {
  const { lang, setLang, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSectionClick = (hash: string) => {
    setMobileMenuOpen(false);
    if (activeView !== 'public') {
      onNavigateView('public');
      setTimeout(() => {
        const el = document.querySelector(hash);
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 60);
      return;
    }
    const el = document.querySelector(hash);
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAFAFA]/95 dark:bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line brand wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            onNavigateView('public');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="font-display text-base sm:text-lg font-bold tracking-tight text-zinc-950 dark:text-zinc-100 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
        >
          {t.brand}
        </a>

        {/* Zone 2: Concise single-line navigation links */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-600 dark:text-zinc-400"
        >
          <a
            href="#projects"
            onClick={(e) => {
              e.preventDefault();
              handleSectionClick('#projects');
            }}
            className="hover:text-zinc-950 dark:hover:text-zinc-100 hover:underline underline-offset-8 decoration-zinc-300 dark:decoration-zinc-700 transition-colors whitespace-nowrap shrink-0"
          >
            {t.nav.projects}
          </a>
          <a
            href="#blog"
            onClick={(e) => {
              e.preventDefault();
              handleSectionClick('#blog');
            }}
            className="hover:text-zinc-950 dark:hover:text-zinc-100 hover:underline underline-offset-8 decoration-zinc-300 dark:decoration-zinc-700 transition-colors whitespace-nowrap shrink-0"
          >
            {t.nav.blog}
          </a>
          <a
            href="#about"
            onClick={(e) => {
              e.preventDefault();
              handleSectionClick('#about');
            }}
            className="hover:text-zinc-950 dark:hover:text-zinc-100 hover:underline underline-offset-8 decoration-zinc-300 dark:decoration-zinc-700 transition-colors whitespace-nowrap shrink-0"
          >
            {t.nav.about}
          </a>
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              handleSectionClick('#contact');
            }}
            className="hover:text-zinc-950 dark:hover:text-zinc-100 hover:underline underline-offset-8 decoration-zinc-300 dark:decoration-zinc-700 transition-colors whitespace-nowrap shrink-0"
          >
            {t.nav.contact}
          </a>
          <button
            type="button"
            onClick={() => onNavigateView(activeView === 'admin' ? 'public' : 'admin')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeView === 'admin'
                ? 'text-blue-600 dark:text-blue-400 font-semibold underline underline-offset-8'
                : 'hover:text-zinc-950 dark:hover:text-zinc-100 hover:underline underline-offset-8 decoration-zinc-300 dark:decoration-zinc-700'
            }`}
          >
            {t.nav.admin}
          </button>
        </nav>

        {/* Zone 3: Theme toggle + language switch + mobile menu trigger */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-pressed={theme === 'dark'}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors cursor-pointer shrink-0"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          <div
            role="group"
            aria-label="Language switcher"
            className="inline-flex items-center p-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
          >
            <button
              type="button"
              onClick={() => setLang('uz')}
              aria-pressed={lang === 'uz'}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                lang === 'uz'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100'
              }`}
            >
              UZ
            </button>
            <button
              type="button"
              onClick={() => setLang('en')}
              aria-pressed={lang === 'en'}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                lang === 'en'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100'
              }`}
            >
              EN
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-zinc-100 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen ? (
        <nav
          aria-label="Mobile navigation"
          className="md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-4 flex flex-col gap-1"
        >
          <a
            href="#projects"
            onClick={(e) => {
              e.preventDefault();
              handleSectionClick('#projects');
            }}
            className="px-3 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg"
          >
            {t.nav.projects}
          </a>
          <a
            href="#blog"
            onClick={(e) => {
              e.preventDefault();
              handleSectionClick('#blog');
            }}
            className="px-3 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg"
          >
            {t.nav.blog}
          </a>
          <a
            href="#about"
            onClick={(e) => {
              e.preventDefault();
              handleSectionClick('#about');
            }}
            className="px-3 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg"
          >
            {t.nav.about}
          </a>
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              handleSectionClick('#contact');
            }}
            className="px-3 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg"
          >
            {t.nav.contact}
          </a>
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              onNavigateView(activeView === 'admin' ? 'public' : 'admin');
            }}
            className="text-left px-3 py-2.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg cursor-pointer"
          >
            {t.nav.admin}
          </button>
        </nav>
      ) : null}
    </header>
  );
}
