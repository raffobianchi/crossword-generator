import type { Word, GridCell, CellMeta, ClueItem, CrosswordPuzzle, GenerateOptions } from './types';
import { SeededRandom } from './seeded-random';

type WordPosition = {
  word: string;
  definitions: string[];
  row: number;
  col: number;
  isHorizontal: boolean;
  number: number;
};

class CrosswordGenerator {
  private size: number;
  private words: Word[];
  private wordSet: Set<string>;
  private wordsByLetter: Map<string, Word[]>;
  private grid: GridCell[][];
  private wordPositions: WordPosition[];
  private usedWords: Set<string>;
  private rng: SeededRandom;

  constructor(size: number, words: Word[], rng: SeededRandom) {
    this.size = size;
    this.rng = rng;
    this.words = words
      .filter((w) => /^[A-Z]{2,15}$/.test(w.text))
      .sort((a, b) => b.text.length - a.text.length);
    this.wordSet = new Set(this.words.map((w) => w.text));
    // Build letter → word index for O(1) lookup
    this.wordsByLetter = new Map();
    for (const word of this.words) {
      const seen = new Set<string>();
      for (let k = 0; k < word.text.length; k++) {
        const letter = word.text[k];
        if (seen.has(letter)) continue;
        seen.add(letter);
        const list = this.wordsByLetter.get(letter) ?? [];
        list.push(word);
        this.wordsByLetter.set(letter, list);
      }
    }
    this.grid = this.createEmptyGrid();
    this.wordPositions = [];
    this.usedWords = new Set();
  }

  private createEmptyGrid(): GridCell[][] {
    return Array.from({ length: this.size }, () =>
      Array.from({ length: this.size }, () => ({
        letter: ' ',
        number: null,
        isStart: false,
        isHorizontal: false,
        isVertical: false,
      }))
    );
  }

  generate(): boolean {
    if (!this.placeFirstWord()) {
      return false;
    }
    let attempts = 0;
    const maxAttempts = 150;
    while (attempts < maxAttempts) {
      if (this.addWord()) {
        attempts = 0;
      } else {
        attempts += 1;
      }
      if (this.wordPositions.length >= Math.min(20, Math.floor(this.words.length / 2))) {
        break;
      }
    }
    if (this.wordPositions.length >= 4) {
      this.fillEmptySpaces();
      this.fixTripleBlackCells();
      return this.validateGrid();
    }
    return false;
  }

  private placeFirstWord(): boolean {
    const maxLen = Math.min(this.size - 2, 8);
    const suitable = this.words.filter(
      (w) => w.text.length >= 5 && w.text.length <= maxLen && !this.usedWords.has(w.text)
    );
    if (suitable.length === 0) return false;
    const word = this.rng.choice(suitable);
    const row = Math.floor(this.size / 2);
    const col = Math.floor((this.size - word.text.length) / 2);
    const definition = this.rng.choice(word.definitions);
    return this.placeWord(word.text, word.definitions, row, col, true, definition);
  }

  private addWord(): boolean {
    const intersections = this.findIntersections();
    if (intersections.length === 0) return false;
    const shuffled = this.rng.shuffle(intersections);
    for (const [row, col, letter, isHorizontal] of shuffled) {
      const candidates = this.wordsByLetter.get(letter) ?? [];
      const possible = candidates.filter(
        (w) =>
          !this.usedWords.has(w.text) &&
          this.canPlaceWord(w.text, row, col, isHorizontal, letter)
      );
      if (possible.length > 0) {
        const word = this.rng.choice(possible);
        const offset = word.text.indexOf(letter);
        const newRow = isHorizontal ? row : row - offset;
        const newCol = isHorizontal ? col - offset : col;
        if (this.isValidPosition(newRow, newCol, word.text, isHorizontal)) {
          const definition = this.rng.choice(word.definitions);
          if (this.placeWord(word.text, word.definitions, newRow, newCol, isHorizontal, definition)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  private validateGrid(): boolean {
    // Letter sequence validity is the hard constraint.
    // Triple blacks are an aesthetic issue — after fixTripleBlackCells ran, we accept residual ones.
    return this.checkAllLetterSequences();
  }

  private checkAllLetterSequences(): boolean {
    // Check rows
    for (let row = 0; row < this.size; row++) {
      let word = '';
      for (let col = 0; col < this.size; col++) {
        const letter = this.grid[row][col].letter;
        if (letter !== ' ' && letter !== '#') {
          word += letter;
        } else {
          if (word.length >= 2 && !this.wordSet.has(word)) return false;
          word = '';
        }
      }
      if (word.length >= 2 && !this.wordSet.has(word)) return false;
    }
    // Check columns
    for (let col = 0; col < this.size; col++) {
      let word = '';
      for (let row = 0; row < this.size; row++) {
        const letter = this.grid[row][col].letter;
        if (letter !== ' ' && letter !== '#') {
          word += letter;
        } else {
          if (word.length >= 2 && !this.wordSet.has(word)) return false;
          word = '';
        }
      }
      if (word.length >= 2 && !this.wordSet.has(word)) return false;
    }
    return true;
  }

  private checkAdjacentWords(word: string, row: number, col: number, isHorizontal: boolean): boolean {
    if (!this.wordSet.has(word)) return false;
    if (isHorizontal) {
      for (let i = 0; i < word.length; i++) {
        const currRow = row;
        const currCol = col + i;
        const hasAbove = currRow > 0 && this.grid[currRow - 1][currCol].letter !== ' ' && this.grid[currRow - 1][currCol].letter !== '#';
        const hasBelow = currRow < this.size - 1 && this.grid[currRow + 1][currCol].letter !== ' ' && this.grid[currRow + 1][currCol].letter !== '#';
        if (hasAbove || hasBelow) {
          const verticalWord = this.getVerticalWord(currRow, currCol, word[i]);
          if (verticalWord && verticalWord.length >= 2 && !this.wordSet.has(verticalWord)) {
            return false;
          }
        }
      }
    } else {
      for (let i = 0; i < word.length; i++) {
        const currRow = row + i;
        const currCol = col;
        const hasLeft = currCol > 0 && this.grid[currRow][currCol - 1].letter !== ' ' && this.grid[currRow][currCol - 1].letter !== '#';
        const hasRight = currCol < this.size - 1 && this.grid[currRow][currCol + 1].letter !== ' ' && this.grid[currRow][currCol + 1].letter !== '#';
        if (hasLeft || hasRight) {
          const horizontalWord = this.getHorizontalWord(currRow, currCol, word[i]);
          if (horizontalWord && horizontalWord.length >= 2 && !this.wordSet.has(horizontalWord)) {
            return false;
          }
        }
      }
    }
    return true;
  }

  private findIntersections(): [number, number, string, boolean][] {
    const intersections: [number, number, string, boolean][] = [];
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        const cell = this.grid[row][col];
        if (cell.letter !== ' ' && cell.letter !== '#') {
          if (this.canStartVerticalWord(row, col)) {
            intersections.push([row, col, cell.letter, false]);
          }
          if (this.canStartHorizontalWord(row, col)) {
            intersections.push([row, col, cell.letter, true]);
          }
        }
      }
    }
    return intersections;
  }

  private placeWord(
    word: string,
    definitions: string[],
    row: number,
    col: number,
    isHorizontal: boolean,
    definition: string
  ): boolean {
    if (!this.checkAdjacentWords(word, row, col, isHorizontal)) {
      return false;
    }
    const number = this.wordPositions.length + 1;
    this.wordPositions.push({ word, definitions, row, col, isHorizontal, number });
    this.usedWords.add(word);

    if (this.grid[row][col].number === null) {
      this.grid[row][col].number = number;
    }
    this.grid[row][col].isStart = true;
    if (isHorizontal) {
      this.grid[row][col].isHorizontal = true;
    } else {
      this.grid[row][col].isVertical = true;
    }

    for (let i = 0; i < word.length; i++) {
      if (isHorizontal) {
        this.grid[row][col + i].letter = word[i];
      } else {
        this.grid[row + i][col].letter = word[i];
      }
    }
    this.addBlackCellsAroundWord(row, col, word.length, isHorizontal);
    return true;
  }

  private canPlaceWord(
    word: string,
    row: number,
    col: number,
    isHorizontal: boolean,
    letter: string
  ): boolean {
    const offset = word.indexOf(letter);
    const newRow = isHorizontal ? row : row - offset;
    const newCol = isHorizontal ? col - offset : col;

    if (!this.isValidPosition(newRow, newCol, word, isHorizontal)) {
      return false;
    }

    if (isHorizontal) {
      // Cell before word must not be a letter (empty or black or boundary)
      if (newCol > 0) {
        const before = this.grid[newRow][newCol - 1].letter;
        if (before !== ' ' && before !== '#') return false;
      }
      // Cell after word must not be a letter
      if (newCol + word.length < this.size) {
        const after = this.grid[newRow][newCol + word.length].letter;
        if (after !== ' ' && after !== '#') return false;
      }
    } else {
      // Cell before word must not be a letter
      if (newRow > 0) {
        const before = this.grid[newRow - 1][newCol].letter;
        if (before !== ' ' && before !== '#') return false;
      }
      // Cell after word must not be a letter
      if (newRow + word.length < this.size) {
        const after = this.grid[newRow + word.length][newCol].letter;
        if (after !== ' ' && after !== '#') return false;
      }
    }

    // Check that existing letters are compatible
    for (let i = 0; i < word.length; i++) {
      const r = isHorizontal ? newRow : newRow + i;
      const c = isHorizontal ? newCol + i : newCol;
      const existing = this.grid[r][c].letter;
      if (existing !== ' ' && existing !== word[i]) {
        return false;
      }
    }

    return true;
  }

  private addBlackCellsAroundWord(
    row: number,
    col: number,
    wordLength: number,
    isHorizontal: boolean
  ): void {
    if (isHorizontal) {
      if (col > 0) {
        const wouldTriple = col > 1 && this.grid[row][col - 2].letter === '#';
        if (!wouldTriple) {
          this.grid[row][col - 1].letter = '#';
        }
      }
      if (col + wordLength < this.size) {
        const wouldTriple =
          col + wordLength < this.size - 1 &&
          this.grid[row][col + wordLength + 1].letter === '#';
        if (!wouldTriple) {
          this.grid[row][col + wordLength].letter = '#';
        }
      }
    } else {
      if (row > 0) {
        const wouldTriple = row > 1 && this.grid[row - 2][col].letter === '#';
        if (!wouldTriple) {
          this.grid[row - 1][col].letter = '#';
        }
      }
      if (row + wordLength < this.size) {
        const wouldTriple =
          row + wordLength < this.size - 1 &&
          this.grid[row + wordLength + 1][col].letter === '#';
        if (!wouldTriple) {
          this.grid[row + wordLength][col].letter = '#';
        }
      }
    }
  }

  private fixTripleBlackCells(): void {
    let fixed = true;
    while (fixed) {
      fixed = false;
      for (let i = 0; i < this.size; i++) {
        for (let j = 0; j < this.size - 2; j++) {
          if (
            this.grid[i][j].letter === '#' &&
            this.grid[i][j + 1].letter === '#' &&
            this.grid[i][j + 2].letter === '#'
          ) {
            if (this.tryPlaceShortWord(i, j + 1, true)) {
              fixed = true;
            }
          }
          if (
            this.grid[j][i].letter === '#' &&
            this.grid[j + 1][i].letter === '#' &&
            this.grid[j + 2][i].letter === '#'
          ) {
            if (this.tryPlaceShortWord(j + 1, i, false)) {
              fixed = true;
            }
          }
        }
      }
    }
  }

  private tryPlaceShortWord(row: number, col: number, isHorizontal: boolean): boolean {
    const shortWords = this.words.filter(
      (w) => w.text.length >= 2 && w.text.length <= 4 && !this.usedWords.has(w.text)
    );
    for (const word of shortWords) {
      if (this.canPlaceWordWithoutConflict(word.text, row, col, isHorizontal)) {
        const definition = this.rng.choice(word.definitions);
        this.placeWord(word.text, word.definitions, row, col, isHorizontal, definition);
        return true;
      }
    }
    return false;
  }

  private tryAddBlackCell(row: number, col: number): boolean {
    if (row > 0 && row < this.size - 1 && col > 0 && col < this.size - 1) {
      if (!this.wouldCreateTripleBlack(row, col)) {
        if (this.canAddBlackCell(row, col)) {
          this.grid[row][col].letter = '#';
          return true;
        }
      }
    }
    return false;
  }

  private canAddBlackCell(row: number, col: number): boolean {
    // Build a temporary grid with this cell set to '#'
    const temp: string[][] = this.grid.map((r) => r.map((cell) => cell.letter));
    temp[row][col] = '#';

    // Find a starting non-black, non-empty cell
    let startR = -1;
    let startC = -1;
    outer: for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        if (temp[i][j] !== '#' && temp[i][j] !== ' ') {
          startR = i;
          startC = j;
          break outer;
        }
      }
    }

    if (startR === -1) return true; // No letter cells at all

    // Iterative DFS (avoid recursion stack overflow on large grids)
    const visited = new Set<number>();
    const encode = (r: number, c: number) => r * this.size + c;
    const stack: [number, number][] = [[startR, startC]];
    visited.add(encode(startR, startC));

    const dirs: [number, number][] = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    while (stack.length > 0) {
      const [cr, cc] = stack.pop()!;
      for (const [dr, dc] of dirs) {
        const nr = cr + dr;
        const nc = cc + dc;
        if (nr < 0 || nr >= this.size || nc < 0 || nc >= this.size) continue;
        if (temp[nr][nc] === '#' || temp[nr][nc] === ' ') continue;
        const key = encode(nr, nc);
        if (visited.has(key)) continue;
        visited.add(key);
        stack.push([nr, nc]);
      }
    }

    // Count total non-black, non-empty cells
    let nonBlack = 0;
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        if (temp[i][j] !== '#' && temp[i][j] !== ' ') nonBlack++;
      }
    }

    return visited.size === nonBlack;
  }

  private isValidPosition(row: number, col: number, word: string, isHorizontal: boolean): boolean {
    if (isHorizontal) {
      return row >= 0 && row < this.size && col >= 0 && col <= this.size - word.length;
    } else {
      return col >= 0 && col < this.size && row >= 0 && row <= this.size - word.length;
    }
  }

  private canStartVerticalWord(row: number, col: number): boolean {
    const above = row === 0 || this.grid[row - 1][col].letter === ' ' || this.grid[row - 1][col].letter === '#';
    return above && row < this.size - 1 && this.grid[row + 1][col].letter === ' ';
  }

  private canStartHorizontalWord(row: number, col: number): boolean {
    const leftOf = col === 0 || this.grid[row][col - 1].letter === ' ' || this.grid[row][col - 1].letter === '#';
    return leftOf && col < this.size - 1 && this.grid[row][col + 1].letter === ' ';
  }

  private getVerticalWord(row: number, col: number, newLetter: string): string | null {
    let startRow = row;
    while (startRow > 0 && this.grid[startRow - 1][col].letter !== ' ' && this.grid[startRow - 1][col].letter !== '#') {
      startRow--;
    }
    const word: string[] = [];
    let curr = startRow;
    while (curr < this.size && this.grid[curr][col].letter !== ' ' && this.grid[curr][col].letter !== '#') {
      word.push(curr === row ? newLetter : this.grid[curr][col].letter);
      curr++;
    }
    return word.length > 0 ? word.join('') : null;
  }

  private getHorizontalWord(row: number, col: number, newLetter: string): string | null {
    let startCol = col;
    while (startCol > 0 && this.grid[row][startCol - 1].letter !== ' ' && this.grid[row][startCol - 1].letter !== '#') {
      startCol--;
    }
    const word: string[] = [];
    let curr = startCol;
    while (curr < this.size && this.grid[row][curr].letter !== ' ' && this.grid[row][curr].letter !== '#') {
      word.push(curr === col ? newLetter : this.grid[row][curr].letter);
      curr++;
    }
    return word.length > 0 ? word.join('') : null;
  }

  private canPlaceWordWithoutConflict(
    word: string,
    row: number,
    col: number,
    isHorizontal: boolean
  ): boolean {
    if (!this.isValidPosition(row, col, word, isHorizontal)) return false;

    // Build a single temp grid with ALL letters of the word placed at once
    const temp: string[][] = this.grid.map((r) => r.map((cell) => cell.letter));
    for (let i = 0; i < word.length; i++) {
      const r = isHorizontal ? row : row + i;
      const c = isHorizontal ? col + i : col;
      if (temp[r][c] !== ' ' && temp[r][c] !== word[i]) return false;
      temp[r][c] = word[i];
    }

    // Now check all cross-sequences
    for (let i = 0; i < word.length; i++) {
      const r = isHorizontal ? row : row + i;
      const c = isHorizontal ? col + i : col;

      const vert = this.getWordAtPosition(r, c, false, temp);
      if (vert && vert.length >= 2 && !this.wordSet.has(vert)) return false;

      const horz = this.getWordAtPosition(r, c, true, temp);
      if (horz && horz.length >= 2 && !this.wordSet.has(horz)) return false;
    }
    return true;
  }

  private getWordAtPosition(
    row: number,
    col: number,
    isHorizontal: boolean,
    grid: string[][]
  ): string | null {
    let sr = row;
    let sc = col;
    if (isHorizontal) {
      while (sc > 0 && grid[row][sc - 1] !== ' ' && grid[row][sc - 1] !== '#') sc--;
    } else {
      while (sr > 0 && grid[sr - 1][col] !== ' ' && grid[sr - 1][col] !== '#') sr--;
    }
    const word: string[] = [];
    let cr = sr;
    let cc = sc;
    while (cr < this.size && cc < this.size && grid[cr][cc] !== ' ' && grid[cr][cc] !== '#') {
      word.push(grid[cr][cc]);
      if (isHorizontal) cc++;
      else cr++;
    }
    return word.length > 0 ? word.join('') : null;
  }

  private fillEmptySpaces(): void {
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        if (this.grid[row][col].letter === ' ') {
          if (!this.tryPlaceShortWord(row, col, true)) {
            if (!this.wouldCreateTripleBlack(row, col)) {
              this.grid[row][col].letter = '#';
            }
          }
        }
      }
    }
  }

  private wouldCreateTripleBlack(row: number, col: number): boolean {
    // Horizontal checks
    if (
      col > 0 &&
      col < this.size - 1 &&
      this.grid[row][col - 1].letter === '#' &&
      this.grid[row][col + 1].letter === '#'
    ) {
      return true;
    }
    if (col > 1 && this.grid[row][col - 2].letter === '#' && this.grid[row][col - 1].letter === '#') {
      return true;
    }
    if (
      col < this.size - 2 &&
      this.grid[row][col + 1].letter === '#' &&
      this.grid[row][col + 2].letter === '#'
    ) {
      return true;
    }
    // Vertical checks
    if (
      row > 0 &&
      row < this.size - 1 &&
      this.grid[row - 1][col].letter === '#' &&
      this.grid[row + 1][col].letter === '#'
    ) {
      return true;
    }
    if (row > 1 && this.grid[row - 2][col].letter === '#' && this.grid[row - 1][col].letter === '#') {
      return true;
    }
    if (
      row < this.size - 2 &&
      this.grid[row + 1][col].letter === '#' &&
      this.grid[row + 2][col].letter === '#'
    ) {
      return true;
    }
    return false;
  }

  getPuzzle(id: string): CrosswordPuzzle {
    // Build the solution grid: null for black/empty, letter for word cells
    const solution: (string | null)[][] = Array.from({ length: this.size }, (_, r) =>
      Array.from({ length: this.size }, (__, c) => {
        const letter = this.grid[r][c].letter;
        if (letter === '#' || letter === ' ') return null;
        return letter;
      })
    );

    // Assign clue numbers by scanning top-to-bottom, left-to-right.
    // A cell gets a number if it starts an across run (2+ letters) or a down run (2+ letters).
    const cellNumbers: (number | null)[][] = Array.from({ length: this.size }, () =>
      Array.from({ length: this.size }, () => null)
    );
    const cellHasAcross: boolean[][] = Array.from({ length: this.size }, () =>
      Array.from({ length: this.size }, () => false)
    );
    const cellHasDown: boolean[][] = Array.from({ length: this.size }, () =>
      Array.from({ length: this.size }, () => false)
    );

    let counter = 1;

    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        if (solution[row][col] === null) continue; // black or empty

        const startsAcross =
          (col === 0 || solution[row][col - 1] === null) &&
          col + 1 < this.size &&
          solution[row][col + 1] !== null;

        const startsDown =
          (row === 0 || solution[row - 1][col] === null) &&
          row + 1 < this.size &&
          solution[row + 1][col] !== null;

        if (startsAcross || startsDown) {
          cellNumbers[row][col] = counter++;
          if (startsAcross) cellHasAcross[row][col] = true;
          if (startsDown) cellHasDown[row][col] = true;
        }
      }
    }

    // Build CellMeta grid
    const grid: CellMeta[][] = Array.from({ length: this.size }, (_, r) =>
      Array.from({ length: this.size }, (__, c) => ({
        isBlack: solution[r][c] === null,
        number: cellNumbers[r][c],
        hasAcross: cellHasAcross[r][c],
        hasDown: cellHasDown[r][c],
      }))
    );

    // Build a lookup: (row, col) -> clue number for placed words
    // We match word positions to the newly computed cell numbers
    const acrossClues: ClueItem[] = [];
    const downClues: ClueItem[] = [];

    // Build a map from word start positions to numbers
    for (const wp of this.wordPositions) {
      const assignedNumber = cellNumbers[wp.row][wp.col];
      if (assignedNumber === null) continue;

      // Pick the definition that was used (the one in the wordPositions entry)
      // We stored definitions array; pick first definition for the clue
      const clue = wp.definitions.length > 0 ? wp.definitions[0] : wp.word;

      const item: ClueItem = {
        number: assignedNumber,
        clue,
        word: wp.word,
        row: wp.row,
        col: wp.col,
      };

      if (wp.isHorizontal) {
        acrossClues.push(item);
      } else {
        downClues.push(item);
      }
    }

    acrossClues.sort((a, b) => a.number - b.number);
    downClues.sort((a, b) => a.number - b.number);

    return {
      id,
      size: this.size,
      grid,
      solution,
      clues: {
        across: acrossClues,
        down: downClues,
      },
      generatedAt: new Date().toISOString(),
      wordCount: this.wordPositions.length,
    };
  }
}

export function generateCrossword(options: GenerateOptions, words: Word[]): CrosswordPuzzle | null {
  const { size, seed } = options;
  const baseSeed = seed ?? Date.now();

  for (let attempt = 0; attempt < 3; attempt++) {
    const rng = new SeededRandom(baseSeed + attempt * 1000000);
    const gen = new CrosswordGenerator(size, words, rng);
    if (gen.generate()) {
      const id = seed !== undefined ? `${seed}` : `${Date.now()}`;
      return gen.getPuzzle(id);
    }
  }
  return null;
}
