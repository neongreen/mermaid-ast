/**
 * Mermaid AST Types
 *
 * This module exports all AST types for supported Mermaid diagram types.
 */

export * from './class.js';
export * from './er.js';
export * from './flowchart.js';
export * from './gantt.js';
export * from './journey.js';
export * from './mindmap.js';
export * from './quadrant.js';
export * from './render-options.js';
export * from './sankey.js';
export * from './sequence.js';
export * from './timeline.js';

import type { ClassDiagramAST } from './class.js';
import type { ErDiagramAST } from './er.js';
import type { FlowchartAST } from './flowchart.js';
import type { GanttAST } from './gantt.js';
import type { JourneyAST } from './journey.js';
import type { MindmapAST } from './mindmap.js';
import type { QuadrantAST } from './quadrant.js';
import type { SankeyAST } from './sankey.js';
import type { SequenceAST } from './sequence.js';
import type { TimelineAST } from './timeline.js';

/**
 * Union type for all supported diagram ASTs
 */
export type MermaidAST =
  | FlowchartAST
  | SequenceAST
  | ClassDiagramAST
  | ErDiagramAST
  | GanttAST
  | MindmapAST
  | JourneyAST
  | QuadrantAST
  | SankeyAST
  | TimelineAST;

/**
 * Diagram type identifiers
 */
export type DiagramType =
  | 'flowchart'
  | 'sequence'
  | 'class'
  | 'erDiagram'
  | 'gantt'
  | 'mindmap'
  | 'journey'
  | 'quadrant'
  | 'sankey'
  | 'timeline';

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
