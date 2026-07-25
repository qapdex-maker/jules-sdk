# Palette's Journal - CLI UX & Accessibility

This journal records critical, reusable UX and accessibility insights specific to this codebase.

## 2026-03-01 - Interactive TTY Styling for Node CLI Orchestration
**Learning:** Users of rich CLI tools (such as orchestrators) need clear visual hierarchies to quickly scan long logs. Plain-text logs without colored status indicators (like checkmarks or warning symbols) increase cognitive load. Adding green, red, yellow, and dim ANSI escapes in interactive TTY environments significantly improves readability, while maintaining clean unstyled text in CI logs preserves log grepability and compatibility.
**Action:** Next time when rendering CLI/TUI outputs, always introduce conditional ANSI styles that detect TTY/non-CI environments to color-code success checkmarks (green), errors/failures (red), warnings (yellow), and secondary metadata/fractions (dim).
