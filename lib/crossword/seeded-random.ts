export class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed >>> 0;
  }

  next(): number {
    let t = (this.seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  nextInt(max: number): number {
    return Math.floor(this.next() * max);
  }

  choice<T>(arr: T[]): T {
    if (arr.length === 0) throw new Error('Cannot choose from empty array');
    return arr[this.nextInt(arr.length)];
  }

  shuffle<T>(arr: T[]): T[] {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.nextInt(i + 1);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  sample<T>(arr: T[], n: number): T[] {
    return this.shuffle(arr).slice(0, n);
  }
}

export function dateToSeed(dateStr: string): number {
  // Convert YYYY-MM-DD to a consistent integer
  const parts = dateStr.split('-').map(Number);
  return (parts[0] * 10000 + parts[1] * 100 + parts[2]) >>> 0;
}
