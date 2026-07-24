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
import { renderMergeEvent } from '../shared/ui/render/merge.js';
import type { RenderContext } from '../shared/ui/spec.js';
import { sessionUrl, ansiLink } from '../shared/ui/session-url.js';

describe('renderMergeEvent', () => {
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

  it('renders merge:conflict:escalated with clickable session url', () => {
    const { ctx, logs } = createMockCtx();
    renderMergeEvent(
      {
        type: 'merge:conflict:escalated',
        prNumber: 123,
        sessionId: 'session_abc_123',
        failureCount: 3,
      },
      ctx,
    );
    expect(logs).toContain(
      'info:   ↳ Escalated PR #123 → session session_abc_123 (3 consecutive failures)',
    );
    const expectedLink = ansiLink(
      'View Session',
      sessionUrl('session_abc_123'),
    );
    expect(logs).toContain(`info:     ${expectedLink}`);
  });

  it('renders merge:batch-resolve:done with clickable session url', () => {
    const { ctx, logs } = createMockCtx();
    renderMergeEvent(
      {
        type: 'merge:batch-resolve:done',
        prNumbers: [101, 102],
        sessionId: 'session_batch_456',
      },
      ctx,
    );
    expect(logs).toContain('stopSpinner: Batch resolved #101, #102 → session session_batch_456');
    const expectedLink = ansiLink(
      'View Session',
      sessionUrl('session_batch_456'),
    );
    expect(logs).toContain(`info:   ${expectedLink}`);
  });

  it('renders merge:redispatch:done with clickable session url', () => {
    const { ctx, logs } = createMockCtx();
    renderMergeEvent(
      {
        type: 'merge:redispatch:done',
        oldPr: 789,
        sessionId: 'session_redispatch_789',
      },
      ctx,
    );
    expect(logs).toContain('stopSpinner: Re-dispatched PR #789 → session session_redispatch_789');
    const expectedLink = ansiLink(
      'View Session',
      sessionUrl('session_redispatch_789'),
    );
    expect(logs).toContain(`info:   ${expectedLink}`);
  });

  it('renders merge:conflict:notifying and merge:conflict:notified correctly', () => {
    const { ctx, logs: logsNotifying } = createMockCtx();
    renderMergeEvent(
      {
        type: 'merge:conflict:notifying',
        prNumber: 456,
        sessionId: 'session_notify_456',
      },
      ctx,
    );
    expect(logsNotifying).toContain('startSpinner: Notifying session session_notify_456 of conflict on PR #456…');

    const { ctx: ctxNotified, logs: logsNotified } = createMockCtx();
    renderMergeEvent(
      {
        type: 'merge:conflict:notified',
        prNumber: 456,
        sessionId: 'session_notify_456',
      },
      ctxNotified,
    );
    expect(logsNotified).toContain('stopSpinner: Notified session session_notify_456 of conflict on PR #456');
    const expectedLink = ansiLink(
      'View Session',
      sessionUrl('session_notify_456'),
    );
    expect(logsNotified).toContain(`info:   ${expectedLink}`);
  });
});
