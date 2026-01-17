/**
 * Kanban Diagram AST Types
 *
 * Represents Kanban board diagrams with hierarchical nodes.
 */

/**
 * Node shape types mapped from parser
 */
export enum KanbanNodeType {
  ROUND = 0,
  SQUARE = 1,
  DIAMOND = 2,
  HEXAGON = 3,
  ODD = 4,
  CIRCLE = 5,
  ASYMMETRIC = 6,
  RHOMBUS = 7,
  CYLINDER = 8,
  ROUND_EDGE = 9,
  SUBROUTINE = 10,
  STADIUM = 11,
  DOUBLE_CIRCLE = 12,
}

/**
 * A node in the kanban board
 */
export interface KanbanNode {
  /** Node identifier */
  id: string;
  /** Node description/label text */
  descr: string;
  /** Node shape type */
  type: KanbanNodeType;
  /** Indentation level (depth in tree) */
  indent: number;
  /** Optional icon identifier */
  icon?: string;
  /** Optional CSS class */
  class?: string;
  /** Optional shape data */
  shapeData?: string;
  /** Child nodes */
  children: KanbanNode[];
}

/**
 * The complete Kanban Diagram AST
 */
export interface KanbanAST {
  type: 'kanban';
  /** Root-level nodes */
  nodes: KanbanNode[];
}

/**
 * Create an empty Kanban AST
 */
export function createEmptyKanbanAST(): KanbanAST {
  return {
    type: 'kanban',
    nodes: [],
  };
}
