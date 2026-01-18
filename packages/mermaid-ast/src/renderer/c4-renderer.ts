/**
 * C4 Diagram Renderer
 *
 * Renders a C4 AST back to Mermaid C4 diagram syntax.
 */

import type {
  C4AST,
  C4Boundary,
  C4Component,
  C4Container,
  C4DeploymentNode,
  C4Element,
  C4ElementStyle,
  C4Person,
  C4Relationship,
  C4RelationshipStyle,
  C4System,
} from '../types/c4.js';
import {
  isC4Boundary,
  isC4Component,
  isC4Container,
  isC4DeploymentNode,
  isC4Person,
  isC4System,
} from '../types/c4.js';
import type { RenderOptions } from '../types/render-options.js';
import { resolveOptions } from '../types/render-options.js';
import type { Doc } from './doc.js';
import { indent, render, when } from './doc.js';

/**
 * Escape double quotes in strings
 */
function escapeQuotes(str: string): string {
  return str.replace(/"/g, '\\"');
}

/**
 * Format attributes as comma-separated quoted strings
 */
function formatAttributes(...attrs: (string | undefined)[]): string {
  const parts: string[] = [];
  for (const attr of attrs) {
    if (attr !== undefined && attr !== '') {
      parts.push(`"${escapeQuotes(attr)}"`);
    } else {
      parts.push('""');
    }
  }
  // Remove trailing empty strings
  while (parts.length > 0 && parts[parts.length - 1] === '""') {
    parts.pop();
  }
  return parts.join(', ');
}

/**
 * Get the keyword for a person type
 */
function getPersonKeyword(type: C4Person['type']): string {
  switch (type) {
    case 'person':
      return 'Person';
    case 'external_person':
      return 'Person_Ext';
  }
}

/**
 * Get the keyword for a system type
 */
function getSystemKeyword(type: C4System['type']): string {
  switch (type) {
    case 'system':
      return 'System';
    case 'system_db':
      return 'SystemDb';
    case 'system_queue':
      return 'SystemQueue';
    case 'external_system':
      return 'System_Ext';
    case 'external_system_db':
      return 'SystemDb_Ext';
    case 'external_system_queue':
      return 'SystemQueue_Ext';
  }
}

/**
 * Get the keyword for a container type
 */
function getContainerKeyword(type: C4Container['type']): string {
  switch (type) {
    case 'container':
      return 'Container';
    case 'container_db':
      return 'ContainerDb';
    case 'container_queue':
      return 'ContainerQueue';
    case 'external_container':
      return 'Container_Ext';
    case 'external_container_db':
      return 'ContainerDb_Ext';
    case 'external_container_queue':
      return 'ContainerQueue_Ext';
  }
}

/**
 * Get the keyword for a component type
 */
function getComponentKeyword(type: C4Component['type']): string {
  switch (type) {
    case 'component':
      return 'Component';
    case 'component_db':
      return 'ComponentDb';
    case 'component_queue':
      return 'ComponentQueue';
    case 'external_component':
      return 'Component_Ext';
    case 'external_component_db':
      return 'ComponentDb_Ext';
    case 'external_component_queue':
      return 'ComponentQueue_Ext';
  }
}

/**
 * Get the keyword for a boundary type
 */
function getBoundaryKeyword(type: C4Boundary['type']): string {
  switch (type) {
    case 'boundary':
      return 'Boundary';
    case 'enterprise_boundary':
      return 'Enterprise_Boundary';
    case 'system_boundary':
      return 'System_Boundary';
    case 'container_boundary':
      return 'Container_Boundary';
  }
}

/**
 * Get the keyword for a deployment node type
 */
function getDeploymentNodeKeyword(type: C4DeploymentNode['type']): string {
  switch (type) {
    case 'node':
      return 'Deployment_Node';
    case 'nodeL':
      return 'Node_L';
    case 'nodeR':
      return 'Node_R';
  }
}

/**
 * Get the keyword for a relationship type
 */
function getRelationshipKeyword(type: C4Relationship['type']): string {
  switch (type) {
    case 'rel':
      return 'Rel';
    case 'birel':
      return 'BiRel';
    case 'rel_u':
      return 'Rel_U';
    case 'rel_d':
      return 'Rel_D';
    case 'rel_l':
      return 'Rel_L';
    case 'rel_r':
      return 'Rel_R';
    case 'rel_b':
      return 'Rel_B';
  }
}

/**
 * Render a person element
 */
function renderPerson(person: C4Person): string {
  const keyword = getPersonKeyword(person.type);
  const attrs = formatAttributes(
    person.alias,
    person.label,
    person.description,
    person.sprite,
    person.tags,
    person.link
  );
  return `${keyword}(${attrs})`;
}

/**
 * Render a system element
 */
function renderSystem(system: C4System): string {
  const keyword = getSystemKeyword(system.type);
  const attrs = formatAttributes(
    system.alias,
    system.label,
    system.description,
    system.sprite,
    system.tags,
    system.link
  );
  return `${keyword}(${attrs})`;
}

/**
 * Render a container element
 */
function renderContainer(container: C4Container): string {
  const keyword = getContainerKeyword(container.type);
  const attrs = formatAttributes(
    container.alias,
    container.label,
    container.technology,
    container.description,
    container.sprite,
    container.tags,
    container.link
  );
  return `${keyword}(${attrs})`;
}

/**
 * Render a component element
 */
function renderComponent(component: C4Component): string {
  const keyword = getComponentKeyword(component.type);
  const attrs = formatAttributes(
    component.alias,
    component.label,
    component.technology,
    component.description,
    component.sprite,
    component.tags,
    component.link
  );
  return `${keyword}(${attrs})`;
}

/**
 * Render a boundary element (with nested children)
 */
function renderBoundary(boundary: C4Boundary): Doc {
  const keyword = getBoundaryKeyword(boundary.type);
  const attrs = formatAttributes(boundary.alias, boundary.label, boundary.tags, boundary.link);

  return [
    `${keyword}(${attrs}) {`,
    indent(boundary.children.map((child) => renderElement(child))),
    '}',
  ];
}

/**
 * Render a deployment node element (with nested children)
 */
function renderDeploymentNode(node: C4DeploymentNode): Doc {
  const keyword = getDeploymentNodeKeyword(node.type);
  const attrs = formatAttributes(
    node.alias,
    node.label,
    node.technology,
    node.description,
    node.sprite,
    node.tags,
    node.link
  );

  return [
    `${keyword}(${attrs}) {`,
    indent(node.children.map((child) => renderElement(child))),
    '}',
  ];
}

/**
 * Render any element
 */
function renderElement(element: C4Element): Doc {
  if (isC4Person(element)) {
    return renderPerson(element);
  }
  if (isC4System(element)) {
    return renderSystem(element);
  }
  if (isC4Container(element)) {
    return renderContainer(element);
  }
  if (isC4Component(element)) {
    return renderComponent(element);
  }
  if (isC4Boundary(element)) {
    return renderBoundary(element);
  }
  if (isC4DeploymentNode(element)) {
    return renderDeploymentNode(element);
  }
  return null;
}

/**
 * Render a relationship
 */
function renderRelationship(rel: C4Relationship): string {
  const keyword = getRelationshipKeyword(rel.type);
  const attrs = formatAttributes(
    rel.from,
    rel.to,
    rel.label,
    rel.technology,
    rel.description,
    rel.sprite,
    rel.tags,
    rel.link
  );
  return `${keyword}(${attrs})`;
}

/**
 * Render an element style update
 */
function renderElementStyle(style: C4ElementStyle): string {
  const attrs = formatAttributes(
    style.elementName,
    style.bgColor,
    style.fontColor,
    style.borderColor,
    style.shadowing,
    style.shape,
    style.sprite,
    style.technology,
    style.legendText,
    style.legendSprite
  );
  return `UpdateElementStyle(${attrs})`;
}

/**
 * Render a relationship style update
 */
function renderRelationshipStyle(style: C4RelationshipStyle): string {
  const attrs: string[] = [`"${escapeQuotes(style.from)}"`, `"${escapeQuotes(style.to)}"`];
  if (style.textColor) attrs.push(`"${escapeQuotes(style.textColor)}"`);
  if (style.lineColor) attrs.push(`"${escapeQuotes(style.lineColor)}"`);
  if (style.offsetX !== undefined) attrs.push(String(style.offsetX));
  if (style.offsetY !== undefined) attrs.push(String(style.offsetY));

  return `UpdateRelStyle(${attrs.join(', ')})`;
}

/**
 * Renders a C4AST to Mermaid C4 diagram syntax
 */
export function renderC4(ast: C4AST, options?: RenderOptions): string {
  const opts = resolveOptions(options);

  const doc: Doc = [
    // Diagram type
    ast.diagramType,

    // Direction (if set)
    when(ast.direction, `direction ${ast.direction}`),

    // Title (if set)
    when(ast.title, `title ${ast.title}`),

    // Accessibility
    when(ast.accTitle, `accTitle: ${ast.accTitle}`),
    when(ast.accDescr, `accDescr: ${ast.accDescr}`),

    // Elements
    indent(ast.elements.map((element) => renderElement(element))),

    // Relationships
    indent(ast.relationships.map((rel) => renderRelationship(rel))),

    // Element styles
    indent(ast.elementStyles.map((style) => renderElementStyle(style))),

    // Relationship styles
    indent(ast.relationshipStyles.map((style) => renderRelationshipStyle(style))),

    // Layout config
    when(ast.layoutConfig, () => {
      const attrs: string[] = [];
      if (ast.layoutConfig?.c4ShapeInRow !== undefined) {
        attrs.push(String(ast.layoutConfig.c4ShapeInRow));
      }
      if (ast.layoutConfig?.c4BoundaryInRow !== undefined) {
        attrs.push(String(ast.layoutConfig.c4BoundaryInRow));
      }
      return attrs.length > 0 ? indent([`UpdateLayoutConfig(${attrs.join(', ')})`]) : null;
    }),
  ];

  return render(doc, opts.indent);
}
