'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { CheckCircle, Eye, EyeOff, RotateCcw, Clock, Trophy, HelpCircle, ChevronDown } from 'lucide-react';
import { CrosswordGrid } from './CrosswordGrid';
import { ClueList } from './ClueList';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { CrosswordPuzzle, ClueItem } from '@/lib/crossword/types';

interface CrosswordGameProps {
  puzzle: CrosswordPuzzle;
  storageKey?: string;
}

type CheckedCells = ('correct' | 'error' | null)[][];

function makeEmptyAnswers(size: number): (string | null)[][] {
  return Array.from({ length: size }, () => Array(size).fill(null));
}

function makeEmptyChecked(size: number): CheckedCells {
  return Array.from({ length: size }, () => Array(size).fill(null));
}

function makeEmptyRevealed(size: number): boolean[][] {
  return Array.from({ length: size }, () => Array(size).fill(false));
}

export function CrosswordGame({ puzzle, storageKey }: CrosswordGameProps) {
  const [userAnswers, setUserAnswers] = useState<(string | null)[][]>(() =>
    makeEmptyAnswers(puzzle.size)
  );
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [selectedDirection, setSelectedDirection] = useState<'across' | 'down'>('across');
  const [checkedCells, setCheckedCells] = useState<CheckedCells>(() =>
    makeEmptyChecked(puzzle.size)
  );
  const [revealedCells, setRevealedCells] = useState<boolean[][]>(() =>
    makeEmptyRevealed(puzzle.size)
  );
  const [isCompleted, setIsCompleted] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [showMobileClues, setShowMobileClues] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load from localStorage
  useEffect(() => {
    if (!storageKey) return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.answers) setUserAnswers(data.answers);
        if (data.elapsed) setElapsed(data.elapsed);
        if (data.revealed) setRevealedCells(data.revealed);
      }
    } catch {
      // ignore
    }
  }, [storageKey]);

  // Save to localStorage
  useEffect(() => {
    if (!storageKey) return;
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ answers: userAnswers, elapsed, revealed: revealedCells })
      );
    } catch {
      // ignore
    }
  }, [userAnswers, elapsed, revealedCells, storageKey]);

  // Timer
  useEffect(() => {
    if (timerRunning && !isCompleted) {
      timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning, isCompleted]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  // Find first non-black cell
  const findFirstCell = useCallback(() => {
    for (let r = 0; r < puzzle.size; r++) {
      for (let c = 0; c < puzzle.size; c++) {
        if (!puzzle.grid[r][c].isBlack) return { row: r, col: c };
      }
    }
    return null;
  }, [puzzle]);

  // Advance to next empty cell in selected direction
  const advanceCell = useCallback(
    (row: number, col: number, dir: 'across' | 'down'): { row: number; col: number } | null => {
      const size = puzzle.size;
      if (dir === 'across') {
        for (let c = col + 1; c < size; c++) {
          if (!puzzle.grid[row][c].isBlack) return { row, col: c };
        }
      } else {
        for (let r = row + 1; r < size; r++) {
          if (!puzzle.grid[r][col].isBlack) return { row: r, col };
        }
      }
      return null;
    },
    [puzzle]
  );

  const retreatCell = useCallback(
    (row: number, col: number, dir: 'across' | 'down'): { row: number; col: number } | null => {
      if (dir === 'across') {
        for (let c = col - 1; c >= 0; c--) {
          if (!puzzle.grid[row][c].isBlack) return { row, col: c };
        }
      } else {
        for (let r = row - 1; r >= 0; r--) {
          if (!puzzle.grid[r][col].isBlack) return { row: r, col };
        }
      }
      return null;
    },
    [puzzle]
  );

  const checkCompletion = useCallback(
    (answers: (string | null)[][]) => {
      for (let r = 0; r < puzzle.size; r++) {
        for (let c = 0; c < puzzle.size; c++) {
          if (!puzzle.grid[r][c].isBlack) {
            const answer = answers[r][c];
            const solution = puzzle.solution[r][c];
            if (!answer || answer !== solution) return false;
          }
        }
      }
      return true;
    },
    [puzzle]
  );

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (!timerRunning) setTimerRunning(true);

      if (selectedCell?.row === row && selectedCell?.col === col) {
        setSelectedDirection((d) => (d === 'across' ? 'down' : 'across'));
      } else {
        setSelectedCell({ row, col });
        // Prefer direction that has a word
        const cell = puzzle.grid[row][col];
        if (cell.hasAcross && !cell.hasDown) setSelectedDirection('across');
        else if (!cell.hasAcross && cell.hasDown) setSelectedDirection('down');
        // else keep current direction
      }
      setCheckedCells(makeEmptyChecked(puzzle.size));
    },
    [selectedCell, puzzle, timerRunning]
  );

  const handleInput = useCallback(
    (letter: string) => {
      if (!selectedCell || isCompleted) return;
      if (!timerRunning) setTimerRunning(true);

      const { row, col } = selectedCell;
      if (puzzle.grid[row][col].isBlack) return;

      setUserAnswers((prev) => {
        const next = prev.map((r) => [...r]);
        next[row][col] = letter;
        if (checkCompletion(next)) setIsCompleted(true);
        return next;
      });
      setCheckedCells(makeEmptyChecked(puzzle.size));

      const next = advanceCell(row, col, selectedDirection);
      if (next) setSelectedCell(next);
    },
    [selectedCell, puzzle, selectedDirection, advanceCell, checkCompletion, timerRunning, isCompleted]
  );

  const handleBackspace = useCallback(() => {
    if (!selectedCell || isCompleted) return;
    const { row, col } = selectedCell;
    if (userAnswers[row][col]) {
      setUserAnswers((prev) => {
        const next = prev.map((r) => [...r]);
        next[row][col] = null;
        return next;
      });
    } else {
      const prev = retreatCell(row, col, selectedDirection);
      if (prev) {
        setSelectedCell(prev);
        setUserAnswers((ans) => {
          const next = ans.map((r) => [...r]);
          next[prev.row][prev.col] = null;
          return next;
        });
      }
    }
    setCheckedCells(makeEmptyChecked(puzzle.size));
  }, [selectedCell, userAnswers, selectedDirection, retreatCell, isCompleted]);

  const handleArrow = useCallback(
    (dir: 'up' | 'down' | 'left' | 'right') => {
      if (!selectedCell) {
        setSelectedCell(findFirstCell());
        return;
      }
      const { row, col } = selectedCell;
      const size = puzzle.size;
      let nr = row;
      let nc = col;

      if (dir === 'left') {
        for (let c = col - 1; c >= 0; c--) {
          if (!puzzle.grid[row][c].isBlack) { nc = c; break; }
        }
        setSelectedDirection('across');
      } else if (dir === 'right') {
        for (let c = col + 1; c < size; c++) {
          if (!puzzle.grid[row][c].isBlack) { nc = c; break; }
        }
        setSelectedDirection('across');
      } else if (dir === 'up') {
        for (let r = row - 1; r >= 0; r--) {
          if (!puzzle.grid[r][col].isBlack) { nr = r; break; }
        }
        setSelectedDirection('down');
      } else {
        for (let r = row + 1; r < size; r++) {
          if (!puzzle.grid[r][col].isBlack) { nr = r; break; }
        }
        setSelectedDirection('down');
      }
      setSelectedCell({ row: nr, col: nc });
    },
    [selectedCell, puzzle, findFirstCell]
  );

  const handleClueClick = useCallback(
    (clue: ClueItem, direction: 'across' | 'down') => {
      setSelectedCell({ row: clue.row, col: clue.col });
      setSelectedDirection(direction);
      setShowMobileClues(false);
    },
    []
  );

  const handleCheck = useCallback(() => {
    const checked: CheckedCells = makeEmptyChecked(puzzle.size);
    for (let r = 0; r < puzzle.size; r++) {
      for (let c = 0; c < puzzle.size; c++) {
        const answer = userAnswers[r][c];
        const solution = puzzle.solution[r][c];
        if (!puzzle.grid[r][c].isBlack && answer) {
          checked[r][c] = answer === solution ? 'correct' : 'error';
        }
      }
    }
    setCheckedCells(checked);
  }, [userAnswers, puzzle]);

  const handleRevealCell = useCallback(() => {
    if (!selectedCell) return;
    const { row, col } = selectedCell;
    setRevealedCells((prev) => {
      const next = prev.map((r) => [...r]);
      next[row][col] = true;
      return next;
    });
    setUserAnswers((prev) => {
      const next = prev.map((r) => [...r]);
      next[row][col] = puzzle.solution[row][col];
      return next;
    });
  }, [selectedCell, puzzle]);

  const handleReset = useCallback(() => {
    setUserAnswers(makeEmptyAnswers(puzzle.size));
    setCheckedCells(makeEmptyChecked(puzzle.size));
    setRevealedCells(makeEmptyRevealed(puzzle.size));
    setIsCompleted(false);
    setShowSolution(false);
    setElapsed(0);
    setTimerRunning(false);
    setSelectedCell(null);
  }, [puzzle.size]);

  const filledCount = userAnswers.flat().filter(Boolean).length;
  const totalCells = puzzle.grid.flat().filter((c) => !c.isBlack).length;
  const progressPct = totalCells > 0 ? Math.round((filledCount / totalCells) * 100) : 0;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Controls bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Timer */}
          <div className="flex items-center gap-1.5 rounded-lg bg-surface-alt px-3 py-1.5 border border-border">
            <Clock className="h-3.5 w-3.5 text-zinc-400" />
            <span className="font-mono text-sm text-zinc-300 tabular-nums">{formatTime(elapsed)}</span>
          </div>
          {/* Progress */}
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-24 rounded-full bg-surface-alt overflow-hidden">
              <div
                className="h-full rounded-full bg-primary-light transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-xs text-zinc-500">{progressPct}%</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleCheck} title="Verifica le risposte">
            <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
            Verifica
          </Button>
          <Button variant="outline" size="sm" onClick={handleRevealCell} title="Rivela la lettera selezionata">
            <Eye className="h-3.5 w-3.5 mr-1.5" />
            Rivela
          </Button>
          <Button variant="ghost" size="sm" onClick={handleReset} title="Ricomincia">
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Completion banner */}
      {isCompleted && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 animate-slide-up">
          <Trophy className="h-5 w-5 text-emerald-400 shrink-0" />
          <div>
            <p className="font-medium text-emerald-300">Complimenti! Hai completato il cruciverba!</p>
            <p className="text-sm text-emerald-400/70">Tempo: {formatTime(elapsed)}</p>
          </div>
        </div>
      )}

      {/* Mobile: active clue hint */}
      <div className="lg:hidden">
        <button
          className="w-full flex items-center justify-between rounded-lg bg-surface-alt border border-border px-3 py-2.5 text-sm text-zinc-300"
          onClick={() => setShowMobileClues(!showMobileClues)}
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-zinc-400" />
            <span className="text-zinc-400">
              {selectedDirection === 'across' ? 'Orizzontale' : 'Verticale'}
            </span>
          </div>
          <ChevronDown className={cn('h-4 w-4 text-zinc-400 transition-transform', showMobileClues && 'rotate-180')} />
        </button>
        {showMobileClues && (
          <div className="mt-2 rounded-lg border border-border bg-surface p-4 max-h-64 overflow-y-auto">
            <ClueList
              puzzle={puzzle}
              selectedCell={selectedCell}
              selectedDirection={selectedDirection}
              onClueClick={handleClueClick}
              userAnswers={userAnswers}
            />
          </div>
        )}
      </div>

      {/* Main layout: grid + clues */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start justify-center">
        {/* Grid */}
        <div className="flex-shrink-0 mx-auto lg:mx-0">
          <CrosswordGrid
            puzzle={puzzle}
            userAnswers={showSolution ? puzzle.solution.map((row) => row.map((l) => l)) : userAnswers}
            selectedCell={selectedCell}
            selectedDirection={selectedDirection}
            checkedCells={showSolution ? makeEmptyChecked(puzzle.size) : checkedCells}
            revealedCells={revealedCells}
            onCellClick={handleCellClick}
            onInput={handleInput}
            onBackspace={handleBackspace}
            onArrow={handleArrow}
            onToggleDirection={() => setSelectedDirection((d) => (d === 'across' ? 'down' : 'across'))}
          />
          <p className="mt-2 text-center text-xs text-zinc-600">
            Clicca due volte per cambiare direzione · Tab per alternare · Frecce per spostarsi
          </p>
        </div>

        {/* Clues — desktop */}
        <div className="hidden lg:flex flex-col min-w-[240px] max-w-[300px] max-h-[640px] overflow-y-auto rounded-xl border border-border bg-surface p-4 flex-1">
          <ClueList
            puzzle={puzzle}
            selectedCell={selectedCell}
            selectedDirection={selectedDirection}
            onClueClick={handleClueClick}
            userAnswers={userAnswers}
          />
        </div>
      </div>
    </div>
  );
}
