/**
 * Journey Diagram Parser
 *
 * Parses Mermaid journey diagram syntax into an AST using the vendored JISON parser.
 */

import type { JourneyAST, JourneySection, JourneyTask } from '../types/journey.js';
import { createEmptyJourneyAST } from '../types/journey.js';

// @ts-expect-error - JISON parser has no types
import journeyParser from '../vendored/parsers/journey.js';

/**
 * Parse task data string into score and actors
 * Format: ": score: actor1, actor2" or ": score"
 */
function parseTaskData(taskData: string): { score: number; actors: string[] } {
  // taskData comes in format ": 5: Me, You" or ": 5"
  const trimmed = taskData.replace(/^:\s*/, '').trim();
  const parts = trimmed.split(':');

  const score = Number.parseInt(parts[0].trim(), 10) || 5;
  const actors: string[] = [];

  if (parts.length > 1) {
    const actorPart = parts.slice(1).join(':').trim();
    if (actorPart) {
      actors.push(
        ...actorPart
          .split(',')
          .map((a) => a.trim())
          .filter((a) => a)
      );
    }
  }

  return { score, actors };
}

/**
 * Create the yy object that the JISON parser uses to build the AST
 */
function createJourneyYY(ast: JourneyAST) {
  let currentSection: JourneySection | null = null;

  return {
    setDiagramTitle(title: string): void {
      ast.title = title;
    },

    addSection(name: string): void {
      currentSection = {
        name,
        tasks: [],
      };
      ast.sections.push(currentSection);
    },

    addTask(taskName: string, taskData: string): void {
      const { score, actors } = parseTaskData(taskData);

      const task: JourneyTask = {
        name: taskName.trim(),
        score,
        actors,
      };

      // If no section exists, create a default one
      if (!currentSection) {
        currentSection = {
          name: '',
          tasks: [],
        };
        ast.sections.push(currentSection);
      }

      currentSection.tasks.push(task);
    },

    setAccTitle(title: string): void {
      ast.accTitle = title;
    },

    setAccDescription(description: string): void {
      ast.accDescription = description;
    },

    // Required by parser but not used for our purposes
    clear(): void {},
    getTitle(): string {
      return ast.title ?? '';
    },
    getSections(): JourneySection[] {
      return ast.sections;
    },
    getTasks(): JourneyTask[] {
      return ast.sections.flatMap((s) => s.tasks);
    },
  };
}

/**
 * Parse journey diagram syntax into an AST
 * @param input - Mermaid journey diagram syntax
 * @returns The parsed AST
 */
export function parseJourney(input: string): JourneyAST {
  const ast = createEmptyJourneyAST();

  // Normalize input - ensure it starts with journey
  let normalizedInput = input.trim();
  if (!normalizedInput.toLowerCase().startsWith('journey')) {
    normalizedInput = `journey\n${normalizedInput}`;
  }

  // Set up the yy object
  journeyParser.yy = createJourneyYY(ast);

  // Parse the input
  journeyParser.parse(normalizedInput);

  return ast;
}

/**
 * Check if input is a journey diagram
 */
export function isJourneyDiagram(input: string): boolean {
  const trimmed = input.trim();
  const firstLine = trimmed.split('\n')[0].trim().toLowerCase();
  return firstLine.startsWith('journey');
}
