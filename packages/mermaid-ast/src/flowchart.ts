/**
 * Flowchart Wrapper Class
 *
 * A unified API for building, mutating, and querying flowchart diagrams.
 * Provides a fluent interface that wraps the FlowchartAST.
 *
 * @example Creating a new flowchart
 * ```typescript
 * const diagram = Flowchart.create()
 *   .addNode('A', 'Start')
 *   .addNode('B', 'End')
 *   .addLink('A', 'B');
 *
 * console.log(diagram.render());
 * ```
 *
 * @example Parsing and modifying
 * ```typescript
 * const diagram = Flowchart.parse(`flowchart LR
 *     A --> B --> C`);
 *
 * diagram.removeNode('B', { reconnect: true });
 * // Now: A --> C
 * ```
 */

import { DiagramWrapper } from './diagram-wrapper.js';
import type {
  AddLinkOptions,
  AddNodeOptions,
  FindNodesQuery,
  LinkInfo,
  RemoveNodeOptions,
} from './flowchart-types.js';
import { parseFlowchart } from './parser/flowchart-parser.js';
import { renderFlowchart } from './renderer/flowchart-renderer.js';
import type {
  FlowchartAST,
  FlowchartDirection,
  FlowchartLink,
  FlowchartLinkStroke,
  FlowchartLinkType,
  FlowchartNode,
  FlowchartNodeShape,
  FlowchartSubgraph,
} from './types/flowchart.js';
import { createEmptyFlowchartAST } from './types/flowchart.js';
import type { RenderOptions } from './types/render-options.js';

// Re-export types for convenience
export type { AddLinkOptions, AddNodeOptions, FindNodesQuery, LinkInfo, RemoveNodeOptions };

// Import graph operations (defined in separate file for organization)
import {
  extractChain,
  getAncestors,
  getChain,
  getPath,
  getReachable,
  insertBetween,
  rebaseNodes,
  removeAndReconnect,
  reverseChain,
  spliceChain,
  yankChain,
} from './flowchart-graph-ops.js';

/**
 * A fluent wrapper for FlowchartAST that supports building, mutating, and querying.
 */
export class Flowchart extends DiagramWrapper<FlowchartAST> {
  private constructor(ast: FlowchartAST) {
    super(ast);
  }

  // ============================================
  // Static Factory Methods
  // ============================================

  /**
   * Create a new empty flowchart
   * @param direction - Layout direction (default: 'TD')
   */
  static create(direction: FlowchartDirection = 'TD'): Flowchart {
    const ast = createEmptyFlowchartAST();
    ast.direction = direction;
    return new Flowchart(ast);
  }

  /**
   * Create a Flowchart wrapper from an existing AST
   * @param ast - The AST to wrap
   */
  static from(ast: FlowchartAST): Flowchart {
    return new Flowchart(ast);
  }

  /**
   * Parse Mermaid syntax and create a Flowchart wrapper
   * @param text - Mermaid flowchart syntax
   */
  static parse(text: string): Flowchart {
    const ast = parseFlowchart(text);
    return new Flowchart(ast);
  }

  // ============================================
  // Core Methods
  // ============================================

  /**
   * Render to Mermaid syntax
   * @param options - Render options
   */
  render(options?: RenderOptions): string {
    return renderFlowchart(this.ast, options);
  }

  /**
   * Create a deep clone of this flowchart
   */
  clone(): Flowchart {
    const cloned: FlowchartAST = {
      type: 'flowchart',
      direction: this.ast.direction,
      nodes: new Map(this.ast.nodes),
      links: [...this.ast.links.map((l) => ({ ...l }))],
      subgraphs: [...this.ast.subgraphs.map((s) => ({ ...s, nodes: [...s.nodes] }))],
      classDefs: new Map(this.ast.classDefs),
      classes: new Map([...this.ast.classes].map(([k, v]) => [k, [...v]])),
      clicks: [...this.ast.clicks.map((c) => ({ ...c }))],
      linkStyles: [...this.ast.linkStyles.map((ls) => ({ ...ls, styles: { ...ls.styles } }))],
      title: this.ast.title,
      accDescription: this.ast.accDescription,
    };
    return new Flowchart(cloned);
  }

  // ============================================
  // Getters
  // ============================================

  /**
   * Get the flowchart direction
   */
  get direction(): FlowchartDirection {
    return this.ast.direction;
  }

  /**
   * Set the flowchart direction
   */
  set direction(dir: FlowchartDirection) {
    this.ast.direction = dir;
  }

  /**
   * Get all node IDs
   */
  get nodeIds(): string[] {
    return [...this.ast.nodes.keys()];
  }

  /**
   * Get all nodes as an array
   */
  get nodes(): FlowchartNode[] {
    return [...this.ast.nodes.values()];
  }

  /**
   * Get all links
   */
  get links(): FlowchartLink[] {
    return this.ast.links;
  }

  /**
   * Get all subgraphs
   */
  get subgraphs(): FlowchartSubgraph[] {
    return this.ast.subgraphs;
  }

  /**
   * Get the number of nodes
   */
  get nodeCount(): number {
    return this.ast.nodes.size;
  }

  /**
   * Get the number of links
   */
  get linkCount(): number {
    return this.ast.links.length;
  }

  // ============================================
  // Node Operations
  // ============================================

  /**
   * Check if a node exists
   * @param id - Node ID
   */
  hasNode(id: string): boolean {
    return this.ast.nodes.has(id);
  }

  /**
   * Get a node by ID
   * @param id - Node ID
   * @returns The node or undefined if not found
   */
  getNode(id: string): FlowchartNode | undefined {
    return this.ast.nodes.get(id);
  }

  /**
   * Add a node to the flowchart
   * @param id - Node ID
   * @param text - Node text/label (optional, defaults to ID)
   * @param options - Additional options
   * @returns this (for chaining)
   */
  addNode(id: string, text?: string, options?: AddNodeOptions): this {
    const node: FlowchartNode = {
      id,
      shape: options?.shape ?? 'square',
    };

    if (text) {
      node.text = { text, type: 'text' };
    }

    this.ast.nodes.set(id, node);

    if (options?.classes) {
      this.ast.classes.set(id, [...options.classes]);
    }

    return this;
  }

  /**
   * Remove a node from the flowchart
   * @param id - Node ID
   * @param options - Removal options
   * @returns this (for chaining)
   */
  removeNode(id: string, options?: RemoveNodeOptions): this {
    if (!this.ast.nodes.has(id)) {
      return this;
    }

    if (options?.reconnect) {
      // Find incoming and outgoing links
      const incoming = this.ast.links.filter((l) => l.target === id);
      const outgoing = this.ast.links.filter((l) => l.source === id);

      // Create new links from each incoming source to each outgoing target
      for (const inLink of incoming) {
        for (const outLink of outgoing) {
          // Only add if not creating a self-loop
          if (inLink.source !== outLink.target) {
            this.ast.links.push({
              source: inLink.source,
              target: outLink.target,
              stroke: inLink.stroke,
              type: inLink.type,
              length: inLink.length,
              // Don't preserve text - it would be confusing
            });
          }
        }
      }
    }

    // Remove all links involving this node
    this.ast.links = this.ast.links.filter((l) => l.source !== id && l.target !== id);

    // Remove from subgraphs
    for (const subgraph of this.ast.subgraphs) {
      const idx = subgraph.nodes.indexOf(id);
      if (idx !== -1) {
        subgraph.nodes.splice(idx, 1);
      }
    }

    // Remove class assignments
    this.ast.classes.delete(id);

    // Remove clicks
    this.ast.clicks = this.ast.clicks.filter((c) => c.nodeId !== id);

    // Remove the node itself
    this.ast.nodes.delete(id);

    return this;
  }

  /**
   * Set the text of a node
   * @param id - Node ID
   * @param text - New text
   * @returns this (for chaining)
   */
  setNodeText(id: string, text: string): this {
    const node = this.ast.nodes.get(id);
    if (node) {
      node.text = { text, type: 'text' };
    }
    return this;
  }

  /**
   * Set the shape of a node
   * @param id - Node ID
   * @param shape - New shape
   * @returns this (for chaining)
   */
  setNodeShape(id: string, shape: FlowchartNodeShape): this {
    const node = this.ast.nodes.get(id);
    if (node) {
      node.shape = shape;
    }
    return this;
  }

  /**
   * Add a class to a node
   * @param id - Node ID
   * @param className - Class name to add
   * @returns this (for chaining)
   */
  addClass(id: string, className: string): this {
    const classes = this.ast.classes.get(id) || [];
    if (!classes.includes(className)) {
      classes.push(className);
      this.ast.classes.set(id, classes);
    }
    return this;
  }

  /**
   * Remove a class from a node
   * @param id - Node ID
   * @param className - Class name to remove
   * @returns this (for chaining)
   */
  removeClass(id: string, className: string): this {
    const classes = this.ast.classes.get(id);
    if (classes) {
      const idx = classes.indexOf(className);
      if (idx !== -1) {
        classes.splice(idx, 1);
        if (classes.length === 0) {
          this.ast.classes.delete(id);
        }
      }
    }
    return this;
  }

  /**
   * Get classes assigned to a node
   * @param id - Node ID
   * @returns Array of class names (empty if none)
   */
  getClasses(id: string): string[] {
    return this.ast.classes.get(id) || [];
  }

  /**
   * Find nodes matching a query
   * @param query - Query options
   * @returns Array of matching node IDs
   */
  findNodes(query: FindNodesQuery): string[] {
    const results: string[] = [];

    for (const [id, node] of this.ast.nodes) {
      // Check class
      if (query.class) {
        const classes = this.ast.classes.get(id) || [];
        if (!classes.includes(query.class)) {
          continue;
        }
      }

      // Check shape
      if (query.shape && node.shape !== query.shape) {
        continue;
      }

      // Check text contains
      if (query.textContains) {
        const text = node.text?.text || node.id;
        if (!text.includes(query.textContains)) {
          continue;
        }
      }

      // Check text matches regex
      if (query.textMatches) {
        const text = node.text?.text || node.id;
        if (!query.textMatches.test(text)) {
          continue;
        }
      }

      // Check subgraph
      if (query.inSubgraph) {
        const subgraph = this.ast.subgraphs.find((s) => s.id === query.inSubgraph);
        if (!subgraph || !subgraph.nodes.includes(id)) {
          continue;
        }
      }

      results.push(id);
    }

    return results;
  }

  // ============================================
  // Link Operations
  // ============================================

  /**
   * Add a link between two nodes
   * @param source - Source node ID
   * @param target - Target node ID
   * @param options - Link options
   * @returns this (for chaining)
   */
  addLink(source: string, target: string, options?: AddLinkOptions): this {
    const link: FlowchartLink = {
      source,
      target,
      type: options?.type ?? 'arrow_point',
      stroke: options?.stroke ?? 'normal',
      length: options?.length ?? 1,
    };

    if (options?.text) {
      link.text = { text: options.text, type: 'text' };
    }

    this.ast.links.push(link);
    return this;
  }

  /**
   * Remove a link by index
   * @param index - Link index
   * @returns this (for chaining)
   */
  removeLink(index: number): this {
    if (index >= 0 && index < this.ast.links.length) {
      this.ast.links.splice(index, 1);
    }
    return this;
  }

  /**
   * Remove all links between two nodes
   * @param source - Source node ID
   * @param target - Target node ID
   * @returns this (for chaining)
   */
  removeLinksBetween(source: string, target: string): this {
    this.ast.links = this.ast.links.filter((l) => !(l.source === source && l.target === target));
    return this;
  }

  /**
   * Get a link by index
   * @param index - Link index
   * @returns The link or undefined
   */
  getLink(index: number): FlowchartLink | undefined {
    return this.ast.links[index];
  }

  /**
   * Flip the direction of a link
   * @param index - Link index
   * @returns this (for chaining)
   */
  flipLink(index: number): this {
    const link = this.ast.links[index];
    if (link) {
      const temp = link.source;
      link.source = link.target;
      link.target = temp;
    }
    return this;
  }

  /**
   * Set the type of a link
   * @param index - Link index
   * @param type - New arrow type
   * @returns this (for chaining)
   */
  setLinkType(index: number, type: FlowchartLinkType): this {
    const link = this.ast.links[index];
    if (link) {
      link.type = type;
    }
    return this;
  }

  /**
   * Set the stroke style of a link
   * @param index - Link index
   * @param stroke - New stroke style
   * @returns this (for chaining)
   */
  setLinkStroke(index: number, stroke: FlowchartLinkStroke): this {
    const link = this.ast.links[index];
    if (link) {
      link.stroke = stroke;
    }
    return this;
  }

  /**
   * Set the text of a link
   * @param index - Link index
   * @param text - New text (or undefined to remove)
   * @returns this (for chaining)
   */
  setLinkText(index: number, text: string | undefined): this {
    const link = this.ast.links[index];
    if (link) {
      if (text) {
        link.text = { text, type: 'text' };
      } else {
        link.text = undefined;
      }
    }
    return this;
  }

  /**
   * Get all links from a node (outgoing)
   * @param nodeId - Node ID
   * @returns Array of link info with indices
   */
  getLinksFrom(nodeId: string): LinkInfo[] {
    return this.ast.links
      .map((link, index) => ({ index, link }))
      .filter(({ link }) => link.source === nodeId);
  }

  /**
   * Get all links to a node (incoming)
   * @param nodeId - Node ID
   * @returns Array of link info with indices
   */
  getLinksTo(nodeId: string): LinkInfo[] {
    return this.ast.links
      .map((link, index) => ({ index, link }))
      .filter(({ link }) => link.target === nodeId);
  }

  /**
   * Add links from multiple sources to one target
   * @param sources - Array of source node IDs
   * @param target - Target node ID
   * @param options - Link options
   * @returns this (for chaining)
   */
  addLinksFromMany(sources: string[], target: string, options?: AddLinkOptions): this {
    for (const source of sources) {
      this.addLink(source, target, options);
    }
    return this;
  }

  /**
   * Add links from one source to multiple targets
   * @param source - Source node ID
   * @param targets - Array of target node IDs
   * @param options - Link options
   * @returns this (for chaining)
   */
  addLinksToMany(source: string, targets: string[], options?: AddLinkOptions): this {
    for (const target of targets) {
      this.addLink(source, target, options);
    }
    return this;
  }

  // ============================================
  // Subgraph Operations
  // ============================================

  /**
   * Create a new subgraph
   * @param id - Subgraph ID
   * @param nodeIds - Node IDs to include
   * @param title - Optional title (defaults to ID)
   * @returns this (for chaining)
   */
  createSubgraph(id: string, nodeIds: string[], title?: string): this {
    // Remove nodes from any existing subgraphs
    for (const subgraph of this.ast.subgraphs) {
      subgraph.nodes = subgraph.nodes.filter((n) => !nodeIds.includes(n));
    }

    const subgraph: FlowchartSubgraph = {
      id,
      nodes: [...nodeIds],
    };

    if (title) {
      subgraph.title = { text: title, type: 'text' };
    }

    this.ast.subgraphs.push(subgraph);
    return this;
  }

  /**
   * Dissolve a subgraph (remove it but keep its nodes)
   * @param id - Subgraph ID
   * @returns this (for chaining)
   */
  dissolveSubgraph(id: string): this {
    const idx = this.ast.subgraphs.findIndex((s) => s.id === id);
    if (idx !== -1) {
      this.ast.subgraphs.splice(idx, 1);
    }
    return this;
  }

  /**
   * Move nodes to a subgraph
   * @param nodeIds - Node IDs to move
   * @param subgraphId - Target subgraph ID
   * @returns this (for chaining)
   */
  moveToSubgraph(nodeIds: string[], subgraphId: string): this {
    // Remove from all subgraphs first
    for (const subgraph of this.ast.subgraphs) {
      subgraph.nodes = subgraph.nodes.filter((n) => !nodeIds.includes(n));
    }

    // Add to target subgraph
    const target = this.ast.subgraphs.find((s) => s.id === subgraphId);
    if (target) {
      target.nodes.push(...nodeIds);
    }

    return this;
  }

  /**
   * Extract nodes from their subgraph to the root level
   * @param nodeIds - Node IDs to extract
   * @returns this (for chaining)
   */
  extractFromSubgraph(nodeIds: string[]): this {
    for (const subgraph of this.ast.subgraphs) {
      subgraph.nodes = subgraph.nodes.filter((n) => !nodeIds.includes(n));
    }
    return this;
  }

  /**
   * Merge one subgraph into another
   * @param sourceId - Subgraph to merge from (will be dissolved)
   * @param targetId - Subgraph to merge into
   * @returns this (for chaining)
   */
  mergeSubgraphs(sourceId: string, targetId: string): this {
    const source = this.ast.subgraphs.find((s) => s.id === sourceId);
    const target = this.ast.subgraphs.find((s) => s.id === targetId);

    if (source && target) {
      target.nodes.push(...source.nodes);
      this.dissolveSubgraph(sourceId);
    }

    return this;
  }

  /**
   * Get a subgraph by ID
   * @param id - Subgraph ID
   * @returns The subgraph or undefined
   */
  getSubgraph(id: string): FlowchartSubgraph | undefined {
    return this.ast.subgraphs.find((s) => s.id === id);
  }

  // ============================================
  // Graph Operations (from flowchart-graph-ops.ts)
  // ============================================

  /** Insert a node between two connected nodes */
  insertBetween = insertBetween;

  /** Remove a node and reconnect its neighbors */
  removeAndReconnect = removeAndReconnect;

  /** Get all nodes reachable from a starting node */
  getReachable = getReachable;

  /** Get all nodes that can reach a target node */
  getAncestors = getAncestors;

  /** Get the shortest path between two nodes */
  getPath = getPath;

  /** Get a linear chain of nodes between two points */
  getChain = getChain;

  /** Remove a chain of nodes and reconnect around them */
  yankChain = yankChain;

  /** Splice a chain of existing nodes between two points */
  spliceChain = spliceChain;

  /** Reverse the direction of all links in a chain */
  reverseChain = reverseChain;

  /** Extract a subchain from the graph as a new Flowchart */
  extractChain = extractChain;

  /** Move a set of nodes to be children of a new parent */
  rebaseNodes = rebaseNodes;
}
