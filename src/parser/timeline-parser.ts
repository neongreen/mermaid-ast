/**
 * Timeline Diagram Parser
 *
 * Parses Mermaid timeline diagram syntax into an AST using the vendored JISON parser.
 */

import type { TimelineAST, TimelinePeriod, TimelineSection } from '../types/timeline.js';
import { createEmptyTimelineAST } from '../types/timeline.js';

// @ts-expect-error - JISON parser has no types
import timelineParser from '../vendored/parsers/timeline.js';

/**
 * Create the yy object that the JISON parser uses to build the AST
 */
function createTimelineYY(ast: TimelineAST) {
  let currentSection: TimelineSection | null = null;
  let currentPeriod: TimelinePeriod | null = null;

  // Ensure there's a default section
  function ensureSection(): TimelineSection {
    if (!currentSection) {
      currentSection = {
        name: '',
        periods: [],
      };
      ast.sections.push(currentSection);
    }
    return currentSection;
  }

  // Ensure there's a current period
  function ensurePeriod(): TimelinePeriod {
    const section = ensureSection();
    if (!currentPeriod) {
      currentPeriod = {
        name: '',
        events: [],
      };
      section.periods.push(currentPeriod);
    }
    return currentPeriod;
  }

  return {
    // CommonDb interface that timeline parser expects
    getCommonDb() {
      return {
        setDiagramTitle(title: string): void {
          ast.title = title;
        },
        setAccTitle(title: string): void {
          ast.accTitle = title;
        },
        setAccDescription(description: string): void {
          ast.accDescription = description;
        },
      };
    },

    addSection(name: string): void {
      currentSection = {
        name,
        periods: [],
      };
      ast.sections.push(currentSection);
      currentPeriod = null; // Reset current period when new section starts
    },

    // addTask is used for periods in timeline
    addTask(period: string, _arg1: number, _arg2: string): void {
      const section = ensureSection();
      currentPeriod = {
        name: period.trim(),
        events: [],
      };
      section.periods.push(currentPeriod);
    },

    addEvent(eventText: string): void {
      const period = ensurePeriod();
      period.events.push({
        text: eventText.trim(),
      });
    },

    // Required by parser but not used for our purposes
    clear(): void {},
  };
}

/**
 * Parse timeline diagram syntax into an AST
 * @param input - Mermaid timeline diagram syntax
 * @returns The parsed AST
 */
export function parseTimeline(input: string): TimelineAST {
  const ast = createEmptyTimelineAST();

  // Normalize input - ensure it starts with timeline
  let normalizedInput = input.trim();
  if (!normalizedInput.toLowerCase().startsWith('timeline')) {
    normalizedInput = `timeline\n${normalizedInput}`;
  }

  // Set up the yy object
  timelineParser.yy = createTimelineYY(ast);

  // Parse the input
  timelineParser.parse(normalizedInput);

  return ast;
}

/**
 * Check if input is a timeline diagram
 */
export function isTimelineDiagram(input: string): boolean {
  const trimmed = input.trim();
  const firstLine = trimmed.split('\n')[0].trim().toLowerCase();
  return firstLine.startsWith('timeline');
}
