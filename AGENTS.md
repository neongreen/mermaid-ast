# mermaid-ast Agent Guide

This document describes how this library was built and how to continue development.

## Project Overview

`mermaid-ast` is a TypeScript library that parses Mermaid diagram syntax into an AST and renders ASTs back to Mermaid syntax. The key feature is **round-trip fidelity**: `render(parse(text))` produces semantically equivalent diagrams.

## Architecture Decisions

### Why JISON Parsers?

Mermaid.js uses two parsing systems:
1. **Legacy JISON parsers** - Used for most diagram types (flowchart, sequence, class, state, etc.)
2. **Langium-based `@mermaid-js/parser`** - Newer, only supports a few diagram types

We chose to **vendor the JISON parsers** from mermaid.js because:
- They support all diagram types
- They are battle-tested and match mermaid.js behavior exactly
- No regex parsing (which was explicitly forbidden)

### Vendoring Approach

The JISON grammar files (`.jison`) are downloaded from mermaid.js, compiled to JavaScript parsers, and stored in `src/vendored/`. A sync script (`scripts/sync-parsers.ts`) handles this process.

**How the parsers work:**
1. JISON parsers call methods on a `yy` object during parsing
2. We provide custom `yy` objects that build our AST structure
3. Example: When the parser sees a node, it calls `yy.addVertex()`, which we intercept to add to our AST

```typescript
// In flowchart-parser.ts
flowchartParser.yy = createFlowchartYY(ast);  // Our custom yy
flowchartParser.parse(input);  // Parser calls yy.addVertex(), yy.addLink(), etc.
// ast is now populated
```

## Project Structure

```
mermaid-ast/
├── src/
│   ├── parser/           # Custom yy objects that build ASTs
│   │   ├── flowchart-parser.ts
│   │   └── sequence-parser.ts
│   ├── renderer/         # AST to Mermaid syntax
│   │   ├── flowchart-renderer.ts
│   │   └── sequence-renderer.ts
│   ├── types/            # TypeScript AST type definitions
│   │   ├── flowchart.ts
│   │   └── sequence.ts
│   └── vendored/         # JISON parsers from mermaid.js
│       ├── grammars/     # Original .jison files (for reference)
│       ├── parsers/      # Compiled .js parsers
│       └── VERSION       # Mermaid version these came from
├── scripts/
│   └── sync-parsers.ts   # Script to update vendored parsers
├── tests/
│   ├── unit/             # Parser and renderer unit tests
│   ├── roundtrip/        # Round-trip verification tests
│   ├── compatibility/    # Mermaid.js SVG comparison tests
│   └── cross-runtime/    # Bun/Node/Deno compatibility tests
└── dagger/               # Dagger pipeline for cross-runtime testing
```

## Current State

### Implemented Diagram Types
- **Flowchart**: Full support including subgraphs, styling (classDef, class, style), click handlers, linkStyle, directions
- **Sequence**: Full support including participants, actors, messages, loops, alt/else, opt, par, critical, break, rect, notes, autonumber, links, create/destroy

### Test Coverage
- 129 unit tests
- Round-trip tests for both diagram types
- Mermaid.js SVG compatibility tests (proves identical rendering)
- Cross-runtime tests (Bun, Node.js, Deno via Dagger)

### What's NOT Implemented
The following diagram types have JISON parsers in mermaid.js but are not yet supported:
- Class diagrams
- State diagrams
- ER diagrams
- Gantt charts
- Journey diagrams
- Mindmaps
- Timeline
- Sankey
- XYChart
- Quadrant
- Requirement
- C4
- Block
- Kanban

## Development Workflow

### Version Control
Use `jj` (Jujutsu), not `git`:
```bash
jj status
jj commit -m "message"
jj git push --bookmark main
```

### Running Tests
```bash
just test              # All unit tests
just test-roundtrip    # Round-trip tests
just test-cross-runtime # Local cross-runtime tests
just dagger-test-all   # Cross-runtime via Dagger
```

### Updating Vendored Parsers
```bash
just sync-parsers 11.4.2        # Specific version
just sync-parsers-latest        # Latest mermaid version
```

This downloads JISON files from mermaid.js, compiles them, and updates `src/vendored/`.

### Building for npm
```bash
bun run build   # Outputs to dist/
npm publish     # Publish to npm
```

## Adding a New Diagram Type

1. **Add the JISON grammar** to `scripts/sync-parsers.ts` in the `GRAMMARS` array
2. **Run sync**: `just sync-parsers-latest`
3. **Create types** in `src/types/<diagram>.ts`
4. **Create parser** in `src/parser/<diagram>-parser.ts`:
   - Import the compiled parser from `src/vendored/parsers/`
   - Create a custom `yy` object that builds your AST
   - Export a `parse()` function
5. **Create renderer** in `src/renderer/<diagram>-renderer.ts`
6. **Add tests** in `tests/unit/<diagram>-parser.test.ts`
7. **Add round-trip tests** in `tests/roundtrip/<diagram>-roundtrip.test.ts`
8. **Export** from `src/index.ts`

## Key Files to Understand

- `src/parser/flowchart-parser.ts` - Best example of how to create a custom yy object
- `src/vendored/grammars/flowchart.jison` - Shows what methods the parser calls on yy
- `tests/unit/flowchart-parser.test.ts` - Comprehensive test examples
- `scripts/sync-parsers.ts` - How vendored parsers are updated

## Constraints

- **No regex parsing** - All parsing must use the JISON grammar-based parsers
- **Round-trip fidelity** - `render(parse(text))` must produce equivalent diagrams
- **Cross-runtime support** - Must work in Bun, Node.js, and Deno