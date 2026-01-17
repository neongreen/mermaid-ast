/**
 * Timeline Diagram Wrapper Class
 *
 * A unified API for building, mutating, and querying timeline diagrams.
 * Provides a fluent interface that wraps the TimelineAST.
 */

import { DiagramWrapper } from './diagram-wrapper.js';
import { parseTimeline } from './parser/timeline-parser.js';
import { renderTimeline } from './renderer/timeline-renderer.js';
import type { RenderOptions } from './types/render-options.js';
import type {
  TimelineAST,
  TimelineEvent,
  TimelinePeriod,
  TimelineSection,
} from './types/timeline.js';
import { createEmptyTimelineAST } from './types/timeline.js';

/**
 * Query options for finding periods
 */
export interface FindTimelinePeriodsQuery {
  /** Find periods in this section */
  section?: string;
  /** Find periods whose name contains this string */
  nameContains?: string;
  /** Find periods with events */
  hasEvents?: boolean;
}

/**
 * Query options for finding events
 */
export interface FindTimelineEventsQuery {
  /** Find events in this section */
  section?: string;
  /** Find events in this period */
  period?: string;
  /** Find events whose text contains this string */
  textContains?: string;
}

/**
 * A fluent wrapper for TimelineAST that supports building, mutating, and querying.
 */
export class Timeline extends DiagramWrapper<TimelineAST> {
  private constructor(ast: TimelineAST) {
    super(ast);
  }

  // ============================================
  // Static Factory Methods
  // ============================================

  /**
   * Create a new empty timeline diagram
   */
  static create(title?: string): Timeline {
    const ast = createEmptyTimelineAST();
    if (title) {
      ast.title = title;
    }
    return new Timeline(ast);
  }

  /**
   * Create a Timeline wrapper from an existing AST
   */
  static from(ast: TimelineAST): Timeline {
    return new Timeline(ast);
  }

  /**
   * Parse Mermaid syntax and create a Timeline wrapper
   */
  static parse(text: string): Timeline {
    const ast = parseTimeline(text);
    return new Timeline(ast);
  }

  // ============================================
  // Core Methods
  // ============================================

  /**
   * Render to Mermaid syntax
   */
  render(options?: RenderOptions): string {
    return renderTimeline(this.ast, options);
  }

  /**
   * Create a deep clone of this timeline
   */
  clone(): Timeline {
    const cloned: TimelineAST = {
      type: 'timeline',
      title: this.ast.title,
      sections: this.ast.sections.map((section) => ({
        ...section,
        periods: section.periods.map((period) => ({
          ...period,
          events: period.events.map((event) => ({ ...event })),
        })),
      })),
      accTitle: this.ast.accTitle,
      accDescription: this.ast.accDescription,
    };
    return new Timeline(cloned);
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
  get sections(): TimelineSection[] {
    return this.ast.sections;
  }

  /**
   * Get section count
   */
  get sectionCount(): number {
    return this.ast.sections.length;
  }

  /**
   * Get total period count
   */
  get periodCount(): number {
    return this.ast.sections.reduce((sum, s) => sum + s.periods.length, 0);
  }

  /**
   * Get total event count
   */
  get eventCount(): number {
    return this.ast.sections.reduce(
      (sum, s) => sum + s.periods.reduce((pSum, p) => pSum + p.events.length, 0),
      0
    );
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
      periods: [],
    });
    return this;
  }

  /**
   * Get a section by name
   */
  getSection(name: string): TimelineSection | undefined {
    return this.ast.sections.find((s) => s.name === name);
  }

  /**
   * Remove a section and all its periods/events
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
  // Period Operations
  // ============================================

  /**
   * Add a period to a section
   */
  addPeriod(sectionName: string, periodName: string): this {
    let section = this.getSection(sectionName);

    // Create section if it doesn't exist
    if (!section) {
      this.addSection(sectionName);
      section = this.getSection(sectionName)!;
    }

    section.periods.push({
      name: periodName,
      events: [],
    });

    return this;
  }

  /**
   * Get a period by name (searches all sections)
   */
  getPeriod(periodName: string): TimelinePeriod | undefined {
    for (const section of this.ast.sections) {
      const period = section.periods.find((p) => p.name === periodName);
      if (period) return period;
    }
    return undefined;
  }

  /**
   * Remove a period
   */
  removePeriod(periodName: string): this {
    for (const section of this.ast.sections) {
      const idx = section.periods.findIndex((p) => p.name === periodName);
      if (idx !== -1) {
        section.periods.splice(idx, 1);
        break;
      }
    }
    return this;
  }

  /**
   * Rename a period
   */
  renamePeriod(oldName: string, newName: string): this {
    const period = this.getPeriod(oldName);
    if (period) {
      period.name = newName;
    }
    return this;
  }

  // ============================================
  // Event Operations
  // ============================================

  /**
   * Add an event to a period
   */
  addEvent(periodName: string, eventText: string): this {
    const period = this.getPeriod(periodName);
    if (period) {
      period.events.push({ text: eventText });
    }
    return this;
  }

  /**
   * Add an event to a period, creating the period if needed
   */
  addEventWithPeriod(sectionName: string, periodName: string, eventText: string): this {
    let period = this.getPeriod(periodName);

    if (!period) {
      this.addPeriod(sectionName, periodName);
      period = this.getPeriod(periodName)!;
    }

    period.events.push({ text: eventText });
    return this;
  }

  /**
   * Remove an event from a period
   */
  removeEvent(periodName: string, eventText: string): this {
    const period = this.getPeriod(periodName);
    if (period) {
      const idx = period.events.findIndex((e) => e.text === eventText);
      if (idx !== -1) {
        period.events.splice(idx, 1);
      }
    }
    return this;
  }

  /**
   * Update event text
   */
  updateEvent(periodName: string, oldText: string, newText: string): this {
    const period = this.getPeriod(periodName);
    if (period) {
      const event = period.events.find((e) => e.text === oldText);
      if (event) {
        event.text = newText;
      }
    }
    return this;
  }

  // ============================================
  // Query Operations
  // ============================================

  /**
   * Get all periods
   */
  getAllPeriods(): TimelinePeriod[] {
    return this.ast.sections.flatMap((s) => s.periods);
  }

  /**
   * Get all events
   */
  getAllEvents(): TimelineEvent[] {
    return this.ast.sections.flatMap((s) => s.periods.flatMap((p) => p.events));
  }

  /**
   * Find periods matching a query
   */
  findPeriods(query: FindTimelinePeriodsQuery): TimelinePeriod[] {
    let periods = this.getAllPeriods();

    if (query.section) {
      const section = this.getSection(query.section);
      periods = section ? section.periods : [];
    }

    return periods.filter((period) => {
      if (query.nameContains && !period.name.includes(query.nameContains)) return false;
      if (query.hasEvents !== undefined) {
        const hasEvents = period.events.length > 0;
        if (query.hasEvents !== hasEvents) return false;
      }
      return true;
    });
  }

  /**
   * Find events matching a query
   */
  findEvents(query: FindTimelineEventsQuery): TimelineEvent[] {
    let events: TimelineEvent[] = [];

    if (query.section) {
      const section = this.getSection(query.section);
      if (section) {
        if (query.period) {
          const period = section.periods.find((p) => p.name === query.period);
          events = period ? period.events : [];
        } else {
          events = section.periods.flatMap((p) => p.events);
        }
      }
    } else if (query.period) {
      const period = this.getPeriod(query.period);
      events = period ? period.events : [];
    } else {
      events = this.getAllEvents();
    }

    if (query.textContains) {
      events = events.filter((e) => e.text.includes(query.textContains!));
    }

    return events;
  }

  /**
   * Get events for a specific period
   */
  getEventsForPeriod(periodName: string): TimelineEvent[] {
    const period = this.getPeriod(periodName);
    return period ? period.events : [];
  }

  /**
   * Get the section containing a period
   */
  getSectionForPeriod(periodName: string): TimelineSection | undefined {
    for (const section of this.ast.sections) {
      if (section.periods.some((p) => p.name === periodName)) {
        return section;
      }
    }
    return undefined;
  }
}
