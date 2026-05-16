'use client';

import { useState } from 'react';
import { Sliders, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { CrosswordGame } from '@/components/crossword/CrosswordGame';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { CrosswordPuzzle } from '@/lib/crossword/types';

const SIZES = [
  { id: 'small', label: 'Piccolo', desc: '10×10', cells: 100 },
  { id: 'medium', label: 'Medio', desc: '13×13', cells: 169 },
  { id: 'large', label: 'Grande', desc: '16×16', cells: 256 },
  { id: 'xl', label: 'XL', desc: '19×19', cells: 361 },
] as const;

const DIFFICULTIES = [
  { id: 'easy', label: 'Facile', desc: 'Parole brevi (3-7 lettere)', color: 'text-emerald-400' },
  { id: 'medium', label: 'Medio', desc: 'Parole miste (4-10 lettere)', color: 'text-amber-400' },
  { id: 'hard', label: 'Difficile', desc: 'Parole lunghe (5-15 lettere)', color: 'text-red-400' },
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
      <section className="border-b border-border bg-surface/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="default">
              <Sliders className="h-3 w-3 mr-1" />
              Personalizza
            </Badge>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-100 text-balance">
            Crea il Tuo Cruciverba
          </h1>
          <p className="mt-2 text-zinc-400 text-lg max-w-xl">
            Scegli dimensione e difficoltà. L&apos;AI genererà un cruciverba unico in pochi secondi.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Configuration panel */}
        <div className="rounded-2xl border border-border bg-surface p-6 lg:p-8 mb-8 shadow-xl">
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
                      'flex flex-col items-start gap-0.5 rounded-xl border p-3.5 text-left transition-all duration-150',
                      selectedSize === size.id
                        ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10'
                        : 'border-border bg-surface-alt hover:border-primary/50 hover:bg-surface-alt'
                    )}
                  >
                    <span
                      className={cn(
                        'font-medium text-sm',
                        selectedSize === size.id ? 'text-primary-light' : 'text-zinc-200'
                      )}
                    >
                      {size.label}
                    </span>
                    <span className="text-xs text-zinc-500 font-mono">{size.desc}</span>
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
                      'flex items-center justify-between rounded-xl border p-3.5 text-left transition-all duration-150',
                      selectedDifficulty === diff.id
                        ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10'
                        : 'border-border bg-surface-alt hover:border-primary/50 hover:bg-surface-alt'
                    )}
                  >
                    <div>
                      <span
                        className={cn(
                          'font-medium text-sm block',
                          selectedDifficulty === diff.id ? 'text-primary-light' : 'text-zinc-200'
                        )}
                      >
                        {diff.label}
                      </span>
                      <span className="text-xs text-zinc-500">{diff.desc}</span>
                    </div>
                    {selectedDifficulty === diff.id && (
                      <div className="h-2 w-2 rounded-full bg-primary-light" />
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
              className="w-full sm:w-auto px-10 shadow-lg shadow-primary/20"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generazione in corso…
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Genera Cruciverba
                </>
              )}
            </Button>
            {generationTime && !loading && (
              <p className="text-xs text-zinc-500">
                Generato in {(generationTime / 1000).toFixed(1)}s
              </p>
            )}
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 mb-6 animate-fade-in">
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-300 text-sm">Errore di generazione</p>
              <p className="text-sm text-red-400/70 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Loading placeholder */}
        {loading && (
          <div className="flex flex-col items-center gap-6 py-16 animate-fade-in">
            <div className="relative">
              <div className="h-16 w-16 rounded-2xl border-2 border-primary/30 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary-light animate-spin" />
              </div>
            </div>
            <div className="text-center">
              <p className="font-serif text-xl text-zinc-200">Generazione in corso…</p>
              <p className="text-sm text-zinc-500 mt-1">
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
                <p className="text-sm text-zinc-500 mt-0.5">
                  {puzzle.wordCount} parole · {puzzle.size}×{puzzle.size} · {
                    DIFFICULTIES.find(d => d.id === selectedDifficulty)?.label
                  }
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
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <div className="h-20 w-20 rounded-2xl border border-border bg-surface-alt flex items-center justify-center">
              <span className="text-3xl">🧩</span>
            </div>
            <div>
              <p className="font-serif text-xl text-zinc-300">Nessun cruciverba generato</p>
              <p className="text-sm text-zinc-500 mt-1">
                Configura le opzioni qui sopra e premi &ldquo;Genera Cruciverba&rdquo;
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
