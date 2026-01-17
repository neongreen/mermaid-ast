/**
 * Class Diagram Builder
 *
 * Fluent API for constructing Class Diagram ASTs programmatically.
 */

import {
  type ClassDefinition,
  type ClassDefStyle,
  type ClassDiagramAST,
  type ClassDirection,
  type ClassMember,
  type ClassNote,
  type ClassRelation,
  createClassDiagramAST,
  type LineType,
  type Namespace,
  type RelationType,
} from '../types/class.js';

/**
 * Options for adding a class
 */
export interface ClassOptions {
  label?: string;
  annotations?: string[];
  cssClasses?: string[];
}

/**
 * Options for adding a relation
 */
export interface RelationOptions {
  type1?: RelationType;
  type2?: RelationType;
  lineType?: LineType;
  label1?: string;
  label2?: string;
  label?: string;
}

/**
 * Options for build()
 */
export interface ClassBuildOptions {
  validate?: boolean;
}

/**
 * Validation error for invalid AST
 */
export class ClassDiagramValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ClassDiagramValidationError';
  }
}

/**
 * Builder for class members
 */
export class ClassMemberBuilder {
  private members: ClassMember[] = [];

  /**
   * Add a property/attribute
   */
  property(text: string, visibility?: '+' | '-' | '#' | '~'): this {
    this.members.push({
      text,
      visibility,
      type: 'attribute',
    });
    return this;
  }

  /**
   * Add a method
   */
  method(text: string, visibility?: '+' | '-' | '#' | '~'): this {
    this.members.push({
      text,
      visibility,
      type: 'method',
    });
    return this;
  }

  /**
   * Get the members
   */
  getMembers(): ClassMember[] {
    return this.members;
  }
}

/**
 * Fluent builder for Class Diagram ASTs
 */
export class ClassDiagramBuilder {
  private ast: ClassDiagramAST;
  private currentNamespace: string | null = null;

  constructor(direction: ClassDirection = 'TB') {
    this.ast = createClassDiagramAST();
    this.ast.direction = direction;
  }

  /**
   * Set the direction
   */
  direction(direction: ClassDirection): this {
    this.ast.direction = direction;
    return this;
  }

  /**
   * Add a class
   */
  class(
    id: string,
    builderFn?: (builder: ClassMemberBuilder) => void,
    options?: ClassOptions
  ): this {
    const memberBuilder = new ClassMemberBuilder();
    if (builderFn) {
      builderFn(memberBuilder);
    }

    const classDef: ClassDefinition = {
      id,
      label: options?.label,
      members: memberBuilder.getMembers(),
      annotations: options?.annotations ?? [],
      cssClasses: options?.cssClasses ?? [],
      styles: [],
    };

    this.ast.classes.set(id, classDef);

    // Add to current namespace if inside one
    if (this.currentNamespace) {
      const ns = this.ast.namespaces.get(this.currentNamespace);
      if (ns) {
        ns.classes.push(id);
      }
    }

    return this;
  }

  /**
   * Add a relation between two classes
   */
  relation(id1: string, id2: string, options?: RelationOptions): this {
    const relation: ClassRelation = {
      id1,
      id2,
      relation: {
        type1: options?.type1 ?? 'none',
        type2: options?.type2 ?? 'none',
        lineType: options?.lineType ?? 'solid',
      },
      relationTitle1: options?.label1,
      relationTitle2: options?.label2,
      title: options?.label,
    };

    this.ast.relations.push(relation);
    return this;
  }

  /**
   * Add an inheritance/extension relation (A extends B)
   */
  extends(child: string, parent: string, label?: string): this {
    return this.relation(parent, child, {
      type1: 'extension',
      type2: 'none',
      lineType: 'solid',
      label,
    });
  }

  /**
   * Add an implementation relation (A implements B)
   */
  implements(implementer: string, interface_: string, label?: string): this {
    return this.relation(interface_, implementer, {
      type1: 'extension',
      type2: 'none',
      lineType: 'dotted',
      label,
    });
  }

  /**
   * Add a composition relation (A has B, strong ownership)
   */
  composition(owner: string, owned: string, label?: string): this {
    return this.relation(owner, owned, {
      type1: 'composition',
      type2: 'none',
      lineType: 'solid',
      label,
    });
  }

  /**
   * Add an aggregation relation (A has B, weak ownership)
   */
  aggregation(owner: string, owned: string, label?: string): this {
    return this.relation(owner, owned, {
      type1: 'aggregation',
      type2: 'none',
      lineType: 'solid',
      label,
    });
  }

  /**
   * Add a dependency relation (A depends on B)
   */
  dependency(dependent: string, dependency: string, label?: string): this {
    return this.relation(dependent, dependency, {
      type1: 'none',
      type2: 'dependency',
      lineType: 'dotted',
      label,
    });
  }

  /**
   * Add a namespace
   */
  namespace(name: string, builderFn: (builder: ClassDiagramBuilder) => void): this {
    const ns: Namespace = {
      name,
      classes: [],
    };
    this.ast.namespaces.set(name, ns);

    // Set current namespace context
    this.currentNamespace = name;
    builderFn(this);
    this.currentNamespace = null;

    return this;
  }

  /**
   * Add a note
   */
  note(text: string, forClass?: string): this {
    const note: ClassNote = {
      text,
      forClass,
    };
    this.ast.notes.push(note);
    return this;
  }

  /**
   * Define a CSS class style
   */
  classDef(name: string, styles: string[]): this {
    const styleDef: ClassDefStyle = {
      name,
      styles,
    };
    this.ast.classDefs.set(name, styleDef);
    return this;
  }

  /**
   * Apply a CSS class to a class
   */
  cssClass(classId: string, cssClassName: string): this {
    const classDef = this.ast.classes.get(classId);
    if (classDef) {
      classDef.cssClasses.push(cssClassName);
    }
    return this;
  }

  /**
   * Add a link to a class
   */
  link(classId: string, url: string, target?: string): this {
    const classDef = this.ast.classes.get(classId);
    if (classDef) {
      classDef.link = url;
      classDef.linkTarget = target;
    }
    return this;
  }

  /**
   * Add a callback to a class
   */
  callback(classId: string, callback: string, args?: string): this {
    const classDef = this.ast.classes.get(classId);
    if (classDef) {
      classDef.callback = callback;
      classDef.callbackArgs = args;
    }
    return this;
  }

  /**
   * Add a tooltip to a class
   */
  tooltip(classId: string, tooltip: string): this {
    const classDef = this.ast.classes.get(classId);
    if (classDef) {
      classDef.tooltip = tooltip;
    }
    return this;
  }

  /**
   * Add an annotation to a class (e.g., <<interface>>, <<abstract>>)
   */
  annotate(classId: string, annotation: string): this {
    const classDef = this.ast.classes.get(classId);
    if (classDef) {
      classDef.annotations.push(annotation);
    }
    return this;
  }

  /**
   * Set the accessibility title
   */
  accTitle(title: string): this {
    this.ast.accTitle = title;
    return this;
  }

  /**
   * Set the accessibility description
   */
  accDescription(description: string): this {
    this.ast.accDescription = description;
    return this;
  }

  /**
   * Validate the AST
   */
  private validate(): void {
    const errors: string[] = [];

    // Check that all relation classes exist
    for (const relation of this.ast.relations) {
      if (!this.ast.classes.has(relation.id1)) {
        errors.push(`Relation references non-existent class '${relation.id1}'`);
      }
      if (!this.ast.classes.has(relation.id2)) {
        errors.push(`Relation references non-existent class '${relation.id2}'`);
      }
    }

    // Check that all namespace classes exist
    for (const [nsName, ns] of this.ast.namespaces) {
      for (const classId of ns.classes) {
        if (!this.ast.classes.has(classId)) {
          errors.push(`Namespace '${nsName}' references non-existent class '${classId}'`);
        }
      }
    }

    // Check that all note references exist
    for (const note of this.ast.notes) {
      if (note.forClass && !this.ast.classes.has(note.forClass)) {
        errors.push(`Note references non-existent class '${note.forClass}'`);
      }
    }

    if (errors.length > 0) {
      throw new ClassDiagramValidationError(errors.join('\n'));
    }
  }

  /**
   * Build and return the ClassDiagramAST
   */
  build(options?: ClassBuildOptions): ClassDiagramAST {
    const shouldValidate = options?.validate !== false;

    if (shouldValidate) {
      this.validate();
    }

    return this.ast;
  }
}

/**
 * Create a new ClassDiagramBuilder
 */
export function classDiagram(direction: ClassDirection = 'TB'): ClassDiagramBuilder {
  return new ClassDiagramBuilder(direction);
}
