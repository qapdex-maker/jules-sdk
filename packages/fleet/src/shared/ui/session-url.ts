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

const JULES_BASE_URL = 'https://jules.google.com';

/**
 * Build a Jules session URL from a session ID.
 */
export function sessionUrl(sessionId: string): string {
  return `${JULES_BASE_URL}/session/${sessionId}`;
}

/**
 * Build a Jules repo config URL.
 */
export function repoConfigUrl(owner: string, repo: string): string {
  return `${JULES_BASE_URL}/repo/github/${owner}/${repo}/config`;
}

/**
 * Wrap text in an ANSI hyperlink (OSC 8) for terminals that support it.
 * Falls back to plain text in terminals that don't (e.g. non-TTY or CI).
 *
 * Visually styles the link text with a cyan color and underline in interactive
 * TTY environments to make it highly discoverable and user-friendly.
 */
export function ansiLink(text: string, url: string): string {
  const isInteractive = process.env.CI !== 'true' && !!process.stdout.isTTY;
  if (!isInteractive) {
    return text === url ? url : `${text} (${url})`;
  }
  // \x1b[36m = Cyan color, \x1b[4m = Underline
  // \x1b[24m = Underline off, \x1b[39m = Default color
  return `\x1b]8;;${url}\x07\x1b[36m\x1b[4m${text}\x1b[24m\x1b[39m\x1b]8;;\x07`;
}
