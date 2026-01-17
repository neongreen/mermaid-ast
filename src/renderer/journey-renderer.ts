/**
 * Journey Diagram Renderer
 *
 * Renders a Journey AST back to Mermaid syntax.
 */

import type { JourneyAST, JourneySection, JourneyTask } from '../types/journey.js';

/**
 * Render options for journey diagrams
 */
export interface JourneyRenderOptions {
  /** Indentation string (default: '    ') */
  indent?: string;
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
export function renderJourney(ast: JourneyAST, options: JourneyRenderOptions = {}): string {
  const indent = options.indent ?? '    ';
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