/**
 * Edge renderer
 */

import type { G, Svg } from '@svgdotjs/svg.js';
import type { PositionedEdge, PositionedNode, Theme } from '../types.js';
import { type CurveType, generatePath } from './curves.js';
import { getMarkerUrl } from './markers.js';

/**
 * Render an edge to the SVG canvas
 */
export function renderEdge(
  canvas: Svg,
  edge: PositionedEdge,
  nodes: Map<string, PositionedNode>,
  markers: Map<string, string>,
  theme: Theme,
  curveType: CurveType = 'linear'
): G {
  const group = canvas.group();

  // Get source and target nodes
  const sourceNode = nodes.get(edge.sourceId);
  const targetNode = nodes.get(edge.targetId);

  if (!sourceNode || !targetNode) {
    console.warn(`Edge ${edge.id}: missing source or target node`);
    return group;
  }

  // Use ELK-provided points if available, otherwise calculate
  let points = edge.points;
  if (!points || points.length < 2) {
    // Fallback: direct line from center to center
    points = [
      { x: sourceNode.x + sourceNode.width / 2, y: sourceNode.y + sourceNode.height / 2 },
      { x: targetNode.x + targetNode.width / 2, y: targetNode.y + targetNode.height / 2 },
    ];
  }

  // Generate path
  const pathData = generatePath(points, curveType);

  // Draw the edge path
  const path = group.path(pathData).fill('none').stroke({
    color: theme.edgeStroke,
    width: theme.edgeStrokeWidth,
  });

  // Add markers
  if (edge.endMarker && markers.has(edge.endMarker)) {
    path.attr('marker-end', getMarkerUrl(markers.get(edge.endMarker)!));
  }
  if (edge.startMarker && markers.has(edge.startMarker)) {
    path.attr('marker-start', getMarkerUrl(markers.get(edge.startMarker)!));
  }

  // Add label if present
  if (edge.label) {
    // Position label at midpoint of edge
    const midIndex = Math.floor(points.length / 2);
    const midPoint = points[midIndex];

    // Create label background
    const labelPadding = 4;
    const labelText = group
      .text(edge.label)
      .font({
        family: theme.fontFamily,
        size: theme.fontSize * 0.9,
        anchor: 'middle',
      })
      .fill(theme.edgeTextColor);

    const bbox = labelText.bbox();

    // Background rectangle
    group
      .rect(bbox.width + labelPadding * 2, bbox.height + labelPadding * 2)
      .fill('#ffffff')
      .stroke({ color: theme.edgeStroke, width: 0.5 })
      .center(midPoint.x, midPoint.y);

    // Move text on top of background
    labelText.center(midPoint.x, midPoint.y);
  }

  return group;
}

/**
 * Render all edges
 */
export function renderEdges(
  canvas: Svg,
  edges: PositionedEdge[],
  nodes: PositionedNode[],
  markers: Map<string, string>,
  theme: Theme,
  curveType: CurveType = 'linear'
): void {
  // Create node lookup map
  const nodeMap = new Map<string, PositionedNode>();
  for (const node of nodes) {
    nodeMap.set(node.id, node);
  }

  // Render each edge
  for (const edge of edges) {
    renderEdge(canvas, edge, nodeMap, markers, theme, curveType);
  }
}
