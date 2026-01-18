/**
 * Mermaid AST Types
 *
 * This module exports all AST types for supported Mermaid diagram types.
 */

export * from './block.js';
export * from './c4.js';
export * from './class.js';
export * from './er.js';
export * from './flowchart.js';
export * from './gantt.js';
export * from './gitgraph.js';
export * from './journey.js';
export * from './kanban.js';
export * from './mindmap.js';
export * from './pie.js';
export * from './quadrant.js';
export * from './render-options.js';
export * from './requirement.js';
export * from './sankey.js';
export * from './sequence.js';
export * from './state.js';
export * from './timeline.js';
export * from './xychart.js';

import type { BlockAST } from './block.js';
import type { C4AST } from './c4.js';
import type { ClassDiagramAST } from './class.js';
import type { ErDiagramAST } from './er.js';
import type { FlowchartAST } from './flowchart.js';
import type { GanttAST } from './gantt.js';
import type { GitGraphAST } from './gitgraph.js';
import type { JourneyAST } from './journey.js';
import type { KanbanAST } from './kanban.js';
import type { MindmapAST } from './mindmap.js';
import type { PieAST } from './pie.js';
import type { QuadrantAST } from './quadrant.js';
import type { RequirementAST } from './requirement.js';
import type { SankeyAST } from './sankey.js';
import type { SequenceAST } from './sequence.js';
import type { StateDiagramAST } from './state.js';
import type { TimelineAST } from './timeline.js';
import type { XYChartAST } from './xychart.js';

/**
 * Union type for all supported diagram ASTs
 */
export type MermaidAST =
  | BlockAST
  | C4AST
  | FlowchartAST
  | SequenceAST
  | ClassDiagramAST
  | StateDiagramAST
  | ErDiagramAST
  | GanttAST
  | GitGraphAST
  | MindmapAST
  | JourneyAST
  | KanbanAST
  | PieAST
  | QuadrantAST
  | RequirementAST
  | SankeyAST
  | TimelineAST
  | XYChartAST;

/**
 * Diagram type identifiers
 */
export type DiagramType =
  | 'block'
  | 'c4'
  | 'flowchart'
  | 'sequence'
  | 'class'
  | 'state'
  | 'erDiagram'
  | 'gantt'
  | 'gitGraph'
  | 'mindmap'
  | 'journey'
  | 'kanban'
  | 'pie'
  | 'quadrant'
  | 'requirement'
  | 'sankey'
  | 'timeline'
  | 'xychart';

/**
 * Check if an AST is a flowchart
 */
export function isFlowchartAST(ast: MermaidAST): ast is FlowchartAST {
  return ast.type === 'flowchart';
}

/**
 * Check if an AST is a sequence diagram
 */
export function isSequenceAST(ast: MermaidAST): ast is SequenceAST {
  return ast.type === 'sequence';
}

/**
 * Check if an AST is a class diagram
 */
export function isClassDiagramAST(ast: MermaidAST): ast is ClassDiagramAST {
  return ast.type === 'classDiagram';
}

/**
 * Check if an AST is a state diagram
 */
export function isStateDiagramAST(ast: MermaidAST): ast is StateDiagramAST {
  return ast.type === 'state';
}

/**
 * Check if an AST is an ER diagram
 */
export function isErDiagramAST(ast: MermaidAST): ast is ErDiagramAST {
  return ast.type === 'erDiagram';
}

/**
 * Check if an AST is a Gantt chart
 */
export function isGanttAST(ast: MermaidAST): ast is GanttAST {
  return ast.type === 'gantt';
}

/**
 * Check if an AST is a Mindmap
 */
export function isMindmapAST(ast: MermaidAST): ast is MindmapAST {
  return ast.type === 'mindmap';
}

/**
 * Check if an AST is a Journey diagram
 */
export function isJourneyAST(ast: MermaidAST): ast is JourneyAST {
  return ast.type === 'journey';
}

/**
 * Check if an AST is a Kanban diagram
 */
export function isKanbanAST(ast: MermaidAST): ast is KanbanAST {
  return ast.type === 'kanban';
}

/**
 * Check if an AST is a Timeline diagram
 */
export function isTimelineAST(ast: MermaidAST): ast is TimelineAST {
  return ast.type === 'timeline';
}

/**
 * Check if an AST is a Sankey diagram
 */
export function isSankeyAST(ast: MermaidAST): ast is SankeyAST {
  return ast.type === 'sankey';
}

/**
 * Check if an AST is a Quadrant chart
 */
export function isQuadrantAST(ast: MermaidAST): ast is QuadrantAST {
  return ast.type === 'quadrant';
}

/**
 * Check if an AST is an XY Chart
 */
export function isXYChartAST(ast: MermaidAST): ast is XYChartAST {
  return ast.type === 'xychart';
}

/**
 * Check if an AST is a Requirement diagram
 */
export function isRequirementAST(ast: MermaidAST): ast is RequirementAST {
  return ast.type === 'requirement';
}

/**
 * Check if an AST is a Block diagram
 */
export function isBlockAST(ast: MermaidAST): ast is BlockAST {
  return ast.type === 'block';
}

/**
 * Check if an AST is a C4 diagram
 */
export function isC4AST(ast: MermaidAST): ast is C4AST {
  return ast.type === 'c4';
}

/**
 * Check if an AST is a Pie chart
 */
export function isPieAST(ast: MermaidAST): ast is PieAST {
  return ast.type === 'pie';
}

/**
 * Check if an AST is a GitGraph diagram
 */
export function isGitGraphAST(ast: MermaidAST): ast is GitGraphAST {
  return ast.type === 'gitGraph';
}
