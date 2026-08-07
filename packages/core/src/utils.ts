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
  const concurrency = options.concurrency ?? 3;
  const stopOnError = options.stopOnError ?? true;
  const delayMs = options.delayMs ?? 0;

  // Optimization: Fast-path for empty array to completely bypass worker allocation and promise chaining.
  if (items.length === 0) {
    return [];
  }

  // Optimization: Fast-path for single-item array to completely bypass worker allocation and promise chaining.
  if (items.length === 1) {
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
    try {
      const result = await mapper(items[0], 0);
      return [result];
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

  const results = new Array<R>(items.length);
  const errors = new Array<Error | unknown>();
  let nextIndex = 0;

  // Optimization: Limit worker pool size to Math.min(concurrency, items.length) to avoid allocating and initializing redundant workers.
  const workerCount = Math.min(concurrency, items.length);
  const workers = new Array(workerCount).fill(0).map(async () => {
    while (true) {
      const index = nextIndex++;
      if (index >= items.length) {
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
