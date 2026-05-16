import { NextResponse } from 'next/server';
import { generateCrossword } from '@/lib/crossword/generator';
import { loadDictionary, filterByDifficulty } from '@/lib/crossword/dictionary';
import type { GenerateOptions } from '@/lib/crossword/types';

const SIZE_MAP: Record<string, number> = {
  small: 10,
  medium: 13,
  large: 16,
  xl: 19,
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { size: sizeLabel = 'medium', difficulty = 'medium' } = body as {
      size?: string;
      difficulty?: 'easy' | 'medium' | 'hard';
    };

    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      return NextResponse.json({ error: 'Difficoltà non valida.' }, { status: 400 });
    }

    const size = SIZE_MAP[sizeLabel] ?? 13;
    if (!Object.keys(SIZE_MAP).includes(sizeLabel)) {
      return NextResponse.json({ error: 'Dimensione non valida.' }, { status: 400 });
    }

    const allWords = loadDictionary();
    const words = filterByDifficulty(allWords, difficulty);

    const options: GenerateOptions = { size, difficulty };
    const puzzle = generateCrossword(options, words);

    if (!puzzle) {
      return NextResponse.json(
        { error: 'Generazione cruciverba fallita. Prova con dimensioni o difficoltà diverse.' },
        { status: 503 }
      );
    }

    return NextResponse.json({ data: puzzle }, { status: 200 });
  } catch (err) {
    console.error('[generate] error:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Errore interno del server.' }, { status: 500 });
  }
}
