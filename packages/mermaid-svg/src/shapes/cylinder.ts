/**
 * Cylinder (database) shape renderer
 */

import type { G, Svg } from '@svgdotjs/svg.js';
import type { PositionedNode, Theme } from '../types.js';
import type { ShapeRenderer } from './types.js';

export const cylinderShape: ShapeRenderer = {
  render(canvas: Svg, node: PositionedNode, theme: Theme): G {
    const group = canvas.group();

    const cx = node.x + node.width / 2;
    const ellipseHeight = node.height / 6; // Height of the ellipse caps

    // Draw the cylinder body (rectangle)
    group
      .rect(node.width, node.height - ellipseHeight)
      .move(node.x, node.y + ellipseHeight / 2)
      .fill(theme.nodeFill)
      .stroke({ color: theme.nodeFill, width: 0 }); // No stroke on body

    // Draw bottom ellipse
    group
      .ellipse(node.width, ellipseHeight)
      .center(cx, node.y + node.height - ellipseHeight / 2)
      .fill(theme.nodeFill)
      .stroke({ color: theme.nodeStroke, width: theme.nodeStrokeWidth });

    // Draw top ellipse (full)
    group
      .ellipse(node.width, ellipseHeight)
      .center(cx, node.y + ellipseHeight / 2)
      .fill(theme.nodeFill)
      .stroke({ color: theme.nodeStroke, width: theme.nodeStrokeWidth });

    // Draw side lines
    group
      .line(node.x, node.y + ellipseHeight / 2, node.x, node.y + node.height - ellipseHeight / 2)
      .stroke({ color: theme.nodeStroke, width: theme.nodeStrokeWidth });
    group
      .line(
        node.x + node.width,
        node.y + ellipseHeight / 2,
        node.x + node.width,
        node.y + node.height - ellipseHeight / 2
      )
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
      .center(cx, node.y + node.height / 2);

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
