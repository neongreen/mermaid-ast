/**
 * Flowchart Graph Operations
 *
 * Graph surgery and chain operations for the Flowchart class.
 * These methods are added to the Flowchart prototype.
 */

import type { Flowchart } from './flowchart.js';
import type { AddLinkOptions } from './flowchart-types.js';

/**
 * Insert a node between two connected nodes.
 * If A --> B exists, insertBetween('X', 'A', 'B') creates A --> X --> B
 */
export function insertBetween(
  this: Flowchart,
  newNodeId: string,
  source: string,
  target: string,
  nodeText?: string
): Flowchart {
  const ast = this.toAST();
  const linkIndex = ast.links.findIndex((l) => l.source === source && l.target === target);

  if (linkIndex === -1) {
    this.addNode(newNodeId, nodeText);
    this.addLink(source, newNodeId);
    this.addLink(newNodeId, target);
    return this;
  }

  const originalLink = ast.links[linkIndex];
  this.addNode(newNodeId, nodeText);

  ast.links.push({
    source,
    target: newNodeId,
    type: originalLink.type,
    stroke: originalLink.stroke,
    length: originalLink.length,
    text: originalLink.text,
  });

  ast.links.push({
    source: newNodeId,
    target,
    type: originalLink.type,
    stroke: originalLink.stroke,
    length: originalLink.length,
  });

  ast.links.splice(linkIndex, 1);
  return this;
}

/**
 * Remove a node and reconnect its neighbors.
 * If A --> B --> C, removeAndReconnect('B') creates A --> C
 */
export function removeAndReconnect(this: Flowchart, nodeId: string): Flowchart {
  return this.removeNode(nodeId, { reconnect: true });
}

/**
 * Get all nodes that can be reached from a starting node.
 */
export function getReachable(this: Flowchart, startId: string): string[] {
  const ast = this.toAST();
  const visited = new Set<string>();
  const queue = [startId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);

    for (const link of ast.links) {
      if (link.source === current && !visited.has(link.target)) {
        queue.push(link.target);
      }
    }
  }

  return [...visited];
}

/**
 * Get all nodes that can reach a target node.
 */
export function getAncestors(this: Flowchart, targetId: string): string[] {
  const ast = this.toAST();
  const visited = new Set<string>();
  const queue = [targetId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);

    for (const link of ast.links) {
      if (link.target === current && !visited.has(link.source)) {
        queue.push(link.source);
      }
    }
  }

  return [...visited];
}

/**
 * Get the shortest path between two nodes.
 */
export function getPath(this: Flowchart, source: string, target: string): string[] {
  if (source === target) return [source];

  const ast = this.toAST();
  const visited = new Set<string>();
  const queue: { node: string; path: string[] }[] = [{ node: source, path: [source] }];

  while (queue.length > 0) {
    const { node, path } = queue.shift()!;
    if (visited.has(node)) continue;
    visited.add(node);

    for (const link of ast.links) {
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

/**
 * Get a linear chain of nodes between two points.
 * Only works if there's a single path (no branching).
 */
export function getChain(this: Flowchart, startId: string, endId: string): string[] {
  if (startId === endId) return [startId];

  const ast = this.toAST();
  const chain: string[] = [startId];
  let current = startId;

  while (current !== endId) {
    const outgoing = ast.links.filter((l) => l.source === current);

    if (outgoing.length !== 1) {
      return [];
    }

    const next = outgoing[0].target;
    chain.push(next);
    current = next;

    if (chain.length > ast.nodes.size) {
      return [];
    }
  }

  return chain;
}

/**
 * Yank (remove) a chain of nodes and reconnect around them.
 * If we have X -> A -> B -> C -> Y and we yank [A, B, C], we get X -> Y.
 */
export function yankChain(this: Flowchart, nodeIds: string[]): Flowchart {
  if (nodeIds.length === 0) return this;

  const ast = this.toAST();
  const firstNode = nodeIds[0];
  const lastNode = nodeIds[nodeIds.length - 1];

  const incomingSources = ast.links
    .filter((l) => l.target === firstNode && !nodeIds.includes(l.source))
    .map((l) => ({ source: l.source, link: l }));

  const outgoingTargets = ast.links
    .filter((l) => l.source === lastNode && !nodeIds.includes(l.target))
    .map((l) => ({ target: l.target, link: l }));

  for (const { source, link: inLink } of incomingSources) {
    for (const { target } of outgoingTargets) {
      if (source !== target) {
        ast.links.push({
          source,
          target,
          type: inLink.type,
          stroke: inLink.stroke,
          length: inLink.length,
        });
      }
    }
  }

  for (const nodeId of nodeIds) {
    this.removeNode(nodeId);
  }

  return this;
}

/**
 * Splice a chain of existing nodes between two points.
 */
export function spliceChain(
  this: Flowchart,
  nodeIds: string[],
  source: string,
  target: string,
  options?: AddLinkOptions
): Flowchart {
  if (nodeIds.length === 0) {
    this.addLink(source, target, options);
    return this;
  }

  const firstNode = nodeIds[0];
  const lastNode = nodeIds[nodeIds.length - 1];

  this.removeLinksBetween(source, target);
  this.addLink(source, firstNode, options);
  this.addLink(lastNode, target, options);

  return this;
}

/**
 * Reverse the direction of all links in a chain.
 */
export function reverseChain(this: Flowchart, nodeIds: string[]): Flowchart {
  if (nodeIds.length < 2) return this;

  const ast = this.toAST();

  for (let i = 0; i < nodeIds.length - 1; i++) {
    const source = nodeIds[i];
    const target = nodeIds[i + 1];

    const linkIndex = ast.links.findIndex((l) => l.source === source && l.target === target);

    if (linkIndex !== -1) {
      this.flipLink(linkIndex);
    }
  }

  return this;
}

/**
 * Extract a subchain from the graph, removing it but keeping internal links intact.
 * Returns the extracted nodes as a new Flowchart.
 */
export function extractChain(this: Flowchart, nodeIds: string[]): Flowchart {
  // Import dynamically to avoid circular dependency
  const { Flowchart } = require('./flowchart.js');

  const ast = this.toAST();
  const nodeIdSet = new Set(nodeIds);
  const extracted = Flowchart.create(this.direction);

  for (const nodeId of nodeIds) {
    const node = ast.nodes.get(nodeId);
    if (node) {
      extracted.addNode(nodeId, node.text?.text, { shape: node.shape });
      const classes = ast.classes.get(nodeId);
      if (classes) {
        for (const cls of classes) {
          extracted.addClass(nodeId, cls);
        }
      }
    }
  }

  for (const link of ast.links) {
    if (nodeIdSet.has(link.source) && nodeIdSet.has(link.target)) {
      extracted.addLink(link.source, link.target, {
        text: link.text?.text,
        type: link.type,
        stroke: link.stroke,
        length: link.length,
      });
    }
  }

  this.yankChain(nodeIds);

  return extracted;
}

/**
 * Rebase nodes - move a set of nodes to be children of a new parent.
 */
export function rebaseNodes(this: Flowchart, nodeIds: string[], newParent: string): Flowchart {
  if (nodeIds.length === 0) return this;

  const ast = this.toAST();
  const nodeIdSet = new Set(nodeIds);

  const externalIncoming = ast.links.filter(
    (l) => !nodeIdSet.has(l.source) && nodeIdSet.has(l.target)
  );

  for (const link of externalIncoming) {
    const idx = ast.links.indexOf(link);
    if (idx !== -1) {
      ast.links.splice(idx, 1);
    }
  }

  const rootNodes = nodeIds.filter((id) => {
    return !ast.links.some((l) => l.target === id && nodeIdSet.has(l.source));
  });

  for (const rootNode of rootNodes) {
    this.addLink(newParent, rootNode);
  }

  return this;
}
