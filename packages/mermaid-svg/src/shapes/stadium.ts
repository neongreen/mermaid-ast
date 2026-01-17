/**
 * Stadium (pill) shape renderer
 */

import type { G, Svg } from '@svgdotjs/svg.js';
import type { PositionedNode, Theme } from '../types.js';
import type { ShapeRenderer } from './types.js';

export const stadiumShape: ShapeRenderer = {
  render(canvas: Svg, node: PositionedNode, theme: Theme): G {
    const group = canvas.group();

    // Stadium shape has fully rounded ends (radius = height/2)
    const radius = node.height / 2;

    group
      .rect(node.width, node.height)
      .radius(radius)
      .move(node.x, node.y)
      .fill(theme.nodeFill)
      .stroke({ color: theme.nodeStroke, width: theme.nodeStrokeWidth });

    // Draw label
    group
      .text(node.label)
      .font({
        family: theme.fontFamily,
        size: theme.fontSize,
        anchor: 'middle',
      })
      .fill(theme.nodeTextColor)
      .center(node.x + node.width / 2, node.y + node.height / 2);

    return group;
  },

  getIntersection(node: PositionedNode, angle: number): { x: number; y: number } {
    const cx = node.x + node.width / 2;
    const cy = node.y + node.height / 2;
    const hh = node.height / 2;
    const radius = hh;

    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    // Check if we're hitting the rounded ends or the flat sides
    const rectWidth = node.width - 2 * radius;

    if (Math.abs(cos) * hh > Math.abs(sin) * (rectWidth / 2)) {
      // Hitting the rounded ends - use circle intersection
      const endCenterX = cos > 0 ? cx + rectWidth / 2 : cx - rectWidth / 2;
      return {
        x: endCenterX + radius * cos,
        y: cy + radius * sin,
      };
    }
    // Hitting the flat top/bottom
    const t = hh / Math.abs(sin);
    return {
      x: cx + t * cos,
      y: cy + t * sin,
    };
  },
};
