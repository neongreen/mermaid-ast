/**
 * Mindmap Wrapper Class
 *
 * A unified API for building, mutating, and querying mindmap diagrams.
 * Provides a fluent interface that wraps the MindmapAST.
 */

import { DiagramWrapper } from './diagram-wrapper.js';
import { parseMindmap } from './parser/mindmap-parser.js';
import { renderMindmap } from './renderer/mindmap-renderer.js';
import type { MindmapAST, MindmapNode, MindmapNodeShape } from './types/mindmap.js';
import { createEmptyMindmapAST } from './types/mindmap.js';
import type { RenderOptions } from './types/render-options.js';

/**
 * Options for adding a node
 */
export interface AddMindmapNodeOptions {
  /** Node shape (default: 'default') */
  shape?: MindmapNodeShape;
  /** Icon */
  icon?: string;
  /** CSS class */
  cssClass?: string;
}

/**
 * Query options for finding nodes
 */
export interface FindMindmapNodesQuery {
  /** Find nodes with this shape */
  shape?: MindmapNodeShape;
  /** Find nodes whose description contains this string */
  textContains?: string;
  /** Find nodes with this icon */
  icon?: string;
  /** Find nodes with this CSS class */
  cssClass?: string;
  /** Find nodes at this level */
  level?: number;
}

/**
 * A fluent wrapper for MindmapAST that supports building, mutating, and querying.
 */
export class Mindmap extends DiagramWrapper<MindmapAST> {
  private constructor(ast: MindmapAST) {
    super(ast);
  }

  // ============================================
  // Static Factory Methods
  // ============================================

  /**
   * Create a new mindmap with a root node
   */
  static create(
    rootId: string,
    rootDescription?: string,
    options?: AddMindmapNodeOptions
  ): Mindmap {
    const ast = createEmptyMindmapAST();
    ast.root = {
      id: rootId,
      description: rootDescription ?? rootId,
      shape: options?.shape ?? 'default',
      icon: options?.icon,
      cssClass: options?.cssClass,
      level: 0,
      children: [],
    };
    return new Mindmap(ast);
  }

  /**
   * Create a Mindmap wrapper from an existing AST
   */
  static from(ast: MindmapAST): Mindmap {
    return new Mindmap(ast);
  }

  /**
   * Parse Mermaid syntax and create a Mindmap wrapper
   */
  static parse(text: string): Mindmap {
    const ast = parseMindmap(text);
    return new Mindmap(ast);
  }

  // ============================================
  // Core Methods
  // ============================================

  /**
   * Render to Mermaid syntax
   */
  render(options?: RenderOptions): string {
    return renderMindmap(this.ast, options);
  }

  /**
   * Create a deep clone of this mindmap
   */
  clone(): Mindmap {
    const cloneNode = (node: MindmapNode): MindmapNode => ({
      ...node,
      children: node.children.map(cloneNode),
    });

    const cloned: MindmapAST = {
      type: 'mindmap',
      root: this.ast.root ? cloneNode(this.ast.root) : undefined,
      accTitle: this.ast.accTitle,
      accDescription: this.ast.accDescription,
    };
    return new Mindmap(cloned);
  }

  // ============================================
  // Getters
  // ============================================

  /**
   * Get the root node
   */
  get root(): MindmapNode | undefined {
    return this.ast.root;
  }

  /**
   * Get total node count
   */
  get nodeCount(): number {
    if (!this.ast.root) return 0;

    const countNodes = (node: MindmapNode): number => {
      return 1 + node.children.reduce((sum, child) => sum + countNodes(child), 0);
    };

    return countNodes(this.ast.root);
  }

  /**
   * Get maximum depth of the tree
   */
  get maxDepth(): number {
    if (!this.ast.root) return 0;

    const getDepth = (node: MindmapNode): number => {
      if (node.children.length === 0) return 1;
      return 1 + Math.max(...node.children.map(getDepth));
    };

    return getDepth(this.ast.root);
  }

  // ============================================
  // Node Operations
  // ============================================

  /**
   * Find a node by ID
   */
  getNode(id: string): MindmapNode | undefined {
    if (!this.ast.root) return undefined;

    const findNode = (node: MindmapNode): MindmapNode | undefined => {
      if (node.id === id) return node;
      for (const child of node.children) {
        const found = findNode(child);
        if (found) return found;
      }
      return undefined;
    };

    return findNode(this.ast.root);
  }

  /**
   * Find the parent of a node
   */
  getParent(id: string): MindmapNode | undefined {
    if (!this.ast.root) return undefined;

    const findParent = (node: MindmapNode, targetId: string): MindmapNode | undefined => {
      for (const child of node.children) {
        if (child.id === targetId) return node;
        const found = findParent(child, targetId);
        if (found) return found;
      }
      return undefined;
    };

    return findParent(this.ast.root, id);
  }

  /**
   * Add a child node to a parent
   */
  addChild(
    parentId: string,
    childId: string,
    description?: string,
    options?: AddMindmapNodeOptions
  ): this {
    const parent = this.getNode(parentId);
    if (parent) {
      parent.children.push({
        id: childId,
        description: description ?? childId,
        shape: options?.shape ?? 'default',
        icon: options?.icon,
        cssClass: options?.cssClass,
        level: parent.level + 1,
        children: [],
      });
    }
    return this;
  }

  /**
   * Remove a node and all its children
   */
  removeNode(id: string): this {
    if (!this.ast.root) return this;

    if (this.ast.root.id === id) {
      this.ast.root = undefined;
      return this;
    }

    const parent = this.getParent(id);
    if (parent) {
      const idx = parent.children.findIndex((c) => c.id === id);
      if (idx !== -1) {
        parent.children.splice(idx, 1);
      }
    }
    return this;
  }

  /**
   * Set node description
   */
  setDescription(id: string, description: string): this {
    const node = this.getNode(id);
    if (node) {
      node.description = description;
    }
    return this;
  }

  /**
   * Set node shape
   */
  setShape(id: string, shape: MindmapNodeShape): this {
    const node = this.getNode(id);
    if (node) {
      node.shape = shape;
    }
    return this;
  }

  /**
   * Set node icon
   */
  setIcon(id: string, icon: string): this {
    const node = this.getNode(id);
    if (node) {
      node.icon = icon;
    }
    return this;
  }

  /**
   * Remove node icon
   */
  removeIcon(id: string): this {
    const node = this.getNode(id);
    if (node) {
      node.icon = undefined;
    }
    return this;
  }

  /**
   * Set node CSS class
   */
  setClass(id: string, cssClass: string): this {
    const node = this.getNode(id);
    if (node) {
      node.cssClass = cssClass;
    }
    return this;
  }

  /**
   * Remove node CSS class
   */
  removeClass(id: string): this {
    const node = this.getNode(id);
    if (node) {
      node.cssClass = undefined;
    }
    return this;
  }

  /**
   * Move a node to a new parent
   */
  moveNode(id: string, newParentId: string): this {
    if (!this.ast.root || id === this.ast.root.id) return this;

    const node = this.getNode(id);
    const newParent = this.getNode(newParentId);
    const oldParent = this.getParent(id);

    if (node && newParent && oldParent) {
      // Remove from old parent
      const idx = oldParent.children.findIndex((c) => c.id === id);
      if (idx !== -1) {
        oldParent.children.splice(idx, 1);
      }

      // Update levels recursively
      const updateLevels = (n: MindmapNode, level: number): void => {
        n.level = level;
        for (const child of n.children) {
          updateLevels(child, level + 1);
        }
      };

      // Add to new parent
      node.level = newParent.level + 1;
      updateLevels(node, node.level);
      newParent.children.push(node);
    }
    return this;
  }

  // ============================================
  // Query Operations
  // ============================================

  /**
   * Get all nodes as a flat array
   */
  getAllNodes(): MindmapNode[] {
    if (!this.ast.root) return [];

    const nodes: MindmapNode[] = [];
    const collect = (node: MindmapNode): void => {
      nodes.push(node);
      for (const child of node.children) {
        collect(child);
      }
    };

    collect(this.ast.root);
    return nodes;
  }

  /**
   * Find nodes matching a query
   */
  findNodes(query: FindMindmapNodesQuery): MindmapNode[] {
    return this.getAllNodes().filter((node) => {
      if (query.shape && node.shape !== query.shape) return false;
      if (query.textContains && !node.description.includes(query.textContains)) return false;
      if (query.icon && node.icon !== query.icon) return false;
      if (query.cssClass && node.cssClass !== query.cssClass) return false;
      if (query.level !== undefined && node.level !== query.level) return false;
      return true;
    });
  }

  /**
   * Get all nodes at a specific level
   */
  getNodesAtLevel(level: number): MindmapNode[] {
    return this.findNodes({ level });
  }

  /**
   * Get all leaf nodes (nodes with no children)
   */
  getLeafNodes(): MindmapNode[] {
    return this.getAllNodes().filter((node) => node.children.length === 0);
  }

  /**
   * Get the path from root to a node
   */
  getPath(id: string): MindmapNode[] {
    if (!this.ast.root) return [];

    const findPath = (
      node: MindmapNode,
      targetId: string,
      path: MindmapNode[]
    ): MindmapNode[] | null => {
      path.push(node);
      if (node.id === targetId) return path;

      for (const child of node.children) {
        const result = findPath(child, targetId, [...path]);
        if (result) return result;
      }

      return null;
    };

    return findPath(this.ast.root, id, []) ?? [];
  }

  /**
   * Get siblings of a node
   */
  getSiblings(id: string): MindmapNode[] {
    const parent = this.getParent(id);
    if (!parent) return [];
    return parent.children.filter((c) => c.id !== id);
  }
}
