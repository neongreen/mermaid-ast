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

// Export builders (legacy - will be replaced by wrapper classes)
export * from './builder/index.js';
export type { ASTOf, BaseDiagramAST } from './diagram-wrapper.js';
// Export base class
export { DiagramWrapper } from './diagram-wrapper.js';
export type {
  AddAttributeOptions,
  AddRelationshipOptions,
  FindEntitiesQuery,
} from './er-diagram.js';

// Export ErDiagram wrapper class
export { ErDiagram } from './er-diagram.js';
// Export Flowchart wrapper class
export { Flowchart } from './flowchart.js';
export type {
  AddLinkOptions,
  AddNodeOptions,
  FindNodesQuery,
  LinkInfo,
  RemoveNodeOptions,
} from './flowchart-types.js';
export type { AddTaskOptions, FindTasksQuery } from './gantt.js';
// Export Gantt wrapper class
export { Gantt } from './gantt.js';
export type { AddJourneyTaskOptions, FindJourneyTasksQuery } from './journey.js';

// Export Journey wrapper class
export { Journey } from './journey.js';
export type { AddMindmapNodeOptions, FindMindmapNodesQuery } from './mindmap.js';
// Export Mindmap wrapper class
export { Mindmap } from './mindmap.js';
export { parseErDiagram } from './parser/er-parser.js';
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
export { renderErDiagram } from './renderer/er-renderer.js';
// Export renderer functions
export {
  render,
  renderClassDiagram,
  renderFlowchart,
  renderSequence,
} from './renderer/index.js';
export type { FindTimelineEventsQuery, FindTimelinePeriodsQuery } from './timeline.js';
// Export Timeline wrapper class
export { Timeline } from './timeline.js';

// Export types
export * from './types/index.js';
