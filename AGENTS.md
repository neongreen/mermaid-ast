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

This is a monorepo with packages in `packages/`. The root README is a brief summary; each package has its own detailed README.

```
mermaid-ast/
├── README.md             # Brief monorepo summary, points to packages
├── packages/
│   └── mermaid-ast/
│       ├── README.md     # Detailed package documentation (published to npm/JSR)
│       ├── src/
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

See the [README](packages/mermaid-ast/README.md) for the current list of implemented diagram types.

## Test Structure

**See [packages/mermaid-ast/TEST_STANDARDS.md](packages/mermaid-ast/TEST_STANDARDS.md) for detailed test standards and minimum coverage requirements.**

### Test Sourcing

Test cases can be sourced from:

1. **Manual creation** - Write tests based on API documentation
2. **Official mermaid-js repo** - Extract test cases from:
   - `packages/mermaid/src/diagrams/<type>/` test files in [mermaid-js/mermaid](https://github.com/mermaid-js/mermaid)
   - Example diagrams in mermaid-js documentation
   - Fixtures used in mermaid-js tests

When sourcing from mermaid-js:
- Verify the test case works with our parser
- Adapt assertions to match our AST structure
- Credit the source in comments if copying significant test logic

### Test File Organization

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

### CI (GitHub Actions)

CI runs automatically on:
- Every push to `main`
- Every pull request targeting `main`

**Check CI status:**
```bash
# List recent CI runs
gh run list --limit 5

# Get run details as JSON (useful for getting full run IDs)
gh run list --limit 3 --json databaseId,status,conclusion,displayTitle,headBranch
```

**View failed run logs:**
```bash
# View failed logs for a specific run (use databaseId from above)
gh run view <run_id> --log-failed

# View full logs
gh run view <run_id> --log
```

**CI steps:**
1. Install dependencies (`bun install`)
2. Lint (`bun run lint`)
3. Type check (`bun run typecheck`)
4. Run tests with coverage
5. Verify examples compile and run
6. Build (`bun run build`)
7. Verify JSR publish (dry-run)

**Note:** The `mermaid-svg/` subdirectory is currently excluded from CI tests (not yet set up as a workspace).

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

See [.agents/release-checklist.md](.agents/release-checklist.md) for the complete release checklist.

**Quick reference:**
```bash
# Bump version (choose one)
just ast-bump-minor   # For new features
just ast-bump-patch   # For bug fixes

# Update CHANGELOG.md, then:
jj commit -m "Release vX.Y.Z"
jj bookmark set main -r @-
jj git push --bookmark main

# Wait for CI to pass, then:
just ast-release      # Creates GitHub release, publishes to npm and JSR
```

## Adding a New Diagram Type - Complete Checklist

This is a comprehensive checklist for adding a new diagram type. Every item must be completed.

### Phase 1: Setup

- [ ] **Verify JISON grammar exists** in mermaid.js for the diagram type
- [ ] **Add grammar to sync script** - Add entry to `GRAMMARS` array in `scripts/sync-parsers.ts`
- [ ] **Run sync**: `bun run sync-parsers -- <version>` to download and compile the parser
- [ ] **Verify parser compiled** - Check `src/vendored/parsers/<diagram>.js` exists

### Phase 2: Types (`src/types/<diagram>.ts`)

- [ ] **Create AST interface** - e.g., `KanbanAST`, `XYChartAST`
  - Must have `type: '<diagram>'` field for type discrimination
- [ ] **Create supporting types** - Nodes, edges, options, enums as needed
- [ ] **Create factory function** - `createEmpty<Diagram>AST()` that returns a valid empty AST
- [ ] **Add JSDoc comments** to all exported types

### Phase 3: Parser (`src/parser/<diagram>-parser.ts`)

- [ ] **Import vendored parser** with `@ts-expect-error` comment:
  ```typescript
  // @ts-expect-error - JISON parser has no types
  import <diagram>Parser from '../vendored/parsers/<diagram>.js';
  ```
- [ ] **Create custom yy object** - `create<Diagram>YY(ast)` function that:
  - Implements all methods the JISON parser calls (check the `.jison` grammar file)
  - Populates the AST as the parser runs
  - Includes `getLogger()` stub if parser uses logging
- [ ] **Export parse function** - `parse<Diagram>(input: string): <Diagram>AST`
- [ ] **Export detection function** - `is<Diagram>Diagram(input: string): boolean`
- [ ] **Handle input normalization** - Ensure diagram header is present, handle edge cases

### Phase 4: Renderer (`src/renderer/<diagram>-renderer.ts`)

- [ ] **Use doc.ts library** - Import from `./doc.js`:
  ```typescript
  import type { Doc } from './doc.js';
  import { indent, render, when } from './doc.js';
  ```
- [ ] **Import RenderOptions** and use `resolveOptions()`:
  ```typescript
  import type { RenderOptions } from '../types/render-options.js';
  import { resolveOptions } from '../types/render-options.js';
  ```
- [ ] **Build document tree** - Use `Doc` type, `indent()`, `when()` helpers
- [ ] **Export render function** - `render<Diagram>(ast: <Diagram>AST, options?: RenderOptions): string`
- [ ] **Add JSDoc comments** to exported function

### Phase 5: Wrapper Class (`src/<diagram>.ts`)

- [ ] **Extend DiagramWrapper**:
  ```typescript
  export class <Diagram> extends DiagramWrapper<<Diagram>AST> {
    private constructor(ast: <Diagram>AST) {
      super(ast);
    }
  ```
- [ ] **Static factory methods**:
  - [ ] `static create(): <Diagram>` - Create empty diagram
  - [ ] `static from(ast: <Diagram>AST): <Diagram>` - Wrap existing AST
  - [ ] `static parse(text: string): <Diagram>` - Parse from Mermaid syntax
- [ ] **Core methods**:
  - [ ] `render(options?: RenderOptions): string` - Render to Mermaid syntax
  - [ ] `clone(): <Diagram>` - Deep clone the diagram
- [ ] **Domain-specific operations** - Add/remove/update methods for diagram elements
- [ ] **Query operations** - Find/get methods for querying diagram elements
- [ ] **Export option types** - e.g., `AddNodeOptions`, `FindNodesQuery`

### Phase 6: Exports

#### `src/types/index.ts`
- [ ] **Export all types**: `export * from './<diagram>.js';`
- [ ] **Import AST type** for union: `import type { <Diagram>AST } from './<diagram>.js';`
- [ ] **Add to MermaidAST union** type
- [ ] **Add to DiagramType union** type
- [ ] **Add type guard function**: `is<Diagram>AST(ast: MermaidAST): ast is <Diagram>AST`

#### `src/parser/index.ts`
- [ ] **Export parse and detect functions**:
  ```typescript
  export { is<Diagram>Diagram, parse<Diagram> } from './<diagram>-parser.js';
  ```
- [ ] **Import for internal use**
- [ ] **Add to detectDiagramType()** function
- [ ] **Add case to parse()** function switch statement

#### `src/renderer/index.ts`
- [ ] **Export render function**: `export { render<Diagram> } from './<diagram>-renderer.js';`
- [ ] **Import type guard**: `is<Diagram>AST` from types
- [ ] **Import render function** for internal use
- [ ] **Add case to render()** function - **THIS IS OFTEN FORGOTTEN!**

#### `src/index.ts`
- [ ] **Export wrapper class**: `export { <Diagram> } from './<diagram>.js';`
- [ ] **Export option types**: `export type { Add<X>Options, Find<X>Query } from './<diagram>.js';`

### Phase 7: Tests

#### Unit Tests (`tests/unit/<diagram>.test.ts`)
- [ ] **Factory Methods** - Test `create()`, `from()`, `parse()`
- [ ] **Core Methods** - Test `toAST()`, `clone()`, `render()`
- [ ] **Domain Operations** - Test add/remove/update methods
- [ ] **Query Operations** - Test find/get methods

#### Parser Tests (`tests/unit/<diagram>-parser.test.ts`)
- [ ] **Detection tests** - Test `is<Diagram>Diagram()` with valid/invalid inputs
- [ ] **Basic parsing** - Simple diagram cases
- [ ] **Advanced parsing** - Complex features, edge cases

#### Renderer Tests (`tests/unit/<diagram>-renderer.test.ts`)
- [ ] **Basic rendering** - Simple diagram cases
- [ ] **Advanced rendering** - All features (styling, options, etc.)
- [ ] **Golden tests** - Use `expectGolden()` for round-trip verification

#### Round-trip Tests (`tests/roundtrip/<diagram>-roundtrip.test.ts`)
- [ ] **Simple round-trips** - Basic diagrams
- [ ] **Complex round-trips** - All features
- [ ] **Idempotency test** - `render(parse(render(parse(x)))) === render(parse(x))`

#### Golden Test Files (`tests/golden/<diagram>/`)
- [ ] **Create golden directory**
- [ ] **Add .json files** - Expected AST structures
- [ ] **Add .mmd files** - Expected rendered output

### Phase 8: Documentation

#### README.md (`packages/mermaid-ast/README.md`)
- [ ] **Add to diagram types table**
- [ ] **Add usage example** if significantly different from others

#### CHANGELOG.md (`packages/mermaid-ast/CHANGELOG.md`)
- [ ] **Add to [Unreleased] section** under "Added"
- [ ] **Include test count** and key features

### Phase 9: Verification

- [ ] **Run all tests**: `bun test` - All tests must pass
- [ ] **Run linter**: `bun run lint` - No lint errors
- [ ] **Run type check**: `bun run typecheck` - No type errors
- [ ] **Run build**: `bun run build` - Build succeeds
- [ ] **Test unified parse()**: Verify `parse('<diagram>...')` works
- [ ] **Test unified render()**: Verify `render(ast)` works for the new type
- [ ] **Commit with descriptive message**

### Common Mistakes to Avoid

1. **Forgetting to add to `render()` in `src/renderer/index.ts`** - The unified render function must handle the new type
2. **Missing type guard in types/index.ts** - The `is<Diagram>AST()` function is needed
3. **Not using doc.ts for rendering** - All new renderers must use the doc.ts library
4. **Incomplete exports** - Check all four export locations (types, parser, renderer, main index)
5. **Missing round-trip tests** - These catch subtle parsing/rendering mismatches
6. **Not testing the unified `parse()` and `render()` functions** - Test both direct imports AND the unified functions
7. **Not testing ALL enum values** - Tests must cover every value in enums (e.g., all node shapes, all arrow types). If tests only cover commonly-used values, bugs in rarely-used values go undetected until production.

## Key Files to Understand

- `src/parser/flowchart-parser.ts` - Best example of how to create a custom yy object
- `src/vendored/grammars/flowchart.jison` - Shows what methods the parser calls on yy
- `src/flowchart.ts` - Best example of a wrapper class with full operations
- `tests/unit/flowchart.test.ts` - Comprehensive test examples
- `src/renderer/doc.ts` - Document builder library for rendering (use this!)
- `src/renderer/flowchart-renderer.ts` - Example of using doc.ts for rendering

## Constraints

- **No regex parsing** - All parsing must use the JISON grammar-based parsers
- **Use doc.ts for rendering** - All new renderers should use the doc.ts library instead of manual string building
- **Round-trip fidelity** - `render(parse(text))` must produce equivalent diagrams
- **Cross-runtime support** - Must work in Bun, Node.js, and Deno
- **Consistent test structure** - All diagram types should follow the same test pattern

## Troubleshooting & Lessons Learned

### CI and Publish Must Run the Same Tests

**Problem:** The v0.6.0 release failed because the publish workflow ran `bun test` (all tests) while CI only ran `bun test tests/unit tests/roundtrip`. The `mermaid-svg` tests failed in publish because they depend on `mermaid-ast` via workspace link.

**Solution:** Both CI and publish workflows must run exactly the same test command. Currently: `bun test --coverage tests/unit tests/roundtrip`

**Lesson:** When adding new packages to the workspace, update both `ci.yml` and `publish.yml` to include their tests, or explicitly exclude them from both.

### gh run rerun Uses the Original Workflow File

**Problem:** After fixing a workflow file and pushing, `gh run rerun <run_id>` still uses the workflow file from the original commit, not the updated one.

**Solution:** Instead of rerunning, trigger a new workflow run:
```bash
# Trigger publish workflow manually
gh workflow run publish.yml -f target=npm

# Or for both npm and jsr
gh workflow run publish.yml -f target=both
```

### Always Keep bun.lock Up to Date

**Problem:** CI failed because `bun install` modified `bun.lock` (platform differences between local macOS and CI Linux).

**Solution:** Always run `bun install` locally and commit the updated `bun.lock` before pushing. The lockfile should be regenerated after any dependency changes:
```bash
rm bun.lock
bun install
jj commit -m "Update bun.lock"
```

### Biome Version Mismatch Between Root and Package

**Problem:** Lint passed locally but failed in CI with errors like `Found an unknown key 'include'` or `Found an unknown key 'includes'`.

**Root cause:** The root `package.json` had `@biomejs/biome: "1.9.4"` while `packages/mermaid-ast/package.json` had `@biomejs/biome: "^2.3.11"`. Biome 1.x and 2.x have different config syntax:
- Biome 1.x: `files.include` and `files.ignore` (singular)
- Biome 2.x: `files.includes` (plural), no `ignore` in files section

Locally, the root's biome 1.9.4 was used. CI installed fresh and got biome 2.x from the package.

**Solution:** Keep biome versions consistent across all `package.json` files in the workspace. Currently using `^2.3.11` everywhere.

**Lesson:** When you see config syntax errors in CI that don't appear locally, check for version mismatches in dependencies.

### Disabled Lints for Fast Iteration

The following biome rules are disabled because they slow down development without genuine improvement:

- `assist/source/organizeImports` - Just reorders imports alphabetically, no functional benefit
- `correctness/noUnusedImports` - Too noisy during active development; unused imports get cleaned up naturally
- `style/recommended` - All style rules disabled; we care about correctness, not style preferences

These are configured in `biome.json`. Re-enable them if the project matures and needs stricter linting.

### Test Job Must Match prepublishOnly Checks

**Problem:** The test job in publish.yml passed, but npm publish failed because `prepublishOnly` in package.json runs additional checks (`bun run build && bun run test && bun run lint`) from within the package directory.

**Root cause:** The test job ran lint at the root level, but prepublishOnly ran lint from within `packages/mermaid-ast`, which could use different biome versions or configurations.

**Solution:** The test job must run the same checks from the same directories as prepublishOnly:
```yaml
- name: Lint (root)
  run: bun run lint
  working-directory: .

- name: Lint (mermaid-ast)
  run: bun run lint

- name: Run tests (mermaid-ast)
  run: bun run test
```

**Lesson:** If package.json has prepublishOnly hooks, the CI test job must validate those exact same commands to catch issues before publish.

### npm version Doesn't Work with Bun Workspace Dependencies

**Problem:** Running `npm version patch --no-git-tag-version` failed with `Unsupported URL Type "workspace:": workspace:*`.

**Root cause:** The package has dependencies using bun's `workspace:*` protocol, which npm doesn't understand.

**Solution:** Use `jq` to manually bump versions instead of `npm version`:
```bash
# Get current version and bump patch
CURRENT=$(jq -r '.version' package.json)
IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT"
NEW_PATCH=$((PATCH + 1))
VERSION="$MAJOR.$MINOR.$NEW_PATCH"

# Update package.json
jq --arg v "$VERSION" '.version = $v' package.json > package.json.tmp && mv package.json.tmp package.json
```

**Lesson:** In bun workspaces, avoid npm commands that parse package.json dependencies. Use `jq` for JSON manipulation instead.

### JSR Needs README in Package Directory

**Problem:** JSR documentation showed "Missing score" for README even though `jsr.json` included `README.md` in `publish.include`.

**Root cause:** In a monorepo, the README was in the repo root, but JSR looks for files relative to the `jsr.json` location (i.e., `packages/mermaid-ast/`).

**Solution:** Move the detailed README to the package directory (`packages/mermaid-ast/README.md`). The root README becomes a brief monorepo summary that points to package READMEs.

**Lesson:** In monorepos, each package needs its own README in its directory for JSR/npm to include it. Don't try to reference files outside the package directory in `publish.include`.