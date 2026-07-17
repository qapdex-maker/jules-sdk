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
