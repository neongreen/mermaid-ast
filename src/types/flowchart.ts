/**
 * Flowchart AST Types
 *
 * These types represent the Abstract Syntax Tree for Mermaid flowchart diagrams.
 * They capture all the information parsed from the flowchart syntax.
 */

/**
 * Direction of the flowchart layout
 */
export type FlowchartDirection =
  | 'TB' // Top to Bottom
  | 'TD' // Top Down (same as TB)
  | 'BT' // Bottom to Top
  | 'RL' // Right to Left
  | 'LR'; // Left to Right

/**
 * Shape types for flowchart nodes
 */
export type FlowchartNodeShape =
  | 'square' // [text]
  | 'round' // (text)
  | 'circle' // ((text))
  | 'doublecircle' // (((text)))
  | 'ellipse' // (-text-)
  | 'stadium' // ([text])
  | 'subroutine' // [[text]]
  | 'cylinder' // [(text)]
  | 'diamond' // {text}
  | 'hexagon' // {{text}}
  | 'odd' // >text]
  | 'trapezoid' // [/text\]
  | 'inv_trapezoid' // [\text/]
  | 'lean_right' // [/text/]
  | 'lean_left' // [\text\]
  | 'rect'; // Default rectangle

/**
 * Link/edge stroke types
 */
export type FlowchartLinkStroke =
  | 'normal' // ---
  | 'thick' // ===
  | 'dotted'; // -.-

/**
 * Link/edge arrow types
 */
export type FlowchartLinkType =
  | 'arrow_point' // -->
  | 'arrow_circle' // --o
  | 'arrow_cross' // --x
  | 'arrow_open'; // ---

/**
 * Text content with type information
 */
export interface FlowchartText {
  text: string;
  type: 'text' | 'string' | 'markdown';
}

/**
 * A node (vertex) in the flowchart
 */
export interface FlowchartNode {
  id: string;
  text?: FlowchartText;
  shape: FlowchartNodeShape;
  classes?: string[];
  props?: Record<string, string>;
  shapeData?: string;
}

/**
 * A link (edge) between nodes
 */
export interface FlowchartLink {
  id?: string;
  source: string;
  target: string;
  text?: FlowchartText;
  stroke: FlowchartLinkStroke;
  type: FlowchartLinkType;
  length: number; // Number of dashes (affects layout spacing)
}

/**
 * A subgraph container
 */
export interface FlowchartSubgraph {
  id: string;
  title?: FlowchartText;
  nodes: string[]; // Node IDs contained in this subgraph
  direction?: FlowchartDirection;
}

/**
 * Style definition for a class
 */
export interface FlowchartClassDef {
  id: string;
  styles: Record<string, string>;
}

/**
 * Click handler definition
 */
export interface FlowchartClickDef {
  nodeId: string;
  callback?: string;
  callbackArgs?: string;
  href?: string;
  target?: '_self' | '_blank' | '_parent' | '_top';
}

/**
 * Link style definition
 */
export interface FlowchartLinkStyle {
  index: number | 'default';
  styles: Record<string, string>;
  interpolate?: string;
}

/**
 * The complete Flowchart AST
 */
export interface FlowchartAST {
  type: 'flowchart';
  direction: FlowchartDirection;
  nodes: Map<string, FlowchartNode>;
  links: FlowchartLink[];
  subgraphs: FlowchartSubgraph[];
  classDefs: Map<string, FlowchartClassDef>;
  classes: Map<string, string[]>; // nodeId -> classNames
  clicks: FlowchartClickDef[];
  linkStyles: FlowchartLinkStyle[];
  title?: string;
  accDescription?: string;
}

/**
 * Create an empty FlowchartAST
 */
export function createEmptyFlowchartAST(): FlowchartAST {
  return {
    type: 'flowchart',
    direction: 'TB',
    nodes: new Map(),
    links: [],
    subgraphs: [],
    classDefs: new Map(),
    classes: new Map(),
    clicks: [],
    linkStyles: [],
  };
}
