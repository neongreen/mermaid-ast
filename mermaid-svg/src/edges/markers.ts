/**
 * Arrow marker definitions for edges
 */

import type { Marker, Svg } from '@svgdotjs/svg.js';
import type { Theme } from '../types.js';

/**
 * Marker types supported
 */
export type MarkerType = 'point' | 'circle' | 'cross' | 'diamond';

/**
 * Create SVG marker definitions
 */
export function createMarkers(canvas: Svg, theme: Theme): Map<string, string> {
  const defs = canvas.defs();
  const markers = new Map<string, string>();

  // Point (arrow) marker
  const pointMarkerId = 'marker-point';
  const pointMarker = defs.marker(10, 10, (add: Marker) => {
    add.polygon('0,0 10,5 0,10').fill(theme.edgeStroke);
  });
  pointMarker.attr({
    id: pointMarkerId,
    refX: 9,
    refY: 5,
    markerWidth: 6,
    markerHeight: 6,
    orient: 'auto',
  });
  markers.set('point', pointMarkerId);

  // Circle marker
  const circleMarkerId = 'marker-circle';
  const circleMarker = defs.marker(10, 10, (add: Marker) => {
    add.circle(8).center(5, 5).fill(theme.edgeStroke);
  });
  circleMarker.attr({
    id: circleMarkerId,
    refX: 5,
    refY: 5,
    markerWidth: 6,
    markerHeight: 6,
    orient: 'auto',
  });
  markers.set('circle', circleMarkerId);

  // Cross marker
  const crossMarkerId = 'marker-cross';
  const crossMarker = defs.marker(10, 10, (add: Marker) => {
    add.line(2, 2, 8, 8).stroke({ color: theme.edgeStroke, width: 2 });
    add.line(8, 2, 2, 8).stroke({ color: theme.edgeStroke, width: 2 });
  });
  crossMarker.attr({
    id: crossMarkerId,
    refX: 5,
    refY: 5,
    markerWidth: 6,
    markerHeight: 6,
    orient: 'auto',
  });
  markers.set('cross', crossMarkerId);

  // Diamond marker
  const diamondMarkerId = 'marker-diamond';
  const diamondMarker = defs.marker(10, 10, (add: Marker) => {
    add.polygon('5,0 10,5 5,10 0,5').fill(theme.edgeStroke);
  });
  diamondMarker.attr({
    id: diamondMarkerId,
    refX: 5,
    refY: 5,
    markerWidth: 6,
    markerHeight: 6,
    orient: 'auto',
  });
  markers.set('diamond', diamondMarkerId);

  return markers;
}

/**
 * Get marker URL reference
 */
export function getMarkerUrl(markerId: string): string {
  return `url(#${markerId})`;
}
