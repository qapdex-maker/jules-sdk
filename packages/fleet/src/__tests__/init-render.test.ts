// Copyright 2026 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { describe, it, expect } from 'vitest';
import { renderInitEvent } from '../shared/ui/render/init.js';
import type { RenderContext } from '../shared/ui/spec.js';
import { ansiLink, ansiYellow, ansiRed, ansiGreen } from '../shared/ui/session-url.js';

describe('renderInitEvent', () => {
  const createMockCtx = () => {
    const logs: string[] = [];
    const ctx: RenderContext = {
      info: (msg) => logs.push(`info: ${msg}`),
      success: (msg) => logs.push(`success: ${msg}`),
      warn: (msg) => logs.push(`warn: ${msg}`),
      error: (msg) => logs.push(`error: ${msg}`),
      message: (msg) => logs.push(`message: ${msg}`),
      step: (msg) => logs.push(`step: ${msg}`),
      startSpinner: (msg) => logs.push(`startSpinner: ${msg}`),
      stopSpinner: (msg) => logs.push(`stopSpinner${msg ? `: ${msg}` : ''}`),
    };
    return { ctx, logs };
  };

  it('renders init:repo:creating correctly', () => {
    const { ctx, logs } = createMockCtx();
    renderInitEvent(
      {
        type: 'init:repo:creating',
        owner: 'google',
        name: 'jules',
      },
      ctx,
    );
    expect(logs).toContain('startSpinner: Creating repository google/jules…');
  });

  it('renders init:repo:created correctly with clickable repository url', () => {
    const { ctx, logs } = createMockCtx();
    renderInitEvent(
      {
        type: 'init:repo:created',
        fullName: 'google/jules',
        url: 'https://github.com/google/jules',
      },
      ctx,
    );
    expect(logs).toContain(`stopSpinner: Repository google/jules created ${ansiGreen('✓')}`);
    const expectedLink = ansiLink(
      'View Repository',
      'https://github.com/google/jules',
    );
    expect(logs).toContain(`info:   ${expectedLink}`);
  });

  it('renders init:repo:exists with warning symbol', () => {
    const { ctx, logs } = createMockCtx();
    renderInitEvent(
      {
        type: 'init:repo:exists',
        fullName: 'google/jules',
      },
      ctx,
    );
    expect(logs).toContain(
      `warn:   ${ansiYellow('⊘')} Repository google/jules already exists`,
    );
  });

  it('renders init:repo:failed and stops spinner', () => {
    const { ctx, logs } = createMockCtx();
    renderInitEvent(
      {
        type: 'init:repo:failed',
        reason: 'API Error',
      },
      ctx,
    );
    expect(logs).toContain('stopSpinner');
    expect(logs).toContain(
      `error:   ${ansiRed('✗')} Repository creation failed: API Error`,
    );
  });
});
