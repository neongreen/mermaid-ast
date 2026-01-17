/**
 * Flowchart Types
 *
 * Type definitions for the Flowchart wrapper class.
 */

import type {
  FlowchartLink,
  FlowchartLinkStroke,
  FlowchartLinkType,
  FlowchartNodeShape,
} from './types/flowchart.js';

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
