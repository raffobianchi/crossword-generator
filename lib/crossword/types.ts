export interface Word {
  text: string;
  definitions: string[];
}

export interface GridCell {
  letter: string; // ' ' = empty, '#' = black, or a letter A-Z
  number: number | null;
  isStart: boolean;
  isHorizontal: boolean;
  isVertical: boolean;
}

export interface PlacedWord {
  word: string;
  definitions: string[];
  row: number;
  col: number;
  isHorizontal: boolean;
  number: number;
}

export interface CellMeta {
  isBlack: boolean;
  number: number | null;
  hasAcross: boolean;
  hasDown: boolean;
}

export interface ClueItem {
  number: number;
  clue: string;
  word: string;
  row: number;
  col: number;
}

export interface CrosswordPuzzle {
  id: string;
  date?: string;
  size: number;
  grid: CellMeta[][];
  solution: (string | null)[][];
  clues: {
    across: ClueItem[];
    down: ClueItem[];
  };
  generatedAt: string;
  wordCount: number;
}

export interface GenerateOptions {
  size: number;
  difficulty: 'easy' | 'medium' | 'hard';
  seed?: number;
}
