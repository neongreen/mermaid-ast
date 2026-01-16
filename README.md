# mermaid-ast

Parse and render Mermaid diagrams to/from AST (Abstract Syntax Tree).

This library provides a way to programmatically work with Mermaid diagrams by parsing them into a structured AST and rendering them back to Mermaid syntax. It uses the official mermaid.js JISON parsers to ensure compatibility.

## Features

- **Parse** Mermaid diagrams into typed AST structures
- **Render** ASTs back to valid Mermaid syntax
- **Round-trip guarantee**: `render(parse(text))` produces semantically equivalent diagrams
- **Full TypeScript support** with comprehensive type definitions
- **Cross-runtime support**: Works in Bun, Node.js, and Deno

## Supported Diagram Types

- **Flowchart** (`flowchart`, `graph`)
- **Sequence Diagram** (`sequenceDiagram`)

## Installation

```bash
# Bun
bun add mermaid-ast

# npm
npm install mermaid-ast

# pnpm
pnpm add mermaid-ast
```

## Usage

### Basic Parsing and Rendering

```typescript
import { parse, render } from "mermaid-ast";

// Parse any supported diagram
const ast = parse(`flowchart LR
    A[Start] --> B{Decision}
    B -->|Yes| C[OK]
    B -->|No| D[Cancel]`);

// Render back to Mermaid syntax
const output = render(ast);
```

### Flowchart Diagrams

```typescript
import { parseFlowchart, renderFlowchart } from "mermaid-ast";

const ast = parseFlowchart(`flowchart TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> B`);

// Access AST properties
console.log(ast.direction); // "TD"
console.log(ast.nodes.size); // 4
console.log(ast.links.length); // 4

// Modify the AST
ast.nodes.get("A")!.text = { text: "Begin", type: "text" };

// Render back
const output = renderFlowchart(ast);
```

### Sequence Diagrams

```typescript
import { parseSequence, renderSequence } from "mermaid-ast";

const ast = parseSequence(`sequenceDiagram
    participant A as Alice
    participant B as Bob
    A->>B: Hello Bob!
    B-->>A: Hi Alice!`);

// Access AST properties
console.log(ast.actors.size); // 2
console.log(ast.statements.length); // 2

// Render back
const output = renderSequence(ast);
```

### Diagram Type Detection

```typescript
import { detectDiagramType } from "mermaid-ast";

detectDiagramType("flowchart LR\n  A --> B"); // "flowchart"
detectDiagramType("sequenceDiagram\n  A->>B: Hi"); // "sequence"
detectDiagramType("unknown diagram"); // null
```

## API Reference

### Core Functions

| Function | Description |
|----------|-------------|
| `parse(input: string): MermaidAST` | Parse any supported diagram |
| `render(ast: MermaidAST): string` | Render any supported AST |
| `detectDiagramType(input: string): DiagramType \| null` | Detect diagram type |

### Flowchart Functions

| Function | Description |
|----------|-------------|
| `parseFlowchart(input: string): FlowchartAST` | Parse flowchart diagram |
| `renderFlowchart(ast: FlowchartAST): string` | Render flowchart AST |
| `isFlowchartDiagram(input: string): boolean` | Check if input is flowchart |

### Sequence Diagram Functions

| Function | Description |
|----------|-------------|
| `parseSequence(input: string): SequenceAST` | Parse sequence diagram |
| `renderSequence(ast: SequenceAST): string` | Render sequence AST |
| `isSequenceDiagram(input: string): boolean` | Check if input is sequence |

## Supported Flowchart Features

- **Directions**: LR, RL, TB, TD, BT
- **Node shapes**: Rectangle, rounded, diamond, stadium, subroutine, cylinder, circle, asymmetric, rhombus, hexagon, parallelogram, trapezoid, double-circle
- **Link types**: Arrow, open, cross, circle
- **Link strokes**: Normal, thick, dotted
- **Link labels**: Text on connections
- **Subgraphs**: With titles and directions
- **Styling**: `classDef`, `class`, `style`, `linkStyle`
- **Interactions**: `click` handlers with callbacks or URLs

## Supported Sequence Diagram Features

- **Participants/Actors**: With aliases
- **Message types**: Solid/dashed lines, arrows/open ends, async
- **Activations**: `activate`/`deactivate`
- **Control flow**: `loop`, `alt`/`else`, `opt`, `par`, `critical`, `break`
- **Grouping**: `rect` backgrounds
- **Notes**: `note left of`, `note right of`, `note over`
- **Actor lifecycle**: `create`, `destroy`

## Development

### Prerequisites

- [Bun](https://bun.sh/) runtime

### Commands

```bash
# Install dependencies
bun install

# Run tests
bun test

# Run specific test suites
bun test tests/unit          # Unit tests
bun test tests/roundtrip     # Round-trip tests
bun test tests/compatibility # Mermaid.js compatibility tests

# Type checking
bun run typecheck

# Build
bun run build
```

### Using the Justfile

If you have [just](https://github.com/casey/just) installed:

```bash
just mermaid-ast test              # Run all tests
just mermaid-ast test-roundtrip    # Run round-trip tests
just mermaid-ast dagger-test-all   # Test in all runtimes via Dagger
just mermaid-ast sync-parsers 11.4.2  # Sync parsers from mermaid version
```

## Updating Mermaid Parsers

This library vendors JISON parsers from mermaid.js. To update to a new mermaid version:

```bash
# Sync from a specific version
bun run sync-parsers -- 11.4.2

# Or using just
just mermaid-ast sync-parsers 11.4.2
```

The sync script will:
1. Clone the specified mermaid version
2. Extract the JISON grammar files
3. Compile them to JavaScript parsers
4. Update the VERSION file
5. Run tests to verify compatibility

### Manual Update Process

If you need to update manually:

1. Check the [mermaid releases](https://github.com/mermaid-js/mermaid/releases) for the target version
2. Run the sync script with that version
3. Run the full test suite to verify compatibility
4. Review any failing tests - they may indicate breaking changes in the grammar

## Architecture

```
mermaid-ast/
├── src/
│   ├── parser/           # Diagram parsers
│   │   ├── flowchart-parser.ts
│   │   └── sequence-parser.ts
│   ├── renderer/         # AST to text renderers
│   │   ├── flowchart-renderer.ts
│   │   └── sequence-renderer.ts
│   ├── types/            # TypeScript type definitions
│   │   ├── flowchart.ts
│   │   └── sequence.ts
│   └── vendored/         # Vendored mermaid parsers
│       ├── grammars/     # Original JISON grammar files
│       └── parsers/      # Compiled JavaScript parsers
├── tests/
│   ├── unit/             # Unit tests for parser/renderer
│   ├── roundtrip/        # Round-trip verification tests
│   └── compatibility/    # Mermaid.js SVG compatibility tests
└── scripts/
    └── sync-parsers.ts   # Parser sync script
```

## License

MIT