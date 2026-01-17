/**
 * Kanban Diagram Wrapper Class
 *
 * A unified API for building, mutating, and querying kanban diagrams.
 * Provides a fluent interface that wraps the KanbanAST.
 */

import { DiagramWrapper } from './diagram-wrapper.js';
import { parseKanban } from './parser/kanban-parser.js';
import { renderKanban } from './renderer/kanban-renderer.js';
import type { KanbanAST, KanbanNode } from './types/kanban.js';
import { KanbanNodeType, createEmptyKanbanAST } from './types/kanban.js';
import type { RenderOptions } from './types/render-options.js';

/**
 * Options for adding a node
 */
export interface AddKanbanNodeOptions {
  /** Node shape type */
  type?: KanbanNodeType;
  /** Optional icon */
  icon?: string;
  /** Optional CSS class */
  class?: string;
  /** Optional shape data */
  shapeData?: string;
}

/**
 * Query options for finding nodes
 */
export interface FindKanbanNodesQuery {
  /** Find nodes with this type */
  type?: KanbanNodeType;
  /** Find nodes with this icon */
  icon?: string;
  /** Find nodes with this class */
  class?: string;
  /** Find nodes whose description contains this string */
  descrContains?: string;
  /** Find nodes at this indent level */
  indent?: number;
}

/**
 * A fluent wrapper for KanbanAST that supports building, mutating, and querying.
 */
export class Kanban extends DiagramWrapper<KanbanAST> {
  private constructor(ast: KanbanAST) {
    super(ast);
  }

  // ============================================
  // Static Factory Methods
  // ============================================

  /**
   * Create a new empty kanban diagram
   */
  static create(): Kanban {
    const ast = createEmptyKanbanAST();
    return new Kanban(ast);
  }

  /**
   * Create a Kanban wrapper from an existing AST
   */
  static from(ast: KanbanAST): Kanban {
    return new Kanban(ast);
  }

  /**
   * Parse Mermaid syntax and create a Kanban wrapper
   */
  static parse(text: string): Kanban {
    const ast = parseKanban(text);
    return new Kanban(ast);
  }

  // ============================================
  // Core Methods
  // ============================================

  /**
   * Render to Mermaid syntax
   */
  render(options?: RenderOptions): string {
    return renderKanban(this.ast, options);
  }

  /**
   * Create a deep clone of this kanban
   */
  clone(): Kanban {
    const cloneNode = (node: KanbanNode): KanbanNode => ({
      ...node,
      children: node.children.map(cloneNode),
    });

    const cloned: KanbanAST = {
      type: 'kanban',
      nodes: this.ast.nodes.map(cloneNode),
    };
    return new Kanban(cloned);
  }

  // ============================================
  // Getters
  // ============================================

  /**
   * Get all root-level nodes
   */
  get nodes(): KanbanNode[] {
    return this.ast.nodes;
  }

  /**
   * Get total node count (including children)
   */
  get nodeCount(): number {
    const countNodes = (nodes: KanbanNode[]): number => {
      return nodes.reduce((sum, node) => sum + 1 + countNodes(node.children), 0);
    };
    return countNodes(this.ast.nodes);
  }

  // ============================================
  // Node Operations
  // ============================================

  /**
   * Add a root-level node
   */
  addNode(id: string, descr?: string, options?: AddKanbanNodeOptions): this {
    const node: KanbanNode = {
      id,
      descr: descr ?? id,
      type: options?.type ?? KanbanNodeType.SQUARE,
      indent: 0,
      children: [],
    };

    if (options?.icon) node.icon = options.icon;
    if (options?.class) node.class = options.class;
    if (options?.shapeData) node.shapeData = options.shapeData;

    this.ast.nodes.push(node);
    return this;
  }

  /**
   * Add a child node to a parent
   */
  addChild(parentId: string, id: string, descr?: string, options?: AddKanbanNodeOptions): this {
    const parent = this.findNodeById(parentId);
    if (!parent) {
      throw new Error(`Parent node with id "${parentId}" not found`);
    }

    const node: KanbanNode = {
      id,
      descr: descr ?? id,
      type: options?.type ?? KanbanNodeType.SQUARE,
      indent: parent.indent + 1,
      children: [],
    };

    if (options?.icon) node.icon = options.icon;
    if (options?.class) node.class = options.class;
    if (options?.shapeData) node.shapeData = options.shapeData;

    parent.children.push(node);
    return this;
  }

  /**
   * Find a node by ID (searches recursively)
   */
  findNodeById(id: string): KanbanNode | undefined {
    const search = (nodes: KanbanNode[]): KanbanNode | undefined => {
      for (const node of nodes) {
        if (node.id === id) return node;
        const found = search(node.children);
        if (found) return found;
      }
      return undefined;
    };
    return search(this.ast.nodes);
  }

  /**
   * Remove a node by ID
   */
  removeNode(id: string): this {
    const removeFrom = (nodes: KanbanNode[]): boolean => {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === id) {
          nodes.splice(i, 1);
          return true;
        }
        if (removeFrom(nodes[i].children)) {
          return true;
        }
      }
      return false;
    };

    removeFrom(this.ast.nodes);
    return this;
  }

  /**
   * Set node description
   */
  setNodeDescr(id: string, descr: string): this {
    const node = this.findNodeById(id);
    if (node) {
      node.descr = descr;
    }
    return this;
  }

  /**
   * Set node type
   */
  setNodeType(id: string, type: KanbanNodeType): this {
    const node = this.findNodeById(id);
    if (node) {
      node.type = type;
    }
    return this;
  }

  /**
   * Set node icon
   */
  setNodeIcon(id: string, icon: string): this {
    const node = this.findNodeById(id);
    if (node) {
      node.icon = icon;
    }
    return this;
  }

  /**
   * Remove node icon
   */
  removeNodeIcon(id: string): this {
    const node = this.findNodeById(id);
    if (node) {
      delete node.icon;
    }
    return this;
  }

  /**
   * Set node class
   */
  setNodeClass(id: string, className: string): this {
    const node = this.findNodeById(id);
    if (node) {
      node.class = className;
    }
    return this;
  }

  /**
   * Remove node class
   */
  removeNodeClass(id: string): this {
    const node = this.findNodeById(id);
    if (node) {
      delete node.class;
    }
    return this;
  }

  // ============================================
  // Query Operations
  // ============================================

  /**
   * Get all nodes (flattened, including children)
   */
  getAllNodes(): KanbanNode[] {
    const collect = (nodes: KanbanNode[]): KanbanNode[] => {
      return nodes.flatMap((node) => [node, ...collect(node.children)]);
    };
    return collect(this.ast.nodes);
  }

  /**
   * Find nodes matching a query
   */
  findNodes(query: FindKanbanNodesQuery): KanbanNode[] {
    const nodes = this.getAllNodes();

    return nodes.filter((node) => {
      if (query.type !== undefined && node.type !== query.type) return false;
      if (query.icon !== undefined && node.icon !== query.icon) return false;
      if (query.class !== undefined && node.class !== query.class) return false;
      if (query.descrContains && !node.descr.includes(query.descrContains)) return false;
      if (query.indent !== undefined && node.indent !== query.indent) return false;
      return true;
    });
  }

  /**
   * Get children of a node
   */
  getChildren(id: string): KanbanNode[] {
    const node = this.findNodeById(id);
    return node ? node.children : [];
  }

  /**
   * Get parent of a node
   */
  getParent(id: string): KanbanNode | undefined {
    const findParent = (nodes: KanbanNode[], targetId: string): KanbanNode | undefined => {
      for (const node of nodes) {
        if (node.children.some((child) => child.id === targetId)) {
          return node;
        }
        const found = findParent(node.children, targetId);
        if (found) return found;
      }
      return undefined;
    };
    return findParent(this.ast.nodes, id);
  }

  /**
   * Get all leaf nodes (nodes with no children)
   */
  getLeafNodes(): KanbanNode[] {
    return this.getAllNodes().filter((node) => node.children.length === 0);
  }

  /**
   * Get depth of the tree
   */
  getDepth(): number {
    const getMaxDepth = (nodes: KanbanNode[], currentDepth: number): number => {
      if (nodes.length === 0) return currentDepth;
      return Math.max(...nodes.map((node) => getMaxDepth(node.children, currentDepth + 1)));
    };
    return getMaxDepth(this.ast.nodes, 0);
  }
}
