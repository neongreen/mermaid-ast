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
│   │   ├── sequence-parser.ts
│   │   └── ...
│   ├── renderer/         # AST to Mermaid syntax
│   │   ├── flowchart-renderer.ts
│   │   ├── sequence-renderer.ts
│   │   └── ...
│   ├── types/            # TypeScript AST type definitions
│   │   ├── flowchart.ts
│   │   ├── sequence.ts
│   │   └── ...
│   ├── <diagram>.ts      # Wrapper classes (Flowchart, Sequence, etc.)
│   └── vendored/         # JISON parsers from mermaid.js
│       ├── grammars/     # Original .jison files (for reference)
│       ├── parsers/      # Compiled .js parsers
│       └── VERSION       # Mermaid version these came from
├── scripts/
│   └── sync-parsers.ts   # Script to update vendored parsers
├── tests/
│   ├── unit/             # Parser, renderer, and wrapper tests
│   ├── roundtrip/        # Round-trip verification tests
│   ├── compatibility/    # Mermaid.js SVG comparison tests
│   └── fixtures/         # Test fixtures extracted from mermaid.js
└── dagger/               # Dagger pipeline for cross-runtime testing
```

## Implemented Diagram Types

| Diagram Type | Parser | Renderer | Wrapper Class |
|--------------|--------|----------|---------------|
| Flowchart | ✅ | ✅ | ✅ `Flowchart` |
| Sequence | ✅ | ✅ | ✅ `Sequence` |
| Class | ✅ | ✅ | ✅ `ClassDiagram` |
| State | ✅ | ✅ | ✅ `StateDiagram` |
| ER | ✅ | ✅ | ✅ `ErDiagram` |
| Gantt | ✅ | ✅ | ✅ `Gantt` |
| Mindmap | ✅ | ✅ | ✅ `Mindmap` |
| Journey | ✅ | ✅ | ✅ `Journey` |
| Timeline | ✅ | ✅ | ✅ `Timeline` |

### Not Yet Implemented
- Pie, Quadrant, Requirement, Git Graph, C4, Sankey, XY Chart, Block

## Test Structure

Each diagram type should have a consistent test structure:

```
tests/unit/
├── <type>.test.ts              # Main tests for the wrapper class
│   ├── Factory Methods         # create(), from(), parse()
│   ├── Core Methods            # toAST(), clone(), render()
│   ├── <Domain> Operations     # e.g., Node Operations, Actor Operations
│   └── Query Operations        # findX(), getX()
│
├── <type>-parser.test.ts       # Parser tests
│   ├── is<Type>Diagram         # Detection function tests
│   ├── Basic Parsing           # Simple cases
│   └── Advanced Parsing        # Complex features
│
└── <type>-renderer.test.ts     # Renderer tests
    ├── Basic Rendering         # Simple cases
    ├── Advanced Rendering      # Complex features (styling, etc.)
    └── Golden Tests            # expectGolden() round-trip tests
```

### Test Coverage Status

| Diagram | Main Tests | Parser Tests | Renderer Tests | Notes |
|---------|-----------|--------------|----------------|-------|
| Flowchart | ✅ flowchart.test.ts | ✅ flowchart-parser.test.ts | ✅ flowchart-renderer.test.ts | Also has flowchart-advanced.test.ts |
| Sequence | ✅ sequence.test.ts | ✅ sequence-parser.test.ts | ✅ sequence-renderer.test.ts | Also has sequence-advanced.test.ts |
| Class | ✅ class-diagram.test.ts | ✅ class-parser.test.ts | ✅ class-diagram-renderer.test.ts | |
| State | ✅ state-diagram.test.ts | ✅ state-parser.test.ts | ✅ state-diagram-renderer.test.ts | |
| ER | ✅ er-diagram.test.ts | ✅ er-parser.test.ts | ✅ er-diagram-renderer.test.ts | |
| Gantt | ✅ gantt.test.ts | ✅ gantt-parser.test.ts | ✅ gantt-renderer.test.ts | |
| Journey | ✅ journey.test.ts | ✅ journey-parser.test.ts | ✅ journey-renderer.test.ts | |
| Mindmap | ✅ mindmap.test.ts | ✅ mindmap-parser.test.ts | ✅ mindmap-renderer.test.ts | |
| Timeline | ✅ timeline.test.ts | ✅ timeline-parser.test.ts | ✅ timeline-renderer.test.ts | |

### Test Naming Conventions

- **Main tests**: `<type>.test.ts` - Tests for the wrapper class (e.g., `Flowchart`, `Sequence`)
- **Parser tests**: `<type>-parser.test.ts` - Tests for `parse<Type>()` and `is<Type>Diagram()`
- **Renderer tests**: `<type>-renderer.test.ts` - Tests for `render<Type>()` including golden tests

For compound names like "class diagram" or "state diagram":
- Main: `class-diagram.test.ts`, `state-diagram.test.ts`
- Parser: `class-parser.test.ts`, `state-parser.test.ts`
- Renderer: `class-diagram-renderer.test.ts`, `state-diagram-renderer.test.ts`

### Golden Tests

Golden tests use `expectGolden()` to verify that:
1. Wrapper builds diagram correctly
2. Rendered output parses back to equivalent AST
3. Round-trip produces semantically equivalent output

```typescript
import { expectGolden } from '../test-utils.js';

it('should render complex diagram', () => {
  const diagram = Flowchart.create('LR')
    .addNode('A', 'Start')
    .addNode('B', 'End')
    .addLink('A', 'B');
  
  expectGolden(diagram);  // Verifies render → parse → render cycle
});
```

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
bun test                      # All tests
bun test tests/unit           # Unit tests only
bun test tests/roundtrip      # Round-trip tests
bun test tests/compatibility  # Mermaid.js SVG compatibility
```

### Updating Vendored Parsers
```bash
bun run sync-parsers -- 11.4.2  # Specific version
```

This downloads JISON files from mermaid.js, compiles them, and updates `src/vendored/`.

### Building for npm
```bash
bun run build   # Outputs to dist/
npm publish     # Publish to npm
```

## Adding a New Diagram Type

1. **Add the JISON grammar** to `scripts/sync-parsers.ts` in the `GRAMMARS` array
2. **Run sync**: `bun run sync-parsers -- <version>`
3. **Create types** in `src/types/<diagram>.ts`
4. **Create parser** in `src/parser/<diagram>-parser.ts`:
   - Import the compiled parser from `src/vendored/parsers/`
   - Create a custom `yy` object that builds your AST
   - Export `parse<Type>()` and `is<Type>Diagram()` functions
5. **Create renderer** in `src/renderer/<diagram>-renderer.ts`
6. **Create wrapper class** in `src/<diagram>.ts`
7. **Add tests**:
   - `tests/unit/<diagram>.test.ts` - Wrapper class tests
   - `tests/unit/<diagram>-parser.test.ts` - Parser tests
   - `tests/unit/<diagram>-renderer.test.ts` - Renderer tests
8. **Add round-trip tests** in `tests/roundtrip/<diagram>-roundtrip.test.ts`
9. **Export** from `src/index.ts`

## Key Files to Understand

- `src/parser/flowchart-parser.ts` - Best example of how to create a custom yy object
- `src/vendored/grammars/flowchart.jison` - Shows what methods the parser calls on yy
- `src/flowchart.ts` - Best example of a wrapper class with full operations
- `tests/unit/flowchart.test.ts` - Comprehensive test examples

## Constraints

- **No regex parsing** - All parsing must use the JISON grammar-based parsers
- **Round-trip fidelity** - `render(parse(text))` must produce equivalent diagrams
- **Cross-runtime support** - Must work in Bun, Node.js, and Deno
- **Consistent test structure** - All diagram types should follow the same test pattern