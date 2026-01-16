/**
 * State Diagram Parser
 *
 * Parses Mermaid state diagram syntax into an AST using the vendored JISON parser.
 * The JISON parser calls methods on a `yy` object - we provide our own implementation
 * that builds an AST instead of mermaid's internal db structure.
 */

import {
  createEmptyStateDiagramAST,
  type StateDefinition,
  type StateDiagramAST,
  type StateDirection,
  type StateNote,
  type StateTransition,
  type StateType,
} from '../types/state.js';

// Import the vendored parser
// @ts-expect-error - Generated JS file without types
import stateParser from '../vendored/parsers/state.js';

/**
 * Process the document produced by the JISON parser into our AST
 */
function processDocument(
  doc: unknown[],
  ast: StateDiagramAST,
  parentStates?: Map<string, StateDefinition>
): void {
  const states = parentStates || ast.states;

  for (const item of doc) {
    if (!item || item === 'nl') continue;

    if (typeof item === 'object' && item !== null) {
      const stmt = item as Record<string, unknown>;

      if (stmt.stmt === 'state') {
        // State definition
        const id = String(stmt.id || '').trim();
        if (!id) continue;

        const stateType = (stmt.type as StateType) || 'default';
        const description = stmt.description as string | string[] | undefined;
        const note = stmt.note as StateNote | undefined;
        const classes = stmt.classes as string[] | undefined;
        const nestedDoc = stmt.doc as unknown[] | undefined;

        // Get or create state
        let state = states.get(id);
        if (!state) {
          state = {
            id,
            type: stateType,
          };
          states.set(id, state);
        }

        // Update state properties
        if (stateType !== 'default') {
          state.type = stateType;
        }
        if (description) {
          state.description = description;
        }
        if (note) {
          state.note = note;
        }
        if (classes) {
          state.classes = classes;
        }

        // Process nested document (composite state)
        if (nestedDoc && Array.isArray(nestedDoc)) {
          state.doc = [];
          processDocument(nestedDoc, ast, states);
        }
      } else if (stmt.stmt === 'relation') {
        // Transition
        const state1 = stmt.state1 as Record<string, unknown>;
        const state2 = stmt.state2 as Record<string, unknown>;
        const description = stmt.description as string | undefined;

        if (state1 && state2) {
          const state1Id = String(state1.id || '').trim();
          const state2Id = String(state2.id || '').trim();

          // Ensure states exist
          if (!states.has(state1Id)) {
            states.set(state1Id, {
              id: state1Id,
              type: (state1.type as StateType) || 'default',
            });
          }
          if (!states.has(state2Id)) {
            states.set(state2Id, {
              id: state2Id,
              type: (state2.type as StateType) || 'default',
            });
          }

          // Handle classes from state1 and state2
          if (state1.classes) {
            const s = states.get(state1Id)!;
            s.classes = state1.classes as string[];
          }
          if (state2.classes) {
            const s = states.get(state2Id)!;
            s.classes = state2.classes as string[];
          }

          const transition: StateTransition = {
            state1: states.get(state1Id)!,
            state2: states.get(state2Id)!,
          };

          if (description) {
            transition.description = description;
          }

          ast.transitions.push(transition);
        }
      } else if (stmt.stmt === 'classDef') {
        // Class definition
        const id = String(stmt.id || '').trim();
        const classes = String(stmt.classes || '').trim();

        if (id) {
          ast.classDefs.set(id, { id, classes });
        }
      } else if (stmt.stmt === 'style') {
        // Style definition
        const id = String(stmt.id || '').trim();
        const styleClass = String(stmt.styleClass || '').trim();

        if (id) {
          ast.styles.push({ id, styleClass });
        }
      } else if (stmt.stmt === 'applyClass') {
        // Apply class to state
        const id = String(stmt.id || '').trim();
        const styleClass = String(stmt.styleClass || '').trim();

        if (id) {
          ast.classApplications.push({ id, styleClass });
        }
      } else if (stmt.stmt === 'dir') {
        // Direction
        ast.direction = stmt.value as StateDirection;
      } else if (stmt.stmt === 'click') {
        // Click handler
        const id = stmt.id as Record<string, unknown>;
        const stateId = String(id?.id || id || '').trim();
        const url = String(stmt.url || '').replace(/^"|"$/g, '');
        const tooltip = String(stmt.tooltip || '').replace(/^"|"$/g, '');

        if (stateId) {
          ast.clicks.push({
            id: stateId,
            url: url || undefined,
            tooltip: tooltip || undefined,
          });
        }
      }
    }
  }
}

/**
 * Create the yy object that the JISON parser uses
 */
function createStateYY(ast: StateDiagramAST) {
  let dividerId = 0;
  let rootDoc: unknown[] = [];

  return {
    // Set the root document
    setRootDoc(doc: unknown[]) {
      rootDoc = doc;
    },

    // Get the root document
    getRootDoc() {
      return rootDoc;
    },

    // Trim colon from description strings
    trimColon(str: string): string {
      if (!str) return '';
      return str.replace(/^:/, '').trim();
    },

    // Get unique divider ID
    getDividerId(): string {
      return `divider-${dividerId++}`;
    },

    // Set direction
    setDirection(dir: string) {
      ast.direction = dir as StateDirection;
    },

    // Accessibility
    setAccTitle(title: string) {
      ast.title = title;
    },

    setAccDescription(description: string) {
      ast.accDescription = description;
    },

    // These are called but we don't need to do anything with them
    getAccTitle: () => ast.title || '',
    getAccDescription: () => ast.accDescription || '',
    clear: () => {},
    setDiagramTitle: () => {},
    getDiagramTitle: () => '',
  };
}

/**
 * Parse a state diagram string into an AST
 */
export function parseStateDiagram(input: string): StateDiagramAST {
  const ast = createEmptyStateDiagramAST();
  const yy = createStateYY(ast);

  // Set up the parser with our yy object
  stateParser.yy = yy;

  try {
    // Parse the input - the parser returns the document
    const doc = stateParser.parse(input);

    // Process the document into our AST
    if (Array.isArray(doc)) {
      processDocument(doc, ast);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to parse state diagram: ${error.message}`);
    }
    throw error;
  }

  return ast;
}

/**
 * Detect if input is a state diagram
 */
export function isStateDiagram(input: string): boolean {
  const trimmed = input.trim();
  const firstLine = trimmed.split('\n')[0].trim().toLowerCase();
  return firstLine.startsWith('statediagram') || firstLine.startsWith('statediagram-v2');
}
