/**
 * Shape type definitions
 */

import type { G, Svg } from '@svgdotjs/svg.js';
import type { PositionedNode, Theme } from '../types.js';

/**
 * Interface for shape renderers
 */
export interface ShapeRenderer {
  /**
   * Render the shape to the SVG canvas
   * @param canvas - The SVG canvas to render to
   * @param node - The positioned node to render
   * @param theme - The theme configuration
   * @returns The SVG group containing the shape
   */
  render(canvas: Svg, node: PositionedNode, theme: Theme): G;

  /**
   * Get the intersection point where an edge should connect
   * @param node - The positioned node
   * @param angle - The angle of the incoming/outgoing edge (in radians)
   * @returns The intersection point {x, y}
   */
  getIntersection(node: PositionedNode, angle: number): { x: number; y: number };
}

/**
 * Shape registry type
 */
export type ShapeRegistry = Map<string, ShapeRenderer>;
