# Renderers

Each file converts an AST back to Mermaid diagram syntax.

## doc.ts — Document builder library

All renderers use the `doc.ts` library instead of manual string concatenation:

```typescript
import type { Doc } from './doc.js';
import { indent, render, when, block, join, blank } from './doc.js';
```

Key primitives:
- `Doc` type: `string | Doc[] | { _indent: Doc } | { _blank: true } | null | undefined | false`
- `indent(content)` — Increase indentation level
- `when(condition, doc)` — Conditional inclusion
- `block(open, body, close)` — Indented block structure
- `join(docs, separator)` — Join with separator, filtering falsy values
- `blank` — Empty line marker
- `render(doc, indentStr)` — Flatten Doc tree to string (default 4-space indent)

## Files

- `index.ts` — Unified `render(ast, options?)` function dispatching via type guards, re-exports all renderers
- `doc.ts` — Document builder library (shared by all renderers)
- `<diagram>-renderer.ts` — One per diagram type, exports `render<Diagram>(ast, options?)`

Note: `state-renderer.ts` and `state-diagram-renderer.ts` both exist — the diagram renderer handles the full state diagram including nested states.

## RenderOptions

All renderers accept optional `RenderOptions` (from `src/types/render-options.ts`):
- `prettyPrint` — Format output for readability (default: true)

Use `resolveOptions()` to apply defaults.

## Adding a new renderer

1. Create `<diagram>-renderer.ts` using doc.ts primitives
2. Export `render<Diagram>(ast, options?)`
3. Add to `index.ts`: export, import type guard, add case to unified `render()`
4. **Don't forget the unified `render()` function** — this is the most commonly missed step