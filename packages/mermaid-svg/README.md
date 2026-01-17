# mermaid-svg

Server-side SVG rendering for Mermaid diagrams. Renders `mermaid-ast` ASTs to SVG without requiring a browser.

[![Built with Slate](https://img.shields.io/badge/Built%20with-Slate-blue)](https://randomlabs.ai)

## Features

- **Server-side rendering** - No browser or DOM required
- **Cross-runtime support** - Works in Bun, Node.js, and Deno
- **Automatic layout** - Uses ELK.js for professional graph layout
- **Customizable themes** - Full control over colors, fonts, and styling
- **Multiple shapes** - Rectangle, rounded, stadium, diamond, hexagon, cylinder, circle

## Installation

```bash
# npm
npm install mermaid-svg mermaid-ast

# bun
bun add mermaid-svg mermaid-ast

# pnpm
pnpm add mermaid-svg mermaid-ast
```

## Quick Start

```typescript
import { parseFlowchart } from 'mermaid-ast';
import { renderFlowchartToSVG } from 'mermaid-svg';

// Parse a Mermaid flowchart
const ast = parseFlowchart(`flowchart LR
  A[Start] --> B{Decision}
  B -->|Yes| C[End]
  B -->|No| D[Loop]
  D --> B
`);

// Render to SVG
const svg = await renderFlowchartToSVG(ast);

// svg is a string: '<svg xmlns="...">...</svg>'
console.log(svg);
```

## API

### `renderFlowchartToSVG(ast, options?)`

Renders a FlowchartAST to an SVG string.

**Parameters:**
- `ast` - A FlowchartAST from `mermaid-ast`
- `options` - Optional rendering options

**Options:**
```typescript
interface RenderOptions {
  theme?: Partial<Theme>;  // Custom theme overrides
  padding?: number;        // Padding around the diagram (default: 20)
}
```

**Returns:** `Promise<string>` - The SVG string

### Theme Options

```typescript
interface Theme {
  // Background
  background: string;

  // Node styling
  nodeFill: string;
  nodeStroke: string;
  nodeStrokeWidth: number;
  nodeTextColor: string;

  // Edge styling
  edgeStroke: string;
  edgeStrokeWidth: number;
  edgeTextColor: string;

  // Typography
  fontFamily: string;
  fontSize: number;

  // Sizing
  nodePadding: number;
  nodeMinWidth: number;
  nodeMinHeight: number;
}
```

## Examples

### Basic Flowchart

```typescript
import { parseFlowchart } from 'mermaid-ast';
import { renderFlowchartToSVG } from 'mermaid-svg';

const ast = parseFlowchart(`flowchart TD
  A[Start] --> B[Process]
  B --> C[End]
`);

const svg = await renderFlowchartToSVG(ast);
```

### Custom Theme

```typescript
import { parseFlowchart } from 'mermaid-ast';
import { renderFlowchartToSVG } from 'mermaid-svg';

const ast = parseFlowchart(`flowchart LR
  A[Input] --> B[Output]
`);

const svg = await renderFlowchartToSVG(ast, {
  theme: {
    nodeFill: '#1a1a2e',
    nodeStroke: '#16213e',
    nodeTextColor: '#e94560',
    edgeStroke: '#0f3460',
    background: '#0f0f0f',
    fontFamily: 'Courier New, monospace',
  },
});
```

### Different Node Shapes

```typescript
import { parseFlowchart } from 'mermaid-ast';
import { renderFlowchartToSVG } from 'mermaid-svg';

const ast = parseFlowchart(`flowchart TD
  A[Rectangle]
  B(Rounded)
  C([Stadium])
  D{Diamond}
  E{{Hexagon}}
  F[(Cylinder)]
  G((Circle))
`);

const svg = await renderFlowchartToSVG(ast);
```

### Layout Directions

```typescript
// Left to Right
const lrAst = parseFlowchart(`flowchart LR
  A --> B --> C
`);

// Top to Bottom
const tbAst = parseFlowchart(`flowchart TB
  A --> B --> C
`);

// Right to Left
const rlAst = parseFlowchart(`flowchart RL
  A --> B --> C
`);

// Bottom to Top
const btAst = parseFlowchart(`flowchart BT
  A --> B --> C
`);
```

### Save to File

```typescript
import { parseFlowchart } from 'mermaid-ast';
import { renderFlowchartToSVG } from 'mermaid-svg';
import { writeFile } from 'fs/promises';

const ast = parseFlowchart(`flowchart LR
  A[Start] --> B[End]
`);

const svg = await renderFlowchartToSVG(ast);
await writeFile('diagram.svg', svg);
```

## Supported Shapes

| Shape | Mermaid Syntax | Description |
|-------|----------------|-------------|
| Rectangle | `A[text]` | Standard rectangle |
| Rounded | `A(text)` | Rectangle with rounded corners |
| Stadium | `A([text])` | Pill/stadium shape |
| Diamond | `A{text}` | Decision diamond |
| Hexagon | `A{{text}}` | Hexagon shape |
| Cylinder | `A[(text)]` | Database cylinder |
| Circle | `A((text))` | Circle/ellipse |

## Dependencies

- **elkjs** - Graph layout engine
- **@svgdotjs/svg.js** - SVG generation
- **svgdom** - Server-side DOM for svg.js
- **mermaid-ast** - Peer dependency for parsing

## License

MIT