/**
 * Gantt Chart Renderer
 *
 * Renders a Gantt Chart AST back to Mermaid syntax.
 */

import type { GanttAST, GanttTask } from '../types/gantt.js';
import type { RenderOptions } from '../types/render-options.js';
import { resolveOptions } from '../types/render-options.js';

/**
 * Render options for Gantt charts
 */
export interface GanttRenderOptions {
  /** Number of spaces for indentation, or 'tab' for tab character (default: 4) */
  indent?: number | 'tab';
}

/**
 * Render a task to Mermaid syntax
 */
function renderTask(task: GanttTask, indent: string): string {
  // If we have raw data, use it for better round-trip fidelity
  if (task.rawData) {
    return `${indent}${task.name}${task.rawData}`;
  }

  // Otherwise, reconstruct from parsed data
  const parts: string[] = [];

  if (task.status) {
    parts.push(task.status);
  }

  if (task.id) {
    parts.push(task.id);
  }

  if (task.start) {
    parts.push(task.start);
  }

  if (task.end) {
    parts.push(task.end);
  }

  const dataStr = parts.length > 0 ? `: ${parts.join(', ')}` : '';
  return `${indent}${task.name}${dataStr}`;
}

/**
 * Render a Gantt Chart AST to Mermaid syntax
 */
export function renderGantt(ast: GanttAST, options?: RenderOptions): string {
  const opts = resolveOptions(options);
  const indent = opts.indent;
  const lines: string[] = [];

  // Header
  lines.push('gantt');

  // Title
  if (ast.title) {
    lines.push(`${indent}title ${ast.title}`);
  }

  // Accessibility
  if (ast.accTitle) {
    lines.push(`${indent}accTitle: ${ast.accTitle}`);
  }
  if (ast.accDescription) {
    lines.push(`${indent}accDescr: ${ast.accDescription}`);
  }

  // Date/axis format
  if (ast.dateFormat) {
    lines.push(`${indent}dateFormat ${ast.dateFormat}`);
  }
  if (ast.axisFormat) {
    lines.push(`${indent}axisFormat ${ast.axisFormat}`);
  }
  if (ast.tickInterval) {
    lines.push(`${indent}tickInterval ${ast.tickInterval}`);
  }

  // Options
  if (ast.inclusiveEndDates) {
    lines.push(`${indent}inclusiveEndDates`);
  }
  if (ast.topAxis) {
    lines.push(`${indent}topAxis`);
  }

  // Excludes/includes
  if (ast.excludes) {
    lines.push(`${indent}excludes ${ast.excludes}`);
  }
  if (ast.includes) {
    lines.push(`${indent}includes ${ast.includes}`);
  }

  // Today marker
  if (ast.todayMarker) {
    lines.push(`${indent}todayMarker ${ast.todayMarker}`);
  }

  // Weekday/weekend
  if (ast.weekday) {
    lines.push(`${indent}weekday ${ast.weekday}`);
  }
  if (ast.weekend) {
    lines.push(`${indent}weekend ${ast.weekend}`);
  }

  // Tasks without section
  for (const task of ast.tasks) {
    lines.push(renderTask(task, indent));
  }

  // Sections with tasks
  for (const section of ast.sections) {
    lines.push(`${indent}section ${section.name}`);
    for (const task of section.tasks) {
      lines.push(renderTask(task, indent));
    }
  }

  // Click events
  for (const click of ast.clickEvents) {
    let clickLine = `${indent}click ${click.taskId}`;
    if (click.callback) {
      clickLine += ` call ${click.callback}`;
      if (click.callbackArgs) {
        clickLine += `(${click.callbackArgs})`;
      } else {
        clickLine += '()';
      }
    }
    if (click.href) {
      clickLine += ` href "${click.href}"`;
    }
    if (clickLine !== `${indent}click ${click.taskId}`) {
      lines.push(clickLine);
    }
  }

  return lines.join('\n');
}
