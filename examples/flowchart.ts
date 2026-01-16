/**
 * Flowchart diagram example
 * This example mirrors the README "Flowchart Diagrams" section
 */
import { parseFlowchart, renderFlowchart } from "../src/index.js";

const ast = parseFlowchart(`flowchart TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> B`);

// Access AST properties
console.log("Direction:", ast.direction); // "TD"
console.log("Nodes count:", ast.nodes.size); // 4
console.log("Links count:", ast.links.length); // 4

// Modify the AST
const nodeA = ast.nodes.get("A");
if (nodeA) {
  nodeA.text = { text: "Begin", type: "text" };
}

// Render back
const output = renderFlowchart(ast);
console.log("\nRendered output:");
console.log(output);