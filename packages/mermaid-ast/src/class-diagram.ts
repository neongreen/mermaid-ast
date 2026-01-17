/**
 * Class Diagram Wrapper Class
 *
 * A unified API for building, mutating, and querying class diagrams.
 * Provides a fluent interface that wraps the ClassDiagramAST.
 */

import { DiagramWrapper } from './diagram-wrapper.js';
import { parseClassDiagram } from './parser/class-parser.js';
import { renderClassDiagram } from './renderer/class-renderer.js';
import type {
  ClassDefinition,
  ClassDiagramAST,
  ClassDirection,
  ClassMember,
  ClassRelation,
  LineType,
  RelationType,
} from './types/class.js';
import { createClassDiagramAST } from './types/class.js';
import type { RenderOptions } from './types/render-options.js';

/** Options for adding a class */
export interface AddClassOptions {
  label?: string;
  annotation?: string;
}

/** Options for adding a member */
export interface AddMemberOptions {
  visibility?: '+' | '-' | '#' | '~';
  type?: 'method' | 'attribute';
}

/** Options for adding a relation */
export interface AddRelationOptions {
  label?: string;
  labelFrom?: string;
  labelTo?: string;
  lineType?: LineType;
}

/**
 * A fluent wrapper for ClassDiagramAST that supports building, mutating, and querying.
 */
export class ClassDiagram extends DiagramWrapper<ClassDiagramAST> {
  private constructor(ast: ClassDiagramAST) {
    super(ast);
  }

  // ============ Factory Methods ============

  /** Create a new empty class diagram */
  static create(direction?: ClassDirection): ClassDiagram {
    const ast = createClassDiagramAST();
    if (direction) ast.direction = direction;
    return new ClassDiagram(ast);
  }

  /** Create from an existing AST */
  static from(ast: ClassDiagramAST): ClassDiagram {
    return new ClassDiagram(structuredClone(ast));
  }

  /** Parse Mermaid syntax into a ClassDiagram */
  static parse(input: string): ClassDiagram {
    return new ClassDiagram(parseClassDiagram(input));
  }

  // ============ Core Methods ============

  render(options?: RenderOptions): string {
    return renderClassDiagram(this.ast, options);
  }

  clone(): ClassDiagram {
    return new ClassDiagram(structuredClone(this.ast));
  }

  // ============ Properties ============

  get direction(): ClassDirection {
    return this.ast.direction;
  }

  get classCount(): number {
    return this.ast.classes.size;
  }

  get relationCount(): number {
    return this.ast.relations.length;
  }

  get classes(): Map<string, { id: string; label?: string; memberCount: number }> {
    return new Map(
      Array.from(this.ast.classes.entries()).map(([id, cls]) => [
        id,
        { id: cls.id, label: cls.label, memberCount: cls.members.length },
      ])
    );
  }

  // ============ Direction Operations ============

  setDirection(direction: ClassDirection): this {
    this.ast.direction = direction;
    return this;
  }

  // ============ Class Operations ============

  /** Add a class */
  addClass(id: string, options?: AddClassOptions): this {
    const cls: ClassDefinition = {
      id,
      label: options?.label,
      members: [],
      annotations: options?.annotation ? [options.annotation] : [],
      cssClasses: [],
      styles: [],
    };
    this.ast.classes.set(id, cls);
    return this;
  }

  /** Remove a class and optionally its relations */
  removeClass(id: string, options?: { removeRelations?: boolean }): this {
    this.ast.classes.delete(id);
    if (options?.removeRelations) {
      this.ast.relations = this.ast.relations.filter((r) => r.id1 !== id && r.id2 !== id);
    }
    return this;
  }

  /** Rename a class */
  renameClass(id: string, newId: string): this {
    const cls = this.ast.classes.get(id);
    if (cls) {
      cls.id = newId;
      this.ast.classes.delete(id);
      this.ast.classes.set(newId, cls);
      // Update relations
      for (const rel of this.ast.relations) {
        if (rel.id1 === id) rel.id1 = newId;
        if (rel.id2 === id) rel.id2 = newId;
      }
      // Update namespaces
      for (const ns of this.ast.namespaces.values()) {
        const idx = ns.classes.indexOf(id);
        if (idx >= 0) ns.classes[idx] = newId;
      }
    }
    return this;
  }

  /** Get a class by ID */
  getClass(id: string): ClassDefinition | undefined {
    return this.ast.classes.get(id);
  }

  /** Check if class exists */
  hasClass(id: string): boolean {
    return this.ast.classes.has(id);
  }

  /** Set class label */
  setClassLabel(id: string, label: string): this {
    const cls = this.ast.classes.get(id);
    if (cls) cls.label = label;
    return this;
  }

  /** Add annotation to class */
  addAnnotation(id: string, annotation: string): this {
    const cls = this.ast.classes.get(id);
    if (cls && !cls.annotations.includes(annotation)) {
      cls.annotations.push(annotation);
    }
    return this;
  }

  /** Remove annotation from class */
  removeAnnotation(id: string, annotation: string): this {
    const cls = this.ast.classes.get(id);
    if (cls) {
      cls.annotations = cls.annotations.filter((a) => a !== annotation);
    }
    return this;
  }

  // ============ Member Operations ============

  /** Add a member (attribute or method) to a class */
  addMember(classId: string, text: string, options?: AddMemberOptions): this {
    const cls = this.ast.classes.get(classId);
    if (!cls) {
      this.addClass(classId);
      return this.addMember(classId, text, options);
    }
    const member: ClassMember = {
      text,
      visibility: options?.visibility,
      type: options?.type,
    };
    cls.members.push(member);
    return this;
  }

  /** Add an attribute to a class */
  addAttribute(classId: string, text: string, visibility?: '+' | '-' | '#' | '~'): this {
    return this.addMember(classId, text, { visibility, type: 'attribute' });
  }

  /** Add a method to a class */
  addMethod(classId: string, text: string, visibility?: '+' | '-' | '#' | '~'): this {
    return this.addMember(classId, text, { visibility, type: 'method' });
  }

  /** Get members of a class */
  getMembers(classId: string): ClassMember[] {
    return this.ast.classes.get(classId)?.members ?? [];
  }

  /** Remove a member from a class */
  removeMember(classId: string, text: string): this {
    const cls = this.ast.classes.get(classId);
    if (cls) {
      cls.members = cls.members.filter((m) => m.text !== text);
    }
    return this;
  }

  // ============ Relation Operations ============

  /** Add a relation between classes */
  addRelation(
    from: string,
    to: string,
    relationType: RelationType,
    options?: AddRelationOptions
  ): this {
    // Auto-create classes if they don't exist
    if (!this.ast.classes.has(from)) this.addClass(from);
    if (!this.ast.classes.has(to)) this.addClass(to);

    const relation: ClassRelation = {
      id1: from,
      id2: to,
      relation: {
        type1: relationType,
        type2: 'none',
        lineType: options?.lineType ?? 'solid',
      },
      title: options?.label,
      relationTitle1: options?.labelFrom,
      relationTitle2: options?.labelTo,
    };
    this.ast.relations.push(relation);
    return this;
  }

  /** Add inheritance relation (A extends B) */
  addInheritance(child: string, parent: string, options?: AddRelationOptions): this {
    return this.addRelation(parent, child, 'extension', options);
  }

  /** Add composition relation */
  addComposition(whole: string, part: string, options?: AddRelationOptions): this {
    return this.addRelation(whole, part, 'composition', options);
  }

  /** Add aggregation relation */
  addAggregation(whole: string, part: string, options?: AddRelationOptions): this {
    return this.addRelation(whole, part, 'aggregation', options);
  }

  /** Add dependency relation */
  addDependency(from: string, to: string, options?: AddRelationOptions): this {
    return this.addRelation(from, to, 'dependency', options);
  }

  /** Add association (simple line) */
  addAssociation(from: string, to: string, options?: AddRelationOptions): this {
    return this.addRelation(from, to, 'none', options);
  }

  /** Get all relations */
  getRelations(): ClassRelation[] {
    return this.ast.relations;
  }

  /** Get relations for a class */
  getRelationsFor(classId: string): ClassRelation[] {
    return this.ast.relations.filter((r) => r.id1 === classId || r.id2 === classId);
  }

  /** Remove a relation */
  removeRelation(from: string, to: string): this {
    this.ast.relations = this.ast.relations.filter(
      (r) => !(r.id1 === from && r.id2 === to) && !(r.id1 === to && r.id2 === from)
    );
    return this;
  }

  // ============ Namespace Operations ============

  /** Add a namespace */
  addNamespace(name: string, classIds?: string[]): this {
    this.ast.namespaces.set(name, {
      name,
      classes: classIds ?? [],
    });
    return this;
  }

  /** Add class to namespace */
  addToNamespace(namespace: string, classId: string): this {
    let ns = this.ast.namespaces.get(namespace);
    if (!ns) {
      this.addNamespace(namespace);
      ns = this.ast.namespaces.get(namespace)!;
    }
    if (!ns.classes.includes(classId)) {
      ns.classes.push(classId);
    }
    return this;
  }

  /** Remove class from namespace */
  removeFromNamespace(namespace: string, classId: string): this {
    const ns = this.ast.namespaces.get(namespace);
    if (ns) {
      ns.classes = ns.classes.filter((c) => c !== classId);
    }
    return this;
  }

  /** Get namespace for a class */
  getNamespaceFor(classId: string): string | undefined {
    for (const [name, ns] of this.ast.namespaces) {
      if (ns.classes.includes(classId)) return name;
    }
    return undefined;
  }

  // ============ Note Operations ============

  /** Add a note */
  addNote(text: string, forClass?: string): this {
    this.ast.notes.push({ text, forClass });
    return this;
  }

  /** Get all notes */
  getNotes(): Array<{ text: string; forClass?: string }> {
    return this.ast.notes;
  }

  // ============ Style Operations ============

  /** Define a class style */
  defineStyle(name: string, styles: string[]): this {
    this.ast.classDefs.set(name, { name, styles });
    return this;
  }

  /** Apply style to a class */
  applyStyle(classId: string, styleName: string): this {
    const cls = this.ast.classes.get(classId);
    if (cls && !cls.cssClasses.includes(styleName)) {
      cls.cssClasses.push(styleName);
    }
    return this;
  }

  // ============ Query Operations ============

  /** Find classes by criteria */
  findClasses(query: {
    hasAnnotation?: string;
    hasStyle?: string;
    inNamespace?: string;
  }): ClassDefinition[] {
    const results: ClassDefinition[] = [];
    for (const cls of this.ast.classes.values()) {
      if (query.hasAnnotation && !cls.annotations.includes(query.hasAnnotation)) continue;
      if (query.hasStyle && !cls.cssClasses.includes(query.hasStyle)) continue;
      if (query.inNamespace) {
        const ns = this.ast.namespaces.get(query.inNamespace);
        if (!ns || !ns.classes.includes(cls.id)) continue;
      }
      results.push(cls);
    }
    return results;
  }

  /** Get all subclasses of a class (direct inheritance) */
  getSubclasses(classId: string): string[] {
    return this.ast.relations
      .filter((r) => r.id1 === classId && r.relation.type1 === 'extension')
      .map((r) => r.id2);
  }

  /** Get parent class (direct inheritance) */
  getParentClass(classId: string): string | undefined {
    const rel = this.ast.relations.find(
      (r) => r.id2 === classId && r.relation.type1 === 'extension'
    );
    return rel?.id1;
  }

  /** Get all ancestors (transitive inheritance) */
  getAncestors(classId: string): string[] {
    const ancestors: string[] = [];
    let current = this.getParentClass(classId);
    while (current) {
      ancestors.push(current);
      current = this.getParentClass(current);
    }
    return ancestors;
  }

  /** Get all descendants (transitive inheritance) */
  getDescendants(classId: string): string[] {
    const descendants: string[] = [];
    const queue = this.getSubclasses(classId);
    while (queue.length > 0) {
      const child = queue.shift()!;
      descendants.push(child);
      queue.push(...this.getSubclasses(child));
    }
    return descendants;
  }
}
