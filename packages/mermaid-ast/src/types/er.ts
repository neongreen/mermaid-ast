/**
 * ER Diagram AST Types
 *
 * Represents Entity-Relationship diagrams with entities, attributes, and relationships.
 */

/**
 * Cardinality types for relationships
 */
export type ErCardinality =
  | 'ZERO_OR_ONE'
  | 'ZERO_OR_MORE'
  | 'ONE_OR_MORE'
  | 'ONLY_ONE'
  | 'MD_PARENT';

/**
 * Identification types for relationships
 */
export type ErIdentification = 'IDENTIFYING' | 'NON_IDENTIFYING';

/**
 * Diagram direction
 */
export type ErDirection = 'TB' | 'BT' | 'LR' | 'RL';

/**
 * Attribute key types (Primary Key, Foreign Key, Unique Key)
 */
export type ErAttributeKey = 'PK' | 'FK' | 'UK';

/**
 * An attribute of an entity
 */
export interface ErAttribute {
  /** Attribute data type */
  type: string;
  /** Attribute name */
  name: string;
  /** Optional key constraints */
  keys?: ErAttributeKey[];
  /** Optional comment/description */
  comment?: string;
}

/**
 * An entity in the ER diagram
 */
export interface ErEntity {
  /** Entity name */
  name: string;
  /** Optional alias for display */
  alias?: string;
  /** Entity attributes */
  attributes: ErAttribute[];
}

/**
 * Relationship specification (cardinality on both sides)
 */
export interface ErRelSpec {
  /** Cardinality on the first entity's side */
  cardA: ErCardinality;
  /** Relationship type (identifying or non-identifying) */
  relType: ErIdentification;
  /** Cardinality on the second entity's side */
  cardB: ErCardinality;
}

/**
 * A relationship between two entities
 */
export interface ErRelationship {
  /** First entity name */
  entityA: string;
  /** Second entity name */
  entityB: string;
  /** Relationship specification */
  relSpec: ErRelSpec;
  /** Role/label for the relationship */
  role: string;
}

/**
 * Class definition for styling
 */
export interface ErClassDef {
  /** Class name */
  name: string;
  /** CSS styles */
  styles: string[];
}

/**
 * The complete ER Diagram AST
 */
export interface ErDiagramAST {
  type: 'erDiagram';
  /** Diagram direction */
  direction: ErDirection;
  /** All entities */
  entities: Map<string, ErEntity>;
  /** All relationships */
  relationships: ErRelationship[];
  /** Class definitions */
  classDefs: Map<string, ErClassDef>;
  /** Class assignments (entity name -> class names) */
  classes: Map<string, string[]>;
  /** CSS style assignments (entity name -> styles) */
  styles: Map<string, string[]>;
  /** Accessibility title */
  accTitle?: string;
  /** Accessibility description */
  accDescription?: string;
}

/**
 * Create an empty ER Diagram AST
 */
export function createEmptyErDiagramAST(): ErDiagramAST {
  return {
    type: 'erDiagram',
    direction: 'TB',
    entities: new Map(),
    relationships: [],
    classDefs: new Map(),
    classes: new Map(),
    styles: new Map(),
  };
}
