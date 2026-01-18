# Test Standards

This document defines the expected test structure for all diagram types in mermaid-ast.

## Test File Organization

Each diagram type should have the following test files:

```
tests/unit/
├── <type>.test.ts              # Wrapper class tests
├── <type>-parser.test.ts       # Parser tests
└── <type>-renderer.test.ts     # Renderer tests

tests/roundtrip/
└── <type>-roundtrip.test.ts    # Round-trip verification tests

tests/golden/<type>/
└── *.mmd                       # Golden output files
```

## Wrapper Tests (`<type>.test.ts`)

Main tests for the wrapper class (e.g., `Flowchart`, `Sequence`, `Gantt`).

### Required Sections

```typescript
describe('<Type> Wrapper', () => {
  describe('Factory Methods', () => {
    // create() - creates empty diagram
    // from() - wraps existing AST
    // parse() - parses Mermaid syntax
  });

  describe('Core Methods', () => {
    // toAST() - returns underlying AST
    // clone() - creates independent copy
    // render() - renders to Mermaid syntax
  });

  describe('<Domain> Operations', () => {
    // Domain-specific add/remove/update methods
    // e.g., Node Operations, Actor Operations, Task Operations
  });

  describe('Query Operations', () => {
    // find*() and get*() methods
  });

  describe('Complex Scenarios', () => {
    // Integration tests combining multiple operations
  });
});
```

### Minimum Test Coverage

| Section | Minimum Tests | Description |
|---------|---------------|-------------|
| Factory Methods | 3 | One for each factory method |
| Core Methods | 3 | toAST, clone, render |
| Domain Operations | 5+ | Cover all main operations |
| Query Operations | 3+ | Cover main query methods |
| Complex Scenarios | 1+ | At least one integration test |

## Parser Tests (`<type>-parser.test.ts`)

Tests for `parse<Type>()` and `is<Type>Diagram()` functions.

### Required Sections

```typescript
describe('is<Type>Diagram', () => {
  // Detection of valid diagram syntax
  // Rejection of invalid/other diagram types
});

describe('parse<Type> - Basic Parsing', () => {
  // Simple diagram cases
  // Core syntax elements
});

describe('parse<Type> - Advanced Parsing', () => {
  // Complex features
  // Edge cases
  // All enum values (shapes, arrow types, etc.)
});
```

### Minimum Test Coverage

| Section | Minimum Tests | Description |
|---------|---------------|-------------|
| Detection | 3+ | Valid detection + rejection of other types |
| Basic Parsing | 5+ | Core syntax elements |
| Advanced Parsing | 3+ | Complex features and edge cases |

## Renderer Tests (`<type>-renderer.test.ts`)

Tests for `render<Type>()` function.

### Required Sections

```typescript
describe('<Type> Renderer', () => {
  describe('Basic Rendering', () => {
    // Minimal diagrams
    // Core elements
  });

  describe('Advanced Rendering', () => {
    // Complex features
    // Styling, options
    // All enum values
  });

  describe('Golden Tests', () => {
    // expectGolden() round-trip tests
  });

  describe('Render Options', () => {
    // Custom indent
    // Tab indent
    // Other options
  });
});
```

### Minimum Test Coverage

| Section | Minimum Tests | Description |
|---------|---------------|-------------|
| Basic Rendering | 3+ | Core rendering cases |
| Advanced Rendering | 3+ | Complex features |
| Golden Tests | 2+ | Round-trip verification |
| Render Options | 2+ | Indent options |

## Round-trip Tests (`<type>-roundtrip.test.ts`)

Verify that `render(parse(text))` produces semantically equivalent diagrams.

### Required Sections

```typescript
describe('<Type> Round-trip', () => {
  describe('Basic Round-trips', () => {
    // Simple diagrams
  });

  describe('Complex Round-trips', () => {
    // All features
  });

  describe('Idempotency', () => {
    // render(parse(render(parse(x)))) === render(parse(x))
  });
});
```

### Minimum Test Coverage

| Section | Minimum Tests | Description |
|---------|---------------|-------------|
| Basic Round-trips | 3+ | Simple cases |
| Complex Round-trips | 2+ | All features |
| Idempotency | 1+ | Verify idempotent behavior |

## Golden Tests

Golden tests use `expectGolden()` to verify output against expected files.

### File Naming

```
tests/golden/<type>/
├── render-basic.mmd
├── render-<feature>.mmd
└── ...
```

### Usage

```typescript
import { expectGolden } from '../golden/golden.js';

it('should render basic diagram', () => {
  const diagram = <Type>.create()
    .addSomething('A')
    .addSomething('B');

  expectGolden(diagram.render(), '<type>/render-basic.mmd');
});
```

## Test Sourcing

Test cases can be sourced from:

1. **Manual creation** - Write tests based on API documentation
2. **Official mermaid-js repo** - Extract test cases from:
   - `packages/mermaid/src/diagrams/<type>/` test files
   - Example diagrams in mermaid-js documentation
   - Fixtures used in mermaid-js tests

When sourcing from mermaid-js:
- Verify the test case works with our parser
- Adapt assertions to match our AST structure
- Credit the source in comments if copying significant test logic

## Automated Test Coverage Verification

The file `tests/unit/test-coverage.test.ts` automatically verifies that all diagram types have the required test files. This test runs as part of `bun test` and will fail if:

1. A new diagram type is added to `DiagramType` but test files are missing
2. The `DIAGRAM_TYPES` configuration doesn't match the `DiagramType` union

### How It Works

The test checks for the existence of these files for each diagram type:
- `tests/unit/<type>.test.ts` (wrapper tests)
- `tests/unit/<type>-parser.test.ts` (parser tests)
- `tests/unit/<type>-renderer.test.ts` (renderer tests)
- `tests/roundtrip/<type>-roundtrip.test.ts` (roundtrip tests)

### Adding a New Diagram Type

When adding a new diagram type:

1. Add the type to `DiagramType` union in `src/types/index.ts`
2. Add an entry to `DIAGRAM_TYPES` in `tests/unit/test-coverage.test.ts`:
   ```typescript
   {
     type: 'newdiagram',
     wrapperName: 'newdiagram',      // or 'new-diagram' for compound names
     parserName: 'newdiagram',
     rendererName: 'newdiagram',
     roundtripName: 'newdiagram',
   },
   ```
3. Create all four required test files
4. Run `bun test tests/unit/test-coverage.test.ts` to verify

## Current Status

| Diagram | Wrapper | Parser | Renderer | Roundtrip | Status |
|---------|---------|--------|----------|-----------|--------|
| flowchart | ✓ | ✓ | ✓ | ✓ | Complete |
| sequence | ✓ | ✓ | ✓ | ✓ | Complete |
| class-diagram | ✓ | ✓ | ✓ | ✓ | Complete |
| state-diagram | ✓ | ✓ | ✓ | ✓ | Complete |
| er-diagram | ✓ | ✓ | ✓ | ✓ | Complete |
| gantt | ✓ | ✓ | ✓ | ✓ | Complete |
| journey | ✓ | ✓ | ✓ | ✓ | Complete |
| mindmap | ✓ | ✓ | ✓ | ✓ | Complete |
| timeline | ✓ | ✓ | ✓ | ✓ | Complete |
| sankey | ✓ | ✓ | ✓ | ✓ | Complete |
| quadrant | ✓ | ✓ | ✓ | ✓ | Complete |
| kanban | ✓ | ✓ | ✓ | ✓ | Complete |
| xychart | ✓ | ✓ | ✓ | ✓ | Complete |

All 13 diagram types have complete test coverage with wrapper, parser, renderer, and roundtrip tests.