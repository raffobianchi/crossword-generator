import { Suspense } from 'react';
import { DailyPuzzle } from '@/components/crossword/DailyPuzzle';
import { formatDate, getTodayString } from '@/lib/utils';
import { Calendar, Zap, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const revalidate = 3600;

export default function HomePage() {
  const today = new Date();
  const dateString = formatDate(today);
  const storageKey = `enigmistica-daily-${getTodayString()}`;

  return (
    <div className="min-h-screen bg-radial-glow">
      {/* Hero section */}
      <section className="border-b border-border bg-surface/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="accent">
                  <Calendar className="h-3 w-3 mr-1" />
                  Oggi
                </Badge>
                <Badge variant="default">
                  <Zap className="h-3 w-3 mr-1" />
                  Giornaliero
                </Badge>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-100 text-balance">
                Il Cruciverba di Oggi
              </h1>
              <p className="mt-2 text-zinc-400 capitalize text-lg">{dateString}</p>
            </div>

            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <Users className="h-4 w-4" />
              <span>Lo stesso per tutta Italia</span>
            </div>
          </div>
        </div>
      </section>

      {/* Puzzle section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <Suspense fallback={<PuzzleSkeleton />}>
          <DailyPuzzle storageKey={storageKey} />
        </Suspense>
      </section>

      {/* Info strip */}
      <section className="border-t border-border bg-surface/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: '🇮🇹',
                title: 'Solo in Italiano',
                desc: 'Parole e definizioni interamente in italiano, dal nostro dizionario di oltre 49.000 voci.',
              },
              {
                icon: '🤖',
                title: 'Generato dall\'AI',
                desc: 'Ogni cruciverba è generato automaticamente ogni giorno alle mezzanotte.',
              },
              {
                icon: '🧩',
                title: 'Un puzzle al giorno',
                desc: 'Il cruciverba giornaliero è uguale per tutti. Confronta il tuo tempo con gli amici!',
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-3">
                <span className="text-2xl shrink-0">{item.icon}</span>
                <div>
                  <h3 className="font-medium text-zinc-200 text-sm">{item.title}</h3>
                  <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function PuzzleSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
      <div className="flex-shrink-0 mx-auto">
        <div className="rounded-lg overflow-hidden bg-surface-alt animate-pulse-soft"
          style={{ width: 494, height: 494 }} />
      </div>
      <div className="hidden lg:block min-w-[240px] max-w-[300px] w-full rounded-xl bg-surface-alt h-96 animate-pulse-soft" />
    </div>
  );
}
