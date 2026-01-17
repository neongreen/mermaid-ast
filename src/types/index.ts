/**
 * Mermaid AST Types
 *
 * This module exports all AST types for supported Mermaid diagram types.
 */

export * from './class.js';
export * from './er.js';
export * from './flowchart.js';
export * from './gantt.js';
export * from './mindmap.js';
export * from './render-options.js';
export * from './sequence.js';

import type { ClassDiagramAST } from './class.js';
import type { ErDiagramAST } from './er.js';
import type { FlowchartAST } from './flowchart.js';
import type { GanttAST } from './gantt.js';
import type { MindmapAST } from './mindmap.js';
import type { SequenceAST } from './sequence.js';

/**
 * Union type for all supported diagram ASTs
 */
export type MermaidAST = FlowchartAST | SequenceAST | ClassDiagramAST | ErDiagramAST | GanttAST | MindmapAST;

/**
 * Diagram type identifiers
 */
export type DiagramType = 'flowchart' | 'sequence' | 'class' | 'erDiagram' | 'gantt' | 'mindmap';

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
