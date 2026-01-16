/**
 * Sequence diagram example
 * This example mirrors the README "Sequence Diagrams" section
 */
import { parseSequence, renderSequence } from "../src/index.js";

const ast = parseSequence(`sequenceDiagram
    participant A as Alice
    participant B as Bob
    A->>B: Hello Bob!
    B-->>A: Hi Alice!`);

// Access AST properties
console.log("Actors count:", ast.actors.size); // 2
console.log("Statements count:", ast.statements.length); // 2

// Render back
const output = renderSequence(ast);
console.log("\nRendered output:");
console.log(output);