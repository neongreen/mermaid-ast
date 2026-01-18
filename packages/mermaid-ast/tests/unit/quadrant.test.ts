import { describe, expect, it } from 'bun:test';
import { Quadrant } from '../../src/quadrant.js';

describe('Quadrant Wrapper', () => {
  describe('Factory Methods', () => {
    it('should create an empty quadrant chart', () => {
      const quadrant = Quadrant.create();
      expect(quadrant.pointCount).toBe(0);
    });

    it('should create with title', () => {
      const quadrant = Quadrant.create('My Chart');
      expect(quadrant.title).toBe('My Chart');
    });

    it('should parse Mermaid syntax', () => {
      const quadrant = Quadrant.parse(`quadrantChart
    A: [0.5, 0.5]
    B: [0.7, 0.8]`);

      expect(quadrant.pointCount).toBe(2);
    });

    it('should create from existing AST', () => {
      const original = Quadrant.create('Test').addPoint('A', 0.5, 0.5);
      const copy = Quadrant.from(original.toAST());
      expect(copy.title).toBe('Test');
      expect(copy.pointCount).toBe(1);
    });
  });

  describe('Core Methods', () => {
    it('should return AST with toAST()', () => {
      const quadrant = Quadrant.create('My Chart').addPoint('A', 0.3, 0.7);

      const ast = quadrant.toAST();
      expect(ast.type).toBe('quadrant');
      expect(ast.title).toBe('My Chart');
      expect(ast.points.length).toBe(1);
    });

    it('should clone diagram', () => {
      const original = Quadrant.create('Original').addPoint('A', 0.5, 0.5).setXAxis('Low', 'High');

      const cloned = original.clone();

      // Verify clone has same data
      expect(cloned.title).toBe('Original');
      expect(cloned.pointCount).toBe(1);

      // Verify independence - modify original
      original.addPoint('B', 0.2, 0.8);
      expect(original.pointCount).toBe(2);
      expect(cloned.pointCount).toBe(1);
    });

    it('should render to Mermaid syntax', () => {
      const quadrant = Quadrant.create('Test Chart').addPoint('Point A', 0.3, 0.7);

      const rendered = quadrant.render();
      expect(rendered).toContain('quadrantChart');
      expect(rendered).toContain('title Test Chart');
      expect(rendered).toContain('Point A');
    });

    it('should render with options', () => {
      const quadrant = Quadrant.create('Test').addPoint('A', 0.5, 0.5);

      const rendered = quadrant.render({ indent: 2 });
      expect(rendered).toContain('quadrantChart');
    });
  });

  describe('Title Operations', () => {
    it('should set title', () => {
      const quadrant = Quadrant.create().setTitle('New Title');
      expect(quadrant.title).toBe('New Title');
    });

    it('should update existing title', () => {
      const quadrant = Quadrant.create('Old Title').setTitle('New Title');
      expect(quadrant.title).toBe('New Title');
    });
  });

  describe('Axis Operations', () => {
    it('should set X-axis labels', () => {
      const quadrant = Quadrant.create().setXAxis('Low Effort', 'High Effort');
      const ast = quadrant.toAST();
      expect(ast.xAxisLeft).toBe('Low Effort');
      expect(ast.xAxisRight).toBe('High Effort');
    });

    it('should set Y-axis labels', () => {
      const quadrant = Quadrant.create().setYAxis('Low Impact', 'High Impact');
      const ast = quadrant.toAST();
      expect(ast.yAxisBottom).toBe('Low Impact');
      expect(ast.yAxisTop).toBe('High Impact');
    });

    it('should set both axes', () => {
      const quadrant = Quadrant.create().setXAxis('Left', 'Right').setYAxis('Bottom', 'Top');

      const ast = quadrant.toAST();
      expect(ast.xAxisLeft).toBe('Left');
      expect(ast.xAxisRight).toBe('Right');
      expect(ast.yAxisBottom).toBe('Bottom');
      expect(ast.yAxisTop).toBe('Top');
    });
  });

  describe('Quadrant Label Operations', () => {
    it('should set quadrant labels', () => {
      const quadrant = Quadrant.create().setQuadrantLabels(
        'Do First',
        'Schedule',
        'Delegate',
        'Eliminate'
      );

      const ast = quadrant.toAST();
      expect(ast.quadrant1).toBe('Do First');
      expect(ast.quadrant2).toBe('Schedule');
      expect(ast.quadrant3).toBe('Delegate');
      expect(ast.quadrant4).toBe('Eliminate');
    });

    it('should set individual quadrant labels', () => {
      const quadrant = Quadrant.create().setQuadrantLabels('Q1').setQuadrantLabels(undefined, 'Q2');

      const ast = quadrant.toAST();
      expect(ast.quadrant1).toBe('Q1');
      expect(ast.quadrant2).toBe('Q2');
    });
  });

  describe('Point Operations', () => {
    it('should add points', () => {
      const quadrant = Quadrant.create().addPoint('A', 0.3, 0.7).addPoint('B', 0.8, 0.2);

      expect(quadrant.pointCount).toBe(2);
      expect(quadrant.getPoint('A')).toEqual({ name: 'A', x: 0.3, y: 0.7 });
    });

    it('should add points with options', () => {
      const quadrant = Quadrant.create().addPoint('A', 0.5, 0.5, { className: 'highlight' });

      const point = quadrant.getPoint('A');
      expect(point?.className).toBe('highlight');
    });

    it('should add points with styles', () => {
      const quadrant = Quadrant.create().addPoint('A', 0.5, 0.5, {
        styles: ['fill: red', 'stroke: blue'],
      });

      const point = quadrant.getPoint('A');
      expect(point?.styles).toEqual(['fill: red', 'stroke: blue']);
    });

    it('should remove points', () => {
      const quadrant = Quadrant.create()
        .addPoint('A', 0.5, 0.5)
        .addPoint('B', 0.7, 0.8)
        .removePoint('A');

      expect(quadrant.pointCount).toBe(1);
      expect(quadrant.getPoint('A')).toBeUndefined();
    });

    it('should update point coordinates', () => {
      const quadrant = Quadrant.create().addPoint('A', 0.5, 0.5).updatePoint('A', 0.7, 0.8);

      const point = quadrant.getPoint('A');
      expect(point?.x).toBe(0.7);
      expect(point?.y).toBe(0.8);
    });

    it('should update only x coordinate', () => {
      const quadrant = Quadrant.create().addPoint('A', 0.5, 0.5).updatePoint('A', 0.9, undefined);

      const point = quadrant.getPoint('A');
      expect(point?.x).toBe(0.9);
      expect(point?.y).toBe(0.5);
    });

    it('should update only y coordinate', () => {
      const quadrant = Quadrant.create().addPoint('A', 0.5, 0.5).updatePoint('A', undefined, 0.9);

      const point = quadrant.getPoint('A');
      expect(point?.x).toBe(0.5);
      expect(point?.y).toBe(0.9);
    });

    it('should get all points', () => {
      const quadrant = Quadrant.create().addPoint('A', 0.1, 0.2).addPoint('B', 0.3, 0.4);

      expect(quadrant.points.length).toBe(2);
    });
  });

  describe('Class Operations', () => {
    it('should add CSS class', () => {
      const quadrant = Quadrant.create().addClass('highlight', ['fill: yellow', 'stroke: black']);

      const cls = quadrant.getClass('highlight');
      expect(cls).toBeDefined();
      expect(cls?.styles).toEqual(['fill: yellow', 'stroke: black']);
    });

    it('should get undefined for non-existent class', () => {
      const quadrant = Quadrant.create();
      expect(quadrant.getClass('nonexistent')).toBeUndefined();
    });
  });

  describe('Query Operations', () => {
    it('should find points by name', () => {
      const quadrant = Quadrant.create()
        .addPoint('Feature A', 0.2, 0.3)
        .addPoint('Feature B', 0.7, 0.8)
        .addPoint('Bug Fix', 0.5, 0.9);

      const features = quadrant.findPoints({ nameContains: 'Feature' });
      expect(features.length).toBe(2);
    });

    it('should find points by coordinates', () => {
      const quadrant = Quadrant.create()
        .addPoint('A', 0.2, 0.3)
        .addPoint('B', 0.7, 0.8)
        .addPoint('C', 0.5, 0.9);

      const highX = quadrant.findPoints({ minX: 0.5 });
      expect(highX.length).toBe(2);
    });

    it('should find points by max coordinates', () => {
      const quadrant = Quadrant.create()
        .addPoint('A', 0.2, 0.3)
        .addPoint('B', 0.7, 0.8)
        .addPoint('C', 0.5, 0.9);

      const lowX = quadrant.findPoints({ maxX: 0.5 });
      expect(lowX.length).toBe(2);
    });

    it('should find points by y range', () => {
      const quadrant = Quadrant.create()
        .addPoint('A', 0.2, 0.3)
        .addPoint('B', 0.7, 0.8)
        .addPoint('C', 0.5, 0.5);

      const midY = quadrant.findPoints({ minY: 0.4, maxY: 0.6 });
      expect(midY.length).toBe(1);
      expect(midY[0].name).toBe('C');
    });

    it('should find points by class name', () => {
      const quadrant = Quadrant.create()
        .addPoint('A', 0.2, 0.3, { className: 'important' })
        .addPoint('B', 0.7, 0.8)
        .addPoint('C', 0.5, 0.9, { className: 'important' });

      const important = quadrant.findPoints({ className: 'important' });
      expect(important.length).toBe(2);
    });

    it('should get points by quadrant', () => {
      const quadrant = Quadrant.create()
        .addPoint('Q1', 0.6, 0.7) // Quadrant 1
        .addPoint('Q2', 0.3, 0.8) // Quadrant 2
        .addPoint('Q3', 0.2, 0.3) // Quadrant 3
        .addPoint('Q4', 0.8, 0.2); // Quadrant 4

      expect(quadrant.getPointsInQuadrant(1).length).toBe(1);
      expect(quadrant.getPointsInQuadrant(2).length).toBe(1);
      expect(quadrant.getPointsInQuadrant(3).length).toBe(1);
      expect(quadrant.getPointsInQuadrant(4).length).toBe(1);
    });

    it('should handle points on quadrant boundaries', () => {
      const quadrant = Quadrant.create()
        .addPoint('Center', 0.5, 0.5)
        .addPoint('XBoundary', 0.5, 0.3)
        .addPoint('YBoundary', 0.3, 0.5);

      // Points at boundary (0.5) are included in quadrants where condition is >=
      // Center (0.5, 0.5) -> x >= 0.5 && y >= 0.5 -> Q1
      // XBoundary (0.5, 0.3) -> x >= 0.5 && y < 0.5 -> Q4
      // YBoundary (0.3, 0.5) -> x < 0.5 && y >= 0.5 -> Q2
      expect(quadrant.getPointsInQuadrant(1).length).toBe(1); // Center
      expect(quadrant.getPointsInQuadrant(2).length).toBe(1); // YBoundary
      expect(quadrant.getPointsInQuadrant(3).length).toBe(0); // None
      expect(quadrant.getPointsInQuadrant(4).length).toBe(1); // XBoundary
    });
  });

  describe('Complex Scenarios', () => {
    it('should build Eisenhower Matrix', () => {
      const matrix = Quadrant.create('Eisenhower Matrix')
        .setXAxis('Not Urgent', 'Urgent')
        .setYAxis('Not Important', 'Important')
        .setQuadrantLabels('Do First', 'Schedule', 'Delegate', 'Eliminate')
        .addPoint('Crisis', 0.9, 0.9)
        .addPoint('Planning', 0.2, 0.8)
        .addPoint('Interruptions', 0.8, 0.2)
        .addPoint('Time Wasters', 0.2, 0.2);

      expect(matrix.pointCount).toBe(4);
      expect(matrix.getPointsInQuadrant(1).length).toBe(1); // Crisis
      expect(matrix.getPointsInQuadrant(2).length).toBe(1); // Planning
      expect(matrix.getPointsInQuadrant(3).length).toBe(1); // Time Wasters
      expect(matrix.getPointsInQuadrant(4).length).toBe(1); // Interruptions
    });

    it('should build feature prioritization chart', () => {
      const chart = Quadrant.create('Feature Prioritization')
        .setXAxis('Low Effort', 'High Effort')
        .setYAxis('Low Value', 'High Value')
        .setQuadrantLabels('Quick Wins', 'Major Projects', 'Fill-ins', 'Money Pit')
        .addClass('critical', ['fill: red'])
        .addPoint('Feature A', 0.2, 0.9, { className: 'critical' })
        .addPoint('Feature B', 0.8, 0.8)
        .addPoint('Feature C', 0.3, 0.2)
        .addPoint('Feature D', 0.9, 0.1);

      const quickWins = chart.getPointsInQuadrant(2); // Low effort, high value
      expect(quickWins.length).toBe(1);
      expect(quickWins[0].name).toBe('Feature A');

      const critical = chart.findPoints({ className: 'critical' });
      expect(critical.length).toBe(1);
    });

    it('should support round-trip parsing and rendering', () => {
      const original = Quadrant.create('Test Chart')
        .setXAxis('Left', 'Right')
        .setYAxis('Bottom', 'Top')
        .addPoint('A', 0.3, 0.7)
        .addPoint('B', 0.8, 0.2);

      const rendered = original.render();
      const parsed = Quadrant.parse(rendered);

      expect(parsed.title).toBe('Test Chart');
      expect(parsed.pointCount).toBe(2);
    });

    it('should handle empty chart operations', () => {
      const empty = Quadrant.create();

      expect(empty.pointCount).toBe(0);
      expect(empty.points).toEqual([]);
      expect(empty.getPoint('nonexistent')).toBeUndefined();
      expect(empty.findPoints({ minX: 0.5 })).toEqual([]);
      expect(empty.getPointsInQuadrant(1)).toEqual([]);
    });

    it('should chain multiple operations fluently', () => {
      const chart = Quadrant.create()
        .setTitle('Chained Chart')
        .setXAxis('X Left', 'X Right')
        .setYAxis('Y Bottom', 'Y Top')
        .setQuadrantLabels('Q1', 'Q2', 'Q3', 'Q4')
        .addClass('style1', ['fill: blue'])
        .addPoint('P1', 0.1, 0.1)
        .addPoint('P2', 0.9, 0.9)
        .removePoint('P1')
        .addPoint('P3', 0.5, 0.5);

      expect(chart.title).toBe('Chained Chart');
      expect(chart.pointCount).toBe(2);
      expect(chart.getPoint('P1')).toBeUndefined();
      expect(chart.getPoint('P2')).toBeDefined();
      expect(chart.getPoint('P3')).toBeDefined();
    });
  });
});
