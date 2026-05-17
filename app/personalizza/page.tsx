'use client';

import { useState } from 'react';
import { Sliders, Loader2, RefreshCw, AlertCircle, Leaf } from 'lucide-react';
import { CrosswordGame } from '@/components/crossword/CrosswordGame';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { CrosswordPuzzle } from '@/lib/crossword/types';

const SIZES = [
  { id: 'small', label: 'Piccolo', desc: '10×10', emoji: '🌰' },
  { id: 'medium', label: 'Medio', desc: '13×13', emoji: '🪵' },
  { id: 'large', label: 'Grande', desc: '16×16', emoji: '🌿' },
  { id: 'xl', label: 'XL', desc: '19×19', emoji: '🌳' },
] as const;

const DIFFICULTIES = [
  { id: 'easy', label: 'Facile', desc: 'Parole brevi (3–7 lettere)', activeText: 'text-accent-dark', activeBg: 'from-accent/12 to-accent/5', activeBorder: 'border-accent/30', dot: 'bg-accent' },
  { id: 'medium', label: 'Medio', desc: 'Parole miste (4–10 lettere)', activeText: 'text-nuts-dark', activeBg: 'from-nuts/12 to-nuts/5', activeBorder: 'border-nuts/30', dot: 'bg-nuts' },
  { id: 'hard', label: 'Difficile', desc: 'Parole lunghe (5–15 lettere)', activeText: 'text-primary-dark', activeBg: 'from-primary/12 to-primary/5', activeBorder: 'border-primary/30', dot: 'bg-primary' },
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
    setLoading(true); setError(null); setPuzzle(null);
    const start = Date.now();
    try {
      const res = await fetch('/api/crossword/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ size: selectedSize, difficulty: selectedDifficulty }) });
      const json = await res.json();
      if (!res.ok || json.error) { setError(json.error ?? 'Errore durante la generazione. Riprova.'); return; }
      setGenerationTime(Date.now() - start);
      setPuzzle(json.data as CrosswordPuzzle);
    } catch { setError('Errore di rete. Controlla la connessione e riprova.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-radial-glow">
      <section className="border-b border-border bg-surface/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="nuts"><Sliders className="h-3 w-3 mr-1" />Personalizza</Badge>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-balance">
            <span className="text-ink">Crea il </span>
            <span className="text-gradient">Tuo Cruciverba</span>
          </h1>
          <p className="mt-3 text-ink-muted text-lg max-w-xl">Scegli dimensione e difficoltà. L&apos;AI genererà un cruciverba unico in pochi secondi.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="rounded-2xl border border-border bg-white p-6 lg:p-8 mb-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="font-serif text-lg font-semibold text-ink mb-4">Dimensione</h2>
              <div className="grid grid-cols-2 gap-2.5">
                {SIZES.map((size) => (
                  <button key={size.id} onClick={() => setSelectedSize(size.id)}
                    className={cn('flex flex-col items-start gap-1 rounded-2xl border p-4 text-left transition-all duration-150',
                      selectedSize === size.id ? 'border-primary/40 bg-primary/8 shadow-sm' : 'border-border bg-surface-alt hover:border-primary/25 hover:bg-[#F5EDE0]'
                    )}>
                    <span className="text-xl">{size.emoji}</span>
                    <span className={cn('font-semibold text-sm', selectedSize === size.id ? 'text-primary-dark' : 'text-ink')}>{size.label}</span>
                    <span className="text-xs text-ink-muted font-mono">{size.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-serif text-lg font-semibold text-ink mb-4">Difficoltà</h2>
              <div className="flex flex-col gap-2.5">
                {DIFFICULTIES.map((diff) => (
                  <button key={diff.id} onClick={() => setSelectedDifficulty(diff.id)}
                    className={cn('flex items-center justify-between rounded-2xl border p-4 text-left transition-all duration-150',
                      selectedDifficulty === diff.id ? `bg-gradient-to-r ${diff.activeBg} ${diff.activeBorder}` : 'border-border bg-surface-alt hover:border-primary/25 hover:bg-[#F5EDE0]'
                    )}>
                    <div>
                      <span className={cn('font-semibold text-sm block', selectedDifficulty === diff.id ? diff.activeText : 'text-ink')}>{diff.label}</span>
                      <span className="text-xs text-ink-muted mt-0.5">{diff.desc}</span>
                    </div>
                    {selectedDifficulty === diff.id && <div className={`h-2.5 w-2.5 rounded-full ${diff.dot}`} />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
            <Button size="lg" onClick={handleGenerate} disabled={loading} className="w-full sm:w-auto px-10">
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generazione in corso…</> : <><Leaf className="h-4 w-4 mr-2" />Genera Cruciverba</>}
            </Button>
            {generationTime && !loading && (
              <p className="text-xs text-ink-muted">Generato in <span className="text-primary-dark font-medium">{(generationTime / 1000).toFixed(1)}s</span></p>
            )}
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 mb-6 animate-fade-in">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-700 text-sm">Errore di generazione</p>
              <p className="text-sm text-red-600/80 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center gap-6 py-20 animate-fade-in">
            <div className="h-20 w-20 rounded-3xl border-2 border-primary/30 bg-primary/8 flex items-center justify-center animate-glow">
              <Loader2 className="h-9 w-9 text-primary animate-spin" />
            </div>
            <div className="text-center">
              <p className="font-serif text-2xl text-ink">Generazione in corso…</p>
              <p className="text-sm text-ink-muted mt-1">L&apos;AI sta costruendo il tuo cruciverba personalizzato</p>
            </div>
          </div>
        )}

        {puzzle && !loading && (
          <div className="animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-ink">Il Tuo Cruciverba</h2>
                <p className="text-sm text-ink-muted mt-0.5">
                  <span className="text-primary-dark font-medium">{puzzle.wordCount} parole</span>{' · '}{puzzle.size}×{puzzle.size}{' · '}{DIFFICULTIES.find((d) => d.id === selectedDifficulty)?.label}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleGenerate}><RefreshCw className="h-3.5 w-3.5 mr-1.5" />Rigenera</Button>
            </div>
            <CrosswordGame puzzle={puzzle} />
          </div>
        )}

        {!puzzle && !loading && !error && (
          <div className="flex flex-col items-center gap-5 py-24 text-center">
            <div className="h-24 w-24 rounded-3xl border border-border bg-surface-alt flex items-center justify-center animate-float shadow-sm">
              <span className="text-4xl">🧩</span>
            </div>
            <div>
              <p className="font-serif text-2xl text-ink">Nessun cruciverba generato</p>
              <p className="text-sm text-ink-muted mt-1.5">Configura le opzioni qui sopra e premi <span className="text-primary-dark font-medium">"Genera Cruciverba"</span></p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
