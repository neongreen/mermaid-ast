/**
 * XY Chart Renderer Tests
 */

import { describe, expect, it } from 'bun:test';
import { parseXYChart } from '../../src/parser/xychart-parser.js';
import { renderXYChart } from '../../src/renderer/xychart-renderer.js';
import { expectGolden } from '../golden/golden.js';
import { XYChart } from '../../src/xychart.js';

describe('XY Chart Renderer', () => {
  describe('Basic Rendering', () => {
    it('should render minimal xychart', () => {
      const ast = parseXYChart(`xychart-beta
    line [1, 2, 3]`);
      const rendered = renderXYChart(ast);
      expect(rendered).toContain('xychart-beta');
      expect(rendered).toContain('line [1, 2, 3]');
    });

    it('should render xychart with title', () => {
      const ast = parseXYChart(`xychart-beta
    title "Sales Data"
    line [1, 2, 3]`);
      const rendered = renderXYChart(ast);
      expect(rendered).toContain('title "Sales Data"');
    });

    it('should render xychart with orientation', () => {
      const ast = parseXYChart(`xychart-beta horizontal
    line [1, 2, 3]`);
      const rendered = renderXYChart(ast);
      expect(rendered).toContain('xychart-beta horizontal');
    });

    it('should render bar chart', () => {
      const ast = parseXYChart(`xychart-beta
    bar [10, 20, 30]`);
      const rendered = renderXYChart(ast);
      expect(rendered).toContain('bar [10, 20, 30]');
    });

    it('should render series with labels', () => {
      const ast = parseXYChart(`xychart-beta
    line "Revenue" [100, 200, 300]`);
      const rendered = renderXYChart(ast);
      expect(rendered).toContain('line "Revenue" [100, 200, 300]');
    });
  });

  describe('Axes Rendering', () => {
    it('should render X-axis with range', () => {
      const ast = parseXYChart(`xychart-beta
    x-axis 0 --> 100
    line [1, 2, 3]`);
      const rendered = renderXYChart(ast);
      expect(rendered).toContain('x-axis 0 --> 100');
    });

    it('should render X-axis with title and range', () => {
      const ast = parseXYChart(`xychart-beta
    x-axis "Month" 0 --> 12
    line [1, 2, 3]`);
      const rendered = renderXYChart(ast);
      expect(rendered).toContain('x-axis "Month" 0 --> 12');
    });

    it('should render X-axis with categorical bands', () => {
      const ast = parseXYChart(`xychart-beta
    x-axis ["Q1", "Q2", "Q3", "Q4"]
    line [100, 120, 110, 130]`);
      const rendered = renderXYChart(ast);
      expect(rendered).toContain('x-axis ["Q1", "Q2", "Q3", "Q4"]');
    });

    it('should render Y-axis with range', () => {
      const ast = parseXYChart(`xychart-beta
    y-axis 0 --> 1000
    line [100, 200, 300]`);
      const rendered = renderXYChart(ast);
      expect(rendered).toContain('y-axis 0 --> 1000');
    });

    it('should render Y-axis with title', () => {
      const ast = parseXYChart(`xychart-beta
    y-axis "Revenue" 0 --> 1000
    line [100, 200, 300]`);
      const rendered = renderXYChart(ast);
      expect(rendered).toContain('y-axis "Revenue" 0 --> 1000');
    });

    it('should render both axes', () => {
      const ast = parseXYChart(`xychart-beta
    x-axis "Month" ["Jan", "Feb", "Mar"]
    y-axis "Sales" 0 --> 500
    line [100, 200, 300]`);
      const rendered = renderXYChart(ast);
      expect(rendered).toContain('x-axis "Month" ["Jan", "Feb", "Mar"]');
      expect(rendered).toContain('y-axis "Sales" 0 --> 500');
    });
  });

  describe('Multiple Series Rendering', () => {
    it('should render multiple line series', () => {
      const ast = parseXYChart(`xychart-beta
    line "Series A" [1, 2, 3]
    line "Series B" [4, 5, 6]`);
      const rendered = renderXYChart(ast);
      expect(rendered).toContain('line "Series A" [1, 2, 3]');
      expect(rendered).toContain('line "Series B" [4, 5, 6]');
    });

    it('should render mixed line and bar series', () => {
      const ast = parseXYChart(`xychart-beta
    line "Revenue" [100, 150, 200]
    bar "Target" [90, 140, 210]`);
      const rendered = renderXYChart(ast);
      expect(rendered).toContain('line "Revenue" [100, 150, 200]');
      expect(rendered).toContain('bar "Target" [90, 140, 210]');
    });
  });

  describe('Accessibility Rendering', () => {
    it('should render accessibility title', () => {
      const ast = parseXYChart(`xychart-beta
    accTitle: Sales Chart
    line [1, 2, 3]`);
      const rendered = renderXYChart(ast);
      expect(rendered).toContain('accTitle: Sales Chart');
    });

    it('should render accessibility description', () => {
      const ast = parseXYChart(`xychart-beta
    accDescr: Chart showing sales over time
    line [1, 2, 3]`);
      const rendered = renderXYChart(ast);
      expect(rendered).toContain('accDescr: Chart showing sales over time');
    });
  });

  describe('Golden Tests', () => {
    it('should render simple line chart', () => {
      const diagram = XYChart.create().addLineSeries([10, 20, 30]);

      expectGolden(diagram.render(), 'xychart/render-simple.mmd');
    });

    it('should render chart with axes', () => {
      const diagram = XYChart.create()
        .setXAxisBand(['Q1', 'Q2', 'Q3'])
        .setYAxisRange(0, 100)
        .addLineSeries([30, 50, 70]);

      expectGolden(diagram.render(), 'xychart/render-axes.mmd');
    });

    it('should render chart with titles', () => {
      const diagram = XYChart.create()
        .setTitle('Sales Report')
        .setXAxisBand(['Jan', 'Feb', 'Mar'], 'Month')
        .setYAxisRange(0, 500, 'Revenue')
        .addLineSeries([100, 200, 300], 'Sales');

      expectGolden(diagram.render(), 'xychart/render-titles.mmd');
    });

    it('should render complex chart', () => {
      const diagram = XYChart.create('horizontal')
        .setTitle('Quarterly Revenue')
        .setXAxisBand(['Q1', 'Q2', 'Q3', 'Q4'], 'Quarter')
        .setYAxisRange(0, 500, 'Revenue ($K)')
        .addLineSeries([100, 150, 200, 250], '2023')
        .addBarSeries([120, 180, 220, 280], '2024')
        .setAccessibilityTitle('Q Revenue Chart')
        .setAccessibilityDescription('Quarterly revenue comparison');

      expectGolden(diagram.render(), 'xychart/render-complex.mmd');
    });
  });

  describe('Render Options', () => {
    it('should respect custom indent', () => {
      const ast = parseXYChart(`xychart-beta
    line [1, 2, 3]`);
      const rendered = renderXYChart(ast, { indent: 2 });
      const lines = rendered.split('\n');
      expect(lines[1]).toMatch(/^\s{2}line/);
    });

    it('should support tab indent', () => {
      const ast = parseXYChart(`xychart-beta
    line [1, 2, 3]`);
      const rendered = renderXYChart(ast, { indent: 'tab' });
      expect(rendered).toContain('\tline');
    });
  });
});
