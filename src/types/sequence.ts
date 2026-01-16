/**
 * Sequence Diagram AST Types
 *
 * These types represent the Abstract Syntax Tree for Mermaid sequence diagrams.
 * They capture all the information parsed from the sequence diagram syntax.
 */

/**
 * Arrow types for sequence diagram messages
 */
export type SequenceArrowType =
  | 'solid' // ->>
  | 'dotted' // -->>
  | 'solid_open' // ->
  | 'dotted_open' // -->
  | 'solid_cross' // -x
  | 'dotted_cross' // --x
  | 'solid_point' // -)
  | 'dotted_point' // --)
  | 'bidirectional_solid' // <<->>
  | 'bidirectional_dotted'; // <<-->>

/**
 * Note placement options
 */
export type NotePlacement = 'left_of' | 'right_of' | 'over';

/**
 * An actor/participant in the sequence diagram
 */
export interface SequenceActor {
  id: string;
  name: string;
  alias?: string;
  type: 'participant' | 'actor';
  created?: boolean; // If created mid-sequence with "create"
  destroyed?: boolean; // If destroyed with "destroy"
}

/**
 * A message between actors
 */
export interface SequenceMessage {
  type: 'message';
  from: string;
  to: string;
  text: string;
  arrowType: SequenceArrowType;
  activate?: boolean; // + after arrow
  deactivate?: boolean; // - after arrow
}

/**
 * A note in the sequence diagram
 */
export interface SequenceNote {
  type: 'note';
  placement: NotePlacement;
  actors: string[]; // Can be over multiple actors
  text: string;
}

/**
 * Activation/deactivation statement
 */
export interface SequenceActivation {
  type: 'activate' | 'deactivate';
  actor: string;
}

/**
 * Loop block
 */
export interface SequenceLoop {
  type: 'loop';
  text: string;
  statements: SequenceStatement[];
}

/**
 * Alt/else block (conditional)
 */
export interface SequenceAlt {
  type: 'alt';
  sections: Array<{
    condition: string;
    statements: SequenceStatement[];
  }>;
}

/**
 * Opt block (optional)
 */
export interface SequenceOpt {
  type: 'opt';
  text: string;
  statements: SequenceStatement[];
}

/**
 * Par block (parallel)
 */
export interface SequencePar {
  type: 'par';
  sections: Array<{
    text: string;
    statements: SequenceStatement[];
  }>;
}

/**
 * Critical block
 */
export interface SequenceCritical {
  type: 'critical';
  text: string;
  statements: SequenceStatement[];
  options: Array<{
    text: string;
    statements: SequenceStatement[];
  }>;
}

/**
 * Break block
 */
export interface SequenceBreak {
  type: 'break';
  text: string;
  statements: SequenceStatement[];
}

/**
 * Rect (highlight) block
 */
export interface SequenceRect {
  type: 'rect';
  color: string;
  statements: SequenceStatement[];
}

/**
 * Box grouping for actors
 */
export interface SequenceBox {
  type: 'box';
  text?: string;
  color?: string;
  actors: string[];
}

/**
 * Autonumber configuration
 */
export interface SequenceAutonumber {
  type: 'autonumber';
  start?: number;
  step?: number;
  visible: boolean;
}

/**
 * Link definition for an actor
 */
export interface SequenceLink {
  type: 'link';
  actor: string;
  url: string;
  text: string;
}

/**
 * Links (multiple) definition for an actor
 */
export interface SequenceLinks {
  type: 'links';
  actor: string;
  links: Record<string, string>; // text -> url
}

/**
 * Properties definition for an actor
 */
export interface SequenceProperties {
  type: 'properties';
  actor: string;
  properties: Record<string, string>;
}

/**
 * Details definition for an actor
 */
export interface SequenceDetails {
  type: 'details';
  actor: string;
  details: string; // JSON string
}

/**
 * Union type for all sequence diagram statements
 */
export type SequenceStatement =
  | SequenceMessage
  | SequenceNote
  | SequenceActivation
  | SequenceLoop
  | SequenceAlt
  | SequenceOpt
  | SequencePar
  | SequenceCritical
  | SequenceBreak
  | SequenceRect
  | SequenceAutonumber
  | SequenceLink
  | SequenceLinks
  | SequenceProperties
  | SequenceDetails;

/**
 * The complete Sequence Diagram AST
 */
export interface SequenceAST {
  type: 'sequence';
  actors: Map<string, SequenceActor>;
  boxes: SequenceBox[];
  statements: SequenceStatement[];
  title?: string;
  accDescription?: string;
}

/**
 * Create an empty SequenceAST
 */
export function createEmptySequenceAST(): SequenceAST {
  return {
    type: 'sequence',
    actors: new Map(),
    boxes: [],
    statements: [],
  };
}
