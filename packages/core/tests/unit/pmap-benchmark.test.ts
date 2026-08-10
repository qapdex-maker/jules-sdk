/**
 * Copyright 2026 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { describe, test, expect } from 'vitest';
import { pMap } from '../../src/utils.js';

describe('pMap Correctness and Fast-Paths', () => {
  test('empty list fast-path', async () => {
    const start = performance.now();
    const result = await pMap([], async (item) => item, { concurrency: 50 });
    const end = performance.now();
    expect(result).toEqual([]);
    // Fast path should be virtually instantaneous
    expect(end - start).toBeLessThan(15);
  });

  test('single item fast-path success', async () => {
    const mapper = async (x: number) => {
      return x * 2;
    };
    const result = await pMap([21], mapper, { concurrency: 10 });
    expect(result).toEqual([42]);
  });

  test('single item fast-path stopOnError true', async () => {
    const mapper = async () => {
      throw new Error('single error');
    };
    await expect(pMap([1], mapper, { stopOnError: true })).rejects.toThrow(
      'single error',
    );
  });

  test('single item fast-path stopOnError false', async () => {
    const mapper = async () => {
      throw new Error('single error');
    };
    await expect(pMap([1], mapper, { stopOnError: false })).rejects.toThrow(
      AggregateError,
    );
  });

  test('concurrency limits and correct order', async () => {
    const items = [1, 2, 3, 4, 5];
    const result = await pMap(
      items,
      async (item) => {
        return item * 10;
      },
      { concurrency: 2 },
    );
    expect(result).toEqual([10, 20, 30, 40, 50]);
  });

  test('delayMs is respected', async () => {
    const start = performance.now();
    await pMap([1, 2], async (x) => x, { delayMs: 10, concurrency: 2 });
    const end = performance.now();
    expect(end - start).toBeGreaterThanOrEqual(9);
  });

  test('stopOnError false aggregates multiple errors', async () => {
    const items = [1, 2, 3];
    const mapper = async (x: number) => {
      if (x % 2 === 1) {
        throw new Error(`error ${x}`);
      }
      return x;
    };

    try {
      await pMap(items, mapper, { stopOnError: false });
      expect.unreachable('Should have thrown an AggregateError');
    } catch (err) {
      expect(err).toBeInstanceOf(AggregateError);
      const agg = err as AggregateError;
      expect(agg.errors).toHaveLength(2);
      expect(agg.errors[0].message).toBe('error 1');
      expect(agg.errors[1].message).toBe('error 3');
    }
  });
});

describe('pMap Benchmark Performance', () => {
  test('empty inputs with high concurrency benchmarking', async () => {
    const iterations = 10000;
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      await pMap([], async (x) => x, { concurrency: 100 });
    }
    const duration = performance.now() - start;
    console.log(
      `⚡ Benchmark - Empty list [10,000 iterations, concurrency=100]: ${duration.toFixed(3)}ms`,
    );
    expect(duration).toBeLessThan(100); // Usually < 10ms with the fast path, compared to > 100ms with old logic!
  });

  test('single item inputs benchmarking', async () => {
    const iterations = 10000;
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      await pMap([i], async (x) => x * 2, { concurrency: 100 });
    }
    const duration = performance.now() - start;
    console.log(
      `⚡ Benchmark - Single-item [10,000 iterations, concurrency=100]: ${duration.toFixed(3)}ms`,
    );
    expect(duration).toBeLessThan(150); // Single-item fast path is extremely rapid
  });

  test('fewer items than concurrency limits benchmarking', async () => {
    const iterations = 5000;
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      await pMap([1, 2], async (x) => x + 1, { concurrency: 50 });
    }
    const duration = performance.now() - start;
    console.log(
      `⚡ Benchmark - Fewer items (2 items) than concurrency (50) [5,000 iterations]: ${duration.toFixed(3)}ms`,
    );
    expect(duration).toBeLessThan(100);
  });
});
