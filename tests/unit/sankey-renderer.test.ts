import { describe, expect, it } from 'bun:test';
import { parseSankey } from '../../src/parser/sankey-parser.js';
import { renderSankey } from '../../src/renderer/sankey-renderer.js';
import { Sankey } from '../../src/sankey.js';
import { expectGolden } from '../golden/golden.js';

describe('Sankey Renderer', () => {
  describe('Basic Rendering', () => {
    it('should render a simple sankey diagram', () => {
      const ast = parseSankey(`sankey-beta
A,B,10`);

      const output = renderSankey(ast);

      expect(output).toContain('sankey-beta');
      expect(output).toContain('A,B,10');
    });

    it('should render multiple links', () => {
      const ast = parseSankey(`sankey-beta
A,B,10
B,C,20
A,C,5`);

      const output = renderSankey(ast);

      expect(output).toContain('A,B,10');
      expect(output).toContain('B,C,20');
      expect(output).toContain('A,C,5');
    });

    it('should render decimal values', () => {
      const ast = parseSankey(`sankey-beta
A,B,10.5
B,C,20.75`);

      const output = renderSankey(ast);

      expect(output).toContain('10.5');
      expect(output).toContain('20.75');
    });
  });

  describe('Advanced Rendering', () => {
    it('should escape field names with commas', () => {
      const diagram = Sankey.create()
        .addNode('A, Inc', 'A, Inc')
        .addNode('B', 'B')
        .addLink('A, Inc', 'B', 10);

      const output = diagram.render();

      expect(output).toContain('"A, Inc"');
    });

    it('should escape quotes in field names', () => {
      const diagram = Sankey.create()
        .addNode('A "Company"', 'A "Company"')
        .addNode('B', 'B')
        .addLink('A "Company"', 'B', 10);

      const output = diagram.render();

      expect(output).toContain('"A ""Company"""');
    });
  });

  describe('Golden Tests', () => {
    it('should handle simple sankey diagram', () => {
      const diagram = Sankey.create()
        .addLink('A', 'B', 10)
        .addLink('B', 'C', 20)
        .addLink('A', 'C', 5);

      expectGolden(diagram.render(), 'sankey/render-simple.mmd');
    });

    it('should handle decimal values', () => {
      const diagram = Sankey.create()
        .addLink('Source', 'Target', 10.5)
        .addLink('Target', 'End', 20.75);

      expectGolden(diagram.render(), 'sankey/render-decimal.mmd');
    });

    it('should handle complex node names', () => {
      const diagram = Sankey.create()
        .addLink('Product A', 'Region 1', 100)
        .addLink('Product B', 'Region 1', 50)
        .addLink('Region 1', 'Customer', 150);

      expectGolden(diagram.render(), 'sankey/render-complex.mmd');
    });
  });
});
