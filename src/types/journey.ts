/**
 * Journey Diagram AST Types
 *
 * Represents user journey diagrams with actors, tasks, and sections.
 */

/**
 * A task in the journey
 */
export interface JourneyTask {
  /** Task name/description */
  name: string;
  /** Score (1-5, higher is better) */
  score: number;
  /** Actors involved in this task */
  actors: string[];
}

/**
 * A section in the journey
 */
export interface JourneySection {
  /** Section name */
  name: string;
  /** Tasks in this section */
  tasks: JourneyTask[];
}

/**
 * The complete Journey Diagram AST
 */
export interface JourneyAST {
  type: 'journey';
  /** Diagram title */
  title?: string;
  /** Sections containing tasks */
  sections: JourneySection[];
  /** Accessibility title */
  accTitle?: string;
  /** Accessibility description */
  accDescription?: string;
}

/**
 * Create an empty Journey AST
 */
export function createEmptyJourneyAST(): JourneyAST {
  return {
    type: 'journey',
    sections: [],
  };
}
