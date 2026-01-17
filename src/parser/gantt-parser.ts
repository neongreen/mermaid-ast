/**
 * Gantt Chart Parser
 *
 * Parses Mermaid Gantt chart syntax into an AST using the vendored JISON parser.
 */

import type {
  GanttAST,
  GanttSection,
  GanttTask,
  GanttWeekday,
  GanttWeekendStart,
} from '../types/gantt.js';
import { createEmptyGanttAST } from '../types/gantt.js';

// @ts-expect-error - JISON parser has no types
import ganttParser from '../vendored/parsers/gantt.js';

/**
 * Parse task data string into task properties
 */
function parseTaskData(taskData: string): Partial<GanttTask> {
  const result: Partial<GanttTask> = {};

  // Remove leading colon if present
  const data = taskData.startsWith(':') ? taskData.slice(1).trim() : taskData.trim();

  // Split by comma
  const parts = data.split(',').map((p) => p.trim());

  for (const part of parts) {
    if (part === 'done') {
      result.status = 'done';
    } else if (part === 'active') {
      result.status = 'active';
    } else if (part === 'crit') {
      result.status = 'crit';
    } else if (part === 'milestone') {
      result.status = 'milestone';
    } else if (part.startsWith('after ')) {
      result.start = part;
    } else if (/^\d{4}-\d{2}-\d{2}/.test(part)) {
      // Date format
      if (!result.start) {
        result.start = part;
      } else {
        result.end = part;
      }
    } else if (/^\d+[dwmyhms]$/.test(part)) {
      // Duration format (e.g., 5d, 2w)
      result.end = part;
    } else if (part && !result.id) {
      // Assume it's an ID if it doesn't match other patterns
      result.id = part;
    }
  }

  return result;
}

/**
 * Create the yy object that the JISON parser uses to build the AST
 */
function createGanttYY(ast: GanttAST) {
  let currentSection: GanttSection | null = null;

  return {
    setDateFormat(format: string): void {
      ast.dateFormat = format.trim();
    },

    setAxisFormat(format: string): void {
      ast.axisFormat = format.trim();
    },

    setTickInterval(interval: string): void {
      ast.tickInterval = interval.trim();
    },

    enableInclusiveEndDates(): void {
      ast.inclusiveEndDates = true;
    },

    TopAxis(): void {
      ast.topAxis = true;
    },

    setExcludes(excludes: string): void {
      ast.excludes = excludes.trim();
    },

    setIncludes(includes: string): void {
      ast.includes = includes.trim();
    },

    setTodayMarker(marker: string): void {
      ast.todayMarker = marker.trim();
    },

    setWeekday(day: string): void {
      ast.weekday = day as GanttWeekday;
    },

    setWeekend(day: string): void {
      ast.weekend = day as GanttWeekendStart;
    },

    setDiagramTitle(title: string): void {
      ast.title = title.trim();
    },

    setAccTitle(title: string): void {
      ast.accTitle = title.trim();
    },

    setAccDescription(description: string): void {
      ast.accDescription = description.trim();
    },

    addSection(name: string): void {
      currentSection = {
        name: name.trim(),
        tasks: [],
      };
      ast.sections.push(currentSection);
    },

    addTask(taskName: string, taskData: string): void {
      const parsed = parseTaskData(taskData);
      const task: GanttTask = {
        name: taskName.trim(),
        ...parsed,
        rawData: taskData,
      };

      if (currentSection) {
        task.section = currentSection.name;
        currentSection.tasks.push(task);
      } else {
        ast.tasks.push(task);
      }
    },

    setClickEvent(taskId: string, callback: string | null, args: string | null): void {
      const existing = ast.clickEvents.find((e) => e.taskId === taskId);
      if (existing) {
        if (callback) existing.callback = callback;
        if (args) existing.callbackArgs = args;
      } else {
        ast.clickEvents.push({
          taskId,
          callback: callback || undefined,
          callbackArgs: args || undefined,
        });
      }
    },

    setLink(taskId: string, href: string): void {
      const existing = ast.clickEvents.find((e) => e.taskId === taskId);
      if (existing) {
        existing.href = href;
      } else {
        ast.clickEvents.push({
          taskId,
          href,
        });
      }
    },

    // Required by parser but not used
    clear(): void {},
    getAxisFormat(): string {
      return '';
    },
    getDateFormat(): string {
      return '';
    },
    getTasks(): GanttTask[] {
      return [];
    },
    getSections(): GanttSection[] {
      return [];
    },
  };
}

/**
 * Parse Gantt chart syntax into an AST
 * @param input - Mermaid Gantt chart syntax
 * @returns The parsed AST
 */
export function parseGantt(input: string): GanttAST {
  const ast = createEmptyGanttAST();

  // Normalize input - ensure it starts with gantt
  let normalizedInput = input.trim();
  if (!normalizedInput.toLowerCase().startsWith('gantt')) {
    normalizedInput = `gantt\n${normalizedInput}`;
  }

  // Set up the yy object
  ganttParser.yy = createGanttYY(ast);

  // Parse the input
  ganttParser.parse(normalizedInput);

  return ast;
}

/**
 * Check if input is a Gantt chart
 */
export function isGanttDiagram(input: string): boolean {
  const trimmed = input.trim();
  const firstLine = trimmed.split('\n')[0].trim().toLowerCase();
  return firstLine.startsWith('gantt');
}
