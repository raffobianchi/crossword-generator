import fs from 'fs';
import path from 'path';
import type { Word } from './types';

let cache: Word[] | null = null;
let wordSetCache: Set<string> | null = null;

type RawWord = { word: string; definitions: string[] };

function loadRaw(): RawWord[] {
  const filePath = path.join(process.cwd(), 'crossword_generator', 'data', 'dizionario.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as RawWord[];
}

export function loadDictionary(): Word[] {
  if (!cache) {
    const all = loadRaw();
    cache = all
      .filter((w) => {
        if (!w.word || typeof w.word !== 'string') return false;
        const t = w.word.toUpperCase();
        return /^[A-Z]{2,15}$/.test(t) && w.definitions.length > 0;
      })
      .map((w) => ({ text: w.word.toUpperCase(), definitions: w.definitions }));
  }
  return cache;
}

export function getWordSet(): Set<string> {
  if (!wordSetCache) {
    wordSetCache = new Set(loadDictionary().map((w) => w.text));
  }
  return wordSetCache;
}

export function filterByDifficulty(words: Word[], difficulty: 'easy' | 'medium' | 'hard'): Word[] {
  // Always include short words (2-4 letters) so triple-black fixing can find candidates
  const short = words.filter((w) => w.text.length >= 2 && w.text.length <= 4);
  switch (difficulty) {
    case 'easy':
      return [...short, ...words.filter((w) => w.text.length >= 5 && w.text.length <= 8)];
    case 'medium':
      return [...short, ...words.filter((w) => w.text.length >= 5 && w.text.length <= 11)];
    case 'hard':
      return [...short, ...words.filter((w) => w.text.length >= 6 && w.text.length <= 15)];
  }
}
