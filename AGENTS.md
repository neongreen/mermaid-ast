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
| Sankey | ✅ | ✅ | ✅ `Sankey` |
| Quadrant | ✅ | ✅ | ✅ `Quadrant` |

### Not Yet Implemented
- Pie (no JISON parser in mermaid.js)
- Git Graph (no JISON parser in mermaid.js)
- Requirement, C4, XY Chart, Block, Kanban (JISON parsers available but not yet implemented)

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
| Sankey | ✅ sankey.test.ts | ✅ sankey-parser.test.ts | ✅ sankey-renderer.test.ts | |
| Quadrant | ✅ quadrant.test.ts | ✅ quadrant-parser.test.ts | ✅ quadrant-renderer.test.ts | |

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

### Code Quality
**Always run biome lint fix before committing:**
```bash
npm run lint:fix     # Run biome check --write
# OR
npx @biomejs/biome check --write .
```

This will automatically fix formatting issues and apply safe code transformations.

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

## Working with the Changelog

The project uses [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format. The changelog is in `CHANGELOG.md`.

### Changelog Structure

```markdown
## [Unreleased]

### Added
- New features

### Changed
- Changes to existing functionality

### Fixed
- Bug fixes

### Removed
- Removed features

### Prompts Used
- User prompts that led to these changes (for released versions)
```

### When to Update the Changelog

**Update the `[Unreleased]` section when:**
- Adding new features or APIs
- Fixing bugs
- Making breaking changes
- Changing existing behavior

**Do NOT update for:**
- Internal refactoring that doesn't affect the public API
- Test-only changes
- Documentation-only changes (unless significant)

### How to Update

1. **During development**: Add entries to the `[Unreleased]` section as you make changes
   ```markdown
   ## [Unreleased]

   ### Added
   - **Feature name** - Brief description of what was added
   ```

2. **At release time**: The `[Unreleased]` section becomes the new version
   - Change `[Unreleased]` to `[X.Y.Z] - YYYY-MM-DD`
   - Add a new empty `[Unreleased]` section at the top
   - Add `### Prompts Used` section with the user prompts that led to the changes

### Entry Format

Each entry should follow this format:
```markdown
- **Short title** - Description of the change
```

Examples:
```markdown
### Added
- **API consistency** - Added `sectionCount` getter to `Journey` and `Timeline` wrapper classes

### Fixed
- **JSR compatibility** - Removed module augmentation pattern that JSR doesn't allow

### Changed
- **Flowchart graph operations** - Now use imported functions as class properties
```

### Categories

Use these categories in this order (skip empty ones):
1. **Added** - New features
2. **Changed** - Changes to existing functionality
3. **Deprecated** - Features that will be removed in future versions
4. **Removed** - Features that were removed
5. **Fixed** - Bug fixes
6. **Security** - Security-related changes

## Releasing a New Version

### Pre-release Checklist

1. **All tests pass**: `bun test`
2. **Biome passes**: `bun run biome check .`
3. **Build works**: `bun run build`
4. **Changelog is updated**: All changes documented in `CHANGELOG.md`

### Release Steps

1. **Update version numbers** in both files:
   - `package.json`: `"version": "X.Y.Z"`
   - `jsr.json`: `"version": "X.Y.Z"`

2. **Update CHANGELOG.md**:
   - Change `[Unreleased]` to `[X.Y.Z] - YYYY-MM-DD`
   - Add a new empty `[Unreleased]` section at the top

3. **Commit the release**:
   ```bash
   jj commit -m "Release vX.Y.Z"
   ```

4. **Push to GitHub**:
   ```bash
   jj bookmark set main -r @-
   jj git push --bookmark main
   ```

5. **Publish to npm**:
   ```bash
   bun run build
   npm publish
   ```

6. **Publish to JSR** (optional):
   ```bash
   just jsr-publish
   ```

### Version Guidelines

- **Patch (0.0.X)**: Bug fixes, documentation improvements, test additions
- **Minor (0.X.0)**: New features, new diagram types, API additions
- **Major (X.0.0)**: Breaking changes to existing APIs

### Justfile Commands

The justfile provides convenience commands for releases:
```bash
just mermaid-ast-build      # Build for npm
just mermaid-ast-publish    # Publish to npm (runs build first)
just mermaid-ast-jsr-publish # Publish to JSR
just mermaid-ast-publish-all # Publish to both npm and JSR
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