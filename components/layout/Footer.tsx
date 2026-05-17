import Link from 'next/link';
import { LayoutGrid } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-nuts shadow-sm">
              <LayoutGrid className="h-4 w-4 text-white" />
            </div>
            <span className="font-serif text-lg font-bold">
              <span className="text-gradient">enigmistica</span>
              <span className="text-ink-muted">.ai</span>
            </span>
          </div>

          <p className="text-sm text-ink-muted text-center">
            Cruciverba italiani generati ogni giorno dall&apos;intelligenza artificiale.
          </p>

          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm text-ink-muted hover:text-primary-dark transition-colors">Giornaliero</Link>
            <Link href="/personalizza" className="text-sm text-ink-muted hover:text-accent-dark transition-colors">Personalizza</Link>
          </nav>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-center">
          <p className="text-xs text-ink-faint">
            © {new Date().getFullYear()} enigmistica.ai · Tutti i diritti riservati
          </p>
        </div>
      </div>
    </footer>
  );
}
