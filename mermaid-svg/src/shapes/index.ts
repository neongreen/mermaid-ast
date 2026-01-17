/**
 * Shape registry
 */

import type { ShapeRenderer, ShapeRegistry } from './types.js';
import { rectShape } from './rect.js';
import { roundedShape } from './rounded.js';
import { stadiumShape } from './stadium.js';
import { diamondShape } from './diamond.js';
import { hexagonShape } from './hexagon.js';
import { cylinderShape } from './cylinder.js';
import { circleShape } from './circle.js';

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

export type { ShapeRenderer, ShapeRegistry } from './types.js';