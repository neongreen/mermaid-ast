/**
 * XY Chart Parser Tests
 */

import { describe, expect, it } from 'bun:test';
import { isXYChartDiagram, parseXYChart } from '../../src/parser/xychart-parser.js';

describe('XY Chart Parser', () => {
  describe('isXYChartDiagram', () => {
    it('should detect xychart diagrams', () => {
      expect(isXYChartDiagram('xychart-beta')).toBe(true);
      expect(isXYChartDiagram('xychart')).toBe(true);
      expect(isXYChartDiagram('XYCHART-BETA')).toBe(true);
      expect(isXYChartDiagram('  xychart-beta  ')).toBe(true);
    });

    it('should reject non-xychart diagrams', () => {
      expect(isXYChartDiagram('flowchart LR')).toBe(false);
      expect(isXYChartDiagram('kanban')).toBe(false);
      expect(isXYChartDiagram('not xychart')).toBe(false);
    });
  });

  describe('Basic Parsing', () => {
    it('should parse minimal xychart', () => {
      const ast = parseXYChart(`xychart-beta
    line [1, 2, 3]`);
      expect(ast.type).toBe('xychart');
      expect(ast.series).toHaveLength(1);
      expect(ast.series[0].type).toBe('line');
      expect(ast.series[0].values).toEqual([1, 2, 3]);
    });

    it('should parse xychart with title', () => {
      const ast = parseXYChart(`xychart-beta
    title "Sales Data"
    line [1, 2, 3]`);
      expect(ast.title).toBe('Sales Data');
    });

    it('should parse xychart with orientation', () => {
      const ast = parseXYChart(`xychart-beta horizontal
    line [1, 2, 3]`);
      expect(ast.orientation).toBe('horizontal');
    });

    it('should parse bar chart', () => {
      const ast = parseXYChart(`xychart-beta
    bar [10, 20, 30]`);
      expect(ast.series[0].type).toBe('bar');
      expect(ast.series[0].values).toEqual([10, 20, 30]);
    });

    it('should parse series with labels', () => {
      const ast = parseXYChart(`xychart-beta
    line "Revenue" [100, 200, 300]`);
      expect(ast.series[0].label).toBe('Revenue');
    });

    it('should parse decimal values', () => {
      const ast = parseXYChart(`xychart-beta
    line [1.5, 2.7, 3.14]`);
      expect(ast.series[0].values).toEqual([1.5, 2.7, 3.14]);
    });
  });

  describe('Axes Parsing', () => {
    it('should parse X-axis with range', () => {
      const ast = parseXYChart(`xychart-beta
    x-axis 0 --> 100
    line [1, 2, 3]`);
      expect(ast.xAxis).toBeDefined();
      expect(ast.xAxis?.type).toBe('range');
      if (ast.xAxis?.type === 'range') {
        expect(ast.xAxis.min).toBe(0);
        expect(ast.xAxis.max).toBe(100);
      }
    });

    it('should parse X-axis with title', () => {
      const ast = parseXYChart(`xychart-beta
    x-axis "Month" 0 --> 12
    line [1, 2, 3]`);
      expect(ast.xAxis?.title).toBe('Month');
    });

    it('should parse X-axis with categorical bands', () => {
      const ast = parseXYChart(`xychart-beta
    x-axis ["Q1", "Q2", "Q3", "Q4"]
    line [100, 120, 110, 130]`);
      expect(ast.xAxis?.type).toBe('band');
      if (ast.xAxis?.type === 'band') {
        expect(ast.xAxis.categories).toEqual(['Q1', 'Q2', 'Q3', 'Q4']);
      }
    });

    it('should parse Y-axis with range', () => {
      const ast = parseXYChart(`xychart-beta
    y-axis 0 --> 1000
    line [100, 200, 300]`);
      expect(ast.yAxis).toBeDefined();
      expect(ast.yAxis?.min).toBe(0);
      expect(ast.yAxis?.max).toBe(1000);
    });

    it('should parse Y-axis with title', () => {
      const ast = parseXYChart(`xychart-beta
    y-axis "Revenue" 0 --> 1000
    line [100, 200, 300]`);
      expect(ast.yAxis?.title).toBe('Revenue');
    });

    it('should parse both axes', () => {
      const ast = parseXYChart(`xychart-beta
    x-axis "Month" ["Jan", "Feb", "Mar"]
    y-axis "Sales" 0 --> 500
    line [100, 200, 300]`);
      expect(ast.xAxis?.type).toBe('band');
      expect(ast.xAxis?.title).toBe('Month');
      expect(ast.yAxis?.title).toBe('Sales');
    });
  });

  describe('Multiple Series', () => {
    it('should parse multiple line series', () => {
      const ast = parseXYChart(`xychart-beta
    line "Series A" [1, 2, 3]
    line "Series B" [4, 5, 6]`);
      expect(ast.series).toHaveLength(2);
      expect(ast.series[0].label).toBe('Series A');
      expect(ast.series[1].label).toBe('Series B');
    });

    it('should parse mixed line and bar series', () => {
      const ast = parseXYChart(`xychart-beta
    line "Revenue" [100, 150, 200]
    bar "Target" [90, 140, 210]`);
      expect(ast.series).toHaveLength(2);
      expect(ast.series[0].type).toBe('line');
      expect(ast.series[1].type).toBe('bar');
    });
  });

  describe('Accessibility', () => {
    it('should parse accessibility title', () => {
      const ast = parseXYChart(`xychart-beta
    accTitle: Sales Chart
    line [1, 2, 3]`);
      expect(ast.accTitle).toBe('Sales Chart');
    });

    it('should parse accessibility description', () => {
      const ast = parseXYChart(`xychart-beta
    accDescr: Chart showing sales over time
    line [1, 2, 3]`);
      expect(ast.accDescription).toBe('Chart showing sales over time');
    });
  });

  describe('Complex Scenarios', () => {
    it('should parse complete chart', () => {
      const ast = parseXYChart(`xychart-beta horizontal
    title "Quarterly Revenue"
    accTitle: Q Revenue Chart
    x-axis "Quarter" ["Q1", "Q2", "Q3", "Q4"]
    y-axis "Revenue ($K)" 0 --> 500
    line "2023" [100, 150, 200, 250]
    bar "2024" [120, 180, 220, 280]`);

      expect(ast.title).toBe('Quarterly Revenue');
      expect(ast.orientation).toBe('horizontal');
      expect(ast.accTitle).toBe('Q Revenue Chart');
      expect(ast.xAxis?.type).toBe('band');
      expect(ast.series).toHaveLength(2);
    });
  });
});
