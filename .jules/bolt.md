# Bolt's Performance Journal

⚡ Focus on measurably speeding up the application. Keep optimizations clean, documented, and non-breaking.

## 2026-03-30 - Optimized Top-Level Document Projections Fast-Path
**Learning:** During multi-document database queries, projecting document fields to lightweight subsets (especially default session/activity projections) is extremely frequent. Invoking a generic projection engine that splits paths, scans for wildcards/exclusions, checks nested structures, and deep-clones primitives introduces major redundant CPU and GC overhead. Pre-calculating a boolean flag `isSimpleTopLevel` in a cached query plan can safely bypass the entire heavy projection engine for flat queries.
**Action:** Always check if a highly repetitive document/object mapping or projection can be pre-calculated and cached. When a selection is strictly simple and flat, implement an O(1) loop copy with direct primitive mapping to achieve up to ~50% CPU performance improvements in hot paths.

## 2026-03-31 - Optimized Query Selection Path & Avoided Sorter Object Allocations
**Learning:** Performing `new Date()` construction and parsing inside an $O(N \log N)$ sort comparator is a significant performance bottleneck due to thousands of repeated string parsings and heap allocations. Pre-parsing timestamps in the $O(N)$ hydration/projection phase and caching them as numbers in the `_sortKey` object completely eliminates this overhead. Additionally, calling `Object.entries()` inside loops that run on every matched document causes substantial GC pressure; replacing it with a simple `for...in` loop prevents those redundant array allocations entirely.
**Action:** Never perform date parsing or string operations inside high-frequency sort comparators. Precompute sort keys as primitives during object mapping. Always replace key/value array helper functions with native loops in high-frequency matching hot paths.

## 2026-04-01 - Avoided Heap Allocation via Primitive-Returning Date.parse & Date.now
**Learning:** Instantiating `new Date()` objects repeatedly inside high-frequency search and scan loops (such as query selection sorting fallbacks, high-watermarking scan loops, cache tier evaluations, and session asking loops) introduces major garbage collection overhead and memory churn. Using standard native primitive-returning helpers like `Date.parse()` and `Date.now()` completely bypasses V8 heap allocation of date objects, making date comparisons up to ~10x faster and eliminating GC pauses.
**Action:** Always prefer `Date.parse(string)` and `Date.now()` over `new Date(string)` or `new Date()` for date comparisons, subtraction, and arithmetic operations in hot execution paths.

## 2026-04-02 - Optimized Deep Query Projections and String Sort Collations
**Learning:** Recursive query projection routines (`getPath`, `setPath`, `deletePath`) split and slice path arrays extensively on every nested field lookup. Replacing sub-path array slicing and destructuring with an explicit `index` traversal parameter completely eliminates redundant array allocations and garbage collection pressure in the query pipeline. Additionally, using standard comparison operators (`<`, `>`) instead of locale-sensitive `localeCompare` inside hot sort comparisons is up to 10x faster for simple alphanumeric identifiers.
**Action:** Avoid allocating sub-arrays/slices in recursive traversal functions. Always prefer direct comparison operators over slow collation methods like `localeCompare` for sorting non-localized key and ID fields.
