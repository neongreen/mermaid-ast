/**
 * Journey Diagram Renderer
 *
 * Renders a Journey AST back to Mermaid syntax.
 */

import type { JourneyAST, JourneyTask } from '../types/journey.js';
import type { RenderOptions } from '../types/render-options.js';
import { resolveOptions } from '../types/render-options.js';

/**
 * Render options for journey diagrams
 */
export interface JourneyRenderOptions {
  /** Number of spaces for indentation, or 'tab' for tab character (default: 4) */
  indent?: number | 'tab';
}

/**
 * Render a task to Mermaid syntax
 */
function renderTask(task: JourneyTask): string {
  let line = `${task.name}: ${task.score}`;
  if (task.actors.length > 0) {
    line += `: ${task.actors.join(', ')}`;
  }
  return line;
}

/**
 * Render a Journey AST to Mermaid syntax
 */
export function renderJourney(ast: JourneyAST, options?: RenderOptions): string {
  const opts = resolveOptions(options);
  const indent = opts.indent;
  const lines: string[] = [];

  // Header
  lines.push('journey');

  // Title
  if (ast.title) {
    lines.push(`${indent}title ${ast.title}`);
  }

  // Sections and tasks
  for (const section of ast.sections) {
    if (section.name) {
      lines.push(`${indent}section ${section.name}`);
    }
    for (const task of section.tasks) {
      lines.push(`${indent}${indent}${renderTask(task)}`);
    }
  }

  return lines.join('\n');
}
