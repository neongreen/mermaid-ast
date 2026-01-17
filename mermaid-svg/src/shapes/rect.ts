/**
 * Rectangle shape renderer
 */

import type { G, Svg } from '@svgdotjs/svg.js';
import type { PositionedNode, Theme } from '../types.js';
import type { ShapeRenderer } from './types.js';

export const rectShape: ShapeRenderer = {
  render(canvas: Svg, node: PositionedNode, theme: Theme): G {
    const group = canvas.group();

    // Draw rectangle
    group
      .rect(node.width, node.height)
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
    const hw = node.width / 2;
    const hh = node.height / 2;

    // Calculate intersection with rectangle
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    // Check which edge the line intersects
    const tx = hw / Math.abs(cos);
    const ty = hh / Math.abs(sin);
    const t = Math.min(tx, ty);

    return {
      x: cx + t * cos,
      y: cy + t * sin,
    };
  },
};
