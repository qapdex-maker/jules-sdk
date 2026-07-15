## 2026-07-09 - Path Traversal Vulnerability in ApiClient
**Vulnerability:** The `ApiClient.resolveUrl` method used simple string concatenation to construct URLs, which allowed malicious paths like `../../secret` to escape the intended `baseUrl`.
**Learning:** Using the `URL` constructor with a base URL is not sufficient to prevent path traversal if the path starts with `..`. The resulting URL can still point outside the base path.
**Prevention:** Always validate that the final resolved URL still starts with the expected normalized base URL.

## 2026-07-10 - Path Traversal and Local File Inclusion in stage-resolution
**Vulnerability:** The `stageResolutionHandler` accepted a `fromFile` path parameter to read local files, but did not validate it. Additionally, the existing `validateFilePath` helper only split the path by `/` and checked for `..`, allowing absolute paths like `/etc/passwd` to bypass the relative path check.
**Learning:** Path bouncers must explicitly reject absolute paths (such as paths starting with `/` or having drive letters on Windows) to prevent traversal via absolute references, even when `..` check is active. Any parameter used in local disk I/O (like `fs.readFileSync`) must be rigorously sanitized.
**Prevention:** Always apply path validation functions to all input file paths and restrict path parameters to relative paths by explicitly throwing on absolute prefixes or drive letters.
