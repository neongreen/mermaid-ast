/**
 * Timeline Diagram AST Types
 *
 * Represents timeline diagrams with periods, events, and sections.
 */

/**
 * An event in the timeline
 */
export interface TimelineEvent {
  /** Event description */
  text: string;
}

/**
 * A period in the timeline (e.g., "2023", "Q1")
 */
export interface TimelinePeriod {
  /** Period name/label */
  name: string;
  /** Events in this period */
  events: TimelineEvent[];
}

/**
 * A section in the timeline
 */
export interface TimelineSection {
  /** Section name */
  name: string;
  /** Periods in this section */
  periods: TimelinePeriod[];
}

/**
 * The complete Timeline Diagram AST
 */
export interface TimelineAST {
  type: 'timeline';
  /** Diagram title */
  title?: string;
  /** Sections (if using sections) */
  sections: TimelineSection[];
  /** Accessibility title */
  accTitle?: string;
  /** Accessibility description */
  accDescription?: string;
}

/**
 * Create an empty Timeline AST
 */
export function createEmptyTimelineAST(): TimelineAST {
  return {
    type: 'timeline',
    sections: [],
  };
}
