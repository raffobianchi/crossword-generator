'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Wheat, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Giornaliero' },
  { href: '/personalizza', label: 'Crea il Tuo' },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/90 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-nuts shadow-md shadow-primary/30 transition-all duration-200 group-hover:scale-105">
            <LayoutGrid className="h-4 w-4 text-white" />
          </div>
          <span className="font-serif text-xl font-bold">
            <span className="text-gradient">enigmistica</span>
            <span className="text-ink-muted">.ai</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative rounded-xl px-4 py-2 text-sm font-medium transition-all duration-150',
                pathname === item.href ? 'text-primary-dark' : 'text-ink-muted hover:text-ink'
              )}
            >
              {pathname === item.href && (
                <span className="absolute inset-0 rounded-xl bg-primary/10 border border-primary/20" />
              )}
              <span className="relative">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center">
          <div className="flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-medium text-primary-dark">
            <Wheat className="h-3 w-3" />
            <span>AI Generato</span>
          </div>
        </div>

        <button
          className="md:hidden rounded-xl p-2 text-ink-muted hover:bg-surface-alt transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-surface px-4 py-3 space-y-1 animate-fade-in">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'block rounded-xl px-4 py-2.5 text-sm font-medium transition-colors',
                pathname === item.href
                  ? 'bg-primary/10 text-primary-dark border border-primary/20'
                  : 'text-ink-muted hover:bg-surface-alt hover:text-ink'
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
