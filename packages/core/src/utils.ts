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

/**
 * The internal engine for jules.all()
 *
 * Highly optimized parallel mapping function with fast-paths.
 * - O(1) instant return for empty inputs (bypasses all worker allocation/Promise.all overhead).
 * - O(1) instant return for single-item inputs (bypasses worker allocation, array filling, Promise.all/loops).
 * - Capped concurrency pool Math.min(concurrency, items.length) to eliminate spawning redundant worker promises
 *   when concurrency is greater than the item count.
 *
 * @param items - Data to process
 * @param mapper - Async function (item) => result
 * @param options - Configuration options
 */
export async function pMap<T, R>(
  items: T[],
  mapper: (item: T, index: number) => Promise<R>,
  options: {
    concurrency?: number;
    stopOnError?: boolean;
    delayMs?: number;
  } = {},
): Promise<R[]> {
  const length = items.length;

  // Performance Optimization Fast-Path 1: Empty input list
  // Instantly return an empty array without allocating anything, bypassing the worker pool entirely.
  if (length === 0) {
    return [];
  }

  const stopOnError = options.stopOnError ?? true;
  const delayMs = options.delayMs ?? 0;

  // Performance Optimization Fast-Path 2: Single-item input list
  // Avoids filling arrays, creating microtasks, allocating workers, and Promise.all overhead.
  if (length === 1) {
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
    try {
      const res = await mapper(items[0], 0);
      return [res];
    } catch (err) {
      if (stopOnError) {
        throw err;
      }
      throw new AggregateError(
        [err],
        'Multiple errors occurred during jules.all()',
      );
    }
  }

  // Performance Optimization Fast-Path 3: Limit active worker pool allocation to actual item length.
  // This eliminates allocating, filling, mapping, and executing redundant worker promises (e.g. concurrency=25 but items=2).
  const concurrency = Math.min(options.concurrency ?? 3, length);
  const results = new Array<R>(length);
  const errors = new Array<Error | unknown>();
  let nextIndex = 0;

  const workers = new Array(concurrency).fill(0).map(async () => {
    while (true) {
      const index = nextIndex++;
      if (index >= length) {
        break;
      }
      const item = items[index];

      if (delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
      try {
        results[index] = await mapper(item, index);
      } catch (err) {
        if (stopOnError) {
          throw err;
        }
        errors.push(err);
      }
    }
  });

  await Promise.all(workers);

  if (!stopOnError && errors.length > 0) {
    throw new AggregateError(
      errors,
      'Multiple errors occurred during jules.all()',
    );
  }

  return results;
}
