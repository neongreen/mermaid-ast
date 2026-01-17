/**
 * Hexagon shape renderer
 */

import type { G, Svg } from '@svgdotjs/svg.js';
import type { PositionedNode, Theme } from '../types.js';
import type { ShapeRenderer } from './types.js';

export const hexagonShape: ShapeRenderer = {
  render(canvas: Svg, node: PositionedNode, theme: Theme): G {
    const group = canvas.group();

    const cx = node.x + node.width / 2;
    const cy = node.y + node.height / 2;

    // Hexagon with flat top/bottom (pointy sides)
    // The indent on the sides is about 1/4 of the width
    const indent = node.width / 4;

    const points = [
      [node.x + indent, node.y], // top-left
      [node.x + node.width - indent, node.y], // top-right
      [node.x + node.width, cy], // right
      [node.x + node.width - indent, node.y + node.height], // bottom-right
      [node.x + indent, node.y + node.height], // bottom-left
      [node.x, cy], // left
    ];

    group
      .polygon(points.map((p) => p.join(',')).join(' '))
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
    // Simplified: use rectangle approximation
    const cx = node.x + node.width / 2;
    const cy = node.y + node.height / 2;
    const hw = node.width / 2;
    const hh = node.height / 2;

    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const tx = hw / Math.abs(cos);
    const ty = hh / Math.abs(sin);
    const t = Math.min(tx, ty);

    return {
      x: cx + t * cos,
      y: cy + t * sin,
    };
  },
};
