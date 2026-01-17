/**
 * Shape registry
 */

import { circleShape } from './circle.js';
import { cylinderShape } from './cylinder.js';
import { diamondShape } from './diamond.js';
import { hexagonShape } from './hexagon.js';
import { rectShape } from './rect.js';
import { roundedShape } from './rounded.js';
import { stadiumShape } from './stadium.js';
import type { ShapeRegistry, ShapeRenderer } from './types.js';

/**
 * Registry of all available shapes
 */
export const shapeRegistry: ShapeRegistry = new Map<string, ShapeRenderer>([
  ['rect', rectShape],
  ['rounded', roundedShape],
  ['stadium', stadiumShape],
  ['diamond', diamondShape],
  ['hexagon', hexagonShape],
  ['cylinder', cylinderShape],
  ['circle', circleShape],
]);

/**
 * Get a shape renderer by name
 */
export function getShape(name: string): ShapeRenderer {
  const shape = shapeRegistry.get(name);
  if (!shape) {
    // Fall back to rect for unknown shapes
    return rectShape;
  }
  return shape;
}

export type { ShapeRegistry, ShapeRenderer } from './types.js';
