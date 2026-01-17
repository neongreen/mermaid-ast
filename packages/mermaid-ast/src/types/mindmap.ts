/**
 * Mindmap AST Types
 *
 * Represents mindmap diagrams with hierarchical nodes.
 */

/**
 * Node shape types
 */
export type MindmapNodeShape =
  | 'default' // No brackets - just text
  | 'square' // [text]
  | 'rounded' // (text)
  | 'circle' // ((text))
  | 'bang' // ))text((
  | 'cloud' // )text(
  | 'hexagon'; // {{text}}

/**
 * A node in the mindmap
 */
export interface MindmapNode {
  /** Node ID */
  id: string;
  /** Node description/label */
  description: string;
  /** Node shape */
  shape: MindmapNodeShape;
  /** Icon (from ::icon()) */
  icon?: string;
  /** CSS class (from :::className) */
  cssClass?: string;
  /** Nesting level (0 = root) */
  level: number;
  /** Child nodes */
  children: MindmapNode[];
}

/**
 * The complete Mindmap AST
 */
export interface MindmapAST {
  type: 'mindmap';
  /** Root node */
  root?: MindmapNode;
  /** Accessibility title */
  accTitle?: string;
  /** Accessibility description */
  accDescription?: string;
}

/**
 * Create an empty Mindmap AST
 */
export function createEmptyMindmapAST(): MindmapAST {
  return {
    type: 'mindmap',
  };
}
