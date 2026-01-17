/**
 * Circle shape renderer
 */

import type { G, Svg } from '@svgdotjs/svg.js';
import type { PositionedNode, Theme } from '../types.js';
import type { ShapeRenderer } from './types.js';

export const circleShape: ShapeRenderer = {
  render(canvas: Svg, node: PositionedNode, theme: Theme): G {
    const group = canvas.group();

    const cx = node.x + node.width / 2;
    const cy = node.y + node.height / 2;
    const radius = Math.min(node.width, node.height) / 2;

    // Draw circle
    group
      .circle(radius * 2)
      .center(cx, cy)
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
      .center(cx, cy);

    return group;
  },

  getIntersection(node: PositionedNode, angle: number): { x: number; y: number } {
    const cx = node.x + node.width / 2;
    const cy = node.y + node.height / 2;
    const radius = Math.min(node.width, node.height) / 2;

    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  },
};
