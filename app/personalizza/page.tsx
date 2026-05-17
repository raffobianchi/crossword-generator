'use client';

import { useState } from 'react';
import { Sliders, Loader2, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { CrosswordGame } from '@/components/crossword/CrosswordGame';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { CrosswordPuzzle } from '@/lib/crossword/types';

const SIZES = [
  { id: 'small', label: 'Piccolo', desc: '10×10', emoji: '🔹' },
  { id: 'medium', label: 'Medio', desc: '13×13', emoji: '🔷' },
  { id: 'large', label: 'Grande', desc: '16×16', emoji: '🟣' },
  { id: 'xl', label: 'XL', desc: '19×19', emoji: '💜' },
] as const;

const DIFFICULTIES = [
  {
    id: 'easy',
    label: 'Facile',
    desc: 'Parole brevi (3–7 lettere)',
    color: 'text-emerald-400',
    activeBg: 'from-emerald-500/15 to-emerald-500/5',
    activeBorder: 'border-emerald-500/40',
    dot: 'bg-emerald-400',
  },
  {
    id: 'medium',
    label: 'Medio',
    desc: 'Parole miste (4–10 lettere)',
    color: 'text-amber-400',
    activeBg: 'from-amber-500/15 to-amber-500/5',
    activeBorder: 'border-amber-500/40',
    dot: 'bg-amber-400',
  },
  {
    id: 'hard',
    label: 'Difficile',
    desc: 'Parole lunghe (5–15 lettere)',
    color: 'text-rose-400',
    activeBg: 'from-rose-500/15 to-rose-500/5',
    activeBorder: 'border-rose-500/40',
    dot: 'bg-rose-400',
  },
] as const;

type Size = (typeof SIZES)[number]['id'];
type Difficulty = (typeof DIFFICULTIES)[number]['id'];

export default function PersonalizzaPage() {
  const [selectedSize, setSelectedSize] = useState<Size>('medium');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('medium');
  const [puzzle, setPuzzle] = useState<CrosswordPuzzle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationTime, setGenerationTime] = useState<number | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setPuzzle(null);
    const start = Date.now();

    try {
      const res = await fetch('/api/crossword/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ size: selectedSize, difficulty: selectedDifficulty }),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        setError(json.error ?? 'Errore durante la generazione. Riprova.');
        return;
      }

      setGenerationTime(Date.now() - start);
      setPuzzle(json.data as CrosswordPuzzle);
    } catch {
      setError('Errore di rete. Controlla la connessione e riprova.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-radial-glow">
      {/* Hero */}
      <section className="border-b border-border/60 relative overflow-hidden">
        <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-14 relative">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="accent">
              <Sliders className="h-3 w-3 mr-1" />
              Personalizza
            </Badge>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-balance">
            <span className="text-zinc-100">Crea il </span>
            <span className="text-gradient">Tuo Cruciverba</span>
          </h1>
          <p className="mt-3 text-muted-foreground text-lg max-w-xl">
            Scegli dimensione e difficoltà. L&apos;AI genererà un cruciverba unico in pochi secondi.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Configuration panel */}
        <div className="rounded-2xl border border-border/60 bg-surface/80 p-6 lg:p-8 mb-8 backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Size */}
            <div>
              <h2 className="font-serif text-lg font-semibold text-zinc-200 mb-4">Dimensione</h2>
              <div className="grid grid-cols-2 gap-2.5">
                {SIZES.map((size) => (
                  <button
                    key={size.id}
                    onClick={() => setSelectedSize(size.id)}
                    className={cn(
                      'flex flex-col items-start gap-1 rounded-2xl border p-4 text-left transition-all duration-200',
                      selectedSize === size.id
                        ? 'border-primary/50 bg-gradient-to-br from-primary/15 to-primary/5 shadow-lg shadow-primary/10'
                        : 'border-border/60 bg-surface-alt/50 hover:border-primary/30 hover:bg-surface-alt'
                    )}
                  >
                    <span className="text-lg">{size.emoji}</span>
                    <span
                      className={cn(
                        'font-semibold text-sm',
                        selectedSize === size.id ? 'text-primary-light' : 'text-zinc-200'
                      )}
                    >
                      {size.label}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">{size.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <h2 className="font-serif text-lg font-semibold text-zinc-200 mb-4">Difficoltà</h2>
              <div className="flex flex-col gap-2.5">
                {DIFFICULTIES.map((diff) => (
                  <button
                    key={diff.id}
                    onClick={() => setSelectedDifficulty(diff.id)}
                    className={cn(
                      'flex items-center justify-between rounded-2xl border p-4 text-left transition-all duration-200',
                      selectedDifficulty === diff.id
                        ? `bg-gradient-to-r ${diff.activeBg} ${diff.activeBorder}`
                        : 'border-border/60 bg-surface-alt/50 hover:border-primary/30 hover:bg-surface-alt'
                    )}
                  >
                    <div>
                      <span
                        className={cn(
                          'font-semibold text-sm block',
                          selectedDifficulty === diff.id ? diff.color : 'text-zinc-200'
                        )}
                      >
                        {diff.label}
                      </span>
                      <span className="text-xs text-muted-foreground mt-0.5">{diff.desc}</span>
                    </div>
                    {selectedDifficulty === diff.id && (
                      <div className={`h-2.5 w-2.5 rounded-full ${diff.dot} shadow-lg`} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
            <Button
              size="lg"
              onClick={handleGenerate}
              disabled={loading}
              className="w-full sm:w-auto px-10"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generazione in corso…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Genera Cruciverba
                </>
              )}
            </Button>
            {generationTime && !loading && (
              <p className="text-xs text-muted-foreground">
                Generato in{' '}
                <span className="text-primary-light font-medium">
                  {(generationTime / 1000).toFixed(1)}s
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 mb-6 animate-fade-in">
            <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-rose-300 text-sm">Errore di generazione</p>
              <p className="text-sm text-rose-400/70 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Loading placeholder */}
        {loading && (
          <div className="flex flex-col items-center gap-6 py-20 animate-fade-in">
            <div className="relative">
              <div className="h-20 w-20 rounded-3xl border-2 border-primary/40 bg-gradient-to-br from-primary/10 to-accent/5 flex items-center justify-center animate-glow">
                <Loader2 className="h-9 w-9 text-primary-light animate-spin" />
              </div>
              <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent animate-pulse" />
            </div>
            <div className="text-center">
              <p className="font-serif text-2xl text-zinc-200">Generazione in corso…</p>
              <p className="text-sm text-muted-foreground mt-1">
                L&apos;AI sta costruendo il tuo cruciverba personalizzato
              </p>
            </div>
          </div>
        )}

        {/* Puzzle */}
        {puzzle && !loading && (
          <div className="animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-zinc-100">Il Tuo Cruciverba</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  <span className="text-primary-light font-medium">{puzzle.wordCount} parole</span>
                  {' · '}
                  {puzzle.size}×{puzzle.size}
                  {' · '}
                  {DIFFICULTIES.find((d) => d.id === selectedDifficulty)?.label}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleGenerate}>
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Rigenera
              </Button>
            </div>
            <CrosswordGame puzzle={puzzle} />
          </div>
        )}

        {/* Empty state */}
        {!puzzle && !loading && !error && (
          <div className="flex flex-col items-center gap-5 py-24 text-center">
            <div className="relative">
              <div className="h-24 w-24 rounded-3xl border border-border/60 bg-gradient-to-br from-surface-alt to-surface flex items-center justify-center animate-float">
                <span className="text-4xl">🧩</span>
              </div>
              <div className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary/40 border border-primary/60 animate-pulse" />
              <div className="absolute -bottom-1 -left-1 h-3 w-3 rounded-full bg-accent/40 border border-accent/60 animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>
            <div>
              <p className="font-serif text-2xl text-zinc-200">Nessun cruciverba generato</p>
              <p className="text-sm text-muted-foreground mt-1.5">
                Configura le opzioni qui sopra e premi{' '}
                <span className="text-primary-light">"Genera Cruciverba"</span>
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
