/**
 * Kanban Diagram Renderer
 *
 * Renders a Kanban AST back to Mermaid syntax.
 */

import type { KanbanAST, KanbanNode } from '../types/kanban.js';
import { KanbanNodeType } from '../types/kanban.js';
import type { RenderOptions } from '../types/render-options.js';
import { resolveOptions } from '../types/render-options.js';

/**
 * Get node delimiter pair for a given type
 */
function getNodeDelimiters(type: KanbanNodeType): [string, string] {
  switch (type) {
    case KanbanNodeType.ROUND:
      return ['(', ')'];
    case KanbanNodeType.SQUARE:
      return ['[', ']'];
    case KanbanNodeType.DIAMOND:
      return ['{{', '}}'];
    case KanbanNodeType.STADIUM:
      return ['((', '))'];
    case KanbanNodeType.SUBROUTINE:
      return ['([', '])'];
    case KanbanNodeType.ASYMMETRIC:
      return ['(-', '-)'];
    default:
      return ['[', ']'];
  }
}

/**
 * Render a single node
 */
function renderNode(node: KanbanNode): string {
  const [start, end] = getNodeDelimiters(node.type);
  
  // If id equals descr, render without delimiters
  if (node.id === node.descr) {
    return node.id;
  }
  
  // Otherwise, render with id and description
  return `${node.id}${start}${node.descr}${end}`;
}

/**
 * Render nodes recursively
 */
function renderNodes(
  nodes: KanbanNode[],
  baseIndent: string,
  singleIndent: string,
  lines: string[]
): void {
  for (const node of nodes) {
    // Root nodes (indent=0) get 1 level of indentation in output
    // Children get their parent's indentation + 1
    const indent = singleIndent.repeat(node.indent + 1);
    let line = `${indent}${renderNode(node)}`;
    
    // Add shape data if present
    if (node.shapeData) {
      line += `@{${node.shapeData}}`;
    }
    
    lines.push(line);
    
    // Add decorations on separate lines
    if (node.icon) {
      lines.push(`${indent}::icon(${node.icon})`);
    }
    if (node.class) {
      lines.push(`${indent}:::${node.class}`);
    }
    
    // Render children
    if (node.children.length > 0) {
      renderNodes(node.children, baseIndent, singleIndent, lines);
    }
  }
}

/**
 * Render a Kanban AST to Mermaid syntax
 */
export function renderKanban(ast: KanbanAST, options?: RenderOptions): string {
  const opts = resolveOptions(options);
  const indent = opts.indent;
  const lines: string[] = [];

  // Header
  lines.push('kanban');

  // Render all nodes
  renderNodes(ast.nodes, indent, indent, lines);

  return lines.join('\n');
}
