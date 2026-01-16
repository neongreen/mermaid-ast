/**
 * Class Diagram Renderer
 *
 * Renders a Class Diagram AST back to Mermaid syntax.
 */

import type {
  ClassDiagramAST,
  ClassDefinition,
  ClassRelation,
  ClassNote,
  RelationType,
  LineType,
  ClassMember,
} from "../types/class.js";
import type { RenderOptions } from "../types/render-options.js";
import { resolveOptions } from "../types/render-options.js";

/**
 * Render relation type to symbol
 */
function renderRelationType(type: RelationType, isStart: boolean): string {
  switch (type) {
    case "aggregation":
      return "o";
    case "extension":
      return isStart ? "<|" : "|>";
    case "composition":
      return "*";
    case "dependency":
      return isStart ? "<" : ">";
    case "lollipop":
      return "()";
    case "none":
    default:
      return "";
  }
}

/**
 * Render line type to symbol
 */
function renderLineType(lineType: LineType): string {
  return lineType === "dotted" ? ".." : "--";
}

/**
 * Render a relationship
 */
function renderRelation(relation: ClassRelation): string {
  const { id1, id2, relation: rel, relationTitle1, relationTitle2, title } = relation;

  // Build the arrow
  const startType = renderRelationType(rel.type1, true);
  const endType = renderRelationType(rel.type2, false);
  const line = renderLineType(rel.lineType);

  let arrow = `${startType}${line}${endType}`;

  // Build the full statement
  let result = id1;

  // Add cardinality/title on id1 side
  if (relationTitle1) {
    result += ` "${relationTitle1}"`;
  }

  result += ` ${arrow}`;

  // Add cardinality/title on id2 side
  if (relationTitle2) {
    result += ` "${relationTitle2}"`;
  }

  result += ` ${id2}`;

  // Add label if present
  if (title) {
    result += ` : ${title}`;
  }

  return result;
}

/**
 * Render a class member
 */
function renderMember(member: ClassMember): string {
  const visibility = member.visibility || "";
  return `${visibility}${member.text}`;
}

/**
 * Render a class definition
 */
function renderClass(
  cls: ClassDefinition,
  baseIndent: string,
  inNamespace: boolean = false,
  isReferencedInRelations: boolean = false
): string[] {
  const lines: string[] = [];
  const indent = inNamespace ? baseIndent + baseIndent : baseIndent;

  // Check if class needs a body
  const hasBody = cls.members.length > 0;
  const hasLabel = cls.label && cls.label !== cls.id;

  if (hasBody) {
    // Class with body
    if (hasLabel) {
      lines.push(`${indent}class ${cls.id}["${cls.label}"] {`);
    } else {
      lines.push(`${indent}class ${cls.id} {`);
    }

    // Render members
    for (const member of cls.members) {
      lines.push(`${indent}${baseIndent}${renderMember(member)}`);
    }

    lines.push(`${indent}}`);
  } else if (hasLabel) {
    // Class with label but no body
    lines.push(`${indent}class ${cls.id}["${cls.label}"]`);
  } else if (!isReferencedInRelations) {
    // Class with no body, no label, and not referenced in relations - must declare explicitly
    lines.push(`${indent}class ${cls.id}`);
  }
  // If no body and no label but referenced in relations, it's declared implicitly

  return lines;
}

/**
 * Render annotations for a class
 */
function renderAnnotations(cls: ClassDefinition, indent: string): string[] {
  const lines: string[] = [];
  for (const annotation of cls.annotations) {
    lines.push(`${indent}<<${annotation}>> ${cls.id}`);
  }
  return lines;
}

/**
 * Render a namespace
 */
function renderNamespace(
  namespaceName: string,
  classIds: string[],
  ast: ClassDiagramAST,
  indent: string
): string[] {
  const lines: string[] = [];

  lines.push(`${indent}namespace ${namespaceName} {`);

  for (const classId of classIds) {
    const cls = ast.classes.get(classId);
    if (cls) {
      lines.push(...renderClass(cls, indent, true));
    }
  }

  lines.push(`${indent}}`);

  return lines;
}

/**
 * Render notes
 */
function renderNotes(notes: ClassNote[], indent: string): string[] {
  const lines: string[] = [];

  for (const note of notes) {
    if (note.forClass) {
      lines.push(`${indent}note for ${note.forClass} "${note.text}"`);
    } else {
      lines.push(`${indent}note "${note.text}"`);
    }
  }

  return lines;
}

/**
 * Render class definitions (classDef)
 */
function renderClassDefs(ast: ClassDiagramAST, indent: string): string[] {
  const lines: string[] = [];

  for (const [name, def] of ast.classDefs) {
    const styles = def.styles.join(",");
    lines.push(`${indent}classDef ${name} ${styles}`);
  }

  return lines;
}

/**
 * Render CSS class assignments
 */
function renderCssClasses(ast: ClassDiagramAST, indent: string): string[] {
  const lines: string[] = [];

  for (const [, cls] of ast.classes) {
    for (const cssClass of cls.cssClasses) {
      lines.push(`${indent}cssClass "${cls.id}" ${cssClass}`);
    }
  }

  return lines;
}

/**
 * Render click handlers and links
 */
function renderClicks(ast: ClassDiagramAST, indent: string): string[] {
  const lines: string[] = [];

  for (const [, cls] of ast.classes) {
    if (cls.link) {
      const target = cls.linkTarget ? ` ${cls.linkTarget}` : "";
      const tooltip = cls.tooltip ? ` "${cls.tooltip}"` : "";
      lines.push(`${indent}link ${cls.id} "${cls.link}"${tooltip}${target}`);
    } else if (cls.callback) {
      const args = cls.callbackArgs ? `("${cls.callbackArgs}")` : "";
      const tooltip = cls.tooltip ? ` "${cls.tooltip}"` : "";
      lines.push(`${indent}callback ${cls.id} "${cls.callback}"${args}${tooltip}`);
    }
  }

  return lines;
}

/**
 * Render a ClassDiagramAST to Mermaid syntax
 */
export function renderClassDiagram(ast: ClassDiagramAST, options?: RenderOptions): string {
  const opts = resolveOptions(options);
  const indent = opts.indent;
  const lines: string[] = [];

  // Header
  lines.push("classDiagram");

  // Direction if not default
  if (ast.direction && ast.direction !== "TB") {
    lines.push(`${indent}direction ${ast.direction}`);
  }

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

  // Render namespaces
  for (const [name, ns] of ast.namespaces) {
    lines.push(...renderNamespace(name, ns.classes, ast, indent));
  }

  // Get classes (optionally sorted)
  let classEntries = [...ast.classes.entries()];
  if (opts.sortNodes) {
    classEntries.sort((a, b) => a[0].localeCompare(b[0]));
  }

  // Render annotations (before classes)
  for (const [, cls] of classEntries) {
    if (cls.annotations.length > 0) {
      lines.push(...renderAnnotations(cls, indent));
    }
  }

  // Render classes not in namespaces
  for (const [classId, cls] of classEntries) {
    if (!classesInNamespaces.has(classId)) {
      const isReferencedInRelations = classesInRelations.has(classId);
      const classLines = renderClass(cls, indent, false, isReferencedInRelations);
      lines.push(...classLines);
    }
  }

  // Render relations
  for (const relation of ast.relations) {
    lines.push(`${indent}${renderRelation(relation)}`);
  }

  // Render notes
  lines.push(...renderNotes(ast.notes, indent));

  // Render class definitions
  lines.push(...renderClassDefs(ast, indent));

  // Render CSS class assignments
  lines.push(...renderCssClasses(ast, indent));

  // Render click handlers
  lines.push(...renderClicks(ast, indent));

  return lines.join("\n");
}