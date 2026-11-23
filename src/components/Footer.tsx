import { useLanguage } from '../context/LanguageContext';

interface FooterProps {
  onOpenAdmin: () => void;
}

export function Footer({ onOpenAdmin }: FooterProps) {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-[#FAFAFA] dark:bg-zinc-950 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="tabular-nums">
          © {year} {t.footer.copyright}
        </div>

        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={onOpenAdmin}
            className="hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors cursor-pointer whitespace-nowrap"
          >
            {t.footer.adminLink}
          </button>
          <a
            href="#top"
            className="hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors whitespace-nowrap"
          >
            {t.footer.backTop}
          </a>
        </div>
      </div>
    </footer>
  );
}
