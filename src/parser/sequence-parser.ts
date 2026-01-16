/**
 * Sequence Diagram Parser
 *
 * Parses Mermaid sequence diagram syntax into an AST using the vendored JISON parser.
 * The sequence parser returns an array of statements that we process into our AST.
 */

import {
  createEmptySequenceAST,
  type SequenceActivation,
  type SequenceActor,
  type SequenceAlt,
  type SequenceArrowType,
  type SequenceAST,
  type SequenceAutonumber,
  type SequenceBox,
  type SequenceBreak,
  type SequenceCritical,
  type SequenceLoop,
  type SequenceMessage,
  type SequenceNote,
  type SequenceOpt,
  type SequencePar,
  type SequenceRect,
  type SequenceStatement,
} from '../types/sequence.js';

// Import the vendored parser
// @ts-expect-error - Generated JS file without types
import sequenceParser from '../vendored/parsers/sequence.js';

/**
 * Line types from mermaid's sequence diagram
 */
const LINETYPE = {
  SOLID: 0,
  DOTTED: 1,
  NOTE: 2,
  SOLID_CROSS: 3,
  DOTTED_CROSS: 4,
  SOLID_OPEN: 5,
  DOTTED_OPEN: 6,
  LOOP_START: 10,
  LOOP_END: 11,
  ALT_START: 12,
  ALT_ELSE: 13,
  ALT_END: 14,
  OPT_START: 15,
  OPT_END: 16,
  ACTIVE_START: 17,
  ACTIVE_END: 18,
  PAR_START: 19,
  PAR_AND: 20,
  PAR_END: 21,
  RECT_START: 22,
  RECT_END: 23,
  SOLID_POINT: 24,
  DOTTED_POINT: 25,
  AUTONUMBER: 26,
  CRITICAL_START: 27,
  CRITICAL_OPTION: 28,
  CRITICAL_END: 29,
  BREAK_START: 30,
  BREAK_END: 31,
  PAR_OVER_START: 32,
  BIDIRECTIONAL_SOLID: 33,
  BIDIRECTIONAL_DOTTED: 34,
};

/**
 * Map arrow token to arrow type
 */
function getArrowType(signalType: number): SequenceArrowType {
  switch (signalType) {
    case LINETYPE.SOLID:
      return 'solid';
    case LINETYPE.DOTTED:
      return 'dotted';
    case LINETYPE.SOLID_CROSS:
      return 'solid_cross';
    case LINETYPE.DOTTED_CROSS:
      return 'dotted_cross';
    case LINETYPE.SOLID_OPEN:
      return 'solid_open';
    case LINETYPE.DOTTED_OPEN:
      return 'dotted_open';
    case LINETYPE.SOLID_POINT:
      return 'solid_point';
    case LINETYPE.DOTTED_POINT:
      return 'dotted_point';
    case LINETYPE.BIDIRECTIONAL_SOLID:
      return 'bidirectional_solid';
    case LINETYPE.BIDIRECTIONAL_DOTTED:
      return 'bidirectional_dotted';
    default:
      return 'solid';
  }
}

/**
 * Parse box data string
 */
function parseBoxData(boxData: string): { text?: string; color?: string } {
  const result: { text?: string; color?: string } = {};
  if (!boxData) return result;

  const trimmed = boxData.trim();

  // Check for color (starts with rgb, #, or color name)
  const colorMatch = trimmed.match(/^(rgb\([^)]+\)|#[0-9a-fA-F]+|\w+)/);
  if (colorMatch) {
    result.color = colorMatch[1];
    const rest = trimmed.slice(colorMatch[0].length).trim();
    if (rest) {
      result.text = rest;
    }
  } else {
    result.text = trimmed;
  }

  return result;
}

/**
 * Parse message text, handling wrap/nowrap directives
 */
function parseMessage(text: string): string {
  if (!text) return '';
  // Remove wrap/nowrap directives
  return text.replace(/^:?(?:no)?wrap:/, '').trim();
}

/**
 * Placement constants for notes
 */
const PLACEMENT = {
  LEFTOF: 'left_of',
  RIGHTOF: 'right_of',
  OVER: 'over',
};

/**
 * Create the yy object for the sequence parser
 */
function createSequenceYY(ast: SequenceAST) {
  return {
    LINETYPE,
    PLACEMENT,

    // Parse box data helper
    parseBoxData,

    // Parse message helper
    parseMessage,

    // Apply the parsed statements to build the AST
    apply(statements: unknown[]) {
      processStatements(statements, ast);
    },

    // Add an actor - actors added via yy are handled in statement processing
    addActor(id: string, name: string, description: string, type: 'participant' | 'actor') {
      if (!ast.actors.has(id)) {
        ast.actors.set(id, {
          id,
          name: description || name || id,
          alias: name !== id ? name : undefined,
          type,
        });
      }
    },

    // Accessibility
    setAccTitle(title: string) {
      ast.title = title;
    },

    setAccDescription(description: string) {
      ast.accDescription = description;
    },

    setDiagramTitle(title: string) {
      ast.title = title;
    },

    getDiagramTitle() {
      return ast.title || '';
    },

    // These are used but we handle them in statement processing
    getActor: () => undefined,
    getActorKeys: () => [],
    enableSequenceNumbers: () => {},
    disableSequenceNumbers: () => {},
    showSequenceNumbers: () => false,
  };
}

/**
 * Process parsed statements into AST
 */
function processStatements(statements: unknown[], ast: SequenceAST): void {
  const statementStack: SequenceStatement[][] = [ast.statements];
  let currentBox: SequenceBox | null = null;

  function currentStatements(): SequenceStatement[] {
    return statementStack[statementStack.length - 1];
  }

  function processStatement(stmt: unknown): void {
    if (!stmt || typeof stmt !== 'object') return;

    const s = stmt as Record<string, unknown>;
    const type = s.type as string;

    switch (type) {
      case 'addParticipant':
      case 'addActor':
      case 'createParticipant': {
        const actorId = s.actor as string;

        // Check if this statement has detailed info (draw field indicates it's the primary declaration)
        const hasDetailedInfo = 'draw' in s || 'description' in s || type === 'addActor';

        // If actor already exists and this statement doesn't have detailed info, skip
        const existingActor = ast.actors.get(actorId);
        if (existingActor && !hasDetailedInfo) {
          break;
        }

        // Determine actor type from draw field or statement type
        let actorType: 'participant' | 'actor' = 'participant';
        if (s.draw === 'actor' || type === 'addActor') {
          actorType = 'actor';
        } else if (existingActor) {
          // Preserve existing type if not specified
          actorType = existingActor.type;
        }

        // Handle description/alias - description field contains the display name
        const description = s.description as string | undefined;
        const displayName = description || actorId;

        const actor: SequenceActor = {
          id: actorId,
          name: displayName,
          type: actorType,
          created: type === 'createParticipant',
        };

        // If description differs from id, it's an alias
        if (description && description !== actorId) {
          actor.alias = description;
        }

        ast.actors.set(actorId, actor);

        if (currentBox) {
          currentBox.actors.push(actorId);
        }
        break;
      }

      case 'destroyParticipant': {
        const existing = ast.actors.get(s.actor as string);
        if (existing) {
          existing.destroyed = true;
        }
        break;
      }

      case 'addMessage': {
        const msg: SequenceMessage = {
          type: 'message',
          from: s.from as string,
          to: s.to as string,
          text: parseMessage(s.msg as string),
          arrowType: getArrowType(s.signalType as number),
        };
        if (s.activate) msg.activate = true;
        if (s.deactivate) msg.deactivate = true;

        // Ensure actors exist
        ensureActor(ast, msg.from);
        ensureActor(ast, msg.to);

        currentStatements().push(msg);
        break;
      }

      case 'addNote': {
        const note: SequenceNote = {
          type: 'note',
          placement: s.placement as 'left_of' | 'right_of' | 'over',
          actors: Array.isArray(s.actor) ? s.actor : [s.actor as string],
          text: s.msg as string,
        };
        currentStatements().push(note);
        break;
      }

      case 'activeStart': {
        const activation: SequenceActivation = {
          type: 'activate',
          actor: s.actor as string,
        };
        currentStatements().push(activation);
        break;
      }

      case 'activeEnd': {
        const deactivation: SequenceActivation = {
          type: 'deactivate',
          actor: s.actor as string,
        };
        currentStatements().push(deactivation);
        break;
      }

      case 'loopStart': {
        const loop: SequenceLoop = {
          type: 'loop',
          text: s.loopText as string,
          statements: [],
        };
        currentStatements().push(loop);
        statementStack.push(loop.statements);
        break;
      }

      case 'loopEnd': {
        statementStack.pop();
        break;
      }

      case 'altStart': {
        const alt: SequenceAlt = {
          type: 'alt',
          sections: [
            {
              condition: s.altText as string,
              statements: [],
            },
          ],
        };
        currentStatements().push(alt);
        statementStack.push(alt.sections[0].statements);
        break;
      }

      case 'else': {
        statementStack.pop();
        // Find the current alt block
        const parent = statementStack[statementStack.length - 1];
        const lastStmt = parent[parent.length - 1];
        if (lastStmt && 'sections' in lastStmt) {
          const alt = lastStmt as SequenceAlt;
          const newSection = {
            condition: (s.altText as string) || 'else',
            statements: [],
          };
          alt.sections.push(newSection);
          statementStack.push(newSection.statements);
        }
        break;
      }

      case 'altEnd': {
        statementStack.pop();
        break;
      }

      case 'optStart': {
        const opt: SequenceOpt = {
          type: 'opt',
          text: s.optText as string,
          statements: [],
        };
        currentStatements().push(opt);
        statementStack.push(opt.statements);
        break;
      }

      case 'optEnd': {
        statementStack.pop();
        break;
      }

      case 'parStart': {
        const par: SequencePar = {
          type: 'par',
          sections: [
            {
              text: s.parText as string,
              statements: [],
            },
          ],
        };
        currentStatements().push(par);
        statementStack.push(par.sections[0].statements);
        break;
      }

      case 'and': {
        statementStack.pop();
        const parent = statementStack[statementStack.length - 1];
        const lastStmt = parent[parent.length - 1];
        if (lastStmt && 'sections' in lastStmt && lastStmt.type === 'par') {
          const par = lastStmt as SequencePar;
          const newSection = {
            text: s.parText as string,
            statements: [],
          };
          par.sections.push(newSection);
          statementStack.push(newSection.statements);
        }
        break;
      }

      case 'parEnd': {
        statementStack.pop();
        break;
      }

      case 'criticalStart': {
        const critical: SequenceCritical = {
          type: 'critical',
          text: s.criticalText as string,
          statements: [],
          options: [],
        };
        currentStatements().push(critical);
        statementStack.push(critical.statements);
        break;
      }

      case 'option': {
        statementStack.pop();
        const parent = statementStack[statementStack.length - 1];
        const lastStmt = parent[parent.length - 1];
        if (lastStmt && lastStmt.type === 'critical') {
          const critical = lastStmt as SequenceCritical;
          const newOption = {
            text: s.optionText as string,
            statements: [],
          };
          critical.options.push(newOption);
          statementStack.push(newOption.statements);
        }
        break;
      }

      case 'criticalEnd': {
        statementStack.pop();
        break;
      }

      case 'breakStart': {
        const brk: SequenceBreak = {
          type: 'break',
          text: s.breakText as string,
          statements: [],
        };
        currentStatements().push(brk);
        statementStack.push(brk.statements);
        break;
      }

      case 'breakEnd': {
        statementStack.pop();
        break;
      }

      case 'rectStart': {
        const rect: SequenceRect = {
          type: 'rect',
          color: s.color as string,
          statements: [],
        };
        currentStatements().push(rect);
        statementStack.push(rect.statements);
        break;
      }

      case 'rectEnd': {
        statementStack.pop();
        break;
      }

      case 'boxStart': {
        const boxData = s.boxData as { text?: string; color?: string } | undefined;
        currentBox = {
          type: 'box',
          text: boxData?.text,
          color: boxData?.color,
          actors: [],
        };
        break;
      }

      case 'boxEnd': {
        if (currentBox) {
          ast.boxes.push(currentBox);
          currentBox = null;
        }
        break;
      }

      case 'sequenceIndex': {
        const autonumber: SequenceAutonumber = {
          type: 'autonumber',
          start: s.sequenceIndex as number | undefined,
          step: s.sequenceIndexStep as number | undefined,
          visible: s.sequenceVisible as boolean,
        };
        currentStatements().push(autonumber);
        break;
      }

      default:
        // Unknown statement type - ignore
        break;
    }
  }

  // Process all statements
  for (const stmt of statements) {
    if (Array.isArray(stmt)) {
      for (const s of stmt) {
        processStatement(s);
      }
    } else {
      processStatement(stmt);
    }
  }
}

/**
 * Ensure an actor exists in the AST
 */
function ensureActor(ast: SequenceAST, id: string): void {
  if (!ast.actors.has(id)) {
    ast.actors.set(id, {
      id,
      name: id,
      type: 'participant',
    });
  }
}

/**
 * Post-process statements to normalize activate/deactivate shortcut syntax.
 *
 * Mermaid's parser handles + and - shortcuts inconsistently:
 * - For +: Sets activate:true on message AND creates activeStart statement
 * - For -: Only creates activeEnd statement (doesn't set deactivate on message)
 *
 * This function normalizes the AST by setting deactivate:true on messages
 * that are immediately followed by a deactivate for the message's from actor.
 */
function normalizeActivationShortcuts(statements: SequenceStatement[]): void {
  for (let i = 0; i < statements.length - 1; i++) {
    const current = statements[i];
    const next = statements[i + 1];

    // Check if current is a message and next is a deactivate for the same actor
    if (current.type === 'message' && next.type === 'deactivate') {
      const msg = current as SequenceMessage;
      const deactivation = next as SequenceActivation;

      // The - shortcut deactivates the sender (from), not the receiver
      if (msg.from === deactivation.actor && !msg.deactivate) {
        msg.deactivate = true;
      }
    }

    // Recursively process nested statements (loops, alt, etc.)
    // Using type narrowing based on statement type
    switch (current.type) {
      case 'loop':
      case 'opt':
      case 'break':
      case 'rect': {
        const stmt = current as SequenceLoop | SequenceOpt | SequenceBreak | SequenceRect;
        normalizeActivationShortcuts(stmt.statements);
        break;
      }
      case 'alt':
      case 'par': {
        const stmt = current as SequenceAlt | SequencePar;
        for (const section of stmt.sections) {
          normalizeActivationShortcuts(section.statements);
        }
        break;
      }
      case 'critical': {
        const stmt = current as SequenceCritical;
        normalizeActivationShortcuts(stmt.statements);
        for (const option of stmt.options) {
          normalizeActivationShortcuts(option.statements);
        }
        break;
      }

      default:
        // Other statement types don't have nested statements
        break;
    }
  }
}

/**
 * Parse a sequence diagram string into an AST
 */
export function parseSequence(input: string): SequenceAST {
  const ast = createEmptySequenceAST();
  const yy = createSequenceYY(ast);

  // Set up the parser with our yy object
  sequenceParser.yy = yy;

  try {
    // Parse the input - the parser calls yy.apply() which processes statements
    // We don't need to process the result again since yy.apply handles it
    sequenceParser.parse(input);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to parse sequence diagram: ${error.message}`);
    }
    throw error;
  }

  // Normalize activation shortcuts to handle inconsistent parser behavior
  normalizeActivationShortcuts(ast.statements);

  return ast;
}

/**
 * Detect if input is a sequence diagram
 */
export function isSequenceDiagram(input: string): boolean {
  const trimmed = input.trim();
  const firstLine = trimmed.split('\n')[0].trim().toLowerCase();
  return firstLine.startsWith('sequencediagram');
}
