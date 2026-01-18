/**
 * C4 Diagram AST Types
 *
 * C4 diagrams visualize software architecture using the C4 model:
 * - Context: High-level system context
 * - Container: Container-level view
 * - Component: Component-level view
 * - Dynamic: Sequence-like interactions
 * - Deployment: Infrastructure deployment
 */

/**
 * C4 diagram types
 */
export type C4DiagramType =
  | 'C4Context'
  | 'C4Container'
  | 'C4Component'
  | 'C4Dynamic'
  | 'C4Deployment';

/**
 * C4 element types - People
 */
export type C4PersonType = 'person' | 'external_person';

/**
 * C4 element types - Systems
 */
export type C4SystemType =
  | 'system'
  | 'system_db'
  | 'system_queue'
  | 'external_system'
  | 'external_system_db'
  | 'external_system_queue';

/**
 * C4 element types - Containers
 */
export type C4ContainerType =
  | 'container'
  | 'container_db'
  | 'container_queue'
  | 'external_container'
  | 'external_container_db'
  | 'external_container_queue';

/**
 * C4 element types - Components
 */
export type C4ComponentType =
  | 'component'
  | 'component_db'
  | 'component_queue'
  | 'external_component'
  | 'external_component_db'
  | 'external_component_queue';

/**
 * C4 boundary types
 */
export type C4BoundaryType =
  | 'boundary'
  | 'enterprise_boundary'
  | 'system_boundary'
  | 'container_boundary';

/**
 * C4 deployment node types
 */
export type C4DeploymentNodeType = 'node' | 'nodeL' | 'nodeR';

/**
 * C4 relationship types
 */
export type C4RelationType = 'rel' | 'birel' | 'rel_u' | 'rel_d' | 'rel_l' | 'rel_r' | 'rel_b';

/**
 * All C4 element types combined
 */
export type C4ElementType = C4PersonType | C4SystemType | C4ContainerType | C4ComponentType;

/**
 * Direction for layout
 */
export type C4Direction = 'TB' | 'BT' | 'LR' | 'RL';

/**
 * A person element in C4 diagrams
 */
export interface C4Person {
  type: C4PersonType;
  alias: string;
  label?: string;
  description?: string;
  sprite?: string;
  tags?: string;
  link?: string;
  /** Custom properties as key-value pairs */
  properties?: Record<string, string>;
}

/**
 * A system element in C4 diagrams
 */
export interface C4System {
  type: C4SystemType;
  alias: string;
  label?: string;
  description?: string;
  sprite?: string;
  tags?: string;
  link?: string;
  properties?: Record<string, string>;
}

/**
 * A container element in C4 diagrams
 */
export interface C4Container {
  type: C4ContainerType;
  alias: string;
  label?: string;
  technology?: string;
  description?: string;
  sprite?: string;
  tags?: string;
  link?: string;
  properties?: Record<string, string>;
}

/**
 * A component element in C4 diagrams
 */
export interface C4Component {
  type: C4ComponentType;
  alias: string;
  label?: string;
  technology?: string;
  description?: string;
  sprite?: string;
  tags?: string;
  link?: string;
  properties?: Record<string, string>;
}

/**
 * A boundary (grouping) in C4 diagrams
 */
export interface C4Boundary {
  type: C4BoundaryType;
  alias: string;
  label?: string;
  tags?: string;
  link?: string;
  properties?: Record<string, string>;
  /** Nested elements within this boundary */
  children: C4Element[];
}

/**
 * A deployment node in C4 diagrams
 */
export interface C4DeploymentNode {
  type: C4DeploymentNodeType;
  alias: string;
  label?: string;
  technology?: string;
  description?: string;
  sprite?: string;
  tags?: string;
  link?: string;
  properties?: Record<string, string>;
  /** Nested elements within this node */
  children: C4Element[];
}

/**
 * A relationship between elements
 */
export interface C4Relationship {
  type: C4RelationType;
  from: string;
  to: string;
  label?: string;
  technology?: string;
  description?: string;
  sprite?: string;
  tags?: string;
  link?: string;
  properties?: Record<string, string>;
}

/**
 * Element style update
 */
export interface C4ElementStyle {
  elementName: string;
  bgColor?: string;
  fontColor?: string;
  borderColor?: string;
  shadowing?: string;
  shape?: string;
  sprite?: string;
  technology?: string;
  legendText?: string;
  legendSprite?: string;
}

/**
 * Relationship style update
 */
export interface C4RelationshipStyle {
  from: string;
  to: string;
  textColor?: string;
  lineColor?: string;
  offsetX?: number;
  offsetY?: number;
}

/**
 * Layout configuration
 */
export interface C4LayoutConfig {
  c4ShapeInRow?: number;
  c4BoundaryInRow?: number;
}

/**
 * Union type for all C4 elements
 */
export type C4Element =
  | C4Person
  | C4System
  | C4Container
  | C4Component
  | C4Boundary
  | C4DeploymentNode;

/**
 * C4 Diagram AST
 */
export interface C4AST {
  /** Discriminator for MermaidAST union */
  type: 'c4';

  /** The specific C4 diagram type */
  diagramType: C4DiagramType;

  /** Diagram title */
  title?: string;

  /** Accessibility title */
  accTitle?: string;

  /** Accessibility description */
  accDescr?: string;

  /** Layout direction */
  direction?: C4Direction;

  /** Top-level elements (people, systems, containers, components) */
  elements: C4Element[];

  /** Relationships between elements */
  relationships: C4Relationship[];

  /** Element style overrides */
  elementStyles: C4ElementStyle[];

  /** Relationship style overrides */
  relationshipStyles: C4RelationshipStyle[];

  /** Layout configuration */
  layoutConfig?: C4LayoutConfig;
}

/**
 * Creates an empty C4 AST
 */
export function createEmptyC4AST(diagramType: C4DiagramType = 'C4Context'): C4AST {
  return {
    type: 'c4',
    diagramType,
    elements: [],
    relationships: [],
    elementStyles: [],
    relationshipStyles: [],
  };
}

/**
 * Type guards for C4 elements
 */
export function isC4Person(element: C4Element): element is C4Person {
  return element.type === 'person' || element.type === 'external_person';
}

export function isC4System(element: C4Element): element is C4System {
  return (
    element.type === 'system' ||
    element.type === 'system_db' ||
    element.type === 'system_queue' ||
    element.type === 'external_system' ||
    element.type === 'external_system_db' ||
    element.type === 'external_system_queue'
  );
}

export function isC4Container(element: C4Element): element is C4Container {
  return (
    element.type === 'container' ||
    element.type === 'container_db' ||
    element.type === 'container_queue' ||
    element.type === 'external_container' ||
    element.type === 'external_container_db' ||
    element.type === 'external_container_queue'
  );
}

export function isC4Component(element: C4Element): element is C4Component {
  return (
    element.type === 'component' ||
    element.type === 'component_db' ||
    element.type === 'component_queue' ||
    element.type === 'external_component' ||
    element.type === 'external_component_db' ||
    element.type === 'external_component_queue'
  );
}

export function isC4Boundary(element: C4Element): element is C4Boundary {
  return (
    element.type === 'boundary' ||
    element.type === 'enterprise_boundary' ||
    element.type === 'system_boundary' ||
    element.type === 'container_boundary'
  );
}

export function isC4DeploymentNode(element: C4Element): element is C4DeploymentNode {
  return element.type === 'node' || element.type === 'nodeL' || element.type === 'nodeR';
}
