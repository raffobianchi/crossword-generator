import { generateCrossword } from '@/lib/crossword/generator';
import { loadDictionary, filterByDifficulty } from '@/lib/crossword/dictionary';
import { dateToSeed } from '@/lib/crossword/seeded-random';
import { getTodayString } from '@/lib/utils';
import { CrosswordGame } from './CrosswordGame';
import { AlertCircle } from 'lucide-react';
import type { CrosswordPuzzle } from '@/lib/crossword/types';

interface DailyPuzzleProps {
  storageKey: string;
}

// Server component — generates the daily puzzle at request time (cached by Next.js ISR)
export async function DailyPuzzle({ storageKey }: DailyPuzzleProps) {
  const puzzle = await getDailyPuzzle();

  if (!puzzle) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-6 py-4 max-w-md">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <div className="text-left">
            <p className="font-medium text-red-300">Cruciverba non disponibile</p>
            <p className="text-sm text-red-400/70 mt-0.5">
              Il cruciverba di oggi non è stato generato correttamente. Riprova tra qualche minuto.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <CrosswordGame puzzle={puzzle} storageKey={storageKey} />;
}

async function getDailyPuzzle(): Promise<CrosswordPuzzle | null> {
  try {
    const today = getTodayString();
    const allWords = loadDictionary();
    const words = filterByDifficulty(allWords, 'medium');
    const seed = dateToSeed(today);

    const puzzle = generateCrossword({ size: 13, difficulty: 'medium', seed }, words);
    if (!puzzle) return null;
    return { ...puzzle, date: today };
  } catch (err) {
    console.error('[DailyPuzzle] error:', err);
    return null;
  }
}
