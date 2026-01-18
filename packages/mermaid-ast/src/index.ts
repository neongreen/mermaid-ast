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

export type {
  AddBlockEdgeOptions,
  AddBlockNodeOptions,
} from './block.js';
// Export Block wrapper class
export { Block } from './block.js';
export type {
  AddBoundaryOptions,
  AddComponentOptions,
  AddContainerOptions,
  AddDeploymentNodeOptions,
  AddPersonOptions,
  AddRelationshipOptions as AddC4RelationshipOptions,
  AddSystemOptions,
  FindElementsQuery as FindC4ElementsQuery,
  FindRelationshipsQuery as FindC4RelationshipsQuery,
} from './c4.js';
// Export C4 wrapper class
export { C4 } from './c4.js';
export type {
  AddClassOptions,
  AddMemberOptions,
  AddRelationOptions,
} from './class-diagram.js';
// Export ClassDiagram wrapper class
export { ClassDiagram } from './class-diagram.js';
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
export type {
  AddBranchOptions,
  AddCommitOptions,
  CherryPickOptions,
  FindBranchesQuery,
  FindCommitsQuery,
  MergeOptions,
} from './gitgraph.js';
// Export GitGraph wrapper class
export { GitGraph } from './gitgraph.js';
export type { AddJourneyTaskOptions, FindJourneyTasksQuery } from './journey.js';

// Export Journey wrapper class
export { Journey } from './journey.js';
export type {
  AddKanbanNodeOptions,
  FindKanbanNodesQuery,
} from './kanban.js';
// Export Kanban wrapper class
export { Kanban } from './kanban.js';
export type { AddMindmapNodeOptions, FindMindmapNodesQuery } from './mindmap.js';
// Export Mindmap wrapper class
export { Mindmap } from './mindmap.js';
export type { AddSectionOptions, FindSectionsQuery } from './pie.js';
// Export Pie wrapper class
export { Pie } from './pie.js';
export { parseErDiagram } from './parser/er-parser.js';
// Export parser functions
export {
  detectDiagramType,
  isBlockDiagram,
  isC4Diagram,
  isClassDiagram,
  isFlowchartDiagram,
  isGitGraphDiagram,
  isPieDiagram,
  isQuadrantDiagram,
  isRequirementDiagram,
  isSankeyDiagram,
  isSequenceDiagram,
  parse,
  parseAsync,
  parseBlock,
  parseC4,
  parseClassDiagram,
  parseFlowchart,
  parseGitGraph,
  parsePie,
  parseQuadrant,
  parseRequirement,
  parseSankey,
  parseSequence,
} from './parser/index.js';
export type {
  AddQuadrantPointOptions,
  FindQuadrantPointsQuery,
} from './quadrant.js';
// Export Quadrant wrapper class
export { Quadrant } from './quadrant.js';

export type {
  AddElementOptions,
  AddRequirementOptions,
  FindElementsQuery,
  FindRelationshipsQuery,
  FindRequirementsQuery,
} from './requirement.js';
// Export Requirement wrapper class
export { Requirement } from './requirement.js';

export { renderErDiagram } from './renderer/er-renderer.js';
// Export renderer functions
export {
  render,
  renderBlock,
  renderC4,
  renderClassDiagram,
  renderFlowchart,
  renderGitGraph,
  renderPie,
  renderQuadrant,
  renderRequirement,
  renderSankey,
  renderSequence,
} from './renderer/index.js';
export type {
  FindSankeyLinksQuery,
  FindSankeyNodesQuery,
} from './sankey.js';
// Export Sankey wrapper class
export { Sankey } from './sankey.js';
export type {
  AddActorOptions,
  AddMessageOptions,
  AddNoteOptions,
} from './sequence.js';
// Export Sequence wrapper class
export { Sequence } from './sequence.js';
export type {
  AddStateOptions,
  AddTransitionOptions,
} from './state-diagram.js';
// Export StateDiagram wrapper class
export { StateDiagram } from './state-diagram.js';
export type { FindTimelineEventsQuery, FindTimelinePeriodsQuery } from './timeline.js';
// Export Timeline wrapper class
export { Timeline } from './timeline.js';
export type { FindSeriesQuery } from './xychart.js';
// Export XYChart wrapper class
export { XYChart } from './xychart.js';

// Export types
export * from './types/index.js';
