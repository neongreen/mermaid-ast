import { describe, expect, it } from 'bun:test';
import { isSankeyDiagram, parseSankey } from '../../src/parser/sankey-parser.js';

describe('Sankey Parser', () => {
  describe('isSankeyDiagram', () => {
    it('should detect sankey diagrams', () => {
      expect(isSankeyDiagram('sankey-beta\nA,B,10')).toBe(true);
      expect(isSankeyDiagram('sankey\nA,B,10')).toBe(true);
      expect(isSankeyDiagram('  sankey\n')).toBe(true);
    });

    it('should not detect non-sankey diagrams', () => {
      expect(isSankeyDiagram('flowchart LR')).toBe(false);
      expect(isSankeyDiagram('graph TD')).toBe(false);
      expect(isSankeyDiagram('sequenceDiagram')).toBe(false);
    });
  });

  describe('Basic Parsing', () => {
    it('should parse a simple sankey diagram', () => {
      const input = `sankey-beta
A,B,10`;

      const ast = parseSankey(input);

      expect(ast.type).toBe('sankey');
      expect(ast.nodes.size).toBe(2);
      expect(ast.links.length).toBe(1);
      expect(ast.links[0]).toEqual({
        source: 'A',
        target: 'B',
        value: 10,
      });
    });

    it('should parse multiple links', () => {
      const input = `sankey-beta
A,B,10
B,C,20
A,C,5`;

      const ast = parseSankey(input);

      expect(ast.nodes.size).toBe(3);
      expect(ast.links.length).toBe(3);
      expect(ast.links).toEqual([
        { source: 'A', target: 'B', value: 10 },
        { source: 'B', target: 'C', value: 20 },
        { source: 'A', target: 'C', value: 5 },
      ]);
    });

    it('should handle decimal values', () => {
      const input = `sankey-beta
A,B,10.5
B,C,20.75`;

      const ast = parseSankey(input);

      expect(ast.links[0].value).toBe(10.5);
      expect(ast.links[1].value).toBe(20.75);
    });

    it('should create nodes automatically', () => {
      const input = `sankey-beta
Source,Target,100`;

      const ast = parseSankey(input);

      expect(ast.nodes.has('Source')).toBe(true);
      expect(ast.nodes.has('Target')).toBe(true);
      expect(ast.nodes.get('Source')).toEqual({
        id: 'Source',
        label: 'Source',
      });
    });
  });

  describe('Advanced Parsing', () => {
    it('should handle quoted field names with commas', () => {
      const input = `sankey-beta
"A, Inc",B,10
B,"C, Ltd",20`;

      const ast = parseSankey(input);

      expect(ast.nodes.size).toBe(3);
      expect(ast.nodes.has('A, Inc')).toBe(true);
      expect(ast.nodes.has('C, Ltd')).toBe(true);
    });

    it('should handle escaped quotes', () => {
      const input = `sankey-beta
"A ""Company""",B,10`;

      const ast = parseSankey(input);

      expect(ast.nodes.has('A "Company"')).toBe(true);
    });

    it('should normalize input without sankey keyword', () => {
      const input = `A,B,10
B,C,20`;

      const ast = parseSankey(input);

      expect(ast.links.length).toBe(2);
    });

    it('should handle whitespace in values', () => {
      const input = `sankey-beta
A , B , 10
B , C , 20.5`;

      const ast = parseSankey(input);

      expect(ast.links[0].value).toBe(10);
      expect(ast.links[1].value).toBe(20.5);
    });
  });
});
