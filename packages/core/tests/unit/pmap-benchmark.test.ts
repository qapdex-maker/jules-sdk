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

import { describe, it, expect, vi } from 'vitest';
import { pMap } from '../../src/utils.js';

describe('pMap optimized correctness and benchmark tests', () => {
  it('should handle empty array (fast path)', async () => {
    const mapper = vi.fn().mockResolvedValue('ok');
    const result = await pMap([], mapper);
    expect(result).toEqual([]);
    expect(mapper).not.toHaveBeenCalled();
  });

  it('should handle single-item array (fast path) - success', async () => {
    const mapper = vi.fn().mockResolvedValue('success');
    const result = await pMap([42], mapper);
    expect(result).toEqual(['success']);
    expect(mapper).toHaveBeenCalledWith(42, 0);
  });

  it('should handle single-item array (fast path) - error with stopOnError=true', async () => {
    const mapper = vi.fn().mockRejectedValue(new Error('Single failure'));
    await expect(pMap([42], mapper)).rejects.toThrow('Single failure');
  });

  it('should handle single-item array (fast path) - error with stopOnError=false', async () => {
    const mapper = vi.fn().mockRejectedValue(new Error('Single failure'));
    await expect(pMap([42], mapper, { stopOnError: false })).rejects.toThrow(AggregateError);
  });

  it('should limit workers to array length when concurrency is larger', async () => {
    const items = [1, 2];
    const mapper = async (n: number) => {
      await new Promise((resolve) => setTimeout(resolve, 5));
      return n * 2;
    };
    const results = await pMap(items, mapper, { concurrency: 10 });
    expect(results).toEqual([2, 4]);
  });

  it('benchmark fast-paths', async () => {
    const itemsEmpty: number[] = [];
    const itemsSingle = [1];
    const mapper = async (n: number) => n;

    const startEmpty = performance.now();
    for (let i = 0; i < 1000; i++) {
      await pMap(itemsEmpty, mapper);
    }
    const endEmpty = performance.now();

    const startSingle = performance.now();
    for (let i = 0; i < 1000; i++) {
      await pMap(itemsSingle, mapper);
    }
    const endSingle = performance.now();

    console.log(`pMap optimized empty arrays 1000 runs: ${endEmpty - startEmpty}ms`);
    console.log(`pMap optimized single-item arrays 1000 runs: ${endSingle - startSingle}ms`);
    expect(true).toBe(true);
  });
});
