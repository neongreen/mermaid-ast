/**
 * Basic parsing and rendering example
 * This example mirrors the README "Basic Parsing and Rendering" section
 */
import { parse, render } from '../src/index.js';

// Parse any supported diagram
const ast = parse(`flowchart LR
    A[Start] --> B{Decision}
    B -->|Yes| C[OK]
    B -->|No| D[Cancel]`);

// Render back to Mermaid syntax
const output = render(ast);

console.log('Parsed AST type:', ast.type);
console.log('Rendered output:');
console.log(output);
