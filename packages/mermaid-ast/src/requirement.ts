/**
 * Requirement Diagram Wrapper Class
 *
 * A unified API for building, mutating, and querying requirement diagrams.
 * Provides a fluent interface that wraps the RequirementAST.
 */

import { DiagramWrapper } from './diagram-wrapper.js';
import { parseRequirement } from './parser/requirement-parser.js';
import { renderRequirement } from './renderer/requirement-renderer.js';
import type {
  RelationshipType,
  Requirement as RequirementNode,
  RequirementAST,
  RequirementDirection,
  RequirementElement,
  RequirementRelationship,
  RequirementType,
  RiskLevel,
  VerifyMethod,
} from './types/requirement.js';
import { createEmptyRequirementAST } from './types/requirement.js';
import type { RenderOptions } from './types/render-options.js';

/**
 * Options for adding a requirement
 */
export interface AddRequirementOptions {
  /** Requirement ID */
  id?: string;
  /** Requirement text/description */
  text?: string;
  /** Risk level */
  risk?: RiskLevel;
  /** Verification method */
  verifyMethod?: VerifyMethod;
}

/**
 * Options for adding an element
 */
export interface AddElementOptions {
  /** Element type (e.g., "simulation", "module") */
  type?: string;
  /** Document reference */
  docRef?: string;
}

/**
 * Query options for finding requirements
 */
export interface FindRequirementsQuery {
  /** Find requirements of this type */
  requirementType?: RequirementType;
  /** Find requirements with this risk level */
  risk?: RiskLevel;
  /** Find requirements with this verification method */
  verifyMethod?: VerifyMethod;
  /** Find requirements whose name contains this string */
  nameContains?: string;
  /** Find requirements whose text contains this string */
  textContains?: string;
}

/**
 * Query options for finding elements
 */
export interface FindElementsQuery {
  /** Find elements of this type */
  type?: string;
  /** Find elements whose name contains this string */
  nameContains?: string;
}

/**
 * Query options for finding relationships
 */
export interface FindRelationshipsQuery {
  /** Find relationships of this type */
  relationshipType?: RelationshipType;
  /** Find relationships from this source */
  source?: string;
  /** Find relationships to this target */
  target?: string;
}

/**
 * A fluent wrapper for RequirementAST that supports building, mutating, and querying.
 */
export class Requirement extends DiagramWrapper<RequirementAST> {
  private constructor(ast: RequirementAST) {
    super(ast);
  }

  // ============================================
  // Static Factory Methods
  // ============================================

  /**
   * Create a new empty requirement diagram
   * @param direction - Layout direction (default: 'TB')
   */
  static create(direction: RequirementDirection = 'TB'): Requirement {
    const ast = createEmptyRequirementAST();
    ast.direction = direction;
    return new Requirement(ast);
  }

  /**
   * Create a Requirement wrapper from an existing AST
   * @param ast - The AST to wrap
   */
  static from(ast: RequirementAST): Requirement {
    return new Requirement(ast);
  }

  /**
   * Parse Mermaid syntax and create a Requirement wrapper
   * @param text - Mermaid requirement diagram syntax
   */
  static parse(text: string): Requirement {
    const ast = parseRequirement(text);
    return new Requirement(ast);
  }

  // ============================================
  // Core Methods
  // ============================================

  /**
   * Render to Mermaid syntax
   * @param options - Render options
   */
  render(options?: RenderOptions): string {
    return renderRequirement(this.ast, options);
  }

  /**
   * Create a deep clone of this requirement diagram
   */
  clone(): Requirement {
    const cloned: RequirementAST = {
      type: 'requirement',
      direction: this.ast.direction,
      requirements: new Map([...this.ast.requirements].map(([k, v]) => [k, { ...v }])),
      elements: new Map([...this.ast.elements].map(([k, v]) => [k, { ...v }])),
      relationships: [...this.ast.relationships.map((r) => ({ ...r }))],
      classDefs: new Map(
        [...this.ast.classDefs].map(([k, v]) => [k, { ...v, styles: [...v.styles] }])
      ),
      classes: new Map([...this.ast.classes].map(([k, v]) => [k, [...v]])),
      styles: new Map([...this.ast.styles].map(([k, v]) => [k, [...v]])),
      accTitle: this.ast.accTitle,
      accDescription: this.ast.accDescription,
    };
    return new Requirement(cloned);
  }

  // ============================================
  // Getters
  // ============================================

  /**
   * Get the diagram direction
   */
  get direction(): RequirementDirection {
    return this.ast.direction;
  }

  /**
   * Get the number of requirements
   */
  get requirementCount(): number {
    return this.ast.requirements.size;
  }

  /**
   * Get the number of elements
   */
  get elementCount(): number {
    return this.ast.elements.size;
  }

  /**
   * Get the number of relationships
   */
  get relationshipCount(): number {
    return this.ast.relationships.length;
  }

  /**
   * Get all requirement names
   */
  get requirementNames(): string[] {
    return [...this.ast.requirements.keys()];
  }

  /**
   * Get all element names
   */
  get elementNames(): string[] {
    return [...this.ast.elements.keys()];
  }

  // ============================================
  // Requirement Operations
  // ============================================

  /**
   * Add a requirement to the diagram
   * @param name - Requirement name
   * @param requirementType - Type of requirement (default: 'requirement')
   * @param options - Additional options
   */
  addRequirement(
    name: string,
    requirementType: RequirementType = 'requirement',
    options?: AddRequirementOptions
  ): this {
    const requirement: RequirementNode = {
      name,
      requirementType,
      ...options,
    };
    this.ast.requirements.set(name, requirement);
    return this;
  }

  /**
   * Get a requirement by name
   * @param name - Requirement name
   */
  getRequirement(name: string): RequirementNode | undefined {
    return this.ast.requirements.get(name);
  }

  /**
   * Check if a requirement exists
   * @param name - Requirement name
   */
  hasRequirement(name: string): boolean {
    return this.ast.requirements.has(name);
  }

  /**
   * Remove a requirement by name
   * @param name - Requirement name
   */
  removeRequirement(name: string): this {
    this.ast.requirements.delete(name);
    // Also remove relationships involving this requirement
    this.ast.relationships = this.ast.relationships.filter(
      (r) => r.source !== name && r.target !== name
    );
    return this;
  }

  /**
   * Update a requirement's properties
   * @param name - Requirement name
   * @param updates - Properties to update
   */
  updateRequirement(name: string, updates: Partial<AddRequirementOptions>): this {
    const req = this.ast.requirements.get(name);
    if (req) {
      if (updates.id !== undefined) req.id = updates.id;
      if (updates.text !== undefined) req.text = updates.text;
      if (updates.risk !== undefined) req.risk = updates.risk;
      if (updates.verifyMethod !== undefined) req.verifyMethod = updates.verifyMethod;
    }
    return this;
  }

  // ============================================
  // Element Operations
  // ============================================

  /**
   * Add an element to the diagram
   * @param name - Element name
   * @param options - Additional options
   */
  addElement(name: string, options?: AddElementOptions): this {
    const element: RequirementElement = {
      name,
      ...options,
    };
    this.ast.elements.set(name, element);
    return this;
  }

  /**
   * Get an element by name
   * @param name - Element name
   */
  getElement(name: string): RequirementElement | undefined {
    return this.ast.elements.get(name);
  }

  /**
   * Check if an element exists
   * @param name - Element name
   */
  hasElement(name: string): boolean {
    return this.ast.elements.has(name);
  }

  /**
   * Remove an element by name
   * @param name - Element name
   */
  removeElement(name: string): this {
    this.ast.elements.delete(name);
    // Also remove relationships involving this element
    this.ast.relationships = this.ast.relationships.filter(
      (r) => r.source !== name && r.target !== name
    );
    return this;
  }

  /**
   * Update an element's properties
   * @param name - Element name
   * @param updates - Properties to update
   */
  updateElement(name: string, updates: Partial<AddElementOptions>): this {
    const elem = this.ast.elements.get(name);
    if (elem) {
      if (updates.type !== undefined) elem.type = updates.type;
      if (updates.docRef !== undefined) elem.docRef = updates.docRef;
    }
    return this;
  }

  // ============================================
  // Relationship Operations
  // ============================================

  /**
   * Add a relationship between entities
   * @param source - Source entity name
   * @param target - Target entity name
   * @param relationshipType - Type of relationship
   */
  addRelationship(source: string, target: string, relationshipType: RelationshipType): this {
    this.ast.relationships.push({
      source,
      target,
      relationshipType,
    });
    return this;
  }

  /**
   * Get all relationships
   */
  getRelationships(): RequirementRelationship[] {
    return [...this.ast.relationships];
  }

  /**
   * Get relationships from a source
   * @param source - Source entity name
   */
  getRelationshipsFrom(source: string): RequirementRelationship[] {
    return this.ast.relationships.filter((r) => r.source === source);
  }

  /**
   * Get relationships to a target
   * @param target - Target entity name
   */
  getRelationshipsTo(target: string): RequirementRelationship[] {
    return this.ast.relationships.filter((r) => r.target === target);
  }

  /**
   * Remove a relationship
   * @param source - Source entity name
   * @param target - Target entity name
   * @param relationshipType - Optional: only remove if type matches
   */
  removeRelationship(source: string, target: string, relationshipType?: RelationshipType): this {
    this.ast.relationships = this.ast.relationships.filter((r) => {
      if (r.source !== source || r.target !== target) return true;
      if (relationshipType && r.relationshipType !== relationshipType) return true;
      return false;
    });
    return this;
  }

  // ============================================
  // Query Operations
  // ============================================

  /**
   * Find requirements matching a query
   * @param query - Query options
   */
  findRequirements(query: FindRequirementsQuery): RequirementNode[] {
    return [...this.ast.requirements.values()].filter((req) => {
      if (query.requirementType && req.requirementType !== query.requirementType) {
        return false;
      }
      if (query.risk && req.risk !== query.risk) {
        return false;
      }
      if (query.verifyMethod && req.verifyMethod !== query.verifyMethod) {
        return false;
      }
      if (query.nameContains && !req.name.includes(query.nameContains)) {
        return false;
      }
      if (query.textContains && (!req.text || !req.text.includes(query.textContains))) {
        return false;
      }
      return true;
    });
  }

  /**
   * Find elements matching a query
   * @param query - Query options
   */
  findElements(query: FindElementsQuery): RequirementElement[] {
    return [...this.ast.elements.values()].filter((elem) => {
      if (query.type && elem.type !== query.type) {
        return false;
      }
      if (query.nameContains && !elem.name.includes(query.nameContains)) {
        return false;
      }
      return true;
    });
  }

  /**
   * Find relationships matching a query
   * @param query - Query options
   */
  findRelationships(query: FindRelationshipsQuery): RequirementRelationship[] {
    return this.ast.relationships.filter((rel) => {
      if (query.relationshipType && rel.relationshipType !== query.relationshipType) {
        return false;
      }
      if (query.source && rel.source !== query.source) {
        return false;
      }
      if (query.target && rel.target !== query.target) {
        return false;
      }
      return true;
    });
  }

  // ============================================
  // Styling Operations
  // ============================================

  /**
   * Define a CSS class
   * @param className - Class name
   * @param styles - CSS styles
   */
  defineClass(className: string, styles: string[]): this {
    this.ast.classDefs.set(className, {
      name: className,
      styles,
    });
    return this;
  }

  /**
   * Apply a class to an entity
   * @param entityName - Entity name (requirement or element)
   * @param className - Class name to apply
   */
  addClass(entityName: string, className: string): this {
    const existing = this.ast.classes.get(entityName) || [];
    if (!existing.includes(className)) {
      this.ast.classes.set(entityName, [...existing, className]);
    }
    return this;
  }

  /**
   * Remove a class from an entity
   * @param entityName - Entity name
   * @param className - Class name to remove
   */
  removeClass(entityName: string, className: string): this {
    const existing = this.ast.classes.get(entityName);
    if (existing) {
      this.ast.classes.set(
        entityName,
        existing.filter((c) => c !== className)
      );
    }
    return this;
  }

  /**
   * Set inline styles for an entity
   * @param entityName - Entity name
   * @param styles - CSS styles
   */
  setStyle(entityName: string, styles: string[]): this {
    this.ast.styles.set(entityName, styles);
    return this;
  }

  // ============================================
  // Accessibility
  // ============================================

  /**
   * Set the accessibility title
   * @param title - Accessibility title
   */
  setAccTitle(title: string): this {
    this.ast.accTitle = title;
    return this;
  }

  /**
   * Set the accessibility description
   * @param description - Accessibility description
   */
  setAccDescription(description: string): this {
    this.ast.accDescription = description;
    return this;
  }

  /**
   * Set the diagram direction
   * @param direction - Layout direction
   */
  setDirection(direction: RequirementDirection): this {
    this.ast.direction = direction;
    return this;
  }
}
