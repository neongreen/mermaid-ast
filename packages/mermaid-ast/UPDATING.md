# Updating mermaid-ast to Newer Mermaid Versions

This document describes how to update mermaid-ast to support newer versions of mermaid.js.

## Overview

mermaid-ast vendors JISON parser grammars from the mermaid.js source code. When a new version of mermaid.js is released, you may need to update these vendored parsers to support new syntax or fix bugs.

## Prerequisites

- Bun installed (`curl -fsSL https://bun.sh/install | bash`)
- Git (for cloning mermaid source)

## Update Process

### 1. Check Current Version

The current vendored mermaid version is recorded in:
```
src/vendored/VERSION
```

### 2. Run the Sync Script

The `sync-parsers.ts` script automates the update process:

```bash
# Update to a specific version
bun run scripts/sync-parsers.ts 11.5.0

# Or update to latest
bun run scripts/sync-parsers.ts latest
```

The script will:
1. Clone/fetch the mermaid repository
2. Checkout the specified version tag
3. Copy JISON grammar files to `src/vendored/grammars/`
4. Compile grammars to JavaScript parsers in `src/vendored/parsers/`
5. Update the VERSION file

### 3. Run Tests

After syncing, run the test suite to ensure compatibility:

```bash
# Run all tests
bun test tests/unit/ tests/roundtrip/

# Run cross-runtime tests (requires Docker)
cd dagger && dagger call test-all --source=..
```

### 4. Fix Any Breaking Changes

New mermaid versions may introduce:

- **New syntax**: Update AST types in `src/types/` and parser wrappers in `src/parser/`
- **Changed parser output**: Update the parser wrapper to handle new statement types
- **New diagram types**: Add new type definitions, parser, and renderer modules

#### Adding Support for New Syntax

1. Check the JISON grammar changes in `src/vendored/grammars/`
2. Update the corresponding AST types in `src/types/`
3. Update the parser wrapper to handle new statement types
4. Update the renderer to output the new syntax
5. Add unit tests for the new features
6. Add round-trip tests

#### Adding a New Diagram Type

1. Add the JISON grammar to the sync script's `DIAGRAM_TYPES` list
2. Create new type definitions in `src/types/<diagram>.ts`
3. Create a parser wrapper in `src/parser/<diagram>-parser.ts`
4. Create a renderer in `src/renderer/<diagram>-renderer.ts`
5. Export from `src/index.ts`
6. Add comprehensive tests

### 5. Commit Changes

```bash
jj commit -m "chore: sync parsers with mermaid v<version>

- Updated JISON grammars from mermaid v<version>
- <list any breaking changes or new features>"
```

## Supported Diagram Types

Currently supported:
- Flowchart (`flowchart`, `graph`)
- Sequence Diagram (`sequenceDiagram`)

Planned:
- Class Diagram
- State Diagram
- Entity Relationship Diagram
- Gantt Chart
- And more...

## Troubleshooting

### Parser Compilation Fails

If JISON compilation fails:
1. Check if the grammar syntax changed
2. Ensure `jison` package is installed: `bun add -d jison`
3. Check for JISON version compatibility

### Tests Fail After Update

1. Check the mermaid changelog for breaking changes
2. Compare old and new grammar files
3. Update parser wrappers to handle new output formats
4. Update AST types if needed

### Round-trip Tests Fail

Round-trip failures usually indicate:
1. The renderer doesn't produce valid mermaid syntax
2. The parser doesn't capture all information needed for rendering
3. Semantic differences in how syntax is normalized

Fix by:
1. Checking what the parser outputs for the failing case
2. Updating the renderer to match expected syntax
3. Updating the AST to capture missing information

## Architecture Notes

### Parser Flow

```
Mermaid Text → JISON Parser → Raw Statements → Parser Wrapper → AST
```

The JISON parser produces raw statement objects. The parser wrapper (`src/parser/*-parser.ts`) transforms these into a clean, typed AST.

### Renderer Flow

```
AST → Renderer → Mermaid Text
```

The renderer (`src/renderer/*-renderer.ts`) converts the AST back to valid Mermaid syntax.

### Key Files

- `scripts/sync-parsers.ts` - Vendoring script
- `src/vendored/grammars/*.jison` - Original JISON grammar files
- `src/vendored/parsers/*.js` - Compiled JavaScript parsers
- `src/types/*.ts` - TypeScript AST type definitions
- `src/parser/*-parser.ts` - Parser wrappers (JISON → AST)
- `src/renderer/*-renderer.ts` - Renderers (AST → Mermaid)

## Version Compatibility Matrix

| mermaid-ast | mermaid.js | Notes |
|-------------|------------|-------|
| 0.1.x       | 11.4.x     | Initial release |

## Resources

- [Mermaid.js GitHub](https://github.com/mermaid-js/mermaid)
- [Mermaid.js Releases](https://github.com/mermaid-js/mermaid/releases)
- [JISON Documentation](https://zaa.ch/jison/docs/)