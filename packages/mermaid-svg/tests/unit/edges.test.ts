/**
 * Unit tests for edge rendering and markers
 */

import { describe, expect, it } from 'bun:test';
import { renderEdges } from '../../src/edges/edge-renderer.js';
import { createMarkers } from '../../src/edges/markers.js';
import { createSvgContext } from '../../src/svg-context.js';
import { defaultTheme } from '../../src/themes/default.js';
import type { PositionedEdge, PositionedNode } from '../../src/types.js';

describe('Markers', () => {
  describe('createMarkers', () => {
    it('should add marker definitions to SVG', () => {
      const ctx = createSvgContext(200, 200);

      createMarkers(ctx.canvas, defaultTheme);

      const svg = ctx.toSvg();
      expect(svg).toContain('<defs>');
      expect(svg).toContain('<marker');
    });

    it('should include point marker', () => {
      const ctx = createSvgContext(200, 200);

      createMarkers(ctx.canvas, defaultTheme);

      const svg = ctx.toSvg();
      expect(svg).toContain('id="marker-point"');
    });

    it('should include circle marker', () => {
      const ctx = createSvgContext(200, 200);

      createMarkers(ctx.canvas, defaultTheme);

      const svg = ctx.toSvg();
      expect(svg).toContain('id="marker-circle"');
    });

    it('should include cross marker', () => {
      const ctx = createSvgContext(200, 200);

      createMarkers(ctx.canvas, defaultTheme);

      const svg = ctx.toSvg();
      expect(svg).toContain('id="marker-cross"');
    });

    it('should include diamond marker', () => {
      const ctx = createSvgContext(200, 200);

      createMarkers(ctx.canvas, defaultTheme);

      const svg = ctx.toSvg();
      expect(svg).toContain('id="marker-diamond"');
    });
  });
});

describe('Edge Rendering', () => {
  const createTestNodes = (): PositionedNode[] => [
    { id: 'A', label: 'A', shape: 'rect', x: 0, y: 50, width: 50, height: 30 },
    { id: 'B', label: 'B', shape: 'rect', x: 150, y: 50, width: 50, height: 30 },
  ];

  describe('renderEdges', () => {
    it('should render a simple edge', () => {
      const ctx = createSvgContext(200, 200);
      const markers = createMarkers(ctx.canvas, defaultTheme);
      const nodes = createTestNodes();

      const edges: PositionedEdge[] = [
        {
          id: 'e1',
          sourceId: 'A',
          targetId: 'B',
          label: '',
          points: [
            { x: 50, y: 65 },
            { x: 150, y: 65 },
          ],
        },
      ];

      renderEdges(ctx.canvas, edges, nodes, markers, defaultTheme);

      const svg = ctx.toSvg();
      expect(svg).toContain('<path');
    });

    it('should render edge with multiple points', () => {
      const ctx = createSvgContext(200, 200);
      const markers = createMarkers(ctx.canvas, defaultTheme);
      const nodes = createTestNodes();

      const edges: PositionedEdge[] = [
        {
          id: 'e1',
          sourceId: 'A',
          targetId: 'B',
          label: '',
          points: [
            { x: 50, y: 65 },
            { x: 100, y: 100 },
            { x: 150, y: 65 },
          ],
        },
      ];

      renderEdges(ctx.canvas, edges, nodes, markers, defaultTheme);

      const svg = ctx.toSvg();
      expect(svg).toContain('<path');
      expect(svg).toContain('d='); // Path data
    });

    it('should render edge with label', () => {
      const ctx = createSvgContext(200, 200);
      const markers = createMarkers(ctx.canvas, defaultTheme);
      const nodes = createTestNodes();

      const edges: PositionedEdge[] = [
        {
          id: 'e1',
          sourceId: 'A',
          targetId: 'B',
          label: 'Yes',
          points: [
            { x: 50, y: 65 },
            { x: 150, y: 65 },
          ],
        },
      ];

      renderEdges(ctx.canvas, edges, nodes, markers, defaultTheme);

      const svg = ctx.toSvg();
      expect(svg).toContain('Yes');
    });

    it('should handle empty edges array', () => {
      const ctx = createSvgContext(200, 200);
      const markers = createMarkers(ctx.canvas, defaultTheme);
      const nodes = createTestNodes();

      renderEdges(ctx.canvas, [], nodes, markers, defaultTheme);

      const svg = ctx.toSvg();
      // Should still be valid SVG, just without edge paths
      expect(svg).toContain('<svg');
    });

    it('should include marker reference when edge has endMarker', () => {
      const ctx = createSvgContext(200, 200);
      const markers = createMarkers(ctx.canvas, defaultTheme);
      const nodes = createTestNodes();

      const edges: PositionedEdge[] = [
        {
          id: 'e1',
          sourceId: 'A',
          targetId: 'B',
          label: '',
          points: [
            { x: 50, y: 65 },
            { x: 150, y: 65 },
          ],
          endMarker: 'point',
        },
      ];

      renderEdges(ctx.canvas, edges, nodes, markers, defaultTheme);

      const svg = ctx.toSvg();
      expect(svg).toContain('marker-end');
    });
  });
});
