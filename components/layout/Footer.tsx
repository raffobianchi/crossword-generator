import Link from 'next/link';
import { Grid3X3 } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <Grid3X3 className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-serif text-lg font-bold text-zinc-100">
              enigmistica<span className="text-primary-light">.ai</span>
            </span>
          </div>

          <p className="text-sm text-zinc-500 text-center">
            Cruciverba italiani generati ogni giorno dall&apos;intelligenza artificiale.
          </p>

          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
              Giornaliero
            </Link>
            <Link
              href="/personalizza"
              className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Personalizza
            </Link>
          </nav>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-center">
          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} enigmistica.ai · Tutti i diritti riservati
          </p>
        </div>
      </div>
    </footer>
  );
}
