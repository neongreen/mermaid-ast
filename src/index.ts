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

// Export Flowchart wrapper class
export { Flowchart } from './flowchart.js';
export type {
  AddLinkOptions,
  AddNodeOptions,
  FindNodesQuery,
  LinkInfo,
  RemoveNodeOptions,
} from './flowchart.js';

// Export builders (legacy - will be replaced by wrapper classes)
export * from './builder/index.js';
// Export parser functions
export {
  detectDiagramType,
  isClassDiagram,
  isFlowchartDiagram,
  isSequenceDiagram,
  parse,
  parseClassDiagram,
  parseFlowchart,
  parseSequence,
} from './parser/index.js';
// Export renderer functions
export {
  render,
  renderClassDiagram,
  renderFlowchart,
  renderSequence,
} from './renderer/index.js';
// Export types
export * from './types/index.js';
