'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Grid3X3, Sparkles, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Cruciverba del Giorno' },
  { href: '/personalizza', label: 'Crea il Tuo' },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/30 transition-all group-hover:shadow-primary/50">
            <Grid3X3 className="h-4 w-4 text-white" />
          </div>
          <span className="font-serif text-xl font-bold text-zinc-100">
            enigmistica<span className="text-primary-light">.ai</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'rounded-lg px-4 py-2 text-sm font-medium transition-all',
                pathname === item.href
                  ? 'bg-primary/10 text-primary-light'
                  : 'text-zinc-400 hover:bg-surface-alt hover:text-zinc-200'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary-light border border-primary/20">
            <Sparkles className="h-3 w-3" />
            <span>AI Powered</span>
          </div>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden rounded-lg p-2 text-zinc-400 hover:bg-surface-alt hover:text-white transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-surface px-4 py-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'block rounded-lg px-4 py-2.5 text-sm font-medium transition-all',
                pathname === item.href
                  ? 'bg-primary/10 text-primary-light'
                  : 'text-zinc-400 hover:bg-surface-alt hover:text-zinc-200'
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
