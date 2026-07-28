# Palette's Journal - CLI UX & Accessibility

This journal records critical, reusable UX and accessibility insights specific to this codebase.

## 2026-03-01 - Interactive TTY Styling for Node CLI Orchestration
**Learning:** Users of rich CLI tools (such as orchestrators) need clear visual hierarchies to quickly scan long logs. Plain-text logs without colored status indicators (like checkmarks or warning symbols) increase cognitive load. Adding green, red, yellow, and dim ANSI escapes in interactive TTY environments significantly improves readability, while maintaining clean unstyled text in CI logs preserves log grepability and compatibility.
**Action:** Next time when rendering CLI/TUI outputs, always introduce conditional ANSI styles that detect TTY/non-CI environments to color-code success checkmarks (green), errors/failures (red), warnings (yellow), and secondary metadata/fractions (dim).

## 2026-03-05 - Backtick Command Highlighting in CLI Suggestions and Errors
**Learning:** Highlighting inline code and command names (wrapped in backticks) in terminal suggestions drastically reduces the user's cognitive friction when dealing with errors. It makes actionable instructions (such as "Use `jules-fleet configure` to update settings") immediately stand out visually in interactive terminals without adding noise in plain CI/log environments.
**Action:** Implement conditional regex-based ANSI formatting on terminal error suggestions to highlight backticked segments in yellow or bold colors when process/stdout is interactive, falling back to clean plain-text when run in CI.

## 2026-03-08 - Informative CLI Resource Creation Feedback
**Learning:** Long-running CLI orchestration tasks that create remote resources (like Git repositories) require continuous visual feedback (spinners for in-flight tasks, and clear success/warning/error states on completion). Leaving key domain events silent increases user anxiety and cognitive load. Providing clickable, descriptive OSC 8 terminal hyperlinks (like "View Repository") dramatically improves user discoverability and workflow efficiency directly inside TTY environments.
**Action:** Always ensure all domain-specific lifecycle events (especially resource creation and fallback states) are fully handled in rendering paths, using clear visual states (spinners, warning icons, and descriptive links instead of raw URLs).
