# Vendored JISON Parsers

Parsers vendored from mermaid.js v11.12.2 (see VERSION file).

## Contents

- `grammars/` — Original .jison grammar files (16 diagram types) for reference
- `parsers/` — Compiled JavaScript parsers (ES modules) generated from the grammars
- `VERSION` — Mermaid.js version these were synced from
- `sync-info.json` — Metadata about the sync process
- `LICENSE` — Mermaid.js license

## Diagram types with JISON parsers (16)

block, c4, class, er, flowchart, gantt, journey, kanban, mindmap, quadrant, requirement, sankey, sequence, state, timeline, xychart

## Not vendored (use Langium-based @mermaid-js/parser)

- **pie** — Uses `@mermaid-js/parser` (async)
- **gitgraph** — Uses `@mermaid-js/parser` (async)

## Updating

Run from repo root:
```bash
just ast-sync-parsers 11.12.2   # or desired version
```

This runs `scripts/sync-parsers.ts` which clones mermaid.js, copies .jison files, compiles them to JS, and updates VERSION.

## Do NOT

- Edit files in `grammars/` or `parsers/` manually — they are auto-generated
- Delete the VERSION file — it tracks provenance