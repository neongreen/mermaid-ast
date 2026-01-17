/**
 * Gantt Chart Wrapper Class
 *
 * A unified API for building, mutating, and querying Gantt charts.
 * Provides a fluent interface that wraps the GanttAST.
 */

import { DiagramWrapper } from './diagram-wrapper.js';
import { parseGantt } from './parser/gantt-parser.js';
import { renderGantt } from './renderer/gantt-renderer.js';
import type {
  GanttAST,
  GanttSection,
  GanttTask,
  GanttTaskStatus,
  GanttWeekday,
  GanttWeekendStart,
} from './types/gantt.js';
import { createEmptyGanttAST } from './types/gantt.js';
import type { RenderOptions } from './types/render-options.js';

/**
 * Options for adding a task
 */
export interface AddTaskOptions {
  /** Task ID */
  id?: string;
  /** Task status (done, active, crit, milestone) */
  status?: GanttTaskStatus;
  /** Start date or dependency */
  start?: string;
  /** End date or duration */
  end?: string;
}

/**
 * Query options for finding tasks
 */
export interface FindTasksQuery {
  /** Find tasks in this section */
  section?: string;
  /** Find tasks with this status */
  status?: GanttTaskStatus;
  /** Find tasks whose name contains this string */
  nameContains?: string;
  /** Find tasks with this ID */
  id?: string;
}

/**
 * A fluent wrapper for GanttAST that supports building, mutating, and querying.
 */
export class Gantt extends DiagramWrapper<GanttAST> {
  private constructor(ast: GanttAST) {
    super(ast);
  }

  // ============================================
  // Static Factory Methods
  // ============================================

  /**
   * Create a new empty Gantt chart
   */
  static create(): Gantt {
    return new Gantt(createEmptyGanttAST());
  }

  /**
   * Create a Gantt wrapper from an existing AST
   */
  static from(ast: GanttAST): Gantt {
    return new Gantt(ast);
  }

  /**
   * Parse Mermaid syntax and create a Gantt wrapper
   */
  static parse(text: string): Gantt {
    const ast = parseGantt(text);
    return new Gantt(ast);
  }

  // ============================================
  // Core Methods
  // ============================================

  /**
   * Render to Mermaid syntax
   */
  render(options?: RenderOptions): string {
    return renderGantt(this.ast, options);
  }

  /**
   * Create a deep clone of this Gantt chart
   */
  clone(): Gantt {
    const cloned: GanttAST = {
      type: 'gantt',
      title: this.ast.title,
      dateFormat: this.ast.dateFormat,
      axisFormat: this.ast.axisFormat,
      tickInterval: this.ast.tickInterval,
      inclusiveEndDates: this.ast.inclusiveEndDates,
      topAxis: this.ast.topAxis,
      excludes: this.ast.excludes,
      includes: this.ast.includes,
      todayMarker: this.ast.todayMarker,
      weekday: this.ast.weekday,
      weekend: this.ast.weekend,
      sections: this.ast.sections.map((s) => ({
        ...s,
        tasks: s.tasks.map((t) => ({ ...t })),
      })),
      tasks: this.ast.tasks.map((t) => ({ ...t })),
      clickEvents: this.ast.clickEvents.map((c) => ({ ...c })),
      accTitle: this.ast.accTitle,
      accDescription: this.ast.accDescription,
    };
    return new Gantt(cloned);
  }

  // ============================================
  // Getters/Setters
  // ============================================

  get title(): string | undefined {
    return this.ast.title;
  }

  set title(value: string | undefined) {
    this.ast.title = value;
  }

  get dateFormat(): string | undefined {
    return this.ast.dateFormat;
  }

  set dateFormat(value: string | undefined) {
    this.ast.dateFormat = value;
  }

  get axisFormat(): string | undefined {
    return this.ast.axisFormat;
  }

  set axisFormat(value: string | undefined) {
    this.ast.axisFormat = value;
  }

  get sections(): GanttSection[] {
    return this.ast.sections;
  }

  get taskCount(): number {
    return this.ast.tasks.length + this.ast.sections.reduce((sum, s) => sum + s.tasks.length, 0);
  }

  get sectionCount(): number {
    return this.ast.sections.length;
  }

  // ============================================
  // Configuration Methods
  // ============================================

  /**
   * Set the title
   */
  setTitle(title: string): this {
    this.ast.title = title;
    return this;
  }

  /**
   * Set the date format
   */
  setDateFormat(format: string): this {
    this.ast.dateFormat = format;
    return this;
  }

  /**
   * Set the axis format
   */
  setAxisFormat(format: string): this {
    this.ast.axisFormat = format;
    return this;
  }

  /**
   * Set the tick interval
   */
  setTickInterval(interval: string): this {
    this.ast.tickInterval = interval;
    return this;
  }

  /**
   * Enable inclusive end dates
   */
  enableInclusiveEndDates(): this {
    this.ast.inclusiveEndDates = true;
    return this;
  }

  /**
   * Disable inclusive end dates
   */
  disableInclusiveEndDates(): this {
    this.ast.inclusiveEndDates = false;
    return this;
  }

  /**
   * Enable top axis
   */
  enableTopAxis(): this {
    this.ast.topAxis = true;
    return this;
  }

  /**
   * Set excludes
   */
  setExcludes(excludes: string): this {
    this.ast.excludes = excludes;
    return this;
  }

  /**
   * Set includes
   */
  setIncludes(includes: string): this {
    this.ast.includes = includes;
    return this;
  }

  /**
   * Set today marker format
   */
  setTodayMarker(marker: string): this {
    this.ast.todayMarker = marker;
    return this;
  }

  /**
   * Set the first day of the week
   */
  setWeekday(day: GanttWeekday): this {
    this.ast.weekday = day;
    return this;
  }

  /**
   * Set the weekend start day
   */
  setWeekend(day: GanttWeekendStart): this {
    this.ast.weekend = day;
    return this;
  }

  // ============================================
  // Section Operations
  // ============================================

  /**
   * Add a section
   */
  addSection(name: string): this {
    this.ast.sections.push({
      name,
      tasks: [],
    });
    return this;
  }

  /**
   * Get a section by name
   */
  getSection(name: string): GanttSection | undefined {
    return this.ast.sections.find((s) => s.name === name);
  }

  /**
   * Remove a section
   */
  removeSection(name: string): this {
    const idx = this.ast.sections.findIndex((s) => s.name === name);
    if (idx !== -1) {
      this.ast.sections.splice(idx, 1);
    }
    return this;
  }

  /**
   * Rename a section
   */
  renameSection(oldName: string, newName: string): this {
    const section = this.ast.sections.find((s) => s.name === oldName);
    if (section) {
      section.name = newName;
      // Update task section references
      for (const task of section.tasks) {
        task.section = newName;
      }
    }
    return this;
  }

  // ============================================
  // Task Operations
  // ============================================

  /**
   * Add a task to a section (or to the root if no section specified)
   */
  addTask(name: string, sectionName?: string, options?: AddTaskOptions): this {
    const task: GanttTask = {
      name,
      section: sectionName,
      ...options,
    };

    if (sectionName) {
      let section = this.ast.sections.find((s) => s.name === sectionName);
      if (!section) {
        section = { name: sectionName, tasks: [] };
        this.ast.sections.push(section);
      }
      section.tasks.push(task);
    } else {
      this.ast.tasks.push(task);
    }

    return this;
  }

  /**
   * Get a task by ID
   */
  getTask(id: string): GanttTask | undefined {
    // Search in root tasks
    const rootTask = this.ast.tasks.find((t) => t.id === id);
    if (rootTask) return rootTask;

    // Search in sections
    for (const section of this.ast.sections) {
      const task = section.tasks.find((t) => t.id === id);
      if (task) return task;
    }

    return undefined;
  }

  /**
   * Remove a task by ID
   */
  removeTask(id: string): this {
    // Remove from root tasks
    const rootIdx = this.ast.tasks.findIndex((t) => t.id === id);
    if (rootIdx !== -1) {
      this.ast.tasks.splice(rootIdx, 1);
      return this;
    }

    // Remove from sections
    for (const section of this.ast.sections) {
      const idx = section.tasks.findIndex((t) => t.id === id);
      if (idx !== -1) {
        section.tasks.splice(idx, 1);
        return this;
      }
    }

    return this;
  }

  /**
   * Set task status
   */
  setTaskStatus(id: string, status: GanttTaskStatus): this {
    const task = this.getTask(id);
    if (task) {
      task.status = status;
    }
    return this;
  }

  /**
   * Set task as a milestone
   */
  setMilestone(id: string): this {
    return this.setTaskStatus(id, 'milestone');
  }

  /**
   * Set task as critical
   */
  setCritical(id: string): this {
    return this.setTaskStatus(id, 'crit');
  }

  /**
   * Set task as done
   */
  setDone(id: string): this {
    return this.setTaskStatus(id, 'done');
  }

  /**
   * Set task as active
   */
  setActive(id: string): this {
    return this.setTaskStatus(id, 'active');
  }

  /**
   * Move a task to a different section
   */
  moveTask(id: string, toSection: string): this {
    // Find and remove the task
    let task: GanttTask | undefined;

    const rootIdx = this.ast.tasks.findIndex((t) => t.id === id);
    if (rootIdx !== -1) {
      task = this.ast.tasks.splice(rootIdx, 1)[0];
    } else {
      for (const section of this.ast.sections) {
        const idx = section.tasks.findIndex((t) => t.id === id);
        if (idx !== -1) {
          task = section.tasks.splice(idx, 1)[0];
          break;
        }
      }
    }

    if (task) {
      task.section = toSection;
      let section = this.ast.sections.find((s) => s.name === toSection);
      if (!section) {
        section = { name: toSection, tasks: [] };
        this.ast.sections.push(section);
      }
      section.tasks.push(task);
    }

    return this;
  }

  // ============================================
  // Click Event Operations
  // ============================================

  /**
   * Set a click callback for a task
   */
  setClickCallback(taskId: string, callback: string, args?: string): this {
    const existing = this.ast.clickEvents.find((c) => c.taskId === taskId);
    if (existing) {
      existing.callback = callback;
      existing.callbackArgs = args;
    } else {
      this.ast.clickEvents.push({
        taskId,
        callback,
        callbackArgs: args,
      });
    }
    return this;
  }

  /**
   * Set a link for a task
   */
  setLink(taskId: string, href: string): this {
    const existing = this.ast.clickEvents.find((c) => c.taskId === taskId);
    if (existing) {
      existing.href = href;
    } else {
      this.ast.clickEvents.push({
        taskId,
        href,
      });
    }
    return this;
  }

  // ============================================
  // Query Operations
  // ============================================

  /**
   * Get all tasks (from all sections and root)
   */
  getAllTasks(): GanttTask[] {
    const tasks = [...this.ast.tasks];
    for (const section of this.ast.sections) {
      tasks.push(...section.tasks);
    }
    return tasks;
  }

  /**
   * Find tasks matching a query
   */
  findTasks(query: FindTasksQuery): GanttTask[] {
    const allTasks = this.getAllTasks();

    return allTasks.filter((task) => {
      if (query.section && task.section !== query.section) {
        return false;
      }
      if (query.status && task.status !== query.status) {
        return false;
      }
      if (query.nameContains && !task.name.includes(query.nameContains)) {
        return false;
      }
      if (query.id && task.id !== query.id) {
        return false;
      }
      return true;
    });
  }

  /**
   * Get tasks in a section
   */
  getTasksInSection(sectionName: string): GanttTask[] {
    const section = this.ast.sections.find((s) => s.name === sectionName);
    return section ? section.tasks : [];
  }

  /**
   * Get critical tasks
   */
  getCriticalTasks(): GanttTask[] {
    return this.findTasks({ status: 'crit' });
  }

  /**
   * Get milestones
   */
  getMilestones(): GanttTask[] {
    return this.findTasks({ status: 'milestone' });
  }
}
