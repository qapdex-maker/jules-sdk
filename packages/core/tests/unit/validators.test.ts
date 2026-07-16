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
import { validateSessionId } from '../../src/utils/validators.js';

describe('validateSessionId', () => {
  test('allows standard session IDs', () => {
    expect(() => validateSessionId('SESSION_123')).not.toThrow();
    expect(() => validateSessionId('sessions/SESSION_123')).not.toThrow();
    expect(() => validateSessionId('abc-def-123_456')).not.toThrow();
  });

  test('rejects empty session IDs', () => {
    expect(() => validateSessionId('')).toThrow('INVALID_SESSION_ID');
    expect(() => validateSessionId('sessions/')).toThrow('INVALID_SESSION_ID');
  });

  test('rejects control characters', () => {
    expect(() => validateSessionId('session\x00_id')).toThrow('INVALID_SESSION_ID');
    expect(() => validateSessionId('sessions/session\x00_id')).toThrow('INVALID_SESSION_ID');
    expect(() => validateSessionId('session\x1f_id')).toThrow('INVALID_SESSION_ID');
  });

  test('rejects slashes and backslashes (after prefix)', () => {
    expect(() => validateSessionId('sessions/../etc/passwd')).toThrow('INVALID_SESSION_ID');
    expect(() => validateSessionId('sessions/abc/def')).toThrow('INVALID_SESSION_ID');
    expect(() => validateSessionId('abc\\def')).toThrow('INVALID_SESSION_ID');
    expect(() => validateSessionId('/etc/passwd')).toThrow('INVALID_SESSION_ID');
  });

  test('rejects "." and ".."', () => {
    expect(() => validateSessionId('.')).toThrow('INVALID_SESSION_ID');
    expect(() => validateSessionId('..')).toThrow('INVALID_SESSION_ID');
    expect(() => validateSessionId('sessions/.')).toThrow('INVALID_SESSION_ID');
    expect(() => validateSessionId('sessions/..')).toThrow('INVALID_SESSION_ID');
  });
});
