/**
 * XY Chart Wrapper Class Tests
 */

import { describe, expect, it } from 'bun:test';
import { XYChart } from '../../src/xychart.js';

describe('XYChart', () => {
  describe('Factory Methods', () => {
    it('should create empty chart', () => {
      const chart = XYChart.create();
      expect(chart.series).toEqual([]);
      expect(chart.seriesCount).toBe(0);
    });

    it('should create chart with orientation', () => {
      const chart = XYChart.create('horizontal');
      expect(chart.orientation).toBe('horizontal');
    });

    it('should parse from text', () => {
      const chart = XYChart.parse(`xychart-beta
    line [1, 2, 3]`);
      expect(chart.seriesCount).toBe(1);
      expect(chart.series[0].type).toBe('line');
    });

    it('should create from AST', () => {
      const ast = {
        type: 'xychart' as const,
        series: [{ type: 'line' as const, label: 'Test', values: [1, 2, 3] }],
      };
      const chart = XYChart.from(ast);
      expect(chart.seriesCount).toBe(1);
    });
  });

  describe('Core Methods', () => {
    it('should render to Mermaid syntax', () => {
      const chart = XYChart.create().addLineSeries([1, 2, 3]);
      const rendered = chart.render();
      expect(rendered).toContain('xychart-beta');
      expect(rendered).toContain('line [1, 2, 3]');
    });

    it('should clone chart', () => {
      const original = XYChart.create().setTitle('Original').addLineSeries([1, 2, 3]);

      const cloned = original.clone();
      cloned.setTitle('Modified');

      expect(original.title).toBe('Original');
      expect(cloned.title).toBe('Modified');
    });

    it('should convert to AST', () => {
      const chart = XYChart.create().addLineSeries([1, 2, 3]);
      const ast = chart.toAST();
      expect(ast.type).toBe('xychart');
      expect(ast.series).toHaveLength(1);
    });
  });

  describe('Chart Configuration Operations', () => {
    it('should set and remove title', () => {
      const chart = XYChart.create().setTitle('Sales Report').addLineSeries([1, 2, 3]);

      expect(chart.title).toBe('Sales Report');

      chart.removeTitle();
      expect(chart.title).toBeUndefined();
    });

    it('should set and remove orientation', () => {
      const chart = XYChart.create().setOrientation('horizontal').addLineSeries([1, 2, 3]);

      expect(chart.orientation).toBe('horizontal');

      chart.removeOrientation();
      expect(chart.orientation).toBeUndefined();
    });

    it('should set and remove accessibility title', () => {
      const chart = XYChart.create().setAccessibilityTitle('Sales Chart').addLineSeries([1, 2, 3]);

      expect(chart.accTitle).toBe('Sales Chart');

      chart.removeAccessibilityTitle();
      expect(chart.accTitle).toBeUndefined();
    });

    it('should set and remove accessibility description', () => {
      const chart = XYChart.create()
        .setAccessibilityDescription('Chart showing sales data')
        .addLineSeries([1, 2, 3]);

      expect(chart.accDescription).toBe('Chart showing sales data');

      chart.removeAccessibilityDescription();
      expect(chart.accDescription).toBeUndefined();
    });
  });

  describe('X-Axis Operations', () => {
    it('should set X-axis with bands', () => {
      const chart = XYChart.create().setXAxisBand(['Q1', 'Q2', 'Q3']).addLineSeries([1, 2, 3]);

      expect(chart.xAxis?.type).toBe('band');
      expect(chart.isXAxisBand()).toBe(true);
      expect(chart.getXAxisCategories()).toEqual(['Q1', 'Q2', 'Q3']);
    });

    it('should set X-axis with bands and title', () => {
      const chart = XYChart.create()
        .setXAxisBand(['Q1', 'Q2', 'Q3'], 'Quarter')
        .addLineSeries([1, 2, 3]);

      expect(chart.xAxis?.title).toBe('Quarter');
    });

    it('should set X-axis with range', () => {
      const chart = XYChart.create().setXAxisRange(0, 100).addLineSeries([1, 2, 3]);

      expect(chart.xAxis?.type).toBe('range');
      expect(chart.isXAxisRange()).toBe(true);
      expect(chart.getXAxisRange()).toEqual({ min: 0, max: 100 });
    });

    it('should set X-axis with range and title', () => {
      const chart = XYChart.create().setXAxisRange(0, 100, 'Time').addLineSeries([1, 2, 3]);

      expect(chart.xAxis?.title).toBe('Time');
    });

    it('should set and remove X-axis title', () => {
      const chart = XYChart.create().setXAxisRange(0, 100).setXAxisTitle('Time Period');

      expect(chart.xAxis?.title).toBe('Time Period');

      chart.removeXAxisTitle();
      expect(chart.xAxis?.title).toBeUndefined();
    });

    it('should remove X-axis', () => {
      const chart = XYChart.create().setXAxisRange(0, 100).addLineSeries([1, 2, 3]);

      expect(chart.xAxis).toBeDefined();

      chart.removeXAxis();
      expect(chart.xAxis).toBeUndefined();
    });
  });

  describe('Y-Axis Operations', () => {
    it('should set Y-axis with range', () => {
      const chart = XYChart.create().setYAxisRange(0, 1000).addLineSeries([100, 200, 300]);

      expect(chart.yAxis?.min).toBe(0);
      expect(chart.yAxis?.max).toBe(1000);
      expect(chart.getYAxisRange()).toEqual({ min: 0, max: 1000 });
    });

    it('should set Y-axis with title', () => {
      const chart = XYChart.create()
        .setYAxisRange(0, 1000, 'Revenue')
        .addLineSeries([100, 200, 300]);

      expect(chart.yAxis?.title).toBe('Revenue');
    });

    it('should set and remove Y-axis title', () => {
      const chart = XYChart.create().setYAxisRange(0, 1000).setYAxisTitle('Sales');

      expect(chart.yAxis?.title).toBe('Sales');

      chart.removeYAxisTitle();
      expect(chart.yAxis?.title).toBeUndefined();
    });

    it('should remove Y-axis', () => {
      const chart = XYChart.create().setYAxisRange(0, 1000).addLineSeries([1, 2, 3]);

      expect(chart.yAxis).toBeDefined();

      chart.removeYAxis();
      expect(chart.yAxis).toBeUndefined();
    });
  });

  describe('Series Operations', () => {
    it('should add line series', () => {
      const chart = XYChart.create().addLineSeries([1, 2, 3]).addLineSeries([4, 5, 6], 'Series B');

      expect(chart.seriesCount).toBe(2);
      expect(chart.series[0].type).toBe('line');
      expect(chart.series[0].values).toEqual([1, 2, 3]);
      expect(chart.series[1].label).toBe('Series B');
    });

    it('should add bar series', () => {
      const chart = XYChart.create()
        .addBarSeries([10, 20, 30])
        .addBarSeries([40, 50, 60], 'Series B');

      expect(chart.seriesCount).toBe(2);
      expect(chart.series[0].type).toBe('bar');
      expect(chart.series[0].values).toEqual([10, 20, 30]);
      expect(chart.series[1].label).toBe('Series B');
    });

    it('should remove series by index', () => {
      const chart = XYChart.create()
        .addLineSeries([1, 2, 3])
        .addLineSeries([4, 5, 6])
        .removeSeries(0);

      expect(chart.seriesCount).toBe(1);
      expect(chart.series[0].values).toEqual([4, 5, 6]);
    });

    it('should remove series by label', () => {
      const chart = XYChart.create()
        .addLineSeries([1, 2, 3], 'Series A')
        .addLineSeries([4, 5, 6], 'Series B')
        .removeSeriesByLabel('Series A');

      expect(chart.seriesCount).toBe(1);
      expect(chart.series[0].label).toBe('Series B');
    });

    it('should clear all series', () => {
      const chart = XYChart.create().addLineSeries([1, 2, 3]).addBarSeries([4, 5, 6]).clearSeries();

      expect(chart.seriesCount).toBe(0);
    });

    it('should set series label', () => {
      const chart = XYChart.create().addLineSeries([1, 2, 3]).setSeriesLabel(0, 'New Label');

      expect(chart.series[0].label).toBe('New Label');
    });

    it('should set series values', () => {
      const chart = XYChart.create().addLineSeries([1, 2, 3]).setSeriesValues(0, [10, 20, 30]);

      expect(chart.series[0].values).toEqual([10, 20, 30]);
    });

    it('should set series type', () => {
      const chart = XYChart.create().addLineSeries([1, 2, 3]).setSeriesType(0, 'bar');

      expect(chart.series[0].type).toBe('bar');
    });
  });

  describe('Query Operations', () => {
    it('should get series by index', () => {
      const chart = XYChart.create()
        .addLineSeries([1, 2, 3], 'Series A')
        .addBarSeries([4, 5, 6], 'Series B');

      const series = chart.getSeries(1);
      expect(series?.type).toBe('bar');
      expect(series?.label).toBe('Series B');
    });

    it('should find series by type', () => {
      const chart = XYChart.create()
        .addLineSeries([1, 2, 3])
        .addBarSeries([4, 5, 6])
        .addLineSeries([7, 8, 9]);

      const lineSeries = chart.findSeries({ type: 'line' });
      expect(lineSeries).toHaveLength(2);
    });

    it('should find series by label', () => {
      const chart = XYChart.create()
        .addLineSeries([1, 2, 3], 'Revenue')
        .addLineSeries([4, 5, 6], 'Target');

      const series = chart.findSeries({ label: 'Revenue' });
      expect(series).toHaveLength(1);
      expect(series[0].values).toEqual([1, 2, 3]);
    });

    it('should find series by label contains', () => {
      const chart = XYChart.create()
        .addLineSeries([1, 2, 3], 'Q1 Sales')
        .addLineSeries([4, 5, 6], 'Q2 Sales')
        .addBarSeries([7, 8, 9], 'Target');

      const salesSeries = chart.findSeries({ labelContains: 'Sales' });
      expect(salesSeries).toHaveLength(2);
    });

    it('should get line series', () => {
      const chart = XYChart.create()
        .addLineSeries([1, 2, 3])
        .addBarSeries([4, 5, 6])
        .addLineSeries([7, 8, 9]);

      const lineSeries = chart.getLineSeries();
      expect(lineSeries).toHaveLength(2);
    });

    it('should get bar series', () => {
      const chart = XYChart.create()
        .addLineSeries([1, 2, 3])
        .addBarSeries([4, 5, 6])
        .addBarSeries([7, 8, 9]);

      const barSeries = chart.getBarSeries();
      expect(barSeries).toHaveLength(2);
    });
  });

  describe('Complex Scenarios', () => {
    it('should build complete chart', () => {
      const chart = XYChart.create('horizontal')
        .setTitle('Quarterly Revenue')
        .setAccessibilityTitle('Q Revenue Chart')
        .setAccessibilityDescription('Revenue comparison by quarter')
        .setXAxisBand(['Q1', 'Q2', 'Q3', 'Q4'], 'Quarter')
        .setYAxisRange(0, 500, 'Revenue ($K)')
        .addLineSeries([100, 150, 200, 250], '2023')
        .addBarSeries([120, 180, 220, 280], '2024');

      expect(chart.title).toBe('Quarterly Revenue');
      expect(chart.orientation).toBe('horizontal');
      expect(chart.seriesCount).toBe(2);
      expect(chart.isXAxisBand()).toBe(true);
      expect(chart.getXAxisCategories()).toEqual(['Q1', 'Q2', 'Q3', 'Q4']);

      const rendered = chart.render();
      expect(rendered).toContain('xychart-beta horizontal');
      expect(rendered).toContain('title "Quarterly Revenue"');
      expect(rendered).toContain('x-axis "Quarter" ["Q1", "Q2", "Q3", "Q4"]');
      expect(rendered).toContain('y-axis "Revenue ($K)" 0 --> 500');
      expect(rendered).toContain('line "2023" [100, 150, 200, 250]');
      expect(rendered).toContain('bar "2024" [120, 180, 220, 280]');
    });

    it('should handle numeric X-axis', () => {
      const chart = XYChart.create()
        .setTitle('Temperature Over Time')
        .setXAxisRange(0, 24, 'Hour')
        .setYAxisRange(-10, 40, 'Temperature (°C)')
        .addLineSeries([10, 12, 15, 18, 22, 25, 28, 30], 'Today');

      expect(chart.isXAxisRange()).toBe(true);
      expect(chart.getXAxisRange()).toEqual({ min: 0, max: 24 });

      const rendered = chart.render();
      expect(rendered).toContain('x-axis "Hour" 0 --> 24');
    });

    it('should support fluent modifications', () => {
      const chart = XYChart.create()
        .addLineSeries([1, 2, 3], 'Old Label')
        .setSeriesLabel(0, 'New Label')
        .setSeriesValues(0, [10, 20, 30])
        .setSeriesType(0, 'bar');

      const series = chart.getSeries(0);
      expect(series?.type).toBe('bar');
      expect(series?.label).toBe('New Label');
      expect(series?.values).toEqual([10, 20, 30]);
    });
  });
});
