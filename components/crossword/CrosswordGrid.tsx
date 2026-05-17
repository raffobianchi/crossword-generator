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

  useEffect(() => {
    if (selectedCell && inputRef.current) inputRef.current.focus();
  }, [selectedCell]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Backspace') { e.preventDefault(); onBackspace(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); onArrow('up'); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); onArrow('down'); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); onArrow('left'); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); onArrow('right'); }
      else if (e.key === 'Tab') { e.preventDefault(); onToggleDirection(); }
      else if (/^[a-zA-ZàáèéìíòóùúÀÁÈÉÌÍÒÓÙÚ]$/.test(e.key)) { e.preventDefault(); onInput(e.key.toUpperCase()); }
    },
    [onBackspace, onArrow, onToggleDirection, onInput]
  );

  const selectedWordCells = getSelectedWordCells(puzzle, selectedCell, selectedDirection);
  const cellSize = getCellSize(puzzle.size);

  return (
    <div className="flex flex-col items-center gap-4">
      <input ref={inputRef} className="sr-only" aria-label="Input lettere" readOnly onKeyDown={handleKeyDown} />

      <div
        ref={containerRef}
        className="inline-block rounded-2xl overflow-hidden shadow-lg border-2 border-[#DEC8B0]"
        role="grid"
        aria-label="Griglia cruciverba"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        style={{ outline: 'none' }}
      >
        {puzzle.grid.map((row, rIdx) => (
          <div key={rIdx} className="flex" role="row">
            {row.map((cell, cIdx) => {
              const isSelected = selectedCell?.row === rIdx && selectedCell?.col === cIdx;
              const isInWord = selectedWordCells.has(`${rIdx},${cIdx}`);
              const userLetter = userAnswers[rIdx]?.[cIdx] ?? null;
              const checkState = checkedCells[rIdx]?.[cIdx] ?? null;
              const isRevealed = revealedCells[rIdx]?.[cIdx] ?? false;
              const solutionLetter = puzzle.solution[rIdx]?.[cIdx];

              const cellBg = cell.isBlack
                ? '#4A2E18'
                : isSelected
                ? '#C4845A'
                : isInWord
                ? '#FFE8CC'
                : isRevealed
                ? '#FAEAB8'
                : checkState === 'correct'
                ? '#D4EAC0'
                : checkState === 'error'
                ? '#F0C4BC'
                : '#FFFFFF';

              return (
                <div
                  key={cIdx}
                  role="gridcell"
                  aria-label={cell.isBlack ? 'cella nera' : `riga ${rIdx + 1} colonna ${cIdx + 1}`}
                  style={{
                    width: cellSize,
                    height: cellSize,
                    backgroundColor: cellBg,
                    borderRight: '1px solid #DEC8B0',
                    borderBottom: '1px solid #DEC8B0',
                    position: 'relative',
                    cursor: cell.isBlack ? 'default' : 'pointer',
                    transition: 'background-color 80ms',
                  }}
                  onClick={() => !cell.isBlack && onCellClick(rIdx, cIdx)}
                >
                  {!cell.isBlack && (
                    <>
                      {cell.number !== null && (
                        <span
                          style={{
                            position: 'absolute',
                            top: 2,
                            left: 2,
                            fontSize: Math.max(7, cellSize * 0.22),
                            lineHeight: 1,
                            color: isSelected ? '#FFF0E0' : '#A06038',
                            fontFamily: 'var(--font-inter), system-ui, sans-serif',
                            userSelect: 'none',
                            pointerEvents: 'none',
                          }}
                        >
                          {cell.number}
                        </span>
                      )}
                      <span
                        style={{
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: Math.max(10, cellSize * 0.55),
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          fontFamily: 'var(--font-inter), system-ui, sans-serif',
                          userSelect: 'none',
                          pointerEvents: 'none',
                          color: isSelected
                            ? '#FFFFFF'
                            : checkState === 'error'
                            ? '#B03020'
                            : isRevealed
                            ? '#7A5030'
                            : '#3D2010',
                        }}
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
    let startCol = col;
    while (startCol > 0 && !grid[row][startCol - 1].isBlack) startCol--;
    let c = startCol;
    while (c < size && !grid[row][c].isBlack) { cells.add(`${row},${c}`); c++; }
  } else {
    let startRow = row;
    while (startRow > 0 && !grid[startRow - 1][col].isBlack) startRow--;
    let r = startRow;
    while (r < size && !grid[r][col].isBlack) { cells.add(`${r},${col}`); r++; }
  }
  return cells;
}
