/**
 * Kanban Diagram Parser
 *
 * Parses Mermaid kanban diagram syntax into an AST using the vendored JISON parser.
 */

import type { KanbanAST, KanbanNode } from '../types/kanban.js';
import { KanbanNodeType, createEmptyKanbanAST } from '../types/kanban.js';

// @ts-expect-error - JISON parser has no types
import kanbanParser from '../vendored/parsers/kanban.js';

/**
 * Map delimiter pairs to node types
 */
function getNodeType(start: string, end: string): KanbanNodeType {
  const pair = `${start}${end}`;
  switch (pair) {
    case '()':
      return KanbanNodeType.ROUND;
    case '[]':
      return KanbanNodeType.SQUARE;
    case '{{}}':
      return KanbanNodeType.DIAMOND;
    case '(())':
      return KanbanNodeType.STADIUM;
    case '([-])':
      return KanbanNodeType.SUBROUTINE;
    case '(-)-)':
      return KanbanNodeType.ASYMMETRIC;
    default:
      return KanbanNodeType.SQUARE;
  }
}

/**
 * Create the yy object that the JISON parser uses to build the AST
 */
function createKanbanYY(ast: KanbanAST) {
  // Stack to track parent nodes at each indent level
  const nodeStack: Array<{ node: KanbanNode; indent: number }> = [];
  let lastNode: KanbanNode | null = null;

  return {
    /**
     * Add a node to the tree
     * @param spaceCount - Number of spaces (from SPACELIST length)
     * @param id - Node ID
     * @param descr - Node description
     * @param type - Node type
     * @param shapeData - Optional shape data
     */
    addNode(spaceCount: number, id: string, descr: string, type: number, shapeData?: string): void {
      // Find parent node based on space count
      while (nodeStack.length > 0 && nodeStack[nodeStack.length - 1].indent >= spaceCount) {
        nodeStack.pop();
      }

      // Calculate actual indent level (tree depth)
      const indentLevel = nodeStack.length;

      const node: KanbanNode = {
        id,
        descr,
        type,
        indent: indentLevel,
        children: [],
      };

      if (shapeData) {
        node.shapeData = shapeData;
      }

      if (nodeStack.length === 0) {
        // Root level node
        ast.nodes.push(node);
      } else {
        // Child node
        const parent = nodeStack[nodeStack.length - 1].node;
        parent.children.push(node);
      }

      // Add to stack with space count (not indent level)
      nodeStack.push({ node, indent: spaceCount });
      lastNode = node;
    },

    /**
     * Decorate the last added node with icon or class
     */
    decorateNode(decoration: { icon?: string; class?: string }): void {
      if (lastNode) {
        if (decoration.icon !== undefined) {
          lastNode.icon = decoration.icon;
        }
        if (decoration.class !== undefined) {
          lastNode.class = decoration.class;
        }
      }
    },

    /**
     * Get node type from delimiter pair
     */
    getType(start: string, end: string): number {
      return getNodeType(start, end);
    },

    /**
     * Logger stub for parser
     */
    getLogger() {
      return {
        trace: () => {},
        info: () => {},
        debug: () => {},
        warn: () => {},
        error: () => {},
      };
    },
  };
}

/**
 * Parse kanban diagram syntax into an AST
 * @param input - Mermaid kanban diagram syntax
 * @returns The parsed AST
 */
export function parseKanban(input: string): KanbanAST {
  const ast = createEmptyKanbanAST();

  // Normalize input - ensure it starts with kanban
  let normalizedInput = input.trim();
  if (!normalizedInput.toLowerCase().startsWith('kanban')) {
    normalizedInput = `kanban\n${normalizedInput}`;
  }

  // Ensure there's a newline after kanban to avoid EOF parse error
  if (normalizedInput.toLowerCase() === 'kanban') {
    normalizedInput = 'kanban\n';
  }

  // Set up the yy object
  kanbanParser.yy = createKanbanYY(ast);

  // Parse the input
  kanbanParser.parse(normalizedInput);

  return ast;
}

/**
 * Check if input is a kanban diagram
 */
export function isKanbanDiagram(input: string): boolean {
  const trimmed = input.trim();
  const firstLine = trimmed.split('\n')[0].trim().toLowerCase();
  return firstLine.startsWith('kanban');
}
