import { describe, expect, it } from 'bun:test';
import { isQuadrantDiagram, parseQuadrant } from '../../src/parser/quadrant-parser.js';

describe('Quadrant Parser', () => {
  describe('isQuadrantDiagram', () => {
    it('should detect quadrant charts', () => {
      expect(isQuadrantDiagram('quadrantChart')).toBe(true);
      expect(isQuadrantDiagram('  quadrantChart\n')).toBe(true);
    });

    it('should not detect non-quadrant diagrams', () => {
      expect(isQuadrantDiagram('flowchart LR')).toBe(false);
      expect(isQuadrantDiagram('sankey-beta')).toBe(false);
    });
  });

  describe('Basic Parsing', () => {
    it('should parse a simple quadrant chart', () => {
      const input = `quadrantChart
    x-axis "Low" --> "High"
    y-axis "Weak" --> "Strong"
    A: [0.3, 0.6]
    B: [0.7, 0.8]`;

      const ast = parseQuadrant(input);

      expect(ast.type).toBe('quadrant');
      expect(ast.points.length).toBe(2);
      expect(ast.xAxisLeft).toBe('Low');
      expect(ast.xAxisRight).toBe('High');
      expect(ast.yAxisBottom).toBe('Weak');
      expect(ast.yAxisTop).toBe('Strong');
    });

    it('should parse point names as strings, not objects', () => {
      // Regression test: JISON grammar passes text as {text, type} objects
      // The parser must extract .text to store as string
      const input = `quadrantChart
    A: [0.3, 0.6]
    B: [0.7, 0.8]
    "Point C": [0.5, 0.5]`;

      const ast = parseQuadrant(input);

      expect(ast.points.length).toBe(3);
      // Verify names are strings, not objects
      expect(typeof ast.points[0].name).toBe('string');
      expect(typeof ast.points[1].name).toBe('string');
      expect(typeof ast.points[2].name).toBe('string');
      // Verify actual values
      expect(ast.points[0].name).toBe('A');
      expect(ast.points[1].name).toBe('B');
      expect(ast.points[2].name).toBe('Point C');
    });

    it('should parse quadrant labels', () => {
      const input = `quadrantChart
    quadrant-1 "Top Right"
    quadrant-2 "Top Left"
    quadrant-3 "Bottom Left"
    quadrant-4 "Bottom Right"`;

      const ast = parseQuadrant(input);

      expect(ast.quadrant1).toBe('Top Right');
      expect(ast.quadrant2).toBe('Top Left');
      expect(ast.quadrant3).toBe('Bottom Left');
      expect(ast.quadrant4).toBe('Bottom Right');
    });

    it('should parse with title', () => {
      const input = `quadrantChart
    title My Chart
    A: [0.5, 0.5]`;

      const ast = parseQuadrant(input);

      expect(ast.title).toBe('My Chart');
    });
  });
});
