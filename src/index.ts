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

// Export base class
export { DiagramWrapper } from './diagram-wrapper.js';
export type { BaseDiagramAST, ASTOf } from './diagram-wrapper.js';

// Export Flowchart wrapper class
export { Flowchart } from './flowchart.js';
export type {
  AddLinkOptions,
  AddNodeOptions,
  FindNodesQuery,
  LinkInfo,
  RemoveNodeOptions,
} from './flowchart-types.js';

// Export ErDiagram wrapper class
export { ErDiagram } from './er-diagram.js';
export type {
  AddAttributeOptions,
  AddRelationshipOptions,
  FindEntitiesQuery,
} from './er-diagram.js';

// Export Gantt wrapper class
export { Gantt } from './gantt.js';
export type { AddTaskOptions, FindTasksQuery } from './gantt.js';

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
export { parseErDiagram } from './parser/er-parser.js';

// Export renderer functions
export {
  render,
  renderClassDiagram,
  renderFlowchart,
  renderSequence,
} from './renderer/index.js';
export { renderErDiagram } from './renderer/er-renderer.js';

// Export types
export * from './types/index.js';
