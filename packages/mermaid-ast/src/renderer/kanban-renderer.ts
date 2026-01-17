/**
 * Kanban Diagram Renderer
 *
 * Renders a Kanban AST back to Mermaid syntax.
 */

import type { KanbanAST, KanbanNode } from '../types/kanban.js';
import { KanbanNodeType } from '../types/kanban.js';
import type { RenderOptions } from '../types/render-options.js';
import { resolveOptions } from '../types/render-options.js';
import type { Doc } from './doc.js';
import { indent, render } from './doc.js';

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
      return ['([-', '-])'];
    case KanbanNodeType.ASYMMETRIC:
      return ['(-)', '-)'];
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
 * Render nodes recursively as Doc
 */
function renderNodesDoc(nodes: KanbanNode[]): Doc {
  return nodes.map((node) => {
    let line = renderNode(node);

    // Add shape data if present
    if (node.shapeData) {
      line += `@{${node.shapeData}}`;
    }

    const parts: Doc[] = [line];

    // Add decorations on separate lines
    if (node.icon) {
      parts.push(`::icon(${node.icon})`);
    }
    if (node.class) {
      parts.push(`:::${node.class}`);
    }

    // Render children (indented)
    if (node.children.length > 0) {
      parts.push(indent(renderNodesDoc(node.children)));
    }

    return parts;
  });
}

/**
 * Render a Kanban AST to Mermaid syntax
 */
export function renderKanban(ast: KanbanAST, options?: RenderOptions): string {
  const opts = resolveOptions(options);

  const doc: Doc = ['kanban', indent(renderNodesDoc(ast.nodes))];

  return render(doc, opts.indent);
}
