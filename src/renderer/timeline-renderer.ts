/**
 * Timeline Diagram Renderer
 *
 * Renders a Timeline AST back to Mermaid syntax.
 */

import type { TimelineAST } from '../types/timeline.js';

/**
 * Render options for timeline diagrams
 */
export interface TimelineRenderOptions {
  /** Indentation string (default: '    ') */
  indent?: string;
}

/**
 * Render a Timeline AST to Mermaid syntax
 */
export function renderTimeline(ast: TimelineAST, options: TimelineRenderOptions = {}): string {
  const indent = options.indent ?? '    ';
  const lines: string[] = [];

  // Header
  lines.push('timeline');

  // Title
  if (ast.title) {
    lines.push(`${indent}title ${ast.title}`);
  }

  // Sections and periods
  for (const section of ast.sections) {
    if (section.name) {
      lines.push(`${indent}section ${section.name}`);
    }

    for (const period of section.periods) {
      // Period name
      if (period.name) {
        lines.push(`${indent}${indent}${period.name}`);
      }

      // Events under this period
      for (const event of period.events) {
        lines.push(`${indent}${indent}${indent}: ${event.text}`);
      }
    }
  }

  return lines.join('\n');
}
