/**
 * ER Diagram Renderer
 *
 * Renders an ER Diagram AST back to Mermaid syntax.
 */

import type {
  ErAttribute,
  ErCardinality,
  ErDiagramAST,
  ErIdentification,
  ErRelationship,
} from '../types/er.js';
import type { RenderOptions } from '../types/render-options.js';
import { resolveOptions } from '../types/render-options.js';

/**
 * Render options for ER diagrams
 */
export interface ErRenderOptions {
  /** Number of spaces for indentation, or 'tab' for tab character (default: 4) */
  indent?: number | 'tab';
}

/**
 * Convert cardinality to Mermaid syntax
 */
function renderCardinality(card: ErCardinality, side: 'left' | 'right'): string {
  // Left side uses opening symbols, right side uses closing symbols
  switch (card) {
    case 'ZERO_OR_ONE':
      return side === 'left' ? '|o' : 'o|';
    case 'ZERO_OR_MORE':
      return side === 'left' ? '}o' : 'o{';
    case 'ONE_OR_MORE':
      return side === 'left' ? '}|' : '|{';
    case 'ONLY_ONE':
      return '||';
    case 'MD_PARENT':
      return side === 'left' ? '' : '';
    default:
      return '||';
  }
}

/**
 * Convert identification type to Mermaid syntax
 */
function renderIdentification(id: ErIdentification): string {
  switch (id) {
    case 'IDENTIFYING':
      return '--';
    case 'NON_IDENTIFYING':
      return '..';
    default:
      return '--';
  }
}

/**
 * Render a relationship specification
 */
function renderRelSpec(rel: ErRelationship): string {
  const leftCard = renderCardinality(rel.relSpec.cardB, 'left');
  const relType = renderIdentification(rel.relSpec.relType);
  const rightCard = renderCardinality(rel.relSpec.cardA, 'right');
  return `${leftCard}${relType}${rightCard}`;
}

/**
 * Render an attribute
 */
function renderAttribute(attr: ErAttribute, indent: string): string {
  let result = `${indent}${attr.type} ${attr.name}`;

  if (attr.keys && attr.keys.length > 0) {
    result += ` ${attr.keys.join(',')}`;
  }

  if (attr.comment) {
    result += ` "${attr.comment}"`;
  }

  return result;
}

/**
 * Check if an entity name needs quoting
 */
function quoteEntityName(name: string): string {
  // Quote if contains spaces or special characters
  if (/\s|[^a-zA-Z0-9_-]/.test(name)) {
    return `"${name}"`;
  }
  return name;
}

/**
 * Render an ER Diagram AST to Mermaid syntax
 */
export function renderErDiagram(ast: ErDiagramAST, options?: RenderOptions): string {
  const opts = resolveOptions(options);
  const indent = opts.indent;
  const lines: string[] = [];

  // Header
  lines.push('erDiagram');

  // Direction (if not default)
  if (ast.direction && ast.direction !== 'TB') {
    lines.push(`${indent}direction ${ast.direction}`);
  }

  // Accessibility
  if (ast.accTitle) {
    lines.push(`${indent}accTitle: ${ast.accTitle}`);
  }
  if (ast.accDescription) {
    lines.push(`${indent}accDescr: ${ast.accDescription}`);
  }

  // Class definitions
  for (const [name, classDef] of ast.classDefs) {
    if (classDef.styles.length > 0) {
      lines.push(`${indent}classDef ${name} ${classDef.styles.join(',')}`);
    }
  }

  // Entities with attributes
  for (const [name, entity] of ast.entities) {
    const entityName = quoteEntityName(name);
    const classAssignment = ast.classes.get(name);
    const classStr = classAssignment ? `:::${classAssignment.join(',')}` : '';
    const aliasStr = entity.alias ? `["${entity.alias}"]` : '';

    if (entity.attributes.length > 0) {
      lines.push(`${indent}${entityName}${aliasStr}${classStr} {`);
      for (const attr of entity.attributes) {
        lines.push(renderAttribute(attr, indent + indent));
      }
      lines.push(`${indent}}`);
    } else if (aliasStr || classStr) {
      // Only output entity if it has alias or class
      lines.push(`${indent}${entityName}${aliasStr}${classStr}`);
    }
  }

  // Relationships
  for (const rel of ast.relationships) {
    const entityA = quoteEntityName(rel.entityA);
    const entityB = quoteEntityName(rel.entityB);
    const relSpec = renderRelSpec(rel);
    const role = rel.role.includes(' ') ? `"${rel.role}"` : rel.role;

    lines.push(`${indent}${entityA} ${relSpec} ${entityB} : ${role}`);
  }

  // Style assignments
  for (const [id, styles] of ast.styles) {
    if (styles.length > 0) {
      lines.push(`${indent}style ${id} ${styles.join(',')}`);
    }
  }

  return lines.join('\n');
}
