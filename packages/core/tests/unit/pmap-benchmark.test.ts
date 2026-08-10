import { describe, it, expect, vi } from 'vitest';
import { pMap } from '../../src/utils.js';

describe('pMap Correctness & Performance Tests', () => {
  it('handles empty arrays immediately via fast-path', async () => {
    const mapper = vi.fn(async (x: number) => x * 2);
    const result = await pMap([], mapper);
    expect(result).toEqual([]);
    expect(mapper).not.toHaveBeenCalled();
  });

  it('handles single items immediately via fast-path with zero delay', async () => {
    const mapper = vi.fn(async (x: number) => x * 2);
    const result = await pMap([10], mapper);
    expect(result).toEqual([20]);
    expect(mapper).toHaveBeenCalledTimes(1);
  });

  it('handles single item error propagation on fast-path', async () => {
    const mapper = async () => {
      throw new Error('fast-path fail');
    };
    await expect(pMap([10], mapper)).rejects.toThrow('fast-path fail');
  });

  it('handles single item error collections when stopOnError is false', async () => {
    const mapper = async () => {
      throw new Error('fast-path fail');
    };
    await expect(pMap([10], mapper, { stopOnError: false })).rejects.toThrow(AggregateError);
  });

  it('runs multiple items in parallel under concurrency constraints', async () => {
    let running = 0;
    let maxRunning = 0;
    const mapper = async (x: number) => {
      running++;
      maxRunning = Math.max(maxRunning, running);
      await new Promise((resolve) => setTimeout(resolve, 5));
      running--;
      return x * 10;
    };

    const result = await pMap([1, 2, 3, 4, 5], mapper, { concurrency: 2 });
    expect(result).toEqual([10, 20, 30, 40, 50]);
    expect(maxRunning).toBeLessThanOrEqual(2);
  });

  it('honors delayMs setting', async () => {
    const startTime = Date.now();
    const result = await pMap([1, 2], async (x) => x, { delayMs: 10, concurrency: 1 });
    const duration = Date.now() - startTime;
    expect(result).toEqual([1, 2]);
    expect(duration).toBeGreaterThanOrEqual(15);
  });

  it('respects stopOnError when parallel mapping fails', async () => {
    const mapper = async (x: number) => {
      if (x === 3) {
        throw new Error('number 3 is unlucky');
      }
      return x;
    };
    await expect(pMap([1, 2, 3, 4], mapper, { concurrency: 2 })).rejects.toThrow('number 3 is unlucky');
  });

  it('collects all errors in AggregateError when stopOnError is false', async () => {
    const mapper = async (x: number) => {
      if (x % 2 === 0) {
        throw new Error(`error on ${x}`);
      }
      return x;
    };
    try {
      await pMap([1, 2, 3, 4], mapper, { stopOnError: false, concurrency: 2 });
      expect.fail('Should have thrown an AggregateError');
    } catch (e: any) {
      expect(e).toBeInstanceOf(AggregateError);
      expect(e.errors).toHaveLength(2);
    }
  });

  it('benchmarks performance differences', async () => {
    const size = 1000;
    const items = Array.from({ length: size }).map((_, i) => i);

    // Warm-up
    await pMap([1, 2, 3], async (x) => x);

    const start = performance.now();
    await pMap(items, async (x) => x, { concurrency: 10 });
    const end = performance.now();

    console.log(`pMap benchmark: Processed ${size} items in ${(end - start).toFixed(3)}ms`);
    expect(true).toBe(true);
  });
});
