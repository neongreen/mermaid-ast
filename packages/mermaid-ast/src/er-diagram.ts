/**
 * ER Diagram Wrapper Class
 *
 * A unified API for building, mutating, and querying ER diagrams.
 * Provides a fluent interface that wraps the ErDiagramAST.
 */

import { DiagramWrapper } from './diagram-wrapper.js';
import { parseErDiagram } from './parser/er-parser.js';
import { renderErDiagram } from './renderer/er-renderer.js';
import type {
  ErAttribute,
  ErAttributeKey,
  ErCardinality,
  ErDiagramAST,
  ErDirection,
  ErEntity,
  ErIdentification,
  ErRelationship,
  ErRelSpec,
} from './types/er.js';
import { createEmptyErDiagramAST } from './types/er.js';
import type { RenderOptions } from './types/render-options.js';

/**
 * Options for adding an attribute
 */
export interface AddAttributeOptions {
  /** Key constraints (PK, FK, UK) */
  keys?: ErAttributeKey[];
  /** Comment/description */
  comment?: string;
}

/**
 * Options for adding a relationship
 */
export interface AddRelationshipOptions {
  /** Cardinality on entityA side (default: 'ONLY_ONE') */
  cardA?: ErCardinality;
  /** Cardinality on entityB side (default: 'ONLY_ONE') */
  cardB?: ErCardinality;
  /** Relationship type (default: 'IDENTIFYING') */
  relType?: ErIdentification;
}

/**
 * Query options for finding entities
 */
export interface FindEntitiesQuery {
  /** Find entities with this class */
  class?: string;
  /** Find entities whose name contains this string */
  nameContains?: string;
  /** Find entities that have a specific attribute name */
  hasAttribute?: string;
  /** Find entities that have a relationship with another entity */
  relatedTo?: string;
}

/**
 * A fluent wrapper for ErDiagramAST that supports building, mutating, and querying.
 */
export class ErDiagram extends DiagramWrapper<ErDiagramAST> {
  private constructor(ast: ErDiagramAST) {
    super(ast);
  }

  // ============================================
  // Static Factory Methods
  // ============================================

  /**
   * Create a new empty ER diagram
   * @param direction - Layout direction (default: 'TB')
   */
  static create(direction: ErDirection = 'TB'): ErDiagram {
    const ast = createEmptyErDiagramAST();
    ast.direction = direction;
    return new ErDiagram(ast);
  }

  /**
   * Create an ErDiagram wrapper from an existing AST
   * @param ast - The AST to wrap
   */
  static from(ast: ErDiagramAST): ErDiagram {
    return new ErDiagram(ast);
  }

  /**
   * Parse Mermaid syntax and create an ErDiagram wrapper
   * @param text - Mermaid ER diagram syntax
   */
  static parse(text: string): ErDiagram {
    const ast = parseErDiagram(text);
    return new ErDiagram(ast);
  }

  // ============================================
  // Core Methods
  // ============================================

  /**
   * Render to Mermaid syntax
   * @param options - Render options
   */
  render(options?: RenderOptions): string {
    return renderErDiagram(this.ast, options);
  }

  /**
   * Create a deep clone of this ER diagram
   */
  clone(): ErDiagram {
    const cloned: ErDiagramAST = {
      type: 'erDiagram',
      direction: this.ast.direction,
      entities: new Map(
        [...this.ast.entities].map(([k, v]) => [
          k,
          {
            ...v,
            attributes: [
              ...v.attributes.map((a) => ({ ...a, keys: a.keys ? [...a.keys] : undefined })),
            ],
          },
        ])
      ),
      relationships: [...this.ast.relationships.map((r) => ({ ...r, relSpec: { ...r.relSpec } }))],
      classDefs: new Map(
        [...this.ast.classDefs].map(([k, v]) => [k, { ...v, styles: [...v.styles] }])
      ),
      classes: new Map([...this.ast.classes].map(([k, v]) => [k, [...v]])),
      styles: new Map([...this.ast.styles].map(([k, v]) => [k, [...v]])),
      accTitle: this.ast.accTitle,
      accDescription: this.ast.accDescription,
    };
    return new ErDiagram(cloned);
  }

  // ============================================
  // Getters
  // ============================================

  /**
   * Get the diagram direction
   */
  get direction(): ErDirection {
    return this.ast.direction;
  }

  /**
   * Set the diagram direction
   */
  set direction(dir: ErDirection) {
    this.ast.direction = dir;
  }

  /**
   * Get all entity names
   */
  get entityNames(): string[] {
    return [...this.ast.entities.keys()];
  }

  /**
   * Get all entities as an array
   */
  get entities(): ErEntity[] {
    return [...this.ast.entities.values()];
  }

  /**
   * Get all relationships
   */
  get relationships(): ErRelationship[] {
    return this.ast.relationships;
  }

  /**
   * Get the number of entities
   */
  get entityCount(): number {
    return this.ast.entities.size;
  }

  /**
   * Get the number of relationships
   */
  get relationshipCount(): number {
    return this.ast.relationships.length;
  }

  // ============================================
  // Entity Operations
  // ============================================

  /**
   * Check if an entity exists
   * @param name - Entity name
   */
  hasEntity(name: string): boolean {
    return this.ast.entities.has(name);
  }

  /**
   * Get an entity by name
   * @param name - Entity name
   * @returns The entity or undefined if not found
   */
  getEntity(name: string): ErEntity | undefined {
    return this.ast.entities.get(name);
  }

  /**
   * Add an entity to the diagram
   * @param name - Entity name
   * @param alias - Optional display alias
   * @returns this (for chaining)
   */
  addEntity(name: string, alias?: string): this {
    if (!this.ast.entities.has(name)) {
      this.ast.entities.set(name, {
        name,
        alias,
        attributes: [],
      });
    } else if (alias) {
      this.ast.entities.get(name)!.alias = alias;
    }
    return this;
  }

  /**
   * Remove an entity from the diagram
   * @param name - Entity name
   * @returns this (for chaining)
   */
  removeEntity(name: string): this {
    this.ast.entities.delete(name);
    // Remove relationships involving this entity
    this.ast.relationships = this.ast.relationships.filter(
      (r) => r.entityA !== name && r.entityB !== name
    );
    // Remove class assignments
    this.ast.classes.delete(name);
    // Remove style assignments
    this.ast.styles.delete(name);
    return this;
  }

  /**
   * Set the alias of an entity
   * @param name - Entity name
   * @param alias - New alias
   * @returns this (for chaining)
   */
  setEntityAlias(name: string, alias: string): this {
    const entity = this.ast.entities.get(name);
    if (entity) {
      entity.alias = alias;
    }
    return this;
  }

  // ============================================
  // Attribute Operations
  // ============================================

  /**
   * Add an attribute to an entity
   * @param entityName - Entity name
   * @param type - Attribute data type
   * @param attrName - Attribute name
   * @param options - Additional options
   * @returns this (for chaining)
   */
  addAttribute(
    entityName: string,
    type: string,
    attrName: string,
    options?: AddAttributeOptions
  ): this {
    let entity = this.ast.entities.get(entityName);
    if (!entity) {
      entity = { name: entityName, attributes: [] };
      this.ast.entities.set(entityName, entity);
    }

    const attr: ErAttribute = {
      type,
      name: attrName,
    };

    if (options?.keys) {
      attr.keys = options.keys;
    }
    if (options?.comment) {
      attr.comment = options.comment;
    }

    entity.attributes.push(attr);
    return this;
  }

  /**
   * Remove an attribute from an entity
   * @param entityName - Entity name
   * @param attrName - Attribute name
   * @returns this (for chaining)
   */
  removeAttribute(entityName: string, attrName: string): this {
    const entity = this.ast.entities.get(entityName);
    if (entity) {
      entity.attributes = entity.attributes.filter((a) => a.name !== attrName);
    }
    return this;
  }

  /**
   * Get attributes of an entity
   * @param entityName - Entity name
   * @returns Array of attributes
   */
  getAttributes(entityName: string): ErAttribute[] {
    return this.ast.entities.get(entityName)?.attributes || [];
  }

  // ============================================
  // Relationship Operations
  // ============================================

  /**
   * Add a relationship between two entities
   * @param entityA - First entity name
   * @param entityB - Second entity name
   * @param role - Relationship role/label
   * @param options - Relationship options
   * @returns this (for chaining)
   */
  addRelationship(
    entityA: string,
    entityB: string,
    role: string,
    options?: AddRelationshipOptions
  ): this {
    // Ensure both entities exist
    if (!this.ast.entities.has(entityA)) {
      this.addEntity(entityA);
    }
    if (!this.ast.entities.has(entityB)) {
      this.addEntity(entityB);
    }

    const relSpec: ErRelSpec = {
      cardA: options?.cardA ?? 'ONLY_ONE',
      cardB: options?.cardB ?? 'ONLY_ONE',
      relType: options?.relType ?? 'IDENTIFYING',
    };

    this.ast.relationships.push({
      entityA,
      entityB,
      role,
      relSpec,
    });

    return this;
  }

  /**
   * Remove a relationship by index
   * @param index - Relationship index
   * @returns this (for chaining)
   */
  removeRelationship(index: number): this {
    if (index >= 0 && index < this.ast.relationships.length) {
      this.ast.relationships.splice(index, 1);
    }
    return this;
  }

  /**
   * Remove all relationships between two entities
   * @param entityA - First entity name
   * @param entityB - Second entity name
   * @returns this (for chaining)
   */
  removeRelationshipsBetween(entityA: string, entityB: string): this {
    this.ast.relationships = this.ast.relationships.filter(
      (r) =>
        !(
          (r.entityA === entityA && r.entityB === entityB) ||
          (r.entityA === entityB && r.entityB === entityA)
        )
    );
    return this;
  }

  /**
   * Get relationships involving an entity
   * @param entityName - Entity name
   * @returns Array of relationships
   */
  getRelationshipsFor(entityName: string): ErRelationship[] {
    return this.ast.relationships.filter(
      (r) => r.entityA === entityName || r.entityB === entityName
    );
  }

  // ============================================
  // Class Operations
  // ============================================

  /**
   * Add a class to an entity
   * @param entityName - Entity name
   * @param className - Class name to add
   * @returns this (for chaining)
   */
  addClass(entityName: string, className: string): this {
    const classes = this.ast.classes.get(entityName) || [];
    if (!classes.includes(className)) {
      classes.push(className);
      this.ast.classes.set(entityName, classes);
    }
    return this;
  }

  /**
   * Remove a class from an entity
   * @param entityName - Entity name
   * @param className - Class name to remove
   * @returns this (for chaining)
   */
  removeClass(entityName: string, className: string): this {
    const classes = this.ast.classes.get(entityName);
    if (classes) {
      const idx = classes.indexOf(className);
      if (idx !== -1) {
        classes.splice(idx, 1);
        if (classes.length === 0) {
          this.ast.classes.delete(entityName);
        }
      }
    }
    return this;
  }

  /**
   * Get classes assigned to an entity
   * @param entityName - Entity name
   * @returns Array of class names
   */
  getClasses(entityName: string): string[] {
    return this.ast.classes.get(entityName) || [];
  }

  // ============================================
  // Query Operations
  // ============================================

  /**
   * Find entities matching a query
   * @param query - Query options
   * @returns Array of matching entity names
   */
  findEntities(query: FindEntitiesQuery): string[] {
    const results: string[] = [];

    for (const [name, entity] of this.ast.entities) {
      // Check class
      if (query.class) {
        const classes = this.ast.classes.get(name) || [];
        if (!classes.includes(query.class)) {
          continue;
        }
      }

      // Check name contains
      if (query.nameContains && !name.includes(query.nameContains)) {
        continue;
      }

      // Check has attribute
      if (query.hasAttribute) {
        const hasAttr = entity.attributes.some((a) => a.name === query.hasAttribute);
        if (!hasAttr) {
          continue;
        }
      }

      // Check related to
      if (query.relatedTo) {
        const isRelated = this.ast.relationships.some(
          (r) =>
            (r.entityA === name && r.entityB === query.relatedTo) ||
            (r.entityB === name && r.entityA === query.relatedTo)
        );
        if (!isRelated) {
          continue;
        }
      }

      results.push(name);
    }

    return results;
  }

  /**
   * Get all entities that are related to a given entity
   * @param entityName - Entity name
   * @returns Array of related entity names
   */
  getRelatedEntities(entityName: string): string[] {
    const related = new Set<string>();
    for (const rel of this.ast.relationships) {
      if (rel.entityA === entityName) {
        related.add(rel.entityB);
      } else if (rel.entityB === entityName) {
        related.add(rel.entityA);
      }
    }
    return [...related];
  }
}
