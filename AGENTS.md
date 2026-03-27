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

The JISON grammar files (`.jison`) are downloaded from mermaid.js v11.12.2, compiled to JavaScript parsers, and stored in `src/vendored/`. A sync script (`scripts/sync-parsers.ts`) handles this process.

Two diagram types (**pie** and **gitgraph**) use the Langium-based `@mermaid-js/parser` instead of JISON, and require async parsing.

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

This is a monorepo with packages in `packages/`. The root README is a brief summary; each package has its own detailed README.

```
mermaid-ast/
├── AGENTS.md             # This file
├── README.md             # Brief monorepo summary, points to packages
├── package.json          # Workspace root (private)
├── justfile              # Task runner (~210 commands)
├── biome.json            # Linter/formatter config (biome v2.3.11)
├── .agents/
│   └── procedures/
│       └── release.md    # Detailed release procedure
├── .github/
│   └── workflows/
│       ├── ci.yml        # CI on push/PR to main
│       └── publish.yml   # Publish to npm + JSR
├── packages/
│   ├── mermaid-ast/      # Main library (see packages/mermaid-ast/AGENTS.md)
│   │   ├── src/
│   │   │   ├── parser/       # Custom yy objects that build ASTs
│   │   │   ├── renderer/     # AST to Mermaid syntax (uses doc.ts)
│   │   │   ├── types/        # TypeScript AST type definitions
│   │   │   ├── vendored/     # JISON parsers from mermaid.js v11.12.2
│   │   │   ├── <diagram>.ts  # Wrapper classes (18 total)
│   │   │   └── index.ts      # Barrel exports
│   │   ├── tests/
│   │   │   ├── unit/         # Parser, renderer, and wrapper tests
│   │   │   ├── roundtrip/    # Round-trip verification tests
│   │   │   ├── golden/       # Golden snapshot + idempotence tests
│   │   │   ├── compatibility/# Mermaid.js SVG comparison tests
│   │   │   ├── cross-runtime/# Cross-runtime tests
│   │   │   └── fixtures/     # Test fixtures
│   │   ├── scripts/
│   │   │   └── sync-parsers.ts
│   │   ├── TEST_STANDARDS.md
│   │   ├── CHANGELOG.md
│   │   └── README.md         # Detailed package docs (published to npm/JSR)
│   └── mermaid-svg/      # SVG renderer (early stage, flowchart only)
│       ├── src/              # ELK layout + SVG rendering
│       └── tests/            # Unit, integration, visual regression
└── CODEOWNERS
```

Each major subdirectory has its own AGENTS.md with details specific to that area.

## Implemented Diagram Types (18)

All 18 Mermaid diagram types are implemented:

| Type | Wrapper | Parser | Sync/Async |
|------|---------|--------|------------|
| flowchart | Flowchart | JISON | sync |
| sequence | Sequence | JISON | sync |
| class | ClassDiagram | JISON | sync |
| state | StateDiagram | JISON | sync |
| er | ErDiagram | JISON | sync |
| gantt | Gantt | JISON | sync |
| journey | Journey | JISON | sync |
| mindmap | Mindmap | JISON | sync |
| timeline | Timeline | JISON | sync |
| sankey | Sankey | JISON | sync |
| quadrant | Quadrant | JISON | sync |
| kanban | Kanban | JISON | sync |
| xychart | XYChart | JISON | sync |
| block | Block | JISON | sync |
| c4 | C4 | JISON | sync |
| requirement | Requirement | JISON | sync |
| pie | Pie | Langium | async |
| gitgraph | GitGraph | Langium | async |

## Test Structure

**See [packages/mermaid-ast/TEST_STANDARDS.md](packages/mermaid-ast/TEST_STANDARDS.md) for detailed test standards and minimum coverage requirements.**

### Test File Organization

Each diagram type has a consistent test structure:

```
tests/unit/
├── <type>.test.ts              # Wrapper class tests
├── <type>-parser.test.ts       # Parser tests
└── <type>-renderer.test.ts     # Renderer tests

tests/roundtrip/
└── <type>-roundtrip.test.ts    # Round-trip verification

tests/golden/<type>/
├── *.mmd                       # Golden Mermaid output files
├── *.json                      # Golden AST snapshots
├── *.input.mmd                 # Idempotence test inputs
└── *.output.mmd                # Idempotence test expected outputs
```

### Golden Tests

```typescript
import { expectGolden } from '../golden/golden.js';

it('should render complex diagram', () => {
  const diagram = Flowchart.create('LR')
    .addNode('A', 'Start')
    .addNode('B', 'End')
    .addLink('A', 'B');

  expectGolden(diagram.render(), 'flowchart/render-basic.mmd');
});
```

Update golden files: `UPDATE_GOLDEN=1 bun test tests/golden`

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
bun run lint:fix     # From packages/mermaid-ast/
# OR from repo root:
npx @biomejs/biome check --write .
```

### Running Tests
```bash
# From packages/mermaid-ast/:
bun test                      # All tests
bun test tests/unit           # Unit tests only
bun test tests/roundtrip      # Round-trip tests

# From repo root:
just ast-test                 # All mermaid-ast tests
just ast-test-unit            # Unit tests only
```

### CI (GitHub Actions)

CI runs automatically on every push to `main` and every PR targeting `main`.

**Check CI status:**
```bash
gh run list --limit 5
gh run list --limit 3 --json databaseId,status,conclusion,displayTitle,headBranch
```

**View failed run logs:**
```bash
gh run view <run_id> --log-failed
```

**CI steps:** install → lockfile check → lint (root + package) → typecheck → tests (unit + roundtrip) → examples → build → JSR dry-run

**Note:** `mermaid-svg` is excluded from CI (not yet set up as a workspace test target).

### Updating Vendored Parsers
```bash
just ast-sync-parsers 11.12.2  # Specific version
```

### Building
```bash
bun run build   # Outputs to dist/
```

## Working with the Changelog

Uses [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format in `packages/mermaid-ast/CHANGELOG.md`.

**Update the `[Unreleased]` section when:**
- Adding new features or APIs
- Fixing bugs
- Making breaking changes

**Do NOT update for:**
- Internal refactoring that doesn't affect public API
- Test-only changes
- Documentation-only changes (unless significant)

**Entry format:**
```markdown
### Added
- **Short title** - Description of the change
```

Categories in order: Added, Changed, Deprecated, Removed, Fixed, Security.

## Releasing a New Version

> **IMPORTANT:** Always follow the release procedure exactly.
>
> **Read the full procedure:** [.agents/procedures/release.md](.agents/procedures/release.md)

**Quick reference:**
```bash
# 1. Set version (updates package.json, jsr.json, bun.lock)
just ast-set-version X.Y.Z

# 2. Update CHANGELOG.md

# 3. Run lint fix
bun run lint:fix

# 4. Commit and push
jj commit -m "Release vX.Y.Z"
jj bookmark set main -r @-
jj git push --bookmark main

# 5. Wait for CI to pass
gh run list --limit 1

# 6. Create release (publishes to npm and JSR)
just ast-release
```

## Adding a New Diagram Type - Complete Checklist

This is a comprehensive checklist for adding a new diagram type. Every item must be completed.

### Phase 1: Setup

- [ ] **Verify JISON grammar exists** in mermaid.js for the diagram type
- [ ] **Add grammar to sync script** - Add entry to `GRAMMARS` array in `scripts/sync-parsers.ts`
- [ ] **Run sync**: `bun run sync-parsers -- <version>` to download and compile the parser
- [ ] **Verify parser compiled** - Check `src/vendored/parsers/<diagram>.js` exists

### Phase 2: Types (`src/types/<diagram>.ts`)

- [ ] **Create AST interface** with `type: '<diagram>'` field for type discrimination
- [ ] **Create supporting types** - Nodes, edges, options, enums as needed
- [ ] **Create factory function** - `createEmpty<Diagram>AST()`
- [ ] **Add JSDoc comments** to all exported types

### Phase 3: Parser (`src/parser/<diagram>-parser.ts`)

- [ ] **Import vendored parser** with `@ts-expect-error` comment
- [ ] **Create custom yy object** - `create<Diagram>YY(ast)` implementing all JISON callbacks
- [ ] **Export parse function** - `parse<Diagram>(input: string): <Diagram>AST`
- [ ] **Export detection function** - `is<Diagram>Diagram(input: string): boolean`

### Phase 4: Renderer (`src/renderer/<diagram>-renderer.ts`)

- [ ] **Use doc.ts library** - Import from `./doc.js`
- [ ] **Import RenderOptions** and use `resolveOptions()`
- [ ] **Export render function** - `render<Diagram>(ast, options?): string`

### Phase 5: Wrapper Class (`src/<diagram>.ts`)

- [ ] **Extend DiagramWrapper** with private constructor
- [ ] **Static factory methods**: `create()`, `from()`, `parse()`
- [ ] **Core methods**: `render()`, `clone()`
- [ ] **Domain-specific operations** and **query operations**

### Phase 6: Exports (all four barrel files)

- [ ] `src/types/index.ts` — Export types, add to MermaidAST union, add type guard
- [ ] `src/parser/index.ts` — Export, add to detectDiagramType(), add to parse()/parseAsync()
- [ ] `src/renderer/index.ts` — Export, add to unified render() — **OFTEN FORGOTTEN!**
- [ ] `src/index.ts` — Export wrapper class and option types

### Phase 7: Tests

- [ ] Unit tests: wrapper, parser, renderer (3 files)
- [ ] Round-trip tests (1 file)
- [ ] Golden tests with .mmd/.json fixtures
- [ ] Test ALL enum values, not just common ones

### Phase 8: Documentation

- [ ] Update `packages/mermaid-ast/README.md` diagram types table
- [ ] Update `packages/mermaid-ast/CHANGELOG.md` under [Unreleased]

### Phase 9: Verification

- [ ] `bun test` — All tests pass
- [ ] `bun run lint` — No lint errors
- [ ] `bun run typecheck` — No type errors
- [ ] `bun run build` — Build succeeds
- [ ] Test unified `parse()` and `render()` functions work for the new type

## Key Files to Understand

- `src/parser/flowchart-parser.ts` - Best example of custom yy object pattern
- `src/vendored/grammars/flowchart.jison` - Shows what methods parser calls on yy
- `src/flowchart.ts` - Best example of a wrapper class with full operations
- `src/renderer/doc.ts` - Document builder library for rendering
- `src/renderer/flowchart-renderer.ts` - Example of using doc.ts
- `src/diagram-wrapper.ts` - Abstract base class for all wrappers

## Constraints

- **No regex parsing** - All parsing must use JISON or Langium parsers
- **Use doc.ts for rendering** - All renderers use the doc.ts library
- **Round-trip fidelity** - `render(parse(text))` must produce equivalent diagrams
- **Cross-runtime** - Must work in Bun, Node.js, and Deno
- **ESM only** - All imports use `.js` extensions
- **Consistent test structure** - All diagram types follow the same test pattern

## Troubleshooting & Lessons Learned

### CI and Publish Must Run the Same Tests

**Problem:** Publish failed because prepublishOnly ran different checks than CI.
**Solution:** Both `ci.yml` and `publish.yml` test jobs run the same commands from the same directories.

### gh run rerun Uses the Original Workflow File

**Problem:** After fixing a workflow, `gh run rerun` still uses the old version.
**Solution:** Use `gh workflow run publish.yml -f target=both` to trigger a new run.

### Always Keep bun.lock Up to Date

**Problem:** CI fails when `bun install` modifies `bun.lock`.
**Solution:** Run `bun install` locally and commit the updated `bun.lock` before pushing.

### Biome Version Mismatch

**Problem:** Lint passed locally but failed in CI.
**Root cause:** Different biome versions between root and package (1.x vs 2.x have different config syntax).
**Solution:** Keep biome versions consistent everywhere. Currently `^2.3.11`.

### npm version Doesn't Work with Bun Workspaces

**Problem:** `npm version` fails on `workspace:*` protocol.
**Solution:** Use `just ast-set-version X.Y.Z` which uses `jq` internally.

### JSR Needs README in Package Directory

**Problem:** JSR couldn't find README in monorepo setup.
**Solution:** Each package has its own README at `packages/<name>/README.md`.

### Disabled Lint Rules

The following biome rules are disabled for development velocity:
- `assist/source/organizeImports` — Just reorders imports, no functional benefit
- `correctness/noUnusedImports` — Too noisy during active development
- `style/recommended` — All style rules disabled
