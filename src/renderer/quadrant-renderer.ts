/**
 * Quadrant Chart Renderer
 *
 * Renders a Quadrant Chart AST back to Mermaid syntax.
 */

import type { QuadrantAST } from '../types/quadrant.js';
import type { RenderOptions } from '../types/render-options.js';
import { resolveOptions } from '../types/render-options.js';

/**
 * Render a Quadrant Chart AST to Mermaid syntax
 */
export function renderQuadrant(ast: QuadrantAST, options?: RenderOptions): string {
  const opts = resolveOptions(options);
  const indent = opts.indent;
  const lines: string[] = [];

  // Header
  lines.push('quadrantChart');

  // Title
  if (ast.title) {
    lines.push(`${indent}title ${ast.title}`);
  }

  // Accessibility info
  if (ast.accTitle) {
    lines.push(`${indent}accTitle: ${ast.accTitle}`);
  }
  if (ast.accDescription) {
    lines.push(`${indent}accDescr: ${ast.accDescription}`);
  }

  // Class definitions
  if (ast.classes && ast.classes.size > 0) {
    for (const cls of ast.classes.values()) {
      const stylesStr = cls.styles.join(', ');
      lines.push(`${indent}classDef ${cls.name} ${stylesStr}`);
    }
  }

  // X-axis labels
  if (ast.xAxisLeft || ast.xAxisRight) {
    const left = ast.xAxisLeft || '';
    const right = ast.xAxisRight || '';
    lines.push(`${indent}x-axis "${left}" --> "${right}"`);
  }

  // Y-axis labels
  if (ast.yAxisBottom || ast.yAxisTop) {
    const bottom = ast.yAxisBottom || '';
    const top = ast.yAxisTop || '';
    lines.push(`${indent}y-axis "${bottom}" --> "${top}"`);
  }

  // Quadrant labels
  if (ast.quadrant1) {
    lines.push(`${indent}quadrant-1 "${ast.quadrant1}"`);
  }
  if (ast.quadrant2) {
    lines.push(`${indent}quadrant-2 "${ast.quadrant2}"`);
  }
  if (ast.quadrant3) {
    lines.push(`${indent}quadrant-3 "${ast.quadrant3}"`);
  }
  if (ast.quadrant4) {
    lines.push(`${indent}quadrant-4 "${ast.quadrant4}"`);
  }

  // Data points
  for (const point of ast.points) {
    let line = `${indent}${point.name}`;

    // Add class reference if present
    if (point.className) {
      line += `:::${point.className}`;
    }

    // Add coordinates
    line += `: [${point.x}, ${point.y}]`;

    // Add inline styles if present
    if (point.styles && point.styles.length > 0) {
      line += ` style ${point.styles.join(', ')}`;
    }

    lines.push(line);
  }

  return lines.join('\n');
}
