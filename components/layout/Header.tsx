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
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-light/50 to-transparent" />

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-nuts shadow-lg shadow-primary/40 transition-all duration-300 group-hover:shadow-primary/60 group-hover:scale-105">
            <LayoutGrid className="h-4 w-4 text-white" />
          </div>
          <span className="font-serif text-xl font-bold">
            <span className="text-gradient">enigmistica</span>
            <span className="text-muted-foreground">.ai</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200',
                pathname === item.href
                  ? 'text-primary-light'
                  : 'text-muted-foreground hover:text-[#EDE0CE]'
              )}
            >
              {pathname === item.href && (
                <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/15 to-nuts/10 border border-primary/25" />
              )}
              <span className="relative">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Right side pill */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary/15 to-nuts/10 px-3 py-1 text-xs font-medium text-primary-light border border-primary/25">
            <Wheat className="h-3 w-3" />
            <span>AI Generato</span>
          </div>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden rounded-xl p-2 text-muted-foreground hover:bg-surface-alt hover:text-[#EDE0CE] transition-all"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/70 bg-surface px-4 py-3 space-y-1 animate-fade-in">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'block rounded-xl px-4 py-2.5 text-sm font-medium transition-all',
                pathname === item.href
                  ? 'bg-gradient-to-r from-primary/15 to-nuts/10 text-primary-light border border-primary/25'
                  : 'text-muted-foreground hover:bg-surface-alt hover:text-[#EDE0CE]'
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
