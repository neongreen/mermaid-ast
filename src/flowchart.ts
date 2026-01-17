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

/**
 * Options for adding a node
 */
export interface AddNodeOptions {
  /** Node shape (default: 'square') */
  shape?: FlowchartNodeShape;
  /** CSS classes to apply */
  classes?: string[];
}

/**
 * Options for adding a link
 */
export interface AddLinkOptions {
  /** Link text/label */
  text?: string;
  /** Arrow type (default: 'arrow_point') */
  type?: FlowchartLinkType;
  /** Line stroke style (default: 'normal') */
  stroke?: FlowchartLinkStroke;
  /** Arrow length - affects spacing (default: 1) */
  length?: number;
}

/**
 * Options for removing a node
 */
export interface RemoveNodeOptions {
  /** If true, reconnect the node's incoming links to its outgoing targets */
  reconnect?: boolean;
}

/**
 * Query options for finding nodes
 */
export interface FindNodesQuery {
  /** Find nodes with this class */
  class?: string;
  /** Find nodes with this shape */
  shape?: FlowchartNodeShape;
  /** Find nodes whose text contains this string */
  textContains?: string;
  /** Find nodes whose text matches this regex */
  textMatches?: RegExp;
  /** Find nodes in this subgraph */
  inSubgraph?: string;
}

/**
 * Information about a link with its index
 */
export interface LinkInfo {
  index: number;
  link: FlowchartLink;
}

/**
 * A fluent wrapper for FlowchartAST that supports building, mutating, and querying.
 */
export class Flowchart {
  private ast: FlowchartAST;

  private constructor(ast: FlowchartAST) {
    this.ast = ast;
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
   * Get the underlying AST
   */
  toAST(): FlowchartAST {
    return this.ast;
  }

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
        delete link.text;
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
  // Graph Surgery (jj-style operations)
  // ============================================

  /**
   * Insert a node between two connected nodes
   * If A --> B exists, insertBetween('X', 'A', 'B') creates A --> X --> B
   * @param newNodeId - ID for the new node
   * @param source - Source node ID
   * @param target - Target node ID
   * @param nodeText - Optional text for the new node
   * @returns this (for chaining)
   */
  insertBetween(newNodeId: string, source: string, target: string, nodeText?: string): this {
    // Find the link to splice
    const linkIndex = this.ast.links.findIndex((l) => l.source === source && l.target === target);

    if (linkIndex === -1) {
      // No direct link exists, just add the node and links
      this.addNode(newNodeId, nodeText);
      this.addLink(source, newNodeId);
      this.addLink(newNodeId, target);
      return this;
    }

    const originalLink = this.ast.links[linkIndex];

    // Add the new node
    this.addNode(newNodeId, nodeText);

    // Create source --> new link (preserve original link properties)
    this.ast.links.push({
      source,
      target: newNodeId,
      type: originalLink.type,
      stroke: originalLink.stroke,
      length: originalLink.length,
      text: originalLink.text, // Keep text on first link
    });

    // Create new --> target link
    this.ast.links.push({
      source: newNodeId,
      target,
      type: originalLink.type,
      stroke: originalLink.stroke,
      length: originalLink.length,
    });

    // Remove original link
    this.ast.links.splice(linkIndex, 1);

    return this;
  }

  /**
   * Remove a node and reconnect its neighbors
   * If A --> B --> C, removeAndReconnect('B') creates A --> C
   * @param nodeId - Node ID to remove
   * @returns this (for chaining)
   */
  removeAndReconnect(nodeId: string): this {
    return this.removeNode(nodeId, { reconnect: true });
  }

  /**
   * Get all nodes that can be reached from a starting node
   * @param startId - Starting node ID
   * @returns Array of reachable node IDs (including start)
   */
  getReachable(startId: string): string[] {
    const visited = new Set<string>();
    const queue = [startId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);

      for (const link of this.ast.links) {
        if (link.source === current && !visited.has(link.target)) {
          queue.push(link.target);
        }
      }
    }

    return [...visited];
  }

  /**
   * Get all nodes that can reach a target node
   * @param targetId - Target node ID
   * @returns Array of node IDs that can reach target (including target)
   */
  getAncestors(targetId: string): string[] {
    const visited = new Set<string>();
    const queue = [targetId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);

      for (const link of this.ast.links) {
        if (link.target === current && !visited.has(link.source)) {
          queue.push(link.source);
        }
      }
    }

    return [...visited];
  }

  /**
   * Get the shortest path between two nodes
   * @param source - Source node ID
   * @param target - Target node ID
   * @returns Array of node IDs representing the path, or empty if no path exists
   */
  getPath(source: string, target: string): string[] {
    if (source === target) return [source];

    const visited = new Set<string>();
    const queue: { node: string; path: string[] }[] = [{ node: source, path: [source] }];

    while (queue.length > 0) {
      const { node, path } = queue.shift()!;
      if (visited.has(node)) continue;
      visited.add(node);

      for (const link of this.ast.links) {
        if (link.source === node) {
          const newPath = [...path, link.target];
          if (link.target === target) {
            return newPath;
          }
          if (!visited.has(link.target)) {
            queue.push({ node: link.target, path: newPath });
          }
        }
      }
    }

    return [];
  }

  // ============================================
  // Chain Operations (jj-style)
  // ============================================

  /**
   * Get a linear chain of nodes between two points.
   * Only works if there's a single path (no branching).
   * @param startId - Start node ID
   * @param endId - End node ID
   * @returns Array of node IDs in the chain, or empty if no linear chain exists
   */
  getChain(startId: string, endId: string): string[] {
    if (startId === endId) return [startId];

    const chain: string[] = [startId];
    let current = startId;

    while (current !== endId) {
      const outgoing = this.ast.links.filter((l) => l.source === current);

      // Must have exactly one outgoing link for a linear chain
      if (outgoing.length !== 1) {
        return [];
      }

      const next = outgoing[0].target;
      chain.push(next);
      current = next;

      // Prevent infinite loops
      if (chain.length > this.ast.nodes.size) {
        return [];
      }
    }

    return chain;
  }

  /**
   * Yank (remove) a chain of nodes and reconnect around them.
   * If we have X -> A -> B -> C -> Y and we yank [A, B, C], we get X -> Y.
   * @param nodeIds - Array of node IDs to remove (must be connected in order)
   * @returns this (for chaining)
   */
  yankChain(nodeIds: string[]): this {
    if (nodeIds.length === 0) return this;

    const firstNode = nodeIds[0];
    const lastNode = nodeIds[nodeIds.length - 1];

    // Find all incoming links to the first node (from outside the chain)
    const incomingSources = this.ast.links
      .filter((l) => l.target === firstNode && !nodeIds.includes(l.source))
      .map((l) => ({ source: l.source, link: l }));

    // Find all outgoing links from the last node (to outside the chain)
    const outgoingTargets = this.ast.links
      .filter((l) => l.source === lastNode && !nodeIds.includes(l.target))
      .map((l) => ({ target: l.target, link: l }));

    // Create new links from each incoming source to each outgoing target
    for (const { source, link: inLink } of incomingSources) {
      for (const { target, link: outLink } of outgoingTargets) {
        // Avoid self-loops
        if (source !== target) {
          this.ast.links.push({
            source,
            target,
            type: inLink.type,
            stroke: inLink.stroke,
            length: inLink.length,
            // Don't preserve text - would be confusing
          });
        }
      }
    }

    // Remove all nodes in the chain (this also removes their links)
    for (const nodeId of nodeIds) {
      this.removeNode(nodeId);
    }

    return this;
  }

  /**
   * Splice a chain of existing nodes between two points.
   * If we have X -> Y and nodes [A, B, C] (already connected A -> B -> C),
   * spliceChain(['A', 'B', 'C'], 'X', 'Y') creates X -> A -> B -> C -> Y.
   * @param nodeIds - Array of node IDs to splice in (must already be connected)
   * @param source - Node to connect from
   * @param target - Node to connect to
   * @param options - Link options for the new connections
   * @returns this (for chaining)
   */
  spliceChain(nodeIds: string[], source: string, target: string, options?: AddLinkOptions): this {
    if (nodeIds.length === 0) {
      // Just connect source to target directly
      this.addLink(source, target, options);
      return this;
    }

    const firstNode = nodeIds[0];
    const lastNode = nodeIds[nodeIds.length - 1];

    // Remove existing link between source and target if it exists
    this.removeLinksBetween(source, target);

    // Connect source to first node in chain
    this.addLink(source, firstNode, options);

    // Connect last node in chain to target
    this.addLink(lastNode, target, options);

    return this;
  }

  /**
   * Reverse the direction of all links in a chain.
   * If we have A -> B -> C, reverseChain(['A', 'B', 'C']) creates A <- B <- C.
   * @param nodeIds - Array of node IDs in the chain (in current order)
   * @returns this (for chaining)
   */
  reverseChain(nodeIds: string[]): this {
    if (nodeIds.length < 2) return this;

    // Find and flip all links between consecutive nodes in the chain
    for (let i = 0; i < nodeIds.length - 1; i++) {
      const source = nodeIds[i];
      const target = nodeIds[i + 1];

      // Find the link from source to target
      const linkIndex = this.ast.links.findIndex(
        (l) => l.source === source && l.target === target
      );

      if (linkIndex !== -1) {
        this.flipLink(linkIndex);
      }
    }

    return this;
  }

  /**
   * Extract a subchain from the graph, removing it but keeping internal links intact.
   * Returns the extracted nodes as a new Flowchart.
   * @param nodeIds - Array of node IDs to extract
   * @returns A new Flowchart containing only the extracted nodes and their internal links
   */
  extractChain(nodeIds: string[]): Flowchart {
    const nodeIdSet = new Set(nodeIds);
    const extracted = Flowchart.create(this.direction);

    // Copy nodes
    for (const nodeId of nodeIds) {
      const node = this.ast.nodes.get(nodeId);
      if (node) {
        extracted.addNode(nodeId, node.text?.text, { shape: node.shape });
        // Copy classes
        const classes = this.ast.classes.get(nodeId);
        if (classes) {
          for (const cls of classes) {
            extracted.addClass(nodeId, cls);
          }
        }
      }
    }

    // Copy internal links (links where both source and target are in the chain)
    for (const link of this.ast.links) {
      if (nodeIdSet.has(link.source) && nodeIdSet.has(link.target)) {
        extracted.addLink(link.source, link.target, {
          text: link.text?.text,
          type: link.type,
          stroke: link.stroke,
          length: link.length,
        });
      }
    }

    // Remove the chain from this graph (with reconnect to preserve external connections)
    this.yankChain(nodeIds);

    return extracted;
  }

  /**
   * Rebase nodes - move a set of nodes to be children of a new parent.
   * All links between the nodes are preserved, but external links are updated.
   * @param nodeIds - Array of node IDs to rebase
   * @param newParent - The new parent node ID (links will go from parent to first node)
   * @returns this (for chaining)
   */
  rebaseNodes(nodeIds: string[], newParent: string): this {
    if (nodeIds.length === 0) return this;

    const nodeIdSet = new Set(nodeIds);

    // Find all incoming links from outside the set
    const externalIncoming = this.ast.links.filter(
      (l) => !nodeIdSet.has(l.source) && nodeIdSet.has(l.target)
    );

    // Remove external incoming links
    for (const link of externalIncoming) {
      const idx = this.ast.links.indexOf(link);
      if (idx !== -1) {
        this.ast.links.splice(idx, 1);
      }
    }

    // Find "root" nodes in the set (nodes with no incoming links from within the set)
    const rootNodes = nodeIds.filter((id) => {
      return !this.ast.links.some((l) => l.target === id && nodeIdSet.has(l.source));
    });

    // Connect new parent to all root nodes
    for (const rootNode of rootNodes) {
      this.addLink(newParent, rootNode);
    }

    return this;
  }
}