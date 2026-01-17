/**
 * Journey Diagram Wrapper Class
 *
 * A unified API for building, mutating, and querying journey diagrams.
 * Provides a fluent interface that wraps the JourneyAST.
 */

import { DiagramWrapper } from './diagram-wrapper.js';
import { parseJourney } from './parser/journey-parser.js';
import { renderJourney } from './renderer/journey-renderer.js';
import type { JourneyAST, JourneySection, JourneyTask } from './types/journey.js';
import { createEmptyJourneyAST } from './types/journey.js';
import type { RenderOptions } from './types/render-options.js';

/**
 * Options for adding a task
 */
export interface AddJourneyTaskOptions {
  /** Score (1-5, default: 5) */
  score?: number;
  /** Actors involved */
  actors?: string[];
}

/**
 * Query options for finding tasks
 */
export interface FindJourneyTasksQuery {
  /** Find tasks in this section */
  section?: string;
  /** Find tasks with this score */
  score?: number;
  /** Find tasks with score >= this value */
  minScore?: number;
  /** Find tasks with score <= this value */
  maxScore?: number;
  /** Find tasks involving this actor */
  actor?: string;
  /** Find tasks whose name contains this string */
  nameContains?: string;
}

/**
 * A fluent wrapper for JourneyAST that supports building, mutating, and querying.
 */
export class Journey extends DiagramWrapper<JourneyAST> {
  private constructor(ast: JourneyAST) {
    super(ast);
  }

  // ============================================
  // Static Factory Methods
  // ============================================

  /**
   * Create a new empty journey diagram
   */
  static create(title?: string): Journey {
    const ast = createEmptyJourneyAST();
    if (title) {
      ast.title = title;
    }
    return new Journey(ast);
  }

  /**
   * Create a Journey wrapper from an existing AST
   */
  static from(ast: JourneyAST): Journey {
    return new Journey(ast);
  }

  /**
   * Parse Mermaid syntax and create a Journey wrapper
   */
  static parse(text: string): Journey {
    const ast = parseJourney(text);
    return new Journey(ast);
  }

  // ============================================
  // Core Methods
  // ============================================

  /**
   * Render to Mermaid syntax
   */
  render(options?: RenderOptions): string {
    return renderJourney(this.ast, options);
  }

  /**
   * Create a deep clone of this journey
   */
  clone(): Journey {
    const cloned: JourneyAST = {
      type: 'journey',
      title: this.ast.title,
      sections: this.ast.sections.map((section) => ({
        ...section,
        tasks: section.tasks.map((task) => ({
          ...task,
          actors: [...task.actors],
        })),
      })),
      accTitle: this.ast.accTitle,
      accDescription: this.ast.accDescription,
    };
    return new Journey(cloned);
  }

  // ============================================
  // Getters
  // ============================================

  /**
   * Get the diagram title
   */
  get title(): string | undefined {
    return this.ast.title;
  }

  /**
   * Get all sections
   */
  get sections(): JourneySection[] {
    return this.ast.sections;
  }

  /**
   * Get section count
   */
  get sectionCount(): number {
    return this.ast.sections.length;
  }

  /**
   * Get total task count
   */
  get taskCount(): number {
    return this.ast.sections.reduce((sum, s) => sum + s.tasks.length, 0);
  }

  /**
   * Get all unique actors
   */
  get actors(): string[] {
    const actorSet = new Set<string>();
    for (const section of this.ast.sections) {
      for (const task of section.tasks) {
        for (const actor of task.actors) {
          actorSet.add(actor);
        }
      }
    }
    return Array.from(actorSet);
  }

  // ============================================
  // Title Operations
  // ============================================

  /**
   * Set the diagram title
   */
  setTitle(title: string): this {
    this.ast.title = title;
    return this;
  }

  // ============================================
  // Section Operations
  // ============================================

  /**
   * Add a new section
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
  getSection(name: string): JourneySection | undefined {
    return this.ast.sections.find((s) => s.name === name);
  }

  /**
   * Remove a section and all its tasks
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
    const section = this.getSection(oldName);
    if (section) {
      section.name = newName;
    }
    return this;
  }

  // ============================================
  // Task Operations
  // ============================================

  /**
   * Add a task to a section
   */
  addTask(sectionName: string, taskName: string, options?: AddJourneyTaskOptions): this {
    let section = this.getSection(sectionName);

    // Create section if it doesn't exist
    if (!section) {
      this.addSection(sectionName);
      section = this.getSection(sectionName)!;
    }

    section.tasks.push({
      name: taskName,
      score: options?.score ?? 5,
      actors: options?.actors ?? [],
    });

    return this;
  }

  /**
   * Remove a task from a section
   */
  removeTask(sectionName: string, taskName: string): this {
    const section = this.getSection(sectionName);
    if (section) {
      const idx = section.tasks.findIndex((t) => t.name === taskName);
      if (idx !== -1) {
        section.tasks.splice(idx, 1);
      }
    }
    return this;
  }

  /**
   * Get a task by name
   */
  getTask(taskName: string): JourneyTask | undefined {
    for (const section of this.ast.sections) {
      const task = section.tasks.find((t) => t.name === taskName);
      if (task) return task;
    }
    return undefined;
  }

  /**
   * Set task score
   */
  setScore(taskName: string, score: number): this {
    const task = this.getTask(taskName);
    if (task) {
      task.score = Math.max(1, Math.min(5, score)); // Clamp to 1-5
    }
    return this;
  }

  /**
   * Add an actor to a task
   */
  addActor(taskName: string, actor: string): this {
    const task = this.getTask(taskName);
    if (task && !task.actors.includes(actor)) {
      task.actors.push(actor);
    }
    return this;
  }

  /**
   * Remove an actor from a task
   */
  removeActor(taskName: string, actor: string): this {
    const task = this.getTask(taskName);
    if (task) {
      const idx = task.actors.indexOf(actor);
      if (idx !== -1) {
        task.actors.splice(idx, 1);
      }
    }
    return this;
  }

  /**
   * Move a task to a different section
   */
  moveTask(taskName: string, toSection: string): this {
    // Find and remove from current section
    let task: JourneyTask | undefined;
    for (const section of this.ast.sections) {
      const idx = section.tasks.findIndex((t) => t.name === taskName);
      if (idx !== -1) {
        task = section.tasks.splice(idx, 1)[0];
        break;
      }
    }

    // Add to target section
    if (task) {
      let targetSection = this.getSection(toSection);
      if (!targetSection) {
        this.addSection(toSection);
        targetSection = this.getSection(toSection)!;
      }
      targetSection.tasks.push(task);
    }

    return this;
  }

  // ============================================
  // Query Operations
  // ============================================

  /**
   * Get all tasks
   */
  getAllTasks(): JourneyTask[] {
    return this.ast.sections.flatMap((s) => s.tasks);
  }

  /**
   * Find tasks matching a query
   */
  findTasks(query: FindJourneyTasksQuery): JourneyTask[] {
    let tasks = this.getAllTasks();

    if (query.section) {
      const section = this.getSection(query.section);
      tasks = section ? section.tasks : [];
    }

    return tasks.filter((task) => {
      if (query.score !== undefined && task.score !== query.score) return false;
      if (query.minScore !== undefined && task.score < query.minScore) return false;
      if (query.maxScore !== undefined && task.score > query.maxScore) return false;
      if (query.actor && !task.actors.includes(query.actor)) return false;
      if (query.nameContains && !task.name.includes(query.nameContains)) return false;
      return true;
    });
  }

  /**
   * Get tasks with low scores (pain points)
   */
  getPainPoints(maxScore = 2): JourneyTask[] {
    return this.findTasks({ maxScore });
  }

  /**
   * Get tasks with high scores (highlights)
   */
  getHighlights(minScore = 4): JourneyTask[] {
    return this.findTasks({ minScore });
  }

  /**
   * Get average score across all tasks
   */
  getAverageScore(): number {
    const tasks = this.getAllTasks();
    if (tasks.length === 0) return 0;
    const sum = tasks.reduce((acc, t) => acc + t.score, 0);
    return sum / tasks.length;
  }

  /**
   * Get tasks for a specific actor
   */
  getTasksForActor(actor: string): JourneyTask[] {
    return this.findTasks({ actor });
  }
}
