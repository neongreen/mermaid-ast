/**
 * Class Diagram Parser
 *
 * Parses Mermaid class diagram syntax into an AST using the vendored JISON parser.
 */

import {
  type ClassDefinition,
  type ClassDiagramAST,
  type ClassDirection,
  type ClassMember,
  type ClassNote,
  type ClassRelation,
  createClassDiagramAST,
  type LineType,
  type RelationType,
} from '../types/class.js';

// Import the vendored parser
// @ts-expect-error - Generated JS file without types
import classParser from '../vendored/parsers/class.js';

/**
 * Parse a member string to extract visibility and type
 */
function parseMember(memberStr: string): ClassMember {
  const trimmed = memberStr.trim();
  let visibility: ClassMember['visibility'];
  let text = trimmed;

  // Check for visibility prefix
  if (trimmed.startsWith('+')) {
    visibility = '+';
    text = trimmed.slice(1).trim();
  } else if (trimmed.startsWith('-')) {
    visibility = '-';
    text = trimmed.slice(1).trim();
  } else if (trimmed.startsWith('#')) {
    visibility = '#';
    text = trimmed.slice(1).trim();
  } else if (trimmed.startsWith('~')) {
    visibility = '~';
    text = trimmed.slice(1).trim();
  }

  // Determine if method or attribute
  const isMethod = text.includes('(') && text.includes(')');

  return {
    text,
    visibility,
    type: isMethod ? 'method' : 'attribute',
  };
}

/**
 * Map relation type number to string
 */
function mapRelationType(type: number | string): RelationType {
  if (typeof type === 'string') return type as RelationType;
  switch (type) {
    case 0:
      return 'aggregation';
    case 1:
      return 'extension';
    case 2:
      return 'composition';
    case 3:
      return 'dependency';
    case 4:
      return 'lollipop';
    default:
      return 'none';
  }
}

/**
 * Map line type number to string
 */
function mapLineType(type: number | string): LineType {
  if (typeof type === 'string') return type as LineType;
  return type === 0 ? 'solid' : 'dotted';
}

/**
 * Create the yy object that the JISON parser uses
 */
function createClassYY(ast: ClassDiagramAST) {
  // Helper to get or create a class
  function getOrCreateClass(id: string): ClassDefinition {
    let cls = ast.classes.get(id);
    if (!cls) {
      cls = {
        id,
        members: [],
        annotations: [],
        cssClasses: [],
        styles: [],
      };
      ast.classes.set(id, cls);
    }
    return cls;
  }

  return {
    // Relation type constants (used by the parser)
    relationType: {
      AGGREGATION: 0,
      EXTENSION: 1,
      COMPOSITION: 2,
      DEPENDENCY: 3,
      LOLLIPOP: 4,
    },

    // Line type constants
    lineType: {
      LINE: 0,
      DOTTED_LINE: 1,
    },

    // Set diagram direction
    setDirection(dir: string) {
      ast.direction = dir as ClassDirection;
    },

    // Add a class
    addClass(id: string) {
      getOrCreateClass(id);
    },

    // Set class label
    setClassLabel(id: string, label: string) {
      const cls = getOrCreateClass(id);
      cls.label = label;
    },

    // Add members to a class
    addMembers(id: string, members: string[]) {
      const cls = getOrCreateClass(id);
      for (const member of members) {
        const trimmed = member.trim();
        if (trimmed) {
          // Skip empty members
          cls.members.push(parseMember(member));
        }
      }
    },

    // Add a single member (called from memberStatement)
    addMember(id: string, member: string) {
      const cls = getOrCreateClass(id);
      const trimmed = member.trim();
      if (trimmed) {
        // Skip empty members
        cls.members.push(parseMember(member));
      }
    },

    // Add a relation
    addRelation(relation: {
      id1: string;
      id2: string;
      relation: { type1: number; type2: number; lineType: number };
      relationTitle1?: string;
      relationTitle2?: string;
      title?: string;
    }) {
      // Ensure both classes exist
      getOrCreateClass(relation.id1);
      getOrCreateClass(relation.id2);

      const rel: ClassRelation = {
        id1: relation.id1,
        id2: relation.id2,
        relation: {
          type1: mapRelationType(relation.relation.type1),
          type2: mapRelationType(relation.relation.type2),
          lineType: mapLineType(relation.relation.lineType),
        },
      };

      if (relation.relationTitle1 && relation.relationTitle1 !== 'none') {
        rel.relationTitle1 = relation.relationTitle1;
      }
      if (relation.relationTitle2 && relation.relationTitle2 !== 'none') {
        rel.relationTitle2 = relation.relationTitle2;
      }
      if (relation.title) {
        rel.title = relation.title;
      }

      ast.relations.push(rel);
    },

    // Add annotation (like <<interface>>)
    addAnnotation(className: string, annotation: string) {
      const cls = getOrCreateClass(className);
      cls.annotations.push(annotation);
    },

    // Add namespace
    addNamespace(name: string) {
      if (!ast.namespaces.has(name)) {
        ast.namespaces.set(name, { name, classes: [] });
      }
    },

    // Add classes to namespace
    addClassesToNamespace(namespaceName: string, classIds: string[]) {
      let ns = ast.namespaces.get(namespaceName);
      if (!ns) {
        ns = { name: namespaceName, classes: [] };
        ast.namespaces.set(namespaceName, ns);
      }
      for (const classId of classIds) {
        if (!ns.classes.includes(classId)) {
          ns.classes.push(classId);
        }
      }
    },

    // Add note
    addNote(text: string, forClass?: string) {
      const note: ClassNote = { text };
      if (forClass) {
        note.forClass = forClass;
      }
      ast.notes.push(note);
    },

    // Set CSS class on a class (id can be comma-separated list like "C1,C2")
    setCssClass(id: string, className: string) {
      // Split by comma to handle "cssClass C1,C2 styleClass" syntax
      const classIds = id
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      for (const classId of classIds) {
        const cls = getOrCreateClass(classId);
        if (!cls.cssClasses.includes(className)) {
          cls.cssClasses.push(className);
        }
      }
    },

    // Set inline CSS style
    setCssStyle(id: string, styles: string[]) {
      const cls = getOrCreateClass(id);
      cls.styles.push(...styles);
    },

    // Define a CSS class (classDef)
    defineClass(classList: string[], styles: string[]) {
      for (const className of classList) {
        ast.classDefs.set(className, { name: className, styles });
      }
    },

    // Set click event
    setClickEvent(id: string, callback: string, callbackArgs?: string) {
      const cls = getOrCreateClass(id);
      cls.callback = callback;
      if (callbackArgs) {
        cls.callbackArgs = callbackArgs;
      }
    },

    // Set link
    setLink(id: string, href: string, target?: string) {
      const cls = getOrCreateClass(id);
      cls.link = href;
      if (target) {
        cls.linkTarget = target;
      }
    },

    // Set tooltip
    setTooltip(id: string, tooltip: string) {
      const cls = getOrCreateClass(id);
      cls.tooltip = tooltip;
    },

    // Clean up label (remove surrounding quotes, colons)
    cleanupLabel(label: string): string {
      let result = label;
      if (result.startsWith(':')) {
        result = result.slice(1);
      }
      result = result.trim();
      if (
        (result.startsWith('"') && result.endsWith('"')) ||
        (result.startsWith("'") && result.endsWith("'"))
      ) {
        result = result.slice(1, -1);
      }
      return result;
    },

    // Accessibility
    setAccTitle(title: string) {
      ast.accTitle = title;
    },

    setAccDescription(description: string) {
      ast.accDescription = description;
    },

    // These are called but we don't need to do anything special
    getTooltip: () => undefined,
    lookUpDomId: (id: string) => id,
    setDiagramTitle: () => {},
    getDiagramTitle: () => '',
    getConfig: () => ({}),
    clear: () => {},
  };
}

/**
 * Parse a class diagram string into an AST
 */
export function parseClassDiagram(input: string): ClassDiagramAST {
  const ast = createClassDiagramAST();
  const yy = createClassYY(ast);

  // Set up the parser with our yy object
  classParser.yy = yy;

  try {
    classParser.parse(input);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to parse class diagram: ${error.message}`);
    }
    throw error;
  }

  // Reverse members to maintain source order (JISON grammar processes bottom-up)
  for (const [, cls] of ast.classes) {
    cls.members.reverse();
  }

  return ast;
}

/**
 * Detect if input is a class diagram
 */
export function isClassDiagram(input: string): boolean {
  const trimmed = input.trim();
  const firstLine = trimmed.split('\n')[0].trim().toLowerCase();
  return firstLine.startsWith('classdiagram') || firstLine.startsWith('classdiagram-v2');
}
