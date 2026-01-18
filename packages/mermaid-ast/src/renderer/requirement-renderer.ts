/**
 * Requirement Diagram Renderer
 *
 * Renders a Requirement Diagram AST back to Mermaid syntax.
 */

import type {
  Requirement,
  RequirementAST,
  RequirementElement,
  RequirementRelationship,
} from '../types/requirement.js';
import type { RenderOptions } from '../types/render-options.js';
import { resolveOptions } from '../types/render-options.js';
import type { Doc } from './doc.js';
import { indent, render as renderDoc } from './doc.js';

/**
 * Map requirement type to Mermaid syntax
 */
function requirementTypeToString(type: Requirement['requirementType']): string {
  switch (type) {
    case 'requirement':
      return 'requirement';
    case 'functionalRequirement':
      return 'functionalRequirement';
    case 'interfaceRequirement':
      return 'interfaceRequirement';
    case 'performanceRequirement':
      return 'performanceRequirement';
    case 'physicalRequirement':
      return 'physicalRequirement';
    case 'designConstraint':
      return 'designConstraint';
    default:
      return 'requirement';
  }
}

/**
 * Render a requirement definition
 */
function renderRequirementDef(name: string, req: Requirement, classes: string[] | undefined): Doc {
  const classStr = classes && classes.length > 0 ? `:::${classes.join(',')}` : '';
  const header = `${requirementTypeToString(req.requirementType)} ${name}${classStr} {`;

  const body: Doc[] = [];
  if (req.id !== undefined) {
    body.push(`id: ${req.id}`);
  }
  if (req.text !== undefined) {
    body.push(`text: ${req.text}`);
  }
  if (req.risk !== undefined) {
    body.push(`risk: ${req.risk}`);
  }
  if (req.verifyMethod !== undefined) {
    body.push(`verifymethod: ${req.verifyMethod}`);
  }

  return [header, indent(body), '}'];
}

/**
 * Render an element definition
 */
function renderElementDef(
  name: string,
  elem: RequirementElement,
  classes: string[] | undefined
): Doc {
  const classStr = classes && classes.length > 0 ? `:::${classes.join(',')}` : '';
  const header = `element ${name}${classStr} {`;

  const body: Doc[] = [];
  if (elem.type !== undefined) {
    body.push(`type: ${elem.type}`);
  }
  if (elem.docRef !== undefined) {
    body.push(`docref: ${elem.docRef}`);
  }

  return [header, indent(body), '}'];
}

/**
 * Render a relationship
 */
function renderRelationshipLine(rel: RequirementRelationship): string {
  // Format: source - relationshipType -> target
  return `${rel.source} - ${rel.relationshipType} -> ${rel.target}`;
}

/**
 * Render a Requirement Diagram AST to Mermaid syntax
 */
export function renderRequirement(ast: RequirementAST, options?: RenderOptions): string {
  const opts = resolveOptions(options);

  const doc: Doc[] = [];

  // Header
  doc.push('requirementDiagram');

  const body: Doc[] = [];

  // Accessibility
  if (ast.accTitle) {
    body.push(`accTitle: ${ast.accTitle}`);
  }
  if (ast.accDescription) {
    body.push(`accDescr: ${ast.accDescription}`);
  }

  // Direction
  if (ast.direction && ast.direction !== 'TB') {
    body.push(`direction ${ast.direction}`);
  }

  // Class definitions
  for (const [name, classDef] of ast.classDefs) {
    body.push(`classDef ${name} ${classDef.styles.join(',')}`);
  }

  // Requirements
  for (const [name, req] of ast.requirements) {
    const classes = ast.classes.get(name);
    body.push(renderRequirementDef(name, req, classes));
  }

  // Elements
  for (const [name, elem] of ast.elements) {
    const classes = ast.classes.get(name);
    body.push(renderElementDef(name, elem, classes));
  }

  // Relationships
  for (const rel of ast.relationships) {
    body.push(renderRelationshipLine(rel));
  }

  // Styles
  for (const [id, styles] of ast.styles) {
    body.push(`style ${id} ${styles.join(',')}`);
  }

  doc.push(indent(body));

  return renderDoc(doc, opts.indent);
}
