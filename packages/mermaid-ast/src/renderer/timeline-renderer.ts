/**
 * Timeline Diagram Renderer
 *
 * Renders a Timeline AST back to Mermaid syntax.
 */

import type { RenderOptions } from '../types/render-options.js';
import { resolveOptions } from '../types/render-options.js';
import type { TimelineAST } from '../types/timeline.js';

/**
 * Render options for timeline diagrams
 */
export interface TimelineRenderOptions {
  /** Number of spaces for indentation, or 'tab' for tab character (default: 4) */
  indent?: number | 'tab';
}

/**
 * Render a Timeline AST to Mermaid syntax
 */
export function renderTimeline(ast: TimelineAST, options?: RenderOptions): string {
  const opts = resolveOptions(options);
  const indent = opts.indent;
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
