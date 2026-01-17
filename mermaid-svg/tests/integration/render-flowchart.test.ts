/**
 * Integration tests for flowchart SVG rendering
 */

import { describe, it, expect } from 'bun:test';
import { parseFlowchart } from 'mermaid-ast';
import { renderFlowchartToSVG } from '../../src/index.js';

describe('renderFlowchartToSVG', () => {
  describe('simple flowchart', () => {
    it('should render a simple flowchart to valid SVG', async () => {
      const ast = parseFlowchart(`flowchart LR
        A[Start] --> B[End]
      `);

      const svg = await renderFlowchartToSVG(ast);

      // Check it's valid SVG
      expect(svg).toContain('<svg');
      expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
      expect(svg).toContain('</svg>');

      // Check it contains our nodes
      expect(svg).toContain('Start');
      expect(svg).toContain('End');
    });

    it('should render a flowchart with multiple node types', async () => {
      const ast = parseFlowchart(`flowchart TD
        A[Rectangle] --> B(Rounded)
        B --> C{Diamond}
        C --> D([Stadium])
        D --> E[(Cylinder)]
      `);

      const svg = await renderFlowchartToSVG(ast);

      expect(svg).toContain('<svg');
      expect(svg).toContain('Rectangle');
      expect(svg).toContain('Rounded');
      expect(svg).toContain('Diamond');
      expect(svg).toContain('Stadium');
      expect(svg).toContain('Cylinder');
    });

    it('should render a flowchart with edge labels', async () => {
      const ast = parseFlowchart(`flowchart LR
        A[Start] -->|Yes| B[Continue]
        A -->|No| C[Stop]
      `);

      const svg = await renderFlowchartToSVG(ast);

      expect(svg).toContain('<svg');
      expect(svg).toContain('Start');
      expect(svg).toContain('Continue');
      expect(svg).toContain('Stop');
      expect(svg).toContain('Yes');
      expect(svg).toContain('No');
    });
  });

  describe('layout directions', () => {
    it('should handle LR (left to right) direction', async () => {
      const ast = parseFlowchart(`flowchart LR
        A --> B --> C
      `);

      const svg = await renderFlowchartToSVG(ast);
      expect(svg).toContain('<svg');
    });

    it('should handle TD (top down) direction', async () => {
      const ast = parseFlowchart(`flowchart TD
        A --> B --> C
      `);

      const svg = await renderFlowchartToSVG(ast);
      expect(svg).toContain('<svg');
    });

    it('should handle RL (right to left) direction', async () => {
      const ast = parseFlowchart(`flowchart RL
        A --> B --> C
      `);

      const svg = await renderFlowchartToSVG(ast);
      expect(svg).toContain('<svg');
    });

    it('should handle BT (bottom to top) direction', async () => {
      const ast = parseFlowchart(`flowchart BT
        A --> B --> C
      `);

      const svg = await renderFlowchartToSVG(ast);
      expect(svg).toContain('<svg');
    });
  });

  describe('theming', () => {
    it('should accept custom theme options', async () => {
      const ast = parseFlowchart(`flowchart LR
        A[Start] --> B[End]
      `);

      const svg = await renderFlowchartToSVG(ast, {
        theme: {
          nodeFill: '#ff0000',
          nodeStroke: '#000000',
        },
      });

      expect(svg).toContain('<svg');
      // The custom colors should be applied
      expect(svg).toContain('#ff0000');
    });
  });
});