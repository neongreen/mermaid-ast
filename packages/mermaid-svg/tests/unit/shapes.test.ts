/**
 * Unit tests for shape rendering
 */

import { describe, expect, it } from 'bun:test';
import { getShape, shapeRegistry } from '../../src/shapes/index.js';
import { createSvgContext } from '../../src/svg-context.js';
import { defaultTheme } from '../../src/themes/default.js';
import type { PositionedNode } from '../../src/types.js';

describe('Shape Registry', () => {
  it('should have all expected shapes registered', () => {
    const expectedShapes = [
      'rect',
      'rounded',
      'stadium',
      'diamond',
      'hexagon',
      'cylinder',
      'circle',
    ];

    for (const shape of expectedShapes) {
      expect(shapeRegistry.has(shape)).toBe(true);
    }
  });

  it('should return a renderer for each registered shape', () => {
    const shapes = ['rect', 'rounded', 'stadium', 'diamond', 'hexagon', 'cylinder', 'circle'];

    for (const shape of shapes) {
      const renderer = getShape(shape);
      expect(renderer).toBeDefined();
      expect(typeof renderer.render).toBe('function');
      expect(typeof renderer.getIntersection).toBe('function');
    }
  });

  it('should return rect renderer for unknown shapes', () => {
    const renderer = getShape('unknown-shape');
    const rectRenderer = getShape('rect');
    expect(renderer).toBe(rectRenderer);
  });
});

describe('Shape Rendering', () => {
  const createTestNode = (shape: string, label = 'Test'): PositionedNode => ({
    id: 'test',
    label,
    shape,
    x: 50,
    y: 50,
    width: 100,
    height: 60,
  });

  describe('rect shape', () => {
    it('should render a rectangle', () => {
      const ctx = createSvgContext(200, 200);
      const node = createTestNode('rect');
      const renderer = getShape('rect');

      renderer.render(ctx.canvas, node, defaultTheme);

      const svg = ctx.toSvg();
      expect(svg).toContain('<rect');
      expect(svg).toContain('width="100"');
      expect(svg).toContain('height="60"');
    });

    it('should include the label text', () => {
      const ctx = createSvgContext(200, 200);
      const node = createTestNode('rect', 'My Label');
      const renderer = getShape('rect');

      renderer.render(ctx.canvas, node, defaultTheme);

      const svg = ctx.toSvg();
      expect(svg).toContain('My Label');
    });
  });

  describe('rounded shape', () => {
    it('should render a rounded rectangle', () => {
      const ctx = createSvgContext(200, 200);
      const node = createTestNode('rounded');
      const renderer = getShape('rounded');

      renderer.render(ctx.canvas, node, defaultTheme);

      const svg = ctx.toSvg();
      expect(svg).toContain('<rect');
      expect(svg).toContain('rx='); // Rounded corners
    });
  });

  describe('stadium shape', () => {
    it('should render a stadium/pill shape', () => {
      const ctx = createSvgContext(200, 200);
      const node = createTestNode('stadium');
      const renderer = getShape('stadium');

      renderer.render(ctx.canvas, node, defaultTheme);

      const svg = ctx.toSvg();
      expect(svg).toContain('<rect');
      expect(svg).toContain('rx='); // Fully rounded ends
    });
  });

  describe('diamond shape', () => {
    it('should render a diamond', () => {
      const ctx = createSvgContext(200, 200);
      const node = createTestNode('diamond');
      const renderer = getShape('diamond');

      renderer.render(ctx.canvas, node, defaultTheme);

      const svg = ctx.toSvg();
      expect(svg).toContain('<polygon');
    });
  });

  describe('hexagon shape', () => {
    it('should render a hexagon', () => {
      const ctx = createSvgContext(200, 200);
      const node = createTestNode('hexagon');
      const renderer = getShape('hexagon');

      renderer.render(ctx.canvas, node, defaultTheme);

      const svg = ctx.toSvg();
      expect(svg).toContain('<polygon');
    });
  });

  describe('cylinder shape', () => {
    it('should render a cylinder', () => {
      const ctx = createSvgContext(200, 200);
      const node = createTestNode('cylinder');
      const renderer = getShape('cylinder');

      renderer.render(ctx.canvas, node, defaultTheme);

      const svg = ctx.toSvg();
      // Cylinder is made of ellipses for the curved top/bottom
      expect(svg).toContain('<ellipse');
    });
  });

  describe('circle shape', () => {
    it('should render a circle', () => {
      const ctx = createSvgContext(200, 200);
      const node = createTestNode('circle');
      const renderer = getShape('circle');

      renderer.render(ctx.canvas, node, defaultTheme);

      const svg = ctx.toSvg();
      expect(svg).toContain('<circle');
    });
  });
});

describe('Shape Intersection', () => {
  const createTestNode = (shape: string): PositionedNode => ({
    id: 'test',
    label: 'Test',
    shape,
    x: 50,
    y: 50,
    width: 100,
    height: 60,
  });

  it('should calculate intersection for rect shape', () => {
    const node = createTestNode('rect');
    const renderer = getShape('rect');

    // Angle pointing right (0 radians)
    const intersection = renderer.getIntersection(node, 0);

    expect(intersection.x).toBeGreaterThan(node.x);
    expect(intersection.y).toBeCloseTo(node.y + node.height / 2, 1);
  });

  it('should calculate intersection for circle shape', () => {
    const node = createTestNode('circle');
    const renderer = getShape('circle');

    // Angle pointing right (0 radians)
    const intersection = renderer.getIntersection(node, 0);

    expect(intersection.x).toBeGreaterThan(node.x);
  });
});
