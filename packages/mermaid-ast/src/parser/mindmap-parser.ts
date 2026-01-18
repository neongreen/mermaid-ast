/**
 * Mindmap Parser
 *
 * Parses Mermaid mindmap syntax into an AST using the vendored JISON parser.
 */

import type { MindmapAST, MindmapNode, MindmapNodeShape } from '../types/mindmap.js';
import { createEmptyMindmapAST } from '../types/mindmap.js';

// @ts-expect-error - JISON parser has no types
import mindmapParser from '../vendored/parsers/mindmap.js';

/**
 * Node type enum matching mermaid's internal values
 */
const NodeType = {
  DEFAULT: 0,
  SQUARE: 1,
  ROUNDED: 2,
  CIRCLE: 3,
  CLOUD: 4,
  BANG: 5,
  HEXAGON: 6,
};

/**
 * Map from internal node type to our shape type
 */
function nodeTypeToShape(type: number): MindmapNodeShape {
  switch (type) {
    case NodeType.SQUARE:
      return 'square';
    case NodeType.ROUNDED:
      return 'rounded';
    case NodeType.CIRCLE:
      return 'circle';
    case NodeType.CLOUD:
      return 'cloud';
    case NodeType.BANG:
      return 'bang';
    case NodeType.HEXAGON:
      return 'hexagon';
    default:
      return 'default';
  }
}

/**
 * Get node type from start/end delimiters
 */
function getTypeFromDelimiters(start: string, end: string): number {
  switch (start) {
    case '[':
      return NodeType.SQUARE;
    case '(':
      return end === ')' ? NodeType.ROUNDED : NodeType.DEFAULT;
    case '((':
      return NodeType.CIRCLE;
    case '))':
      return NodeType.BANG;
    case ')':
      return NodeType.CLOUD;
    case '(-':
      return NodeType.CLOUD;
    case '{{':
      return NodeType.HEXAGON;
    default:
      return NodeType.DEFAULT;
  }
}

/**
 * Create the yy object that the JISON parser uses to build the AST
 */
function createMindmapYY(ast: MindmapAST) {
  // Stack to track parent nodes at each logical level
  const nodeStack: MindmapNode[] = [];
  // Map from raw indent to logical level
  const indentToLevel: Map<number, number> = new Map();
  // Last node added (for decoration)
  let lastNode: MindmapNode | null = null;
  // Track if we've seen the first node (which becomes root)
  let isFirstNode = true;
  // The base indent level (indent of the first/root node)
  let baseIndent = 0;

  return {
    nodeType: NodeType,

    getType(start: string, end: string): number {
      return getTypeFromDelimiters(start, end);
    },

    addNode(rawIndent: number, id: string, descr: string, type: number): void {
      // Convert raw indent to logical level
      let logicalLevel: number;

      if (isFirstNode) {
        // First node is always the root, regardless of its indent
        isFirstNode = false;
        baseIndent = rawIndent;
        logicalLevel = 0;
        indentToLevel.clear();
        indentToLevel.set(rawIndent, 0);
      } else if (indentToLevel.has(rawIndent)) {
        // We've seen this indent before
        logicalLevel = indentToLevel.get(rawIndent)!;
      } else {
        // New indent level - find where it fits
        // Get all known indents sorted
        const knownIndents = Array.from(indentToLevel.keys()).sort((a, b) => a - b);

        // Find the largest known indent smaller than rawIndent
        let parentIndent = 0;
        for (const indent of knownIndents) {
          if (indent < rawIndent) {
            parentIndent = indent;
          } else {
            break;
          }
        }

        const parentLevel = indentToLevel.get(parentIndent) ?? 0;
        logicalLevel = parentLevel + 1;
        indentToLevel.set(rawIndent, logicalLevel);

        // Clear any indent levels greater than this one (they're outdated)
        for (const [indent, _level] of indentToLevel) {
          if (indent > rawIndent) {
            indentToLevel.delete(indent);
          }
        }
      }

      const node: MindmapNode = {
        id,
        description: descr || id,
        shape: nodeTypeToShape(type),
        level: logicalLevel,
        children: [],
      };

      if (logicalLevel === 0) {
        // Root node
        ast.root = node;
        nodeStack.length = 0;
        nodeStack.push(node);
      } else {
        // Pop stack to find parent
        while (nodeStack.length > logicalLevel) {
          nodeStack.pop();
        }

        const parent = nodeStack[nodeStack.length - 1];
        if (parent) {
          parent.children.push(node);
        }

        // Add this node to the stack
        if (nodeStack.length <= logicalLevel) {
          nodeStack.push(node);
        } else {
          nodeStack[logicalLevel] = node;
        }
      }

      lastNode = node;
    },

    decorateNode(decoration: { icon?: string; class?: string }): void {
      if (lastNode) {
        if (decoration.icon) {
          lastNode.icon = decoration.icon;
        }
        if (decoration.class) {
          lastNode.cssClass = decoration.class;
        }
      }
    },

    setAccTitle(title: string): void {
      ast.accTitle = title;
    },

    setAccDescription(description: string): void {
      ast.accDescription = description;
    },

    // Required by parser but not used
    clear(): void {},
    setDiagramTitle(): void {},
    getLogger(): { trace: () => void; info: () => void } {
      return {
        trace: () => {},
        info: () => {},
      };
    },
  };
}

/**
 * Parse mindmap syntax into an AST
 * @param input - Mermaid mindmap syntax
 * @returns The parsed AST
 */
export function parseMindmap(input: string): MindmapAST {
  const ast = createEmptyMindmapAST();

  // Normalize input - ensure it starts with mindmap
  let normalizedInput = input.trim();
  if (!normalizedInput.toLowerCase().startsWith('mindmap')) {
    normalizedInput = `mindmap\n${normalizedInput}`;
  }

  // Set up the yy object
  mindmapParser.yy = createMindmapYY(ast);

  // Parse the input
  mindmapParser.parse(normalizedInput);

  return ast;
}

/**
 * Check if input is a mindmap diagram
 */
export function isMindmapDiagram(input: string): boolean {
  const trimmed = input.trim();
  const firstLine = trimmed.split('\n')[0].trim().toLowerCase();
  return firstLine.startsWith('mindmap');
}
