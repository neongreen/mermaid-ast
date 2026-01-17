/**
 * Unit tests for ELK layout integration
 */

import { describe, expect, it } from 'bun:test';
import { parseFlowchart } from 'mermaid-ast';
import { layoutFlowchart } from '../../src/layout/elk-layout.js';
import { defaultTheme } from '../../src/themes/default.js';

describe('ELK Layout', () => {
  describe('layoutFlowchart', () => {
    it('should produce valid positions for nodes', async () => {
      const ast = parseFlowchart(`flowchart LR
        A[Start] --> B[End]
      `);

      const result = await layoutFlowchart(ast, defaultTheme);

      // Check that we have positioned nodes
      expect(result.nodes).toHaveLength(2);

      // Check that each node has valid position and dimensions
      for (const node of result.nodes) {
        expect(typeof node.x).toBe('number');
        expect(typeof node.y).toBe('number');
        expect(typeof node.width).toBe('number');
        expect(typeof node.height).toBe('number');
        expect(node.x).toBeGreaterThanOrEqual(0);
        expect(node.y).toBeGreaterThanOrEqual(0);
        expect(node.width).toBeGreaterThan(0);
        expect(node.height).toBeGreaterThan(0);
      }
    });

    it('should produce valid positions for edges', async () => {
      const ast = parseFlowchart(`flowchart LR
        A[Start] --> B[End]
      `);

      const result = await layoutFlowchart(ast, defaultTheme);

      // Check that we have positioned edges
      expect(result.edges).toHaveLength(1);

      // Check that each edge has valid points
      for (const edge of result.edges) {
        expect(edge.points).toBeDefined();
        expect(edge.points.length).toBeGreaterThanOrEqual(2);

        for (const point of edge.points) {
          expect(typeof point.x).toBe('number');
          expect(typeof point.y).toBe('number');
        }
      }
    });

    it('should respect LR direction', async () => {
      const ast = parseFlowchart(`flowchart LR
        A[Start] --> B[End]
      `);

      const result = await layoutFlowchart(ast, defaultTheme);

      // In LR direction, A should be to the left of B
      const nodeA = result.nodes.find((n) => n.id === 'A');
      const nodeB = result.nodes.find((n) => n.id === 'B');

      expect(nodeA).toBeDefined();
      expect(nodeB).toBeDefined();
      expect(nodeA!.x).toBeLessThan(nodeB!.x);
    });

    it('should respect TD direction', async () => {
      const ast = parseFlowchart(`flowchart TD
        A[Start] --> B[End]
      `);

      const result = await layoutFlowchart(ast, defaultTheme);

      // In TD direction, A should be above B
      const nodeA = result.nodes.find((n) => n.id === 'A');
      const nodeB = result.nodes.find((n) => n.id === 'B');

      expect(nodeA).toBeDefined();
      expect(nodeB).toBeDefined();
      expect(nodeA!.y).toBeLessThan(nodeB!.y);
    });

    it('should handle nodes without links', async () => {
      const ast = parseFlowchart(`flowchart LR
        A[Lonely Node]
      `);

      const result = await layoutFlowchart(ast, defaultTheme);

      expect(result.nodes).toHaveLength(1);
      expect(result.edges).toHaveLength(0);

      const node = result.nodes[0];
      expect(node.x).toBeGreaterThanOrEqual(0);
      expect(node.y).toBeGreaterThanOrEqual(0);
    });

    it('should handle multiple disconnected components', async () => {
      const ast = parseFlowchart(`flowchart LR
        A --> B
        C --> D
      `);

      const result = await layoutFlowchart(ast, defaultTheme);

      expect(result.nodes).toHaveLength(4);
      expect(result.edges).toHaveLength(2);

      // All nodes should have valid positions
      for (const node of result.nodes) {
        expect(node.x).toBeGreaterThanOrEqual(0);
        expect(node.y).toBeGreaterThanOrEqual(0);
      }
    });

    it('should calculate correct bounds', async () => {
      const ast = parseFlowchart(`flowchart LR
        A[Start] --> B[End]
      `);

      const result = await layoutFlowchart(ast, defaultTheme);

      // Bounds should encompass all nodes
      expect(result.width).toBeGreaterThan(0);
      expect(result.height).toBeGreaterThan(0);

      // All nodes should be within bounds
      for (const node of result.nodes) {
        expect(node.x + node.width).toBeLessThanOrEqual(result.width + 10); // Allow some padding
        expect(node.y + node.height).toBeLessThanOrEqual(result.height + 10);
      }
    });

    it('should handle different node shapes', async () => {
      const ast = parseFlowchart(`flowchart LR
        A[Rectangle]
        B(Rounded)
        C([Stadium])
        D{Diamond}
        E{{Hexagon}}
        F[(Cylinder)]
        G((Circle))
      `);

      const result = await layoutFlowchart(ast, defaultTheme);

      expect(result.nodes).toHaveLength(7);

      // All nodes should have valid positions regardless of shape
      for (const node of result.nodes) {
        expect(node.x).toBeGreaterThanOrEqual(0);
        expect(node.y).toBeGreaterThanOrEqual(0);
        expect(node.width).toBeGreaterThan(0);
        expect(node.height).toBeGreaterThan(0);
      }
    });

    it('should handle edge labels', async () => {
      const ast = parseFlowchart(`flowchart LR
        A -->|Yes| B
        A -->|No| C
      `);

      const result = await layoutFlowchart(ast, defaultTheme);

      expect(result.edges).toHaveLength(2);

      // Check that edge labels are preserved
      const yesEdge = result.edges.find((e) => e.label === 'Yes');
      const noEdge = result.edges.find((e) => e.label === 'No');

      expect(yesEdge).toBeDefined();
      expect(noEdge).toBeDefined();
    });
  });
});
