'use client';

import { useCallback, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import type { CrosswordPuzzle } from '@/lib/crossword/types';

interface CrosswordGridProps {
  puzzle: CrosswordPuzzle;
  userAnswers: (string | null)[][];
  selectedCell: { row: number; col: number } | null;
  selectedDirection: 'across' | 'down';
  checkedCells: ('correct' | 'error' | null)[][];
  revealedCells: boolean[][];
  onCellClick: (row: number, col: number) => void;
  onInput: (letter: string) => void;
  onBackspace: () => void;
  onArrow: (dir: 'up' | 'down' | 'left' | 'right') => void;
  onToggleDirection: () => void;
}

export function CrosswordGrid({
  puzzle,
  userAnswers,
  selectedCell,
  selectedDirection,
  checkedCells,
  revealedCells,
  onCellClick,
  onInput,
  onBackspace,
  onArrow,
  onToggleDirection,
}: CrosswordGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus hidden input whenever a cell is selected
  useEffect(() => {
    if (selectedCell && inputRef.current) {
      inputRef.current.focus();
    }
  }, [selectedCell]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Backspace') {
        e.preventDefault();
        onBackspace();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        onArrow('up');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        onArrow('down');
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onArrow('left');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onArrow('right');
      } else if (e.key === 'Tab') {
        e.preventDefault();
        onToggleDirection();
      } else if (/^[a-zA-ZàáèéìíòóùúÀÁÈÉÌÍÒÓÙÚ]$/.test(e.key)) {
        e.preventDefault();
        onInput(e.key.toUpperCase());
      }
    },
    [onBackspace, onArrow, onToggleDirection, onInput]
  );

  // Compute which cells belong to the selected word
  const selectedWordCells = getSelectedWordCells(puzzle, selectedCell, selectedDirection);

  const cellSize = getCellSize(puzzle.size);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Hidden input for mobile keyboard */}
      <input
        ref={inputRef}
        className="sr-only"
        aria-label="Input lettere"
        readOnly
        onKeyDown={handleKeyDown}
      />

      {/* Grid */}
      <div
        ref={containerRef}
        className="inline-block rounded-lg overflow-hidden shadow-2xl border border-gray-200 bg-white"
        role="grid"
        aria-label="Griglia cruciverba"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        style={{ outline: 'none' }}
      >
        {puzzle.grid.map((row, rIdx) => (
          <div key={rIdx} className="flex" role="row">
            {row.map((cell, cIdx) => {
              const isSelected =
                selectedCell?.row === rIdx && selectedCell?.col === cIdx;
              const isInWord = selectedWordCells.has(`${rIdx},${cIdx}`);
              const userLetter = userAnswers[rIdx]?.[cIdx] ?? null;
              const checkState = checkedCells[rIdx]?.[cIdx] ?? null;
              const isRevealed = revealedCells[rIdx]?.[cIdx] ?? false;
              const solutionLetter = puzzle.solution[rIdx]?.[cIdx];

              return (
                <div
                  key={cIdx}
                  role="gridcell"
                  aria-label={
                    cell.isBlack
                      ? 'cella nera'
                      : `riga ${rIdx + 1} colonna ${cIdx + 1}${cell.number ? ` numero ${cell.number}` : ''}`
                  }
                  style={{ width: cellSize, height: cellSize }}
                  className={cn(
                    'relative border select-none',
                    cell.isBlack
                      ? 'bg-black border-gray-900 cursor-default'
                      : [
                          'cursor-pointer border-gray-300 transition-colors duration-75',
                          isSelected
                            ? 'bg-violet-200 border-violet-400'
                            : isInWord
                            ? 'bg-violet-50 border-gray-300'
                            : isRevealed
                            ? 'bg-amber-50'
                            : checkState === 'correct'
                            ? 'bg-emerald-100'
                            : checkState === 'error'
                            ? 'bg-red-100'
                            : 'bg-white hover:bg-violet-50',
                        ]
                  )}
                  onClick={() => !cell.isBlack && onCellClick(rIdx, cIdx)}
                >
                  {!cell.isBlack && (
                    <>
                      {cell.number !== null && (
                        <span
                          className="absolute top-0.5 left-0.5 text-gray-500 leading-none pointer-events-none font-sans select-none"
                          style={{ fontSize: Math.max(7, cellSize * 0.22) }}
                        >
                          {cell.number}
                        </span>
                      )}
                      <span
                        className={cn(
                          'absolute inset-0 flex items-center justify-center font-bold text-gray-900 pointer-events-none font-sans uppercase select-none',
                          checkState === 'error' && 'text-red-600',
                          isRevealed && 'text-amber-700'
                        )}
                        style={{ fontSize: Math.max(10, cellSize * 0.55) }}
                      >
                        {isRevealed ? solutionLetter : userLetter}
                      </span>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function getCellSize(gridSize: number): number {
  if (gridSize <= 10) return 44;
  if (gridSize <= 13) return 38;
  if (gridSize <= 15) return 34;
  if (gridSize <= 17) return 30;
  return 26;
}

function getSelectedWordCells(
  puzzle: CrosswordPuzzle,
  selectedCell: { row: number; col: number } | null,
  direction: 'across' | 'down'
): Set<string> {
  if (!selectedCell) return new Set();

  const cells = new Set<string>();
  const { row, col } = selectedCell;
  const size = puzzle.size;
  const grid = puzzle.grid;

  if (direction === 'across') {
    // Find start of word
    let startCol = col;
    while (startCol > 0 && !grid[row][startCol - 1].isBlack) startCol--;
    // Walk right
    let c = startCol;
    while (c < size && !grid[row][c].isBlack) {
      cells.add(`${row},${c}`);
      c++;
    }
  } else {
    // Find start of word
    let startRow = row;
    while (startRow > 0 && !grid[startRow - 1][col].isBlack) startRow--;
    // Walk down
    let r = startRow;
    while (r < size && !grid[r][col].isBlack) {
      cells.add(`${r},${col}`);
      r++;
    }
  }

  return cells;
}
