/**
 * Diagram type detection example
 * This example mirrors the README "Diagram Type Detection" section
 */
import { detectDiagramType } from "../src/index.js";

console.log("flowchart:", detectDiagramType("flowchart LR\n  A --> B")); // "flowchart"
console.log("sequence:", detectDiagramType("sequenceDiagram\n  A->>B: Hi")); // "sequence"
console.log("class:", detectDiagramType("classDiagram\n  class Animal")); // "class"
console.log("unknown:", detectDiagramType("unknown diagram")); // null