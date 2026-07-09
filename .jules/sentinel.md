## 2026-07-09 - Path Traversal Vulnerability in ApiClient
**Vulnerability:** The `ApiClient.resolveUrl` method used simple string concatenation to construct URLs, which allowed malicious paths like `../../secret` to escape the intended `baseUrl`.
**Learning:** Using the `URL` constructor with a base URL is not sufficient to prevent path traversal if the path starts with `..`. The resulting URL can still point outside the base path.
**Prevention:** Always validate that the final resolved URL still starts with the expected normalized base URL.
