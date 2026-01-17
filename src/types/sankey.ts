/**
 * Sankey Diagram AST Types
 *
 * Represents Sankey diagrams showing flow between nodes with weighted links.
 */

/**
 * A node in the Sankey diagram
 */
export interface SankeyNode {
  /** Unique identifier for the node */
  id: string;
  /** Display label for the node */
  label: string;
}

/**
 * A link between two nodes in the Sankey diagram
 */
export interface SankeyLink {
  /** Source node ID */
  source: string;
  /** Target node ID */
  target: string;
  /** Flow value/weight of the link */
  value: number;
}

/**
 * The complete Sankey Diagram AST
 */
export interface SankeyAST {
  type: 'sankey';
  /** All nodes in the diagram */
  nodes: Map<string, SankeyNode>;
  /** All links in the diagram */
  links: SankeyLink[];
}

/**
 * Create an empty Sankey AST
 */
export function createEmptySankeyAST(): SankeyAST {
  return {
    type: 'sankey',
    nodes: new Map(),
    links: [],
  };
}
