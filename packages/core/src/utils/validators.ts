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
 * Validates a given sessionId to prevent directory/path traversal
 * and injection attacks when interacting with the local filesystem.
 *
 * @param sessionId - The session ID to validate.
 * @throws {Error} If the session ID is invalid.
 */
export function validateSessionId(sessionId: string): void {
  if (!sessionId) {
    throw new Error('INVALID_SESSION_ID: Session ID cannot be empty');
  }

  const cleanId = sessionId.replace(/^sessions\//, '');

  if (!cleanId) {
    throw new Error('INVALID_SESSION_ID: Session ID cannot be empty');
  }

  if (cleanId.includes('\x00') || /[\x01-\x1f\x7f]/.test(cleanId)) {
    throw new Error(
      `INVALID_SESSION_ID: Session ID contains control characters: ${sessionId}`,
    );
  }

  if (cleanId.includes('/') || cleanId.includes('\\')) {
    throw new Error(
      `INVALID_SESSION_ID: Session ID cannot contain slashes or backslashes: ${sessionId}`,
    );
  }

  if (cleanId === '.' || cleanId === '..') {
    throw new Error(
      `INVALID_SESSION_ID: Session ID cannot be "." or "..": ${sessionId}`,
    );
  }
}
