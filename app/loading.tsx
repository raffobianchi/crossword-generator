import { Grid3X3 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <div className="relative animate-pulse-soft">
        <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
          <Grid3X3 className="h-6 w-6 text-primary-light" />
        </div>
      </div>
      <p className="text-sm text-zinc-500 animate-pulse-soft">Caricamento…</p>
    </div>
  );
}
