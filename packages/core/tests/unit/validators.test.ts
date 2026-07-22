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
import { validateSessionId, validateRepository, validateBranchName } from '../../src/utils/validators.js';

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

describe('validateRepository', () => {
  test('allows standard repository strings', () => {
    expect(() => validateRepository('owner/repo')).not.toThrow();
    expect(() => validateRepository('google/jules-sdk')).not.toThrow();
    expect(() => validateRepository('owner-name/repo_name.js')).not.toThrow();
  });

  test('rejects empty repository strings', () => {
    expect(() => validateRepository('')).toThrow('INVALID_REPOSITORY');
  });

  test('rejects repository strings without exact owner/repo format', () => {
    expect(() => validateRepository('owner')).toThrow('INVALID_REPOSITORY');
    expect(() => validateRepository('owner/repo/extra')).toThrow('INVALID_REPOSITORY');
    expect(() => validateRepository('owner//repo')).toThrow('INVALID_REPOSITORY');
    expect(() => validateRepository('/owner/repo')).toThrow('INVALID_REPOSITORY');
    expect(() => validateRepository('owner/repo/')).toThrow('INVALID_REPOSITORY');
  });

  test('rejects repository strings containing invalid characters', () => {
    expect(() => validateRepository('owner$/repo')).toThrow('INVALID_REPOSITORY');
    expect(() => validateRepository('owner/re@po')).toThrow('INVALID_REPOSITORY');
    expect(() => validateRepository('owner:/repo')).toThrow('INVALID_REPOSITORY');
  });

  test('rejects control characters', () => {
    expect(() => validateRepository('owner\x00/repo')).toThrow('CONTROL_CHAR');
    expect(() => validateRepository('owner/re\x1fpo')).toThrow('CONTROL_CHAR');
  });

  test('rejects path traversal segments', () => {
    expect(() => validateRepository('../repo')).toThrow('PATH_TRAVERSAL');
    expect(() => validateRepository('owner/..')).toThrow('PATH_TRAVERSAL');
    expect(() => validateRepository('../owner/repo')).toThrow('INVALID_REPOSITORY');
    expect(() => validateRepository('owner/../repo')).toThrow('INVALID_REPOSITORY');
    expect(() => validateRepository('./repo')).toThrow('PATH_TRAVERSAL');
    expect(() => validateRepository('owner/.')).toThrow('PATH_TRAVERSAL');
  });
});

describe('validateBranchName', () => {
  test('allows standard branch names', () => {
    expect(() => validateBranchName('main')).not.toThrow();
    expect(() => validateBranchName('feature/login')).not.toThrow();
    expect(() => validateBranchName('bug-fix_123')).not.toThrow();
  });

  test('rejects empty branch names', () => {
    expect(() => validateBranchName('')).toThrow('INVALID_BRANCH');
  });

  test('rejects branch names starting with refs/', () => {
    expect(() => validateBranchName('refs/heads/main')).toThrow('RESERVED_BRANCH');
  });

  test('rejects spaces in branch names', () => {
    expect(() => validateBranchName('my branch')).toThrow('INVALID_BRANCH');
  });

  test('rejects invalid git reference characters', () => {
    expect(() => validateBranchName('my~branch')).toThrow('INVALID_BRANCH');
    expect(() => validateBranchName('my^branch')).toThrow('INVALID_BRANCH');
    expect(() => validateBranchName('my:branch')).toThrow('INVALID_BRANCH');
    expect(() => validateBranchName('my?branch')).toThrow('INVALID_BRANCH');
    expect(() => validateBranchName('my*branch')).toThrow('INVALID_BRANCH');
    expect(() => validateBranchName('my[branch')).toThrow('INVALID_BRANCH');
    expect(() => validateBranchName('my\\branch')).toThrow('INVALID_BRANCH');
  });

  test('rejects consecutive dots', () => {
    expect(() => validateBranchName('my..branch')).toThrow('INVALID_BRANCH');
  });

  test('rejects trailing dot or slash', () => {
    expect(() => validateBranchName('my-branch.')).toThrow('INVALID_BRANCH');
    expect(() => validateBranchName('my-branch/')).toThrow('INVALID_BRANCH');
  });

  test('rejects trailing .lock', () => {
    expect(() => validateBranchName('my-branch.lock')).toThrow('INVALID_BRANCH');
  });
});
