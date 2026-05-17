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
      <section className="border-b border-border bg-surface/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="default"><Calendar className="h-3 w-3 mr-1" />Oggi</Badge>
                <Badge variant="accent"><Zap className="h-3 w-3 mr-1" />Giornaliero</Badge>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-balance">
                <span className="text-gradient">Il Cruciverba</span>
                <br />
                <span className="text-ink">di Oggi</span>
              </h1>
              <p className="mt-3 text-ink-muted capitalize text-lg">{dateString}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-ink-muted bg-surface border border-border rounded-xl px-4 py-2.5">
              <Users className="h-4 w-4 text-accent" />
              <span>Lo stesso per tutta Italia</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <Suspense fallback={<PuzzleSkeleton />}>
          <DailyPuzzle storageKey={storageKey} />
        </Suspense>
      </section>

      <section className="border-t border-border bg-surface/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { icon: '🇮🇹', bg: 'bg-primary/10', border: 'border-primary/20', title: 'Solo in Italiano', desc: 'Parole e definizioni interamente in italiano, dal nostro dizionario di oltre 49.000 voci.' },
              { icon: '🌿', bg: 'bg-accent/10', border: 'border-accent/20', title: "Generato dall'AI", desc: 'Ogni cruciverba è generato automaticamente ogni giorno alle mezzanotte.' },
              { icon: '🧩', bg: 'bg-nuts/10', border: 'border-nuts/20', title: 'Un puzzle al giorno', desc: 'Il cruciverba giornaliero è uguale per tutti. Confronta il tuo tempo con gli amici!' },
            ].map((item) => (
              <div key={item.title} className="flex gap-4 rounded-2xl bg-white border border-border p-4 hover:border-primary/30 transition-colors shadow-sm">
                <div className={`shrink-0 h-11 w-11 rounded-xl ${item.bg} border ${item.border} flex items-center justify-center text-xl`}>
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-ink text-sm">{item.title}</h3>
                  <p className="text-xs text-ink-muted mt-1 leading-relaxed">{item.desc}</p>
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
        <div className="rounded-2xl overflow-hidden bg-surface-alt animate-pulse-soft border border-border" style={{ width: 494, height: 494 }} />
      </div>
      <div className="hidden lg:block min-w-[240px] max-w-[300px] w-full rounded-2xl bg-surface-alt border border-border h-96 animate-pulse-soft" />
    </div>
  );
}
