/**
 * Block Diagram Renderer
 *
 * Renders BlockAST back to Mermaid block-beta diagram syntax.
 */

import type { Doc } from './doc.js';
import { indent, render, when } from './doc.js';
import type {
  BlockAST,
  BlockApplyClass,
  BlockApplyStyles,
  BlockClassDef,
  BlockColumnSetting,
  BlockComposite,
  BlockEdge,
  BlockElement,
  BlockNode,
  BlockNodeShape,
  BlockSpace,
} from '../types/block.js';
import type { RenderOptions, ResolvedRenderOptions } from '../types/render-options.js';
import { resolveOptions } from '../types/render-options.js';

/**
 * Maps BlockNodeShape to opening/closing delimiters
 */
function getShapeDelimiters(shape: BlockNodeShape): [string, string] {
  switch (shape) {
    case 'square':
      return ['[', ']'];
    case 'round':
      return ['(', ')'];
    case 'circle':
      return ['((', '))'];
    case 'doublecircle':
      return ['(((', ')))'];
    case 'diamond':
      return ['{', '}'];
    case 'hexagon':
      return ['{{', '}}'];
    case 'stadium':
      return ['([', '])'];
    case 'subroutine':
      return ['[[', ']]'];
    case 'cylinder':
      return ['[(', ')]'];
    case 'asymmetric':
      return ['>', ']'];
    case 'trapezoid':
      return ['[/', '\\]'];
    case 'trapezoid-alt':
      return ['[\\', '/]'];
    case 'lean-right':
      return ['[/', ']'];
    case 'lean-left':
      return ['[\\', ']'];
    case 'block-arrow':
      return ['<[', ']>'];
    default:
      return ['[', ']'];
  }
}

/**
 * Maps BlockEdgeType to edge string
 */
function getEdgeString(edgeType: string): string {
  switch (edgeType) {
    case 'arrow':
      return '-->';
    case 'open':
      return '---';
    case 'dotted':
      return '-.->';
    case 'thick':
      return '==>';
    case 'invisible':
      return '~~~';
    default:
      return '-->';
  }
}

/**
 * Renders a single block node
 */
function renderNode(node: BlockNode): Doc {
  const [open, close] = getShapeDelimiters(node.shape);
  const label = node.label || node.id;

  let result = `${node.id}${open}"${label}"${close}`;

  // Add directions for block arrows
  if (node.shape === 'block-arrow' && node.directions && node.directions.length > 0) {
    result = `${node.id}<["${label}"]>(${node.directions.join(', ')})`;
  }

  // Add width if not default
  if (node.widthInColumns > 1) {
    result += `:${node.widthInColumns}`;
  }

  return result;
}

/**
 * Renders a space block
 */
function renderSpace(space: BlockSpace): Doc {
  if (space.width === 1) {
    return 'space';
  }
  return `space:${space.width}`;
}

/**
 * Renders a column setting
 */
function renderColumnSetting(setting: BlockColumnSetting): Doc {
  if (setting.columns === -1) {
    return 'columns auto';
  }
  return `columns ${setting.columns}`;
}

/**
 * Renders a class definition
 */
function renderClassDef(classDef: BlockClassDef): Doc {
  return `classDef ${classDef.id} ${classDef.css}`;
}

/**
 * Renders a class application
 */
function renderApplyClass(applyClass: BlockApplyClass): Doc {
  return `class ${applyClass.id} ${applyClass.styleClass}`;
}

/**
 * Renders a style application
 */
function renderApplyStyles(applyStyles: BlockApplyStyles): Doc {
  return `style ${applyStyles.id} ${applyStyles.stylesStr}`;
}

/**
 * Renders an edge
 */
function renderEdge(edge: BlockEdge): Doc {
  const edgeStr = getEdgeString(edge.edgeType);
  if (edge.label) {
    // Edge with label uses different syntax
    const startEdge = edgeStr.substring(0, 2); // '--' or '==' or '-.'
    const endEdge = edgeStr.substring(2); // '>' or '-' or '>'
    return `${edge.start} ${startEdge}"${edge.label}"${endEdge} ${edge.end}`;
  }
  return `${edge.start} ${edgeStr} ${edge.end}`;
}

/**
 * Renders a composite block
 */
function renderComposite(composite: BlockComposite, options: ResolvedRenderOptions): Doc {
  const header = composite.label
    ? `block:${composite.id}["${composite.label}"]`
    : `block:${composite.id}`;

  const children = composite.children.map((child) => renderElement(child, options));

  return [header, indent(children), 'end'];
}

/**
 * Renders a single element
 */
function renderElement(element: BlockElement, options: ResolvedRenderOptions): Doc {
  // Type guards based on properties
  if ('type' in element) {
    switch (element.type) {
      case 'space':
        return renderSpace(element as BlockSpace);
      case 'composite':
        return renderComposite(element as BlockComposite, options);
      case 'column-setting':
        return renderColumnSetting(element as BlockColumnSetting);
      case 'classDef':
        return renderClassDef(element as BlockClassDef);
      case 'applyClass':
        return renderApplyClass(element as BlockApplyClass);
      case 'applyStyles':
        return renderApplyStyles(element as BlockApplyStyles);
    }
  }

  // Check for edge (has start and end)
  if ('start' in element && 'end' in element) {
    return renderEdge(element as BlockEdge);
  }

  // Default: node
  if ('shape' in element) {
    return renderNode(element as BlockNode);
  }

  return '';
}

/**
 * Renders a BlockAST to Mermaid block-beta diagram syntax
 *
 * Block diagrams require edges to be rendered inline with nodes (as node chains),
 * not as separate statements. The parser only recognizes edges when they're part
 * of node chains like `a --> b --> c`.
 */
export function renderBlock(ast: BlockAST, options?: RenderOptions): string {
  const opts = resolveOptions(options);

  // Build a map of edges by their source node
  const edgesBySource = new Map<string, BlockEdge[]>();
  const edgeIds = new Set<string>();

  for (const element of ast.elements) {
    if ('start' in element && 'end' in element) {
      const edge = element as BlockEdge;
      edgeIds.add(edge.id);
      const edges = edgesBySource.get(edge.start) || [];
      edges.push(edge);
      edgesBySource.set(edge.start, edges);
    }
  }

  // Render elements, but handle edges specially
  const renderedElements: Doc[] = [];
  const renderedNodes = new Set<string>();

  for (const element of ast.elements) {
    // Skip edges - they'll be rendered inline with their source nodes
    if ('start' in element && 'end' in element) {
      continue;
    }

    // For nodes, render them with any outgoing edges as a chain
    if ('shape' in element && !('type' in element)) {
      const node = element as BlockNode;
      const edges = edgesBySource.get(node.id) || [];

      if (edges.length > 0) {
        // Render node with its outgoing edges as a chain
        renderedElements.push(renderNodeWithEdges(node, edges, ast.elements, renderedNodes));
      } else if (!renderedNodes.has(node.id)) {
        // Render standalone node
        renderedElements.push(renderNode(node));
      }
      renderedNodes.add(node.id);
    } else {
      // Render other elements normally
      renderedElements.push(renderElement(element, opts));
    }
  }

  const doc: Doc = [
    'block-beta',
    when(ast.accTitle, `accTitle: ${ast.accTitle}`),
    when(ast.accDescr, `accDescr: ${ast.accDescr}`),
    indent(renderedElements),
  ];

  return render(doc, opts.indent);
}

/**
 * Renders a node with its outgoing edges as a chain
 * e.g., a["Start"] --> b["Middle"] --> c["End"]
 */
function renderNodeWithEdges(
  node: BlockNode,
  edges: BlockEdge[],
  allElements: BlockElement[],
  renderedNodes: Set<string>
): Doc {
  // Find the target nodes for each edge
  const nodeMap = new Map<string, BlockNode>();
  for (const elem of allElements) {
    if ('shape' in elem && !('type' in elem)) {
      nodeMap.set((elem as BlockNode).id, elem as BlockNode);
    }
  }

  // Build the chain: node --> target1 --> target2 ...
  // For now, just render node --> target for each edge
  // (More complex chain building would require graph analysis)

  const parts: string[] = [renderNode(node) as string];
  renderedNodes.add(node.id);

  for (const edge of edges) {
    const edgeStr = getEdgeString(edge.edgeType);
    const targetNode = nodeMap.get(edge.end);

    if (edge.label) {
      const startEdge = edgeStr.substring(0, 2);
      const endEdge = edgeStr.substring(2);
      parts.push(`${startEdge}"${edge.label}"${endEdge}`);
    } else {
      parts.push(edgeStr);
    }

    if (targetNode && !renderedNodes.has(edge.end)) {
      parts.push(renderNode(targetNode) as string);
      renderedNodes.add(edge.end);
    } else {
      // Target already rendered or not found, just use the ID
      parts.push(edge.end);
    }
  }

  return parts.join(' ');
}
