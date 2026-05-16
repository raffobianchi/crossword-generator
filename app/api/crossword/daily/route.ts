import { NextResponse } from 'next/server';
import { generateCrossword } from '@/lib/crossword/generator';
import { loadDictionary, filterByDifficulty } from '@/lib/crossword/dictionary';
import { dateToSeed } from '@/lib/crossword/seeded-random';
import { getTodayString } from '@/lib/utils';

// Cache the daily crossword in memory for the lifetime of the server process
let cachedPuzzle: { date: string; data: unknown } | null = null;

export const revalidate = 3600; // revalidate every hour (Next.js ISR)

export async function GET() {
  try {
    const today = getTodayString();

    // Serve from memory cache if same day
    if (cachedPuzzle?.date === today) {
      return NextResponse.json({ data: cachedPuzzle.data }, { status: 200 });
    }

    const allWords = loadDictionary();
    const words = filterByDifficulty(allWords, 'medium');
    const seed = dateToSeed(today);

    const puzzle = generateCrossword(
      { size: 13, difficulty: 'medium', seed },
      words
    );

    if (!puzzle) {
      return NextResponse.json(
        { error: 'Generazione cruciverba fallita. Riprova più tardi.' },
        { status: 503 }
      );
    }

    const result = { ...puzzle, date: today };
    cachedPuzzle = { date: today, data: result };

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (err) {
    console.error('[daily] error:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Errore interno del server.' }, { status: 500 });
  }
}
