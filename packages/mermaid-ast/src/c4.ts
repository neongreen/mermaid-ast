/**
 * C4 Diagram Wrapper Class
 *
 * Provides a fluent API for building, mutating, and querying C4 diagrams.
 */

import { DiagramWrapper } from './diagram-wrapper.js';
import { parseC4 } from './parser/c4-parser.js';
import { renderC4 } from './renderer/c4-renderer.js';
import type {
  C4AST,
  C4Boundary,
  C4BoundaryType,
  C4Component,
  C4ComponentType,
  C4Container,
  C4ContainerType,
  C4DeploymentNode,
  C4DeploymentNodeType,
  C4DiagramType,
  C4Direction,
  C4Element,
  C4ElementStyle,
  C4Person,
  C4PersonType,
  C4Relationship,
  C4RelationshipStyle,
  C4RelationType,
  C4System,
  C4SystemType,
} from './types/c4.js';
import {
  createEmptyC4AST,
  isC4Boundary,
  isC4Component,
  isC4Container,
  isC4DeploymentNode,
  isC4Person,
  isC4System,
} from './types/c4.js';
import type { RenderOptions } from './types/render-options.js';

/**
 * Options for adding a person
 */
export interface AddPersonOptions {
  label?: string;
  description?: string;
  sprite?: string;
  tags?: string;
  link?: string;
  external?: boolean;
}

/**
 * Options for adding a system
 */
export interface AddSystemOptions {
  label?: string;
  description?: string;
  sprite?: string;
  tags?: string;
  link?: string;
  external?: boolean;
  variant?: 'default' | 'db' | 'queue';
}

/**
 * Options for adding a container
 */
export interface AddContainerOptions {
  label?: string;
  technology?: string;
  description?: string;
  sprite?: string;
  tags?: string;
  link?: string;
  external?: boolean;
  variant?: 'default' | 'db' | 'queue';
}

/**
 * Options for adding a component
 */
export interface AddComponentOptions {
  label?: string;
  technology?: string;
  description?: string;
  sprite?: string;
  tags?: string;
  link?: string;
  external?: boolean;
  variant?: 'default' | 'db' | 'queue';
}

/**
 * Options for adding a boundary
 */
export interface AddBoundaryOptions {
  label?: string;
  tags?: string;
  link?: string;
}

/**
 * Options for adding a deployment node
 */
export interface AddDeploymentNodeOptions {
  label?: string;
  technology?: string;
  description?: string;
  sprite?: string;
  tags?: string;
  link?: string;
  variant?: 'default' | 'left' | 'right';
}

/**
 * Options for adding a relationship
 */
export interface AddRelationshipOptions {
  label?: string;
  technology?: string;
  description?: string;
  sprite?: string;
  tags?: string;
  link?: string;
  type?: C4RelationType;
}

/**
 * Query for finding elements
 */
export interface FindElementsQuery {
  type?: C4Element['type'];
  alias?: string;
  aliasContains?: string;
  labelContains?: string;
}

/**
 * Query for finding relationships
 */
export interface FindRelationshipsQuery {
  from?: string;
  to?: string;
  type?: C4RelationType;
  labelContains?: string;
}

/**
 * C4 Diagram wrapper class
 */
export class C4 extends DiagramWrapper<C4AST> {
  private constructor(ast: C4AST) {
    super(ast);
  }

  // ============================================================
  // Factory Methods
  // ============================================================

  /**
   * Create an empty C4 diagram
   */
  static create(diagramType: C4DiagramType = 'C4Context'): C4 {
    return new C4(createEmptyC4AST(diagramType));
  }

  /**
   * Wrap an existing C4 AST
   */
  static from(ast: C4AST): C4 {
    return new C4(ast);
  }

  /**
   * Parse a C4 diagram from Mermaid syntax
   */
  static parse(text: string): C4 {
    return new C4(parseC4(text));
  }

  // ============================================================
  // Core Methods
  // ============================================================

  /**
   * Render the diagram to Mermaid syntax
   */
  render(options?: RenderOptions): string {
    return renderC4(this.ast, options);
  }

  /**
   * Create a deep clone of this diagram
   */
  clone(): C4 {
    return new C4(structuredClone(this.ast));
  }

  // ============================================================
  // Diagram Properties
  // ============================================================

  /**
   * Get the diagram type
   */
  get diagramType(): C4DiagramType {
    return this.ast.diagramType;
  }

  /**
   * Set the diagram type
   */
  setDiagramType(type: C4DiagramType): this {
    this.ast.diagramType = type;
    return this;
  }

  /**
   * Get the title
   */
  get title(): string | undefined {
    return this.ast.title;
  }

  /**
   * Set the title
   */
  setTitle(title: string): this {
    this.ast.title = title;
    return this;
  }

  /**
   * Get the direction
   */
  get direction(): C4Direction | undefined {
    return this.ast.direction;
  }

  /**
   * Set the direction
   */
  setDirection(direction: C4Direction): this {
    this.ast.direction = direction;
    return this;
  }

  // ============================================================
  // Element Operations
  // ============================================================

  /**
   * Get all top-level elements
   */
  get elements(): readonly C4Element[] {
    return this.ast.elements;
  }

  /**
   * Get the count of top-level elements
   */
  get elementCount(): number {
    return this.ast.elements.length;
  }

  /**
   * Add a person
   */
  addPerson(alias: string, options: AddPersonOptions = {}): this {
    const type: C4PersonType = options.external ? 'external_person' : 'person';
    const person: C4Person = {
      type,
      alias,
      label: options.label,
      description: options.description,
      sprite: options.sprite,
      tags: options.tags,
      link: options.link,
    };
    this.ast.elements.push(person);
    return this;
  }

  /**
   * Add a system
   */
  addSystem(alias: string, options: AddSystemOptions = {}): this {
    let type: C4SystemType;
    const variant = options.variant || 'default';
    const external = options.external || false;

    if (external) {
      switch (variant) {
        case 'db':
          type = 'external_system_db';
          break;
        case 'queue':
          type = 'external_system_queue';
          break;
        default:
          type = 'external_system';
      }
    } else {
      switch (variant) {
        case 'db':
          type = 'system_db';
          break;
        case 'queue':
          type = 'system_queue';
          break;
        default:
          type = 'system';
      }
    }

    const system: C4System = {
      type,
      alias,
      label: options.label,
      description: options.description,
      sprite: options.sprite,
      tags: options.tags,
      link: options.link,
    };
    this.ast.elements.push(system);
    return this;
  }

  /**
   * Add a container
   */
  addContainer(alias: string, options: AddContainerOptions = {}): this {
    let type: C4ContainerType;
    const variant = options.variant || 'default';
    const external = options.external || false;

    if (external) {
      switch (variant) {
        case 'db':
          type = 'external_container_db';
          break;
        case 'queue':
          type = 'external_container_queue';
          break;
        default:
          type = 'external_container';
      }
    } else {
      switch (variant) {
        case 'db':
          type = 'container_db';
          break;
        case 'queue':
          type = 'container_queue';
          break;
        default:
          type = 'container';
      }
    }

    const container: C4Container = {
      type,
      alias,
      label: options.label,
      technology: options.technology,
      description: options.description,
      sprite: options.sprite,
      tags: options.tags,
      link: options.link,
    };
    this.ast.elements.push(container);
    return this;
  }

  /**
   * Add a component
   */
  addComponent(alias: string, options: AddComponentOptions = {}): this {
    let type: C4ComponentType;
    const variant = options.variant || 'default';
    const external = options.external || false;

    if (external) {
      switch (variant) {
        case 'db':
          type = 'external_component_db';
          break;
        case 'queue':
          type = 'external_component_queue';
          break;
        default:
          type = 'external_component';
      }
    } else {
      switch (variant) {
        case 'db':
          type = 'component_db';
          break;
        case 'queue':
          type = 'component_queue';
          break;
        default:
          type = 'component';
      }
    }

    const component: C4Component = {
      type,
      alias,
      label: options.label,
      technology: options.technology,
      description: options.description,
      sprite: options.sprite,
      tags: options.tags,
      link: options.link,
    };
    this.ast.elements.push(component);
    return this;
  }

  /**
   * Add a boundary
   */
  addBoundary(
    alias: string,
    boundaryType: C4BoundaryType = 'boundary',
    options: AddBoundaryOptions = {}
  ): this {
    const boundary: C4Boundary = {
      type: boundaryType,
      alias,
      label: options.label,
      tags: options.tags,
      link: options.link,
      children: [],
    };
    this.ast.elements.push(boundary);
    return this;
  }

  /**
   * Add a deployment node
   */
  addDeploymentNode(alias: string, options: AddDeploymentNodeOptions = {}): this {
    let type: C4DeploymentNodeType;
    switch (options.variant) {
      case 'left':
        type = 'nodeL';
        break;
      case 'right':
        type = 'nodeR';
        break;
      default:
        type = 'node';
    }

    const node: C4DeploymentNode = {
      type,
      alias,
      label: options.label,
      technology: options.technology,
      description: options.description,
      sprite: options.sprite,
      tags: options.tags,
      link: options.link,
      children: [],
    };
    this.ast.elements.push(node);
    return this;
  }

  /**
   * Add an element to a boundary or deployment node
   */
  addToBoundary(boundaryAlias: string, element: C4Element): this {
    const boundary = this.findBoundary(boundaryAlias);
    if (boundary) {
      boundary.children.push(element);
    }
    return this;
  }

  /**
   * Find a boundary by alias
   */
  private findBoundary(alias: string): C4Boundary | C4DeploymentNode | undefined {
    const search = (elements: C4Element[]): C4Boundary | C4DeploymentNode | undefined => {
      for (const element of elements) {
        if ((isC4Boundary(element) || isC4DeploymentNode(element)) && element.alias === alias) {
          return element;
        }
        if (isC4Boundary(element) || isC4DeploymentNode(element)) {
          const found = search(element.children);
          if (found) return found;
        }
      }
      return undefined;
    };
    return search(this.ast.elements);
  }

  /**
   * Get an element by alias
   */
  getElement(alias: string): C4Element | undefined {
    const search = (elements: C4Element[]): C4Element | undefined => {
      for (const element of elements) {
        if ('alias' in element && element.alias === alias) {
          return element;
        }
        if (isC4Boundary(element) || isC4DeploymentNode(element)) {
          const found = search(element.children);
          if (found) return found;
        }
      }
      return undefined;
    };
    return search(this.ast.elements);
  }

  /**
   * Find elements matching a query
   */
  findElements(query: FindElementsQuery): C4Element[] {
    const results: C4Element[] = [];
    const search = (elements: C4Element[]): void => {
      for (const element of elements) {
        let matches = true;

        if (query.type && element.type !== query.type) {
          matches = false;
        }
        if (query.alias && 'alias' in element && element.alias !== query.alias) {
          matches = false;
        }
        if (
          query.aliasContains &&
          'alias' in element &&
          !element.alias.includes(query.aliasContains)
        ) {
          matches = false;
        }
        if (query.labelContains) {
          const label = 'label' in element ? element.label : undefined;
          if (!label || !label.includes(query.labelContains)) {
            matches = false;
          }
        }

        if (matches) {
          results.push(element);
        }

        if (isC4Boundary(element) || isC4DeploymentNode(element)) {
          search(element.children);
        }
      }
    };
    search(this.ast.elements);
    return results;
  }

  /**
   * Remove an element by alias
   */
  removeElement(alias: string): this {
    const remove = (elements: C4Element[]): boolean => {
      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        if ('alias' in element && element.alias === alias) {
          elements.splice(i, 1);
          return true;
        }
        if (isC4Boundary(element) || isC4DeploymentNode(element)) {
          if (remove(element.children)) return true;
        }
      }
      return false;
    };
    remove(this.ast.elements);
    return this;
  }

  // ============================================================
  // Relationship Operations
  // ============================================================

  /**
   * Get all relationships
   */
  get relationships(): readonly C4Relationship[] {
    return this.ast.relationships;
  }

  /**
   * Get the count of relationships
   */
  get relationshipCount(): number {
    return this.ast.relationships.length;
  }

  /**
   * Add a relationship
   */
  addRelationship(from: string, to: string, options: AddRelationshipOptions = {}): this {
    const rel: C4Relationship = {
      type: options.type || 'rel',
      from,
      to,
      label: options.label,
      technology: options.technology,
      description: options.description,
      sprite: options.sprite,
      tags: options.tags,
      link: options.link,
    };
    this.ast.relationships.push(rel);
    return this;
  }

  /**
   * Find relationships matching a query
   */
  findRelationships(query: FindRelationshipsQuery): C4Relationship[] {
    return this.ast.relationships.filter((rel) => {
      if (query.from && rel.from !== query.from) return false;
      if (query.to && rel.to !== query.to) return false;
      if (query.type && rel.type !== query.type) return false;
      if (query.labelContains && (!rel.label || !rel.label.includes(query.labelContains)))
        return false;
      return true;
    });
  }

  /**
   * Get relationships from a specific element
   */
  getRelationshipsFrom(alias: string): C4Relationship[] {
    return this.ast.relationships.filter((rel) => rel.from === alias);
  }

  /**
   * Get relationships to a specific element
   */
  getRelationshipsTo(alias: string): C4Relationship[] {
    return this.ast.relationships.filter((rel) => rel.to === alias);
  }

  /**
   * Remove a relationship
   */
  removeRelationship(from: string, to: string): this {
    const index = this.ast.relationships.findIndex((rel) => rel.from === from && rel.to === to);
    if (index !== -1) {
      this.ast.relationships.splice(index, 1);
    }
    return this;
  }

  // ============================================================
  // Style Operations
  // ============================================================

  /**
   * Add an element style
   */
  addElementStyle(elementName: string, style: Omit<C4ElementStyle, 'elementName'>): this {
    this.ast.elementStyles.push({
      elementName,
      ...style,
    });
    return this;
  }

  /**
   * Add a relationship style
   */
  addRelationshipStyle(
    from: string,
    to: string,
    style: Omit<C4RelationshipStyle, 'from' | 'to'>
  ): this {
    this.ast.relationshipStyles.push({
      from,
      to,
      ...style,
    });
    return this;
  }

  // ============================================================
  // Query Operations
  // ============================================================

  /**
   * Get all people
   */
  getPeople(): C4Person[] {
    return this.findElements({}).filter(isC4Person);
  }

  /**
   * Get all systems
   */
  getSystems(): C4System[] {
    return this.findElements({}).filter(isC4System);
  }

  /**
   * Get all containers
   */
  getContainers(): C4Container[] {
    return this.findElements({}).filter(isC4Container);
  }

  /**
   * Get all components
   */
  getComponents(): C4Component[] {
    return this.findElements({}).filter(isC4Component);
  }

  /**
   * Get all boundaries
   */
  getBoundaries(): C4Boundary[] {
    return this.findElements({}).filter(isC4Boundary);
  }

  /**
   * Get all deployment nodes
   */
  getDeploymentNodes(): C4DeploymentNode[] {
    return this.findElements({}).filter(isC4DeploymentNode);
  }
}
