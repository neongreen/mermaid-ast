/**
 * Class Diagram Renderer
 *
 * Renders a Class Diagram AST back to Mermaid syntax.
 */

import type {
  ClassDefinition,
  ClassDiagramAST,
  ClassMember,
  ClassNote,
  ClassRelation,
  LineType,
  RelationType,
} from '../types/class.js';
import type { RenderOptions } from '../types/render-options.js';
import { resolveOptions } from '../types/render-options.js';
import { assertNever } from '../utils.js';
import { block, type Doc, indent, render, when } from './doc.js';

/**
 * Render relation type to symbol
 */
function renderRelationType(type: RelationType, isStart: boolean): string {
  switch (type) {
    case 'aggregation':
      return 'o';
    case 'extension':
      return isStart ? '<|' : '|>';
    case 'composition':
      return '*';
    case 'dependency':
      return isStart ? '<' : '>';
    case 'lollipop':
      return '()';
    case 'none':
      return '';
    default:
      return assertNever(type);
  }
}

/**
 * Render line type to symbol
 */
function renderLineType(lineType: LineType): string {
  switch (lineType) {
    case 'dotted':
      return '..';
    case 'solid':
      return '--';
    default:
      return assertNever(lineType);
  }
}

/**
 * Render a relationship to a string
 */
function renderRelation(relation: ClassRelation): string {
  const { id1, id2, relation: rel, relationTitle1, relationTitle2, title } = relation;

  const startType = renderRelationType(rel.type1, true);
  const endType = renderRelationType(rel.type2, false);
  const line = renderLineType(rel.lineType);
  const arrow = `${startType}${line}${endType}`;

  let result = id1;
  if (relationTitle1) result += ` "${relationTitle1}"`;
  result += ` ${arrow}`;
  if (relationTitle2) result += ` "${relationTitle2}"`;
  result += ` ${id2}`;
  if (title) result += ` : ${title}`;

  return result;
}

/**
 * Render a class member to a string
 */
function renderMember(member: ClassMember): string {
  const visibility = member.visibility || '';
  return `${visibility}${member.text}`;
}

/**
 * Render a class definition to a Doc
 */
function renderClass(cls: ClassDefinition, isReferencedInRelations: boolean): Doc {
  const hasBody = cls.members.length > 0;
  const hasLabel = cls.label && cls.label !== cls.id;

  if (hasBody) {
    const header = hasLabel ? `class ${cls.id}["${cls.label}"] {` : `class ${cls.id} {`;
    return block(header, cls.members.map(renderMember), '}');
  }

  if (hasLabel) {
    return `class ${cls.id}["${cls.label}"]`;
  }

  // Class with no body, no label - only declare if not referenced in relations
  if (!isReferencedInRelations) {
    return `class ${cls.id}`;
  }

  // Implicitly declared via relations
  return null;
}

/**
 * Render annotations for a class to a Doc
 */
function renderAnnotations(cls: ClassDefinition): Doc {
  return cls.annotations.map((annotation) => `<<${annotation}>> ${cls.id}`);
}

/**
 * Render a namespace to a Doc
 */
function renderNamespace(
  namespaceName: string,
  classIds: string[],
  ast: ClassDiagramAST,
  classesInRelations: Set<string>
): Doc {
  const classesDoc: Doc = classIds
    .map((classId) => {
      const cls = ast.classes.get(classId);
      if (!cls) return null;
      return renderClass(cls, classesInRelations.has(classId));
    })
    .filter(Boolean);

  return block(`namespace ${namespaceName} {`, classesDoc, '}');
}

/**
 * Render notes to a Doc
 */
function renderNotes(notes: ClassNote[]): Doc {
  return notes.map((note) =>
    note.forClass ? `note for ${note.forClass} "${note.text}"` : `note "${note.text}"`
  );
}

/**
 * Render class definitions (classDef) to a Doc
 */
function renderClassDefs(ast: ClassDiagramAST): Doc {
  const entries = [...ast.classDefs.entries()];
  return entries.map(([name, def]) => {
    const styles = def.styles.join(',');
    return `classDef ${name} ${styles}`;
  });
}

/**
 * Render CSS class assignments to a Doc
 */
function renderCssClasses(ast: ClassDiagramAST): Doc {
  const assignments: string[] = [];
  for (const [, cls] of ast.classes) {
    for (const cssClass of cls.cssClasses) {
      assignments.push(`cssClass "${cls.id}" ${cssClass}`);
    }
  }
  return assignments;
}

/**
 * Render click handlers and links to a Doc
 */
function renderClicks(ast: ClassDiagramAST): Doc {
  const clicks: string[] = [];
  for (const [, cls] of ast.classes) {
    if (cls.link) {
      const target = cls.linkTarget ? ` ${cls.linkTarget}` : '';
      const tooltip = cls.tooltip ? ` "${cls.tooltip}"` : '';
      clicks.push(`link ${cls.id} "${cls.link}"${tooltip}${target}`);
    } else if (cls.callback) {
      const args = cls.callbackArgs ? `("${cls.callbackArgs}")` : '';
      const tooltip = cls.tooltip ? ` "${cls.tooltip}"` : '';
      clicks.push(`callback ${cls.id} "${cls.callback}"${args}${tooltip}`);
    }
  }
  return clicks;
}

/**
 * Render a ClassDiagramAST to Mermaid syntax
 */
export function renderClassDiagram(ast: ClassDiagramAST, options?: RenderOptions): string {
  const opts = resolveOptions(options);

  // Track classes rendered in namespaces
  const classesInNamespaces = new Set<string>();
  for (const [, ns] of ast.namespaces) {
    for (const classId of ns.classes) {
      classesInNamespaces.add(classId);
    }
  }

  // Track classes referenced in relations
  const classesInRelations = new Set<string>();
  for (const relation of ast.relations) {
    classesInRelations.add(relation.id1);
    classesInRelations.add(relation.id2);
  }

  // Get classes (optionally sorted)
  const classEntries = [...ast.classes.entries()];
  if (opts.sortNodes) {
    classEntries.sort((a, b) => a[0].localeCompare(b[0]));
  }

  // Build the document
  const doc: Doc = [
    'classDiagram',
    indent([
      // Direction
      when(ast.direction && ast.direction !== 'TB', `direction ${ast.direction}`),

      // Namespaces
      ...[...ast.namespaces.entries()].map(([name, ns]) =>
        renderNamespace(name, ns.classes, ast, classesInRelations)
      ),

      // Annotations (before classes)
      ...classEntries
        .filter(([, cls]) => cls.annotations.length > 0)
        .map(([, cls]) => renderAnnotations(cls)),

      // Classes not in namespaces
      ...classEntries
        .filter(([classId]) => !classesInNamespaces.has(classId))
        .map(([classId, cls]) => renderClass(cls, classesInRelations.has(classId))),

      // Relations
      ...ast.relations.map(renderRelation),

      // Notes
      renderNotes(ast.notes),

      // Class definitions
      renderClassDefs(ast),

      // CSS class assignments
      renderCssClasses(ast),

      // Click handlers
      renderClicks(ast),
    ]),
  ];

  return render(doc, opts.indent);
}
