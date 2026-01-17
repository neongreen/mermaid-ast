/**
 * Mindmap Renderer
 *
 * Renders a Mindmap AST back to Mermaid syntax.
 */

import type { MindmapAST, MindmapNode, MindmapNodeShape } from '../types/mindmap.js';
import type { RenderOptions } from '../types/render-options.js';
import { resolveOptions } from '../types/render-options.js';

/**
 * Render options for mindmaps
 */
export interface MindmapRenderOptions {
  /** Number of spaces for indentation, or 'tab' for tab character (default: 4) */
  indent?: number | 'tab';
}

/**
 * Get the start delimiter for a node shape
 */
function getShapeStart(shape: MindmapNodeShape): string {
  switch (shape) {
    case 'square':
      return '[';
    case 'rounded':
      return '(';
    case 'circle':
      return '((';
    case 'bang':
      return '))';
    case 'cloud':
      return ')';
    case 'hexagon':
      return '{{';
    default:
      return '';
  }
}

/**
 * Get the end delimiter for a node shape
 */
function getShapeEnd(shape: MindmapNodeShape): string {
  switch (shape) {
    case 'square':
      return ']';
    case 'rounded':
      return ')';
    case 'circle':
      return '))';
    case 'bang':
      return '((';
    case 'cloud':
      return '(';
    case 'hexagon':
      return '}}';
    default:
      return '';
  }
}

/**
 * Render a single node and its children
 */
function renderNode(node: MindmapNode, indent: string, lines: string[]): void {
  const prefix = indent.repeat(node.level);
  const start = getShapeStart(node.shape);
  const end = getShapeEnd(node.shape);

  // Build the node line
  let line = prefix;

  if (node.shape === 'default') {
    // No brackets for default shape
    line += node.id;
  } else if (node.id === node.description) {
    // ID same as description, use short form
    line += `${node.id}${start}${node.description}${end}`;
  } else {
    // ID different from description
    line += `${node.id}${start}${node.description}${end}`;
  }

  lines.push(line);

  // Add icon if present
  if (node.icon) {
    lines.push(`${prefix}::icon(${node.icon})`);
  }

  // Add class if present
  if (node.cssClass) {
    lines.push(`${prefix}:::${node.cssClass}`);
  }

  // Render children
  for (const child of node.children) {
    renderNode(child, indent, lines);
  }
}

/**
 * Render a Mindmap AST to Mermaid syntax
 */
export function renderMindmap(ast: MindmapAST, options?: RenderOptions): string {
  const opts = resolveOptions(options);
  const indent = opts.indent;
  const lines: string[] = [];

  // Header
  lines.push('mindmap');

  // Render root and all children
  if (ast.root) {
    renderNode(ast.root, indent, lines);
  }

  return lines.join('\n');
}
