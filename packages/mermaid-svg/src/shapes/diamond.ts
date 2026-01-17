/**
 * Diamond (decision) shape renderer
 */

import type { G, Svg } from '@svgdotjs/svg.js';
import type { PositionedNode, Theme } from '../types.js';
import type { ShapeRenderer } from './types.js';

export const diamondShape: ShapeRenderer = {
  render(canvas: Svg, node: PositionedNode, theme: Theme): G {
    const group = canvas.group();

    const cx = node.x + node.width / 2;
    const cy = node.y + node.height / 2;

    // Diamond points: top, right, bottom, left
    const points = [
      [cx, node.y], // top
      [node.x + node.width, cy], // right
      [cx, node.y + node.height], // bottom
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
    const cx = node.x + node.width / 2;
    const cy = node.y + node.height / 2;
    const hw = node.width / 2;
    const hh = node.height / 2;

    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    // Diamond intersection: the diamond edges have slopes ±(hh/hw)
    // Line from center: y = sin/cos * x (parametric: x = t*cos, y = t*sin)
    // Diamond edge: |x|/hw + |y|/hh = 1

    // Solving: |t*cos|/hw + |t*sin|/hh = 1
    // t * (|cos|/hw + |sin|/hh) = 1
    const t = 1 / (Math.abs(cos) / hw + Math.abs(sin) / hh);

    return {
      x: cx + t * cos,
      y: cy + t * sin,
    };
  },
};
