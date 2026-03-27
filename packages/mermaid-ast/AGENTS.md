# mermaid-ast Package

TypeScript library that parses Mermaid diagram syntax into an AST and renders ASTs back to Mermaid syntax, with round-trip fidelity.

## Quick reference

```bash
bun test                          # All tests
bun test tests/unit               # Unit tests only
bun test tests/roundtrip          # Round-trip tests
bun run lint                      # Lint
bun run lint:fix                  # Lint + autofix
bun run typecheck                 # Type check
bun run build                     # Build to dist/
```

## Package structure

```
src/
├── index.ts              # Barrel: exports everything
├── diagram-wrapper.ts    # Abstract base class for all wrappers
├── utils.ts              # Shared utilities
├── <diagram>.ts          # Wrapper class per diagram type (18 total)
├── parser/               # Mermaid syntax → AST (see parser/AGENTS.md)
├── renderer/             # AST → Mermaid syntax (see renderer/AGENTS.md)
├── types/                # TypeScript AST interfaces (see types/AGENTS.md)
└── vendored/             # JISON parsers from mermaid.js (see vendored/AGENTS.md)

tests/                    # See tests/AGENTS.md
scripts/
└── sync-parsers.ts       # Downloads and compiles JISON parsers from mermaid.js
```

## Supported diagram types (18)

All 18 Mermaid diagram types are implemented:

| Type | Wrapper class | Parser | Notes |
|------|--------------|--------|-------|
| flowchart | Flowchart | JISON (sync) | Also has flowchart-graph-ops.ts, flowchart-types.ts |
| sequence | Sequence | JISON (sync) | |
| class | ClassDiagram | JISON (sync) | |
| state | StateDiagram | JISON (sync) | state-renderer.ts + state-diagram-renderer.ts |
| er | ErDiagram | JISON (sync) | |
| gantt | Gantt | JISON (sync) | |
| journey | Journey | JISON (sync) | |
| mindmap | Mindmap | JISON (sync) | |
| timeline | Timeline | JISON (sync) | |
| sankey | Sankey | JISON (sync) | |
| quadrant | Quadrant | JISON (sync) | |
| kanban | Kanban | JISON (sync) | |
| xychart | XYChart | JISON (sync) | |
| block | Block | JISON (sync) | |
| c4 | C4 | JISON (sync) | |
| requirement | Requirement | JISON (sync) | |
| pie | Pie | Langium (async) | Uses @mermaid-js/parser, requires parseAsync() |
| gitgraph | GitGraph | Langium (async) | Uses @mermaid-js/parser, requires parseAsync() |

## Wrapper class pattern

All wrapper classes extend `DiagramWrapper<AST>`:

```typescript
class Flowchart extends DiagramWrapper<FlowchartAST> {
  static create(direction?): Flowchart     // Empty diagram
  static from(ast): Flowchart              // Wrap existing AST
  static parse(text): Flowchart            // Parse Mermaid syntax

  render(options?): string                 // AST → Mermaid syntax
  clone(): Flowchart                       // Deep clone
  toAST(): FlowchartAST                   // Get underlying AST

  // Fluent domain operations (return this)
  addNode(id, label?): this
  addLink(from, to): this
  // ... diagram-specific operations

  // Query operations
  findNodes(query): FlowchartNode[]
  // ... diagram-specific queries
}
```

## Exports structure

Four barrel files, each must be updated when adding a diagram type:

1. `src/types/index.ts` — Types, MermaidAST union, DiagramType union, type guards
2. `src/parser/index.ts` — parse(), parseAsync(), detectDiagramType(), individual parsers
3. `src/renderer/index.ts` — render(), individual renderers
4. `src/index.ts` — Wrapper classes, option types, re-exports parser/renderer/types

## Key constraints

- **No regex parsing** — All parsing via JISON or Langium parsers
- **Use doc.ts for rendering** — No manual string building in renderers
- **Round-trip fidelity** — `render(parse(text))` produces semantically equivalent diagrams
- **Cross-runtime** — Must work in Bun, Node.js, and Deno
- **ESM only** — All imports use `.js` extensions

## Version

Current: 0.8.2 (npm: `mermaid-ast`, JSR: `@emily/mermaid-ast`)
Vendored parsers: mermaid.js v11.12.2

## See also

- `TEST_STANDARDS.md` — Detailed test coverage requirements
- `CHANGELOG.md` — Release history
- `README.md` — Full API documentation with examples
- `.agents/procedures/release.md` (at repo root) — Release procedure
