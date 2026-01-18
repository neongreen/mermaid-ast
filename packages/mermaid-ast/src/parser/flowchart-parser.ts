/**
 * Flowchart Parser
 *
 * Parses Mermaid flowchart syntax into an AST using the vendored JISON parser.
 * The JISON parser calls methods on a `yy` object - we provide our own implementation
 * that builds an AST instead of mermaid's internal db structure.
 */

import {
  createEmptyFlowchartAST,
  type FlowchartAST,
  type FlowchartDirection,
  type FlowchartLink,
  type FlowchartLinkStroke,
  type FlowchartLinkType,
  type FlowchartNodeShape,
  type FlowchartSubgraph,
} from '../types/flowchart.js';

// Import the vendored parser
// @ts-expect-error - Generated JS file without types
import flowchartParser from '../vendored/parsers/flowchart.js';

/**
 * Destructure a link string to extract type, stroke, and length
 *
 * The length field represents the "extra" dashes beyond the minimum.
 * This is designed for IDEMPOTENCE: render(parse(x)) must produce
 * output that, when parsed and rendered again, is identical.
 *
 * Formula (for normal/thick strokes):
 * - Arrows with endpoints (-->, ==>, --x, --o):
 *   - Parser: length = dashCount - 1
 *   - Renderer: dashes = length + 1
 * - Open arrows (---, ===):
 *   - Parser: length = dashCount - 2
 *   - Renderer: dashes = length + 2
 *
 * Examples:
 * - "-->" has 2 dashes → length = 1 → renders as 2 dashes → "-->"
 * - "--->" has 3 dashes → length = 2 → renders as 3 dashes → "--->"
 * - "---" has 3 dashes → length = 1 → renders as 3 dashes → "---"
 * - "----" has 4 dashes → length = 2 → renders as 4 dashes → "----"
 */
function destructLink(
  linkStr: string,
  startStr?: string
): {
  type: FlowchartLinkType;
  stroke: FlowchartLinkStroke;
  length: number;
} {
  let type: FlowchartLinkType = 'arrow_open';
  let stroke: FlowchartLinkStroke = 'normal';
  let length = 1;

  // Determine stroke type based on characters
  if (linkStr.includes('=')) {
    stroke = 'thick';
  } else if (linkStr.includes('.')) {
    stroke = 'dotted';
  }

  // Determine arrow type based on end characters
  const combined = (startStr || '') + linkStr;
  if (combined.includes('x')) {
    type = 'arrow_cross';
  } else if (combined.includes('o')) {
    type = 'arrow_circle';
  } else if (combined.includes('>')) {
    type = 'arrow_point';
  } else {
    type = 'arrow_open';
  }

  // Count length for IDEMPOTENCE
  // The formula depends on whether it's an open arrow or has an endpoint
  // - Open arrows: renderer uses length + 2, so parser uses dashCount - 2
  // - Arrows with endpoints: renderer uses length + 1, so parser uses dashCount - 1
  const dashMatch = linkStr.match(/[-=]+/g);
  if (dashMatch) {
    const dashCount = dashMatch[0].length;
    if (type === 'arrow_open') {
      // Open arrows: renderer uses length + 2
      length = Math.max(1, dashCount - 2);
    } else {
      // Arrows with endpoints: renderer uses length + 1
      length = Math.max(1, dashCount - 1);
    }
  }

  return { type, stroke, length };
}

/**
 * Parse style string into key-value pairs
 */
function parseStyles(styleStr: string): Record<string, string> {
  const styles: Record<string, string> = {};
  if (!styleStr) return styles;

  const parts = styleStr.split(',');
  for (const part of parts) {
    const colonIndex = part.indexOf(':');
    if (colonIndex > 0) {
      const key = part.slice(0, colonIndex).trim();
      const value = part.slice(colonIndex + 1).trim();
      styles[key] = value;
    }
  }
  return styles;
}

/**
 * Parse stylesOpt (array of style strings) into key-value pairs
 * The JISON parser returns stylesOpt as an array like ["fill:#f00", "stroke:#333"]
 */
function parseStylesOpt(stylesOpt: unknown): Record<string, string> {
  const styles: Record<string, string> = {};

  if (!stylesOpt) return styles;

  // Handle array of style strings
  if (Array.isArray(stylesOpt)) {
    for (const styleStr of stylesOpt) {
      if (typeof styleStr === 'string') {
        const colonIndex = styleStr.indexOf(':');
        if (colonIndex > 0) {
          const key = styleStr.slice(0, colonIndex).trim();
          const value = styleStr.slice(colonIndex + 1).trim();
          styles[key] = value;
        }
      }
    }
    return styles;
  }

  // Handle single string
  if (typeof stylesOpt === 'string') {
    return parseStyles(stylesOpt);
  }

  // Handle object (already parsed)
  if (typeof stylesOpt === 'object') {
    for (const [key, value] of Object.entries(stylesOpt)) {
      if (typeof value === 'string') {
        styles[key] = value;
      }
    }
    return styles;
  }

  return styles;
}

/**
 * Create the yy object that the JISON parser uses
 * This builds our AST instead of mermaid's internal structures
 */
function createFlowchartYY(ast: FlowchartAST) {
  let firstGraph = true;
  let subgraphIdCounter = 0;
  const subgraphStack: string[] = [];
  const nodeToSubgraph = new Map<string, string>();

  return {
    // Track if this is the first graph declaration
    lex: {
      firstGraph: () => {
        if (firstGraph) {
          firstGraph = false;
          return true;
        }
        return false;
      },
    },

    // Set the graph direction
    setDirection(dir: string) {
      ast.direction = dir.trim() as FlowchartDirection;
    },

    // Add a vertex (node)
    addVertex(
      id: string,
      text?: { text: string; type: string } | string,
      shape?: string,
      _style?: string,
      _classes?: string,
      _dir?: string,
      _props?: Record<string, string>,
      shapeData?: string
    ) {
      if (!id) return;

      // Get or create the node
      let node = ast.nodes.get(id);
      if (!node) {
        node = {
          id,
          shape: 'rect' as FlowchartNodeShape,
        };
        ast.nodes.set(id, node);
      }

      // Update text if provided
      if (text) {
        if (typeof text === 'string') {
          node.text = { text, type: 'text' };
        } else if (text.text) {
          node.text = {
            text: text.text,
            type: text.type as 'text' | 'string' | 'markdown',
          };
        }
      }

      // Update shape if provided
      if (shape) {
        node.shape = shape as FlowchartNodeShape;
      }

      // Update props if provided
      if (_props) {
        node.props = _props;
      }

      // Update shapeData if provided
      if (shapeData) {
        node.shapeData = shapeData;
      }

      // Track subgraph membership
      if (subgraphStack.length > 0) {
        const currentSubgraph = subgraphStack[subgraphStack.length - 1];
        nodeToSubgraph.set(id, currentSubgraph);
      }
    },

    // Add a link between nodes
    addLink(
      from: string | string[],
      to: string | string[],
      linkInfo: {
        type?: string;
        stroke?: string;
        length?: number;
        text?: { text: string; type: string } | string;
        id?: string;
      }
    ) {
      const sources = Array.isArray(from) ? from : [from];
      const targets = Array.isArray(to) ? to : [to];

      for (const source of sources) {
        for (const target of targets) {
          const link: FlowchartLink = {
            source,
            target,
            stroke: (linkInfo.stroke as FlowchartLinkStroke) || 'normal',
            type: (linkInfo.type as FlowchartLinkType) || 'arrow_point',
            length: linkInfo.length || 1,
          };

          if (linkInfo.id) {
            link.id = linkInfo.id;
          }

          if (linkInfo.text) {
            if (typeof linkInfo.text === 'string') {
              link.text = { text: linkInfo.text, type: 'text' };
            } else if (linkInfo.text.text) {
              link.text = {
                text: linkInfo.text.text,
                type: linkInfo.text.type as 'text' | 'string' | 'markdown',
              };
            }
          }

          ast.links.push(link);
        }
      }
    },

    // Add a subgraph
    addSubGraph(
      id: string | { text: string; type: string } | undefined,
      nodeList: unknown,
      title?: { text: string; type: string } | string
    ): string {
      // Handle case where id might be an object (when no explicit id is given)
      let subgraphId: string;
      if (!id) {
        subgraphId = `subGraph${subgraphIdCounter++}`;
      } else if (typeof id === 'object' && 'text' in id) {
        subgraphId = id.text.trim();
      } else {
        subgraphId = id.trim();
      }

      // Collect node IDs from the nodeList and look for direction statements
      const nodes: string[] = [];
      let direction: FlowchartDirection | undefined;

      if (Array.isArray(nodeList)) {
        for (const item of nodeList) {
          if (typeof item === 'string') {
            // Trim and filter empty strings
            const trimmed = item.trim();
            if (trimmed) {
              nodes.push(trimmed);
            }
          } else if (Array.isArray(item)) {
            for (const x of item) {
              if (typeof x === 'string') {
                const trimmed = x.trim();
                if (trimmed) {
                  nodes.push(trimmed);
                }
              }
            }
          } else if (item && typeof item === 'object') {
            // Check for direction statement: {stmt: 'dir', value: 'TB'}
            if ('stmt' in item && (item as { stmt: string }).stmt === 'dir' && 'value' in item) {
              direction = (item as { stmt: string; value: string }).value as FlowchartDirection;
            } else if ('nodes' in item) {
              const itemNodes = (item as { nodes: string[] }).nodes;
              if (Array.isArray(itemNodes)) {
                for (const x of itemNodes) {
                  if (typeof x === 'string') {
                    const trimmed = x.trim();
                    if (trimmed) {
                      nodes.push(trimmed);
                    }
                  }
                }
              }
            }
          }
        }
      } else if (typeof nodeList === 'string') {
        // Handle case where nodeList is a string (might be space-separated node IDs)
        const trimmed = nodeList.trim();
        if (trimmed) {
          // Split by whitespace and filter empty strings
          const parts = trimmed.split(/\s+/).filter((p) => p.length > 0);
          nodes.push(...parts);
        }
      }

      const subgraph: FlowchartSubgraph = {
        id: subgraphId,
        nodes,
      };

      if (direction) {
        subgraph.direction = direction;
      }

      if (title) {
        if (typeof title === 'string') {
          subgraph.title = { text: title, type: 'text' };
        } else if (title.text) {
          subgraph.title = {
            text: title.text,
            type: title.type as 'text' | 'string' | 'markdown',
          };
        }
      }

      ast.subgraphs.push(subgraph);
      return subgraphId;
    },

    // Set class on a node (nodeIds can be comma-separated)
    setClass(nodeIds: string, className: string) {
      // Handle comma-separated node IDs
      const ids = nodeIds.split(',').map((id) => id.trim());
      for (const nodeId of ids) {
        if (!nodeId) continue;
        const existing = ast.classes.get(nodeId) || [];
        if (!existing.includes(className)) {
          existing.push(className);
        }
        ast.classes.set(nodeId, existing);
      }
    },

    // Add a class definition
    addClass(className: string, stylesOpt: unknown) {
      ast.classDefs.set(className, {
        id: className,
        styles: parseStylesOpt(stylesOpt),
      });
    },

    // Add click handler
    setClickEvent(nodeId: string, callback?: string, callbackArgs?: string) {
      const existing = ast.clicks.find((c) => c.nodeId === nodeId);
      if (existing) {
        if (callback) existing.callback = callback;
        if (callbackArgs) existing.callbackArgs = callbackArgs;
      } else {
        ast.clicks.push({
          nodeId,
          callback,
          callbackArgs,
        });
      }
    },

    // Set link for click
    setLink(nodeId: string, href: string, target?: string) {
      const existing = ast.clicks.find((c) => c.nodeId === nodeId);
      if (existing) {
        existing.href = href;
        if (target) existing.target = target as '_self' | '_blank' | '_parent' | '_top';
      } else {
        ast.clicks.push({
          nodeId,
          href,
          target: target as '_self' | '_blank' | '_parent' | '_top',
        });
      }
    },

    // Add link style (called by parser as updateLink)
    updateLink(indices: (string | number)[], stylesOpt: unknown) {
      const parsedStyles = parseStylesOpt(stylesOpt);

      for (const index of indices) {
        const idx =
          index === 'default'
            ? 'default'
            : typeof index === 'number'
              ? index
              : Number.parseInt(index, 10);
        ast.linkStyles.push({
          index: idx as number | 'default',
          styles: parsedStyles,
        });
      }
    },

    // Update link interpolation
    updateLinkInterpolate(indices: (string | number)[], interpolate: string) {
      // Store interpolation info - will be merged with styles when updateLink is called
      // For now, just track it
      for (const index of indices) {
        const idx =
          index === 'default'
            ? 'default'
            : typeof index === 'number'
              ? index
              : Number.parseInt(index, 10);
        // Find existing linkStyle or create new one
        const existing = ast.linkStyles.find((ls) => ls.index === idx);
        if (existing) {
          existing.interpolate = interpolate;
        } else {
          ast.linkStyles.push({
            index: idx as number | 'default',
            styles: {},
            interpolate,
          });
        }
      }
    },

    // Accessibility
    setAccTitle(title: string) {
      ast.title = title;
    },

    setAccDescription(description: string) {
      ast.accDescription = description;
    },

    // Destructure link helper
    destructLink,

    // Subgraph direction
    setSubgraphDirection(dir: string) {
      if (ast.subgraphs.length > 0) {
        ast.subgraphs[ast.subgraphs.length - 1].direction = dir as FlowchartDirection;
      }
    },

    // These are called but we don't need to do anything with them
    getTooltip: () => undefined,
    setTooltip: () => {},
    lookUpDomId: (id: string) => id,
    setDiagramTitle: () => {},
    getDiagramTitle: () => '',
  };
}

/**
 * Parse a flowchart diagram string into an AST
 */
export function parseFlowchart(input: string): FlowchartAST {
  const ast = createEmptyFlowchartAST();
  const yy = createFlowchartYY(ast);

  // Set up the parser with our yy object
  flowchartParser.yy = yy;

  try {
    // Parse the input
    flowchartParser.parse(input);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to parse flowchart: ${error.message}`);
    }
    throw error;
  }

  return ast;
}

/**
 * Detect if input is a flowchart diagram
 */
export function isFlowchartDiagram(input: string): boolean {
  const trimmed = input.trim();
  const firstLine = trimmed.split('\n')[0].trim().toLowerCase();
  return (
    firstLine.startsWith('flowchart') ||
    firstLine.startsWith('graph') ||
    firstLine.startsWith('flowchart-elk')
  );
}
