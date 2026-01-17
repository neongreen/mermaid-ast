/**
 * Sankey Diagram Wrapper Class
 *
 * A unified API for building, mutating, and querying sankey diagrams.
 * Provides a fluent interface that wraps the SankeyAST.
 */

import { DiagramWrapper } from './diagram-wrapper.js';
import { parseSankey } from './parser/sankey-parser.js';
import { renderSankey } from './renderer/sankey-renderer.js';
import type { RenderOptions } from './types/render-options.js';
import type { SankeyAST, SankeyLink, SankeyNode } from './types/sankey.js';
import { createEmptySankeyAST } from './types/sankey.js';

/**
 * Query options for finding nodes
 */
export interface FindSankeyNodesQuery {
  /** Find nodes whose label contains this string */
  labelContains?: string;
}

/**
 * Query options for finding links
 */
export interface FindSankeyLinksQuery {
  /** Find links from this source */
  source?: string;
  /** Find links to this target */
  target?: string;
  /** Find links with value greater than this */
  minValue?: number;
  /** Find links with value less than this */
  maxValue?: number;
}

/**
 * A fluent wrapper for SankeyAST that supports building, mutating, and querying.
 */
export class Sankey extends DiagramWrapper<SankeyAST> {
  private constructor(ast: SankeyAST) {
    super(ast);
  }

  // ============================================
  // Static Factory Methods
  // ============================================

  /**
   * Create a new empty sankey diagram
   */
  static create(): Sankey {
    const ast = createEmptySankeyAST();
    return new Sankey(ast);
  }

  /**
   * Create a Sankey wrapper from an existing AST
   */
  static from(ast: SankeyAST): Sankey {
    return new Sankey(ast);
  }

  /**
   * Parse Mermaid syntax and create a Sankey wrapper
   */
  static parse(text: string): Sankey {
    const ast = parseSankey(text);
    return new Sankey(ast);
  }

  // ============================================
  // Core Methods
  // ============================================

  /**
   * Render to Mermaid syntax
   */
  render(options?: RenderOptions): string {
    return renderSankey(this.ast, options);
  }

  /**
   * Create a deep clone of this sankey diagram
   */
  clone(): Sankey {
    const cloned: SankeyAST = {
      type: 'sankey',
      nodes: new Map(Array.from(this.ast.nodes.entries()).map(([id, node]) => [id, { ...node }])),
      links: this.ast.links.map((link) => ({ ...link })),
    };
    return new Sankey(cloned);
  }

  // ============================================
  // Getters
  // ============================================

  /**
   * Get all nodes as an array
   */
  get nodes(): SankeyNode[] {
    return Array.from(this.ast.nodes.values());
  }

  /**
   * Get all links
   */
  get links(): SankeyLink[] {
    return this.ast.links;
  }

  /**
   * Get node count
   */
  get nodeCount(): number {
    return this.ast.nodes.size;
  }

  /**
   * Get link count
   */
  get linkCount(): number {
    return this.ast.links.length;
  }

  // ============================================
  // Node Operations
  // ============================================

  /**
   * Add a node
   */
  addNode(id: string, label?: string): this {
    this.ast.nodes.set(id, {
      id,
      label: label || id,
    });
    return this;
  }

  /**
   * Get a node by ID
   */
  getNode(id: string): SankeyNode | undefined {
    return this.ast.nodes.get(id);
  }

  /**
   * Remove a node and all its connected links
   */
  removeNode(id: string): this {
    this.ast.nodes.delete(id);
    // Remove all links connected to this node
    this.ast.links = this.ast.links.filter((link) => link.source !== id && link.target !== id);
    return this;
  }

  /**
   * Update node label
   */
  updateNodeLabel(id: string, label: string): this {
    const node = this.ast.nodes.get(id);
    if (node) {
      node.label = label;
    }
    return this;
  }

  // ============================================
  // Link Operations
  // ============================================

  /**
   * Add a link between two nodes
   */
  addLink(source: string, target: string, value: number): this {
    // Create nodes if they don't exist
    if (!this.ast.nodes.has(source)) {
      this.addNode(source);
    }
    if (!this.ast.nodes.has(target)) {
      this.addNode(target);
    }

    this.ast.links.push({
      source,
      target,
      value,
    });
    return this;
  }

  /**
   * Get all links from a source node
   */
  getLinksFrom(source: string): SankeyLink[] {
    return this.ast.links.filter((link) => link.source === source);
  }

  /**
   * Get all links to a target node
   */
  getLinksTo(target: string): SankeyLink[] {
    return this.ast.links.filter((link) => link.target === target);
  }

  /**
   * Remove a specific link
   */
  removeLink(source: string, target: string): this {
    const idx = this.ast.links.findIndex(
      (link) => link.source === source && link.target === target
    );
    if (idx !== -1) {
      this.ast.links.splice(idx, 1);
    }
    return this;
  }

  /**
   * Update link value
   */
  updateLinkValue(source: string, target: string, value: number): this {
    const link = this.ast.links.find((l) => l.source === source && l.target === target);
    if (link) {
      link.value = value;
    }
    return this;
  }

  // ============================================
  // Query Operations
  // ============================================

  /**
   * Find nodes matching a query
   */
  findNodes(query: FindSankeyNodesQuery): SankeyNode[] {
    let nodes = this.nodes;

    if (query.labelContains) {
      nodes = nodes.filter((node) => node.label.includes(query.labelContains!));
    }

    return nodes;
  }

  /**
   * Find links matching a query
   */
  findLinks(query: FindSankeyLinksQuery): SankeyLink[] {
    let links = this.ast.links;

    if (query.source) {
      links = links.filter((link) => link.source === query.source);
    }

    if (query.target) {
      links = links.filter((link) => link.target === query.target);
    }

    if (query.minValue !== undefined) {
      links = links.filter((link) => link.value >= query.minValue!);
    }

    if (query.maxValue !== undefined) {
      links = links.filter((link) => link.value <= query.maxValue!);
    }

    return links;
  }

  /**
   * Get total flow value (sum of all link values)
   */
  getTotalFlow(): number {
    return this.ast.links.reduce((sum, link) => sum + link.value, 0);
  }
}
