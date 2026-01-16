/**
 * State Diagram AST Types
 *
 * Represents the structure of a Mermaid state diagram.
 */

/**
 * Direction of the state diagram layout
 */
export type StateDirection = 'TB' | 'BT' | 'LR' | 'RL';

/**
 * Type of state
 */
export type StateType = 'default' | 'fork' | 'join' | 'choice' | 'divider';

/**
 * A note attached to a state
 */
export interface StateNote {
  /** Position relative to the state */
  position: 'left of' | 'right of';
  /** Note text content */
  text: string;
}

/**
 * A state definition
 */
export interface StateDefinition {
  /** State ID */
  id: string;
  /** State type */
  type: StateType;
  /** State description/label */
  description?: string | string[];
  /** Nested states (for composite states) */
  doc?: StateStatement[];
  /** Note attached to this state */
  note?: StateNote;
  /** CSS classes applied to this state */
  classes?: string[];
}

/**
 * A transition between states
 */
export interface StateTransition {
  /** Source state */
  state1: StateDefinition;
  /** Target state */
  state2: StateDefinition;
  /** Transition label/description */
  description?: string;
}

/**
 * A class definition for styling
 */
export interface StateClassDef {
  /** Class name */
  id: string;
  /** CSS styles */
  classes: string;
}

/**
 * A style definition
 */
export interface StateStyleDef {
  /** State ID(s) to style */
  id: string;
  /** CSS styles */
  styleClass: string;
}

/**
 * Apply class to state(s)
 */
export interface StateApplyClass {
  /** State ID(s) */
  id: string;
  /** Class name to apply */
  styleClass: string;
}

/**
 * Direction statement
 */
export interface StateDirectionStmt {
  stmt: 'dir';
  value: StateDirection;
}

/**
 * Click handler
 */
export interface StateClick {
  /** State ID */
  id: string;
  /** URL to navigate to */
  url?: string;
  /** Tooltip text */
  tooltip?: string;
}

/**
 * Union of all statement types
 */
export type StateStatement =
  | { stmt: 'state'; state: StateDefinition }
  | { stmt: 'relation'; transition: StateTransition }
  | { stmt: 'classDef'; classDef: StateClassDef }
  | { stmt: 'style'; style: StateStyleDef }
  | { stmt: 'applyClass'; applyClass: StateApplyClass }
  | { stmt: 'dir'; value: StateDirection }
  | { stmt: 'click'; click: StateClick };

/**
 * State Diagram AST
 */
export interface StateDiagramAST {
  /** Diagram type identifier */
  type: 'state';
  /** Diagram direction */
  direction: StateDirection;
  /** All states in the diagram (flattened) */
  states: Map<string, StateDefinition>;
  /** All transitions */
  transitions: StateTransition[];
  /** Class definitions */
  classDefs: Map<string, StateClassDef>;
  /** Style definitions */
  styles: StateStyleDef[];
  /** Class applications */
  classApplications: StateApplyClass[];
  /** Click handlers */
  clicks: StateClick[];
  /** Accessibility title */
  title?: string;
  /** Accessibility description */
  accDescription?: string;
}

/**
 * Create an empty State Diagram AST
 */
export function createEmptyStateDiagramAST(): StateDiagramAST {
  return {
    type: 'state',
    direction: 'TB',
    states: new Map(),
    transitions: [],
    classDefs: new Map(),
    styles: [],
    classApplications: [],
    clicks: [],
  };
}
