'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import type { ClueItem, CrosswordPuzzle } from '@/lib/crossword/types';

interface ClueListProps {
  puzzle: CrosswordPuzzle;
  selectedCell: { row: number; col: number } | null;
  selectedDirection: 'across' | 'down';
  onClueClick: (clue: ClueItem, direction: 'across' | 'down') => void;
  userAnswers: (string | null)[][];
}

export function ClueList({
  puzzle,
  selectedCell,
  selectedDirection,
  onClueClick,
  userAnswers,
}: ClueListProps) {
  const activeClueRef = useRef<HTMLLIElement>(null);

  const activeAcrossClue = getActiveClue(puzzle, selectedCell, 'across');
  const activeDownClue = getActiveClue(puzzle, selectedCell, 'down');

  useEffect(() => {
    activeClueRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [activeAcrossClue, activeDownClue]);

  const isClueComplete = (clue: ClueItem): boolean => {
    const { row, col } = clue;
    const isAcross = puzzle.clues.across.includes(clue);
    let r = row;
    let c = col;
    for (let i = 0; i < clue.word.length; i++) {
      if (!userAnswers[r]?.[c]) return false;
      if (isAcross) c++;
      else r++;
    }
    return true;
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      <ClueSection
        title="Orizzontali"
        clues={puzzle.clues.across}
        direction="across"
        activeClue={activeAcrossClue}
        selectedDirection={selectedDirection}
        activeClueRef={activeClueRef}
        onClueClick={onClueClick}
        isClueComplete={isClueComplete}
      />
      <ClueSection
        title="Verticali"
        clues={puzzle.clues.down}
        direction="down"
        activeClue={activeDownClue}
        selectedDirection={selectedDirection}
        activeClueRef={null}
        onClueClick={onClueClick}
        isClueComplete={isClueComplete}
      />
    </div>
  );
}

interface ClueSectionProps {
  title: string;
  clues: ClueItem[];
  direction: 'across' | 'down';
  activeClue: ClueItem | null;
  selectedDirection: 'across' | 'down';
  activeClueRef: React.RefObject<HTMLLIElement> | null;
  onClueClick: (clue: ClueItem, direction: 'across' | 'down') => void;
  isClueComplete: (clue: ClueItem) => boolean;
}

function ClueSection({
  title,
  clues,
  direction,
  activeClue,
  selectedDirection,
  activeClueRef,
  onClueClick,
  isClueComplete,
}: ClueSectionProps) {
  const isActiveDirection = selectedDirection === direction;

  return (
    <div className="flex flex-col">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-2 px-1">
        {title}
      </h3>
      <ul className="space-y-0.5">
        {clues.map((clue) => {
          const isActive = activeClue?.number === clue.number;
          const complete = isClueComplete(clue);
          return (
            <li
              key={clue.number}
              ref={isActive && isActiveDirection ? activeClueRef : undefined}
              className={cn(
                'flex items-start gap-2 rounded-md px-2 py-1.5 cursor-pointer transition-colors text-sm',
                isActive && isActiveDirection
                  ? 'bg-primary/20 text-zinc-100'
                  : isActive
                  ? 'bg-surface-alt text-zinc-200'
                  : 'text-zinc-400 hover:bg-surface-alt hover:text-zinc-200',
                complete && 'opacity-50'
              )}
              onClick={() => onClueClick(clue, direction)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onClueClick(clue, direction)}
            >
              <span
                className={cn(
                  'shrink-0 font-bold w-5 text-right',
                  isActive && isActiveDirection ? 'text-primary-light' : 'text-zinc-500'
                )}
              >
                {clue.number}
              </span>
              <span className="leading-snug">{clue.clue}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function getActiveClue(
  puzzle: CrosswordPuzzle,
  selectedCell: { row: number; col: number } | null,
  direction: 'across' | 'down'
): ClueItem | null {
  if (!selectedCell) return null;

  const clues = direction === 'across' ? puzzle.clues.across : puzzle.clues.down;
  const { row, col } = selectedCell;
  const grid = puzzle.grid;
  const size = puzzle.size;

  if (direction === 'across') {
    let startCol = col;
    while (startCol > 0 && !grid[row][startCol - 1].isBlack) startCol--;
    return clues.find((c) => c.row === row && c.col === startCol) ?? null;
  } else {
    let startRow = row;
    while (startRow > 0 && !grid[startRow - 1][col].isBlack) startRow--;
    return clues.find((c) => c.row === startRow && c.col === col) ?? null;
  }
}
