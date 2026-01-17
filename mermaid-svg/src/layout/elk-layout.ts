/**
 * ELK Layout Integration
 *
 * Converts FlowchartAST to ELK graph format, runs layout,
 * and extracts positioned nodes and edges.
 */

import type { ElkExtendedEdge, ElkNode } from 'elkjs';
// Use elk-api.js with a custom worker factory for Bun compatibility
import ELK from 'elkjs/lib/elk-api.js';
import type { FlowchartAST, FlowchartLink, FlowchartNode } from 'mermaid-ast';
import { measureText } from '../svg-context.js';
import type { LayoutResult, PositionedEdge, PositionedNode, Theme } from '../types.js';

// Import the FakeWorker using our custom loader (works in Bun)
import { FakeWorker } from './elk-worker-loader.js';

// Create ELK instance with custom worker factory that uses the FakeWorker
const elk = new ELK({
  workerFactory: () => new FakeWorker(),
});

/**
 * Get the text label from a FlowchartNode
 */
function getNodeLabel(node: FlowchartNode): string {
  return node.text?.text || node.id;
}

/**
 * Get the text label from a FlowchartLink
 */
function getLinkLabel(link: FlowchartLink): string | undefined {
  return link.text?.text;
}

/**
 * Map flowchart direction to ELK direction
 */
function getElkDirection(direction: string): string {
  switch (direction) {
    case 'TB':
    case 'TD':
      return 'DOWN';
    case 'BT':
      return 'UP';
    case 'LR':
      return 'RIGHT';
    case 'RL':
      return 'LEFT';
    default:
      return 'DOWN';
  }
}

/**
 * Calculate node dimensions based on label text
 */
function calculateNodeSize(node: FlowchartNode, theme: Theme): { width: number; height: number } {
  const label = getNodeLabel(node);
  const textSize = measureText(label, theme.fontSize, theme.fontFamily);

  // Add padding and ensure minimum size
  const width = Math.max(textSize.width + theme.nodePadding * 2, theme.nodeMinWidth);
  const height = Math.max(textSize.height + theme.nodePadding * 2, theme.nodeMinHeight);

  return { width, height };
}

/**
 * Map flowchart node shape to our shape names
 */
function mapShape(shape?: string): string {
  if (!shape) return 'rect';

  // Normalize shape names
  switch (shape) {
    case 'square':
    case 'rect':
      return 'rect';
    case 'round':
    case 'rounded':
      return 'rounded';
    case 'stadium':
    case 'pill':
      return 'stadium';
    case 'diamond':
    case 'rhombus':
    case 'decision':
      return 'diamond';
    case 'hexagon':
      return 'hexagon';
    case 'cylinder':
    case 'database':
      return 'cylinder';
    case 'circle':
      return 'circle';
    default:
      return 'rect';
  }
}

/**
 * Map flowchart link type to end marker name
 */
function mapLinkTypeToEndMarker(linkType: string): string | undefined {
  switch (linkType) {
    case 'arrow_point':
      return 'point';
    case 'arrow_circle':
      return 'circle';
    case 'arrow_cross':
      return 'cross';
    case 'arrow_open':
      return undefined; // No arrow head
    default:
      return 'point';
  }
}

/**
 * Convert FlowchartAST to ELK graph format
 */
function astToElkGraph(ast: FlowchartAST, theme: Theme): ElkNode {
  const children: ElkNode[] = [];
  const edges: ElkExtendedEdge[] = [];

  // Convert nodes
  for (const node of ast.nodes.values()) {
    const size = calculateNodeSize(node, theme);
    const label = getNodeLabel(node);
    children.push({
      id: node.id,
      width: size.width,
      height: size.height,
      labels: [{ text: label }],
    });
  }

  // Convert links to edges
  let edgeIndex = 0;
  for (const link of ast.links) {
    const label = getLinkLabel(link);
    edges.push({
      id: `e${edgeIndex++}`,
      sources: [link.source],
      targets: [link.target],
      labels: label ? [{ text: label }] : undefined,
    });
  }

  // Build ELK graph
  const elkGraph: ElkNode = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': getElkDirection(ast.direction),
      'elk.spacing.nodeNode': '50',
      'elk.spacing.edgeNode': '25',
      'elk.layered.spacing.nodeNodeBetweenLayers': '50',
      'elk.edgeRouting': 'ORTHOGONAL',
    },
    children,
    edges,
  };

  return elkGraph;
}

/**
 * Extract positioned nodes from ELK layout result
 */
function extractPositionedNodes(elkGraph: ElkNode, ast: FlowchartAST): PositionedNode[] {
  const nodes: PositionedNode[] = [];

  if (!elkGraph.children) return nodes;

  for (const elkNode of elkGraph.children) {
    const astNode = ast.nodes.get(elkNode.id);
    if (!astNode) continue;

    nodes.push({
      id: elkNode.id,
      x: elkNode.x ?? 0,
      y: elkNode.y ?? 0,
      width: elkNode.width ?? 0,
      height: elkNode.height ?? 0,
      label: getNodeLabel(astNode),
      shape: mapShape(astNode.shape),
    });
  }

  return nodes;
}

/**
 * Extract positioned edges from ELK layout result
 */
function extractPositionedEdges(elkGraph: ElkNode, ast: FlowchartAST): PositionedEdge[] {
  const edges: PositionedEdge[] = [];

  if (!elkGraph.edges) return edges;

  for (let i = 0; i < elkGraph.edges.length; i++) {
    const elkEdge = elkGraph.edges[i] as ElkExtendedEdge;
    const astLink = ast.links[i];

    // Extract edge points from sections
    const points: Array<{ x: number; y: number }> = [];
    if (elkEdge.sections) {
      for (const section of elkEdge.sections) {
        if (section.startPoint) {
          points.push({ x: section.startPoint.x, y: section.startPoint.y });
        }
        if (section.bendPoints) {
          for (const bp of section.bendPoints) {
            points.push({ x: bp.x, y: bp.y });
          }
        }
        if (section.endPoint) {
          points.push({ x: section.endPoint.x, y: section.endPoint.y });
        }
      }
    }

    edges.push({
      id: elkEdge.id,
      sourceId: astLink.source,
      targetId: astLink.target,
      label: getLinkLabel(astLink),
      points,
      startMarker: undefined, // Mermaid flowcharts don't have start arrows
      endMarker: mapLinkTypeToEndMarker(astLink.type),
    });
  }

  return edges;
}

/**
 * Run ELK layout on a FlowchartAST
 */
export async function layoutFlowchart(ast: FlowchartAST, theme: Theme): Promise<LayoutResult> {
  // Convert AST to ELK graph
  const elkGraph = astToElkGraph(ast, theme);

  // Run ELK layout
  const layoutedGraph = await elk.layout(elkGraph);

  // Extract positioned elements
  const nodes = extractPositionedNodes(layoutedGraph, ast);
  const edges = extractPositionedEdges(layoutedGraph, ast);

  // Calculate total dimensions
  let maxX = 0;
  let maxY = 0;
  for (const node of nodes) {
    maxX = Math.max(maxX, node.x + node.width);
    maxY = Math.max(maxY, node.y + node.height);
  }

  return {
    nodes,
    edges,
    width: maxX,
    height: maxY,
  };
}
