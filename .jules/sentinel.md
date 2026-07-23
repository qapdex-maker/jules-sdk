## 2026-07-23 - Robustness of Merge Reconcile Validators on Falsy Inputs
**Vulnerability:** The reconciliation `validateBranchName` and `validateFilePath` helpers in the `@google/jules-merge` package did not check for falsy/empty values before invoking string operations. This could lead to unhandled runtime type exceptions, crashing the execution context, or allowing unexpected bypasses if downstream functions default empty values in unforeseen ways.
**Learning:** Enforcing non-empty values at the validation boundary ensures absolute system robustness, preventing potential Denial of Service (DoS) and input validation bypasses during conflict resolution execution.
**Prevention:** Always validate all path/identifier parameters to ensure they are non-empty strings before proceeding with sub-string matching or other string manipulations.

## 2026-07-18 - Input Validation of Repository and Branch Names on SDK/MCP Entrypoints
**Vulnerability:** The Core SDK and MCP entrypoints allowed arbitrary strings to be used for repository references and Git branch names during session creation and resource fetches, presenting opportunities for path traversal, script injection, and reference escape down the call chain.
**Learning:** Validating input format at the highest level of the SDK ensures consistent security boundaries across all integration endpoints (including CLI, direct client usage, and MCP tools) before operations resolve URLs or format API payloads.
**Prevention:** Integrate robust `validateRepository` and `validateBranchName` checks on all entrypoints receiving user-supplied source contexts.

## 2026-07-17 - Repository Validation Pattern to Prevent Injection and Traversal
**Vulnerability:** The reconciliation handlers accepted untrusted `repo` string inputs (such as `owner/repo`) and parsed them directly (e.g., using `.split('/')`) without verification, opening potential vectors for path traversal, control character injection, or API parsing attacks when interacting with downstream filesystems and Octokit.
**Learning:** Repository path structures must be strictly validated before processing or accessing external APIs. An simple/anchored regex match against standard naming formats prevents any injection or path traversal attempts.
**Prevention:** Always validate repository name parameters against standard patterns (like strictly alphanumeric, dots, hyphens, and underscores) and reject control characters, path traversal segments (`..`), or invalid slash counts.

## 2026-07-16 - Path Traversal Vulnerability via Session ID Input
**Vulnerability:** The client session initialization and local cache file storage used user-supplied or untrusted `sessionId` inputs directly to resolve cache directories, which allowed directory traversal and file inclusion when malicious IDs containing path traversal characters like `..`, `/`, or `\\` were provided.
**Learning:** Session IDs must be rigorously validated before performing any disk I/O, as they are implicitly used as subdirectory names in local cache structures. By enforcing flat, alphanumeric string constraints (no directory separators or control characters), path traversal is completely eliminated.
**Prevention:** Always validate all path parameters and identifiers like `sessionId` to ensure they are strictly flat (no `/`, `\\`, control chars, `.`, or `..`) before utilizing them in file system path resolution.

## 2026-07-09 - Path Traversal Vulnerability in ApiClient
**Vulnerability:** The `ApiClient.resolveUrl` method used simple string concatenation to construct URLs, which allowed malicious paths like `../../secret` to escape the intended `baseUrl`.
**Learning:** Using the `URL` constructor with a base URL is not sufficient to prevent path traversal if the path starts with `..`. The resulting URL can still point outside the base path.
**Prevention:** Always validate that the final resolved URL still starts with the expected normalized base URL.

## 2026-07-10 - Path Traversal and Local File Inclusion in stage-resolution
**Vulnerability:** The `stageResolutionHandler` accepted a `fromFile` path parameter to read local files, but did not validate it. Additionally, the existing `validateFilePath` helper only split the path by `/` and checked for `..`, allowing absolute paths like `/etc/passwd` to bypass the relative path check.
**Learning:** Path bouncers must explicitly reject absolute paths (such as paths starting with `/` or having drive letters on Windows) to prevent traversal via absolute references, even when `..` check is active. Any parameter used in local disk I/O (like `fs.readFileSync`) must be rigorously sanitized.
**Prevention:** Always apply path validation functions to all input file paths and restrict path parameters to relative paths by explicitly throwing on absolute prefixes or drive letters.
