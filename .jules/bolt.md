# Bolt's Performance Journal

⚡ Focus on measurably speeding up the application. Keep optimizations clean, documented, and non-breaking.

## 2026-03-30 - Optimized Top-Level Document Projections Fast-Path
**Learning:** During multi-document database queries, projecting document fields to lightweight subsets (especially default session/activity projections) is extremely frequent. Invoking a generic projection engine that splits paths, scans for wildcards/exclusions, checks nested structures, and deep-clones primitives introduces major redundant CPU and GC overhead. Pre-calculating a boolean flag `isSimpleTopLevel` in a cached query plan can safely bypass the entire heavy projection engine for flat queries.
**Action:** Always check if a highly repetitive document/object mapping or projection can be pre-calculated and cached. When a selection is strictly simple and flat, implement an O(1) loop copy with direct primitive mapping to achieve up to ~50% CPU performance improvements in hot paths.

## 2026-03-31 - Optimized Query Selection Path & Avoided Sorter Object Allocations
**Learning:** Performing `new Date()` construction and parsing inside an $O(N \log N)$ sort comparator is a significant performance bottleneck due to thousands of repeated string parsings and heap allocations. Pre-parsing timestamps in the $O(N)$ hydration/projection phase and caching them as numbers in the `_sortKey` object completely eliminates this overhead. Additionally, calling `Object.entries()` inside loops that run on every matched document causes substantial GC pressure; replacing it with a simple `for...in` loop prevents those redundant array allocations entirely.
**Action:** Never perform date parsing or string operations inside high-frequency sort comparators. Precompute sort keys as primitives during object mapping. Always replace key/value array helper functions with native loops in high-frequency matching hot paths.
