/**
 * mermaid-ast
 * 
 * A library for parsing and rendering Mermaid diagrams to/from AST.
 * 
 * @example
 * ```typescript
 * import { parse, render } from "mermaid-ast";
 * 
 * const diagram = `
 * flowchart LR
 *   A[Start] --> B[End]
 * `;
 * 
 * const ast = parse(diagram);
 * const output = render(ast);
 * ```
 */

// Export types
export * from "./types/index.js";

// Export parser functions
export {
  parse,
  parseFlowchart,
  parseSequence,
  parseClassDiagram,
  detectDiagramType,
  isFlowchartDiagram,
  isSequenceDiagram,
  isClassDiagram,
} from "./parser/index.js";

// Export renderer functions
export {
  render,
  renderFlowchart,
  renderSequence,
  renderClassDiagram,
} from "./renderer/index.js";