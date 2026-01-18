/**
 * Block Diagram AST Types
 *
 * Block diagrams (block-beta) are used to create block-based layouts with
 * configurable columns and various node shapes.
 */

/**
 * Node shape types in block diagrams
 */
export type BlockNodeShape =
  | 'square' // []
  | 'round' // ()
  | 'circle' // (())
  | 'doublecircle' // ((()))
  | 'diamond' // {}
  | 'hexagon' // {{}}
  | 'stadium' // ([])
  | 'subroutine' // [[]]
  | 'cylinder' // [()]
  | 'asymmetric' // >]
  | 'trapezoid' // [/\]
  | 'trapezoid-alt' // [\/]
  | 'lean-right' // [/]
  | 'lean-left' // [\]
  | 'block-arrow'; // <[]>

/**
 * Direction for block arrows
 */
export type BlockArrowDirection = 'left' | 'right' | 'up' | 'down' | 'x' | 'y';

/**
 * Edge/link type
 */
export type BlockEdgeType =
  | 'arrow' // -->
  | 'open' // ---
  | 'dotted' // -.-
  | 'thick' // ==>
  | 'invisible'; // ~~~

/**
 * A node in a block diagram
 */
export interface BlockNode {
  /** Unique identifier for the node */
  id: string;
  /** Display label (if different from id) */
  label?: string;
  /** Node shape */
  shape: BlockNodeShape;
  /** Width in columns (default 1) */
  widthInColumns: number;
  /** Directions for block arrows */
  directions?: BlockArrowDirection[];
}

/**
 * A space block for layout purposes
 */
export interface BlockSpace {
  /** Unique identifier */
  id: string;
  /** Type discriminator */
  type: 'space';
  /** Width in columns */
  width: number;
}

/**
 * A composite block containing child elements
 */
export interface BlockComposite {
  /** Unique identifier */
  id: string;
  /** Type discriminator */
  type: 'composite';
  /** Display label */
  label?: string;
  /** Child elements */
  children: BlockElement[];
}

/**
 * An edge/link between nodes
 */
export interface BlockEdge {
  /** Unique identifier */
  id: string;
  /** Source node id */
  start: string;
  /** Target node id */
  end: string;
  /** Edge label */
  label?: string;
  /** Edge type */
  edgeType: BlockEdgeType;
}

/**
 * Column setting statement
 */
export interface BlockColumnSetting {
  /** Type discriminator */
  type: 'column-setting';
  /** Number of columns (-1 for auto) */
  columns: number;
}

/**
 * Class definition for styling
 */
export interface BlockClassDef {
  /** Type discriminator */
  type: 'classDef';
  /** Class name */
  id: string;
  /** CSS styles */
  css: string;
}

/**
 * Apply class to nodes
 */
export interface BlockApplyClass {
  /** Type discriminator */
  type: 'applyClass';
  /** Node IDs (comma-separated) */
  id: string;
  /** Style class name */
  styleClass: string;
}

/**
 * Apply inline styles to nodes
 */
export interface BlockApplyStyles {
  /** Type discriminator */
  type: 'applyStyles';
  /** Node IDs (comma-separated) */
  id: string;
  /** Style string */
  stylesStr: string;
}

/**
 * Union of all block element types
 */
export type BlockElement =
  | BlockNode
  | BlockSpace
  | BlockComposite
  | BlockEdge
  | BlockColumnSetting
  | BlockClassDef
  | BlockApplyClass
  | BlockApplyStyles;

/**
 * Block Diagram AST
 */
export interface BlockAST {
  /** Diagram type discriminator */
  type: 'block';

  /** Accessibility title */
  accTitle?: string;

  /** Accessibility description */
  accDescr?: string;

  /** Root elements of the diagram */
  elements: BlockElement[];

  /** Class definitions */
  classDefs: Map<string, string>;

  /** Class assignments (node id -> class name) */
  classAssignments: Map<string, string>;

  /** Style assignments (node id -> style string) */
  styleAssignments: Map<string, string>;
}

/**
 * Creates an empty BlockAST
 */
export function createEmptyBlockAST(): BlockAST {
  return {
    type: 'block',
    elements: [],
    classDefs: new Map(),
    classAssignments: new Map(),
    styleAssignments: new Map(),
  };
}

/**
 * Type guard for BlockNode
 */
export function isBlockNode(element: BlockElement): element is BlockNode {
  return 'shape' in element && !('type' in element);
}

/**
 * Type guard for BlockSpace
 */
export function isBlockSpace(element: BlockElement): element is BlockSpace {
  return 'type' in element && element.type === 'space';
}

/**
 * Type guard for BlockComposite
 */
export function isBlockComposite(element: BlockElement): element is BlockComposite {
  return 'type' in element && element.type === 'composite';
}

/**
 * Type guard for BlockEdge
 */
export function isBlockEdge(element: BlockElement): element is BlockEdge {
  return 'start' in element && 'end' in element;
}

/**
 * Type guard for BlockColumnSetting
 */
export function isBlockColumnSetting(element: BlockElement): element is BlockColumnSetting {
  return 'type' in element && element.type === 'column-setting';
}

/**
 * Type guard for BlockClassDef
 */
export function isBlockClassDef(element: BlockElement): element is BlockClassDef {
  return 'type' in element && element.type === 'classDef';
}

/**
 * Type guard for BlockApplyClass
 */
export function isBlockApplyClass(element: BlockElement): element is BlockApplyClass {
  return 'type' in element && element.type === 'applyClass';
}

/**
 * Type guard for BlockApplyStyles
 */
export function isBlockApplyStyles(element: BlockElement): element is BlockApplyStyles {
  return 'type' in element && element.type === 'applyStyles';
}
