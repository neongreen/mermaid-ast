/**
 * Requirement Diagram AST Types
 *
 * Represents requirement diagrams with requirements, elements, and relationships.
 */

/**
 * Requirement types
 */
export type RequirementType =
  | 'requirement'
  | 'functionalRequirement'
  | 'interfaceRequirement'
  | 'performanceRequirement'
  | 'physicalRequirement'
  | 'designConstraint';

/**
 * Risk levels for requirements
 */
export type RiskLevel = 'low' | 'medium' | 'high';

/**
 * Verification methods for requirements
 */
export type VerifyMethod = 'analysis' | 'demonstration' | 'inspection' | 'test';

/**
 * Relationship types between requirements and elements
 */
export type RelationshipType =
  | 'contains'
  | 'copies'
  | 'derives'
  | 'satisfies'
  | 'verifies'
  | 'refines'
  | 'traces';

/**
 * Diagram direction
 */
export type RequirementDirection = 'TB' | 'BT' | 'LR' | 'RL';

/**
 * A requirement in the diagram
 */
export interface Requirement {
  /** Requirement name/identifier in the diagram */
  name: string;
  /** Requirement type */
  requirementType: RequirementType;
  /** Requirement ID (from id: field) */
  id?: string;
  /** Requirement text/description */
  text?: string;
  /** Risk level */
  risk?: RiskLevel;
  /** Verification method */
  verifyMethod?: VerifyMethod;
}

/**
 * An element in the diagram (represents a system component)
 */
export interface RequirementElement {
  /** Element name */
  name: string;
  /** Element type (e.g., "simulation", "module") */
  type?: string;
  /** Document reference */
  docRef?: string;
}

/**
 * A relationship between requirements and elements
 */
export interface RequirementRelationship {
  /** Source entity name (requirement or element) */
  source: string;
  /** Target entity name (requirement or element) */
  target: string;
  /** Relationship type */
  relationshipType: RelationshipType;
}

/**
 * Class definition for styling
 */
export interface RequirementClassDef {
  /** Class name */
  name: string;
  /** CSS styles */
  styles: string[];
}

/**
 * The complete Requirement Diagram AST
 */
export interface RequirementAST {
  type: 'requirement';
  /** Diagram direction */
  direction: RequirementDirection;
  /** All requirements */
  requirements: Map<string, Requirement>;
  /** All elements */
  elements: Map<string, RequirementElement>;
  /** All relationships */
  relationships: RequirementRelationship[];
  /** Class definitions */
  classDefs: Map<string, RequirementClassDef>;
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
 * Create an empty Requirement Diagram AST
 */
export function createEmptyRequirementAST(): RequirementAST {
  return {
    type: 'requirement',
    direction: 'TB',
    requirements: new Map(),
    elements: new Map(),
    relationships: [],
    classDefs: new Map(),
    classes: new Map(),
    styles: new Map(),
  };
}
