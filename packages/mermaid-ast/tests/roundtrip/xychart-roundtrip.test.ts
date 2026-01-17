import { describe, expect, test } from 'bun:test';
import { parseXYChart } from '../../src/parser/xychart-parser.js';
import { renderXYChart } from '../../src/renderer/xychart-renderer.js';

/**
 * Test round-trip: parse -> render -> parse should produce equivalent AST
 */
function testRoundTrip(input: string, description: string) {
  test(description, () => {
    const ast1 = parseXYChart(input);
    const rendered = renderXYChart(ast1);
    const ast2 = parseXYChart(rendered);

    // Compare key properties
    expect(ast2.type).toBe(ast1.type);
    expect(ast2.title).toBe(ast1.title);
    expect(ast2.orientation).toBe(ast1.orientation);
    expect(ast2.accTitle).toBe(ast1.accTitle);
    expect(ast2.accDescription).toBe(ast1.accDescription);
    expect(ast2.series.length).toBe(ast1.series.length);

    // Compare X-axis
    if (ast1.xAxis) {
      expect(ast2.xAxis).toBeDefined();
      expect(ast2.xAxis?.type).toBe(ast1.xAxis.type);
      expect(ast2.xAxis?.title).toBe(ast1.xAxis.title);

      if (ast1.xAxis.type === 'band' && ast2.xAxis?.type === 'band') {
        expect(ast2.xAxis.categories).toEqual(ast1.xAxis.categories);
      } else if (ast1.xAxis.type === 'range' && ast2.xAxis?.type === 'range') {
        expect(ast2.xAxis.min).toBe(ast1.xAxis.min);
        expect(ast2.xAxis.max).toBe(ast1.xAxis.max);
      }
    } else {
      expect(ast2.xAxis).toBeUndefined();
    }

    // Compare Y-axis
    if (ast1.yAxis) {
      expect(ast2.yAxis).toBeDefined();
      expect(ast2.yAxis?.title).toBe(ast1.yAxis.title);
      expect(ast2.yAxis?.min).toBe(ast1.yAxis.min);
      expect(ast2.yAxis?.max).toBe(ast1.yAxis.max);
    } else {
      expect(ast2.yAxis).toBeUndefined();
    }

    // Compare series
    for (let i = 0; i < ast1.series.length; i++) {
      const series1 = ast1.series[i];
      const series2 = ast2.series[i];

      expect(series2.type).toBe(series1.type);
      expect(series2.label).toBe(series1.label);
      expect(series2.values).toEqual(series1.values);
    }
  });
}

describe('XY Chart Round-Trip Tests', () => {
  testRoundTrip(
    `xychart-beta
    line [1, 2, 3]`,
    'simple line chart'
  );

  testRoundTrip(
    `xychart-beta
    bar [10, 20, 30]`,
    'simple bar chart'
  );

  testRoundTrip(
    `xychart-beta
    title "Sales Data"
    line [1, 2, 3]`,
    'chart with title'
  );

  testRoundTrip(
    `xychart-beta horizontal
    line [1, 2, 3]`,
    'chart with orientation'
  );

  testRoundTrip(
    `xychart-beta
    line "Revenue" [100, 200, 300]`,
    'series with label'
  );

  testRoundTrip(
    `xychart-beta
    x-axis 0 --> 100
    line [1, 2, 3]`,
    'chart with X-axis range'
  );

  testRoundTrip(
    `xychart-beta
    x-axis "Month" 0 --> 12
    line [1, 2, 3]`,
    'chart with X-axis title and range'
  );

  testRoundTrip(
    `xychart-beta
    x-axis ["Q1", "Q2", "Q3", "Q4"]
    line [100, 120, 110, 130]`,
    'chart with categorical X-axis'
  );

  testRoundTrip(
    `xychart-beta
    x-axis "Quarter" ["Q1", "Q2", "Q3"]
    line [100, 150, 200]`,
    'chart with X-axis title and bands'
  );

  testRoundTrip(
    `xychart-beta
    y-axis 0 --> 1000
    line [100, 200, 300]`,
    'chart with Y-axis'
  );

  testRoundTrip(
    `xychart-beta
    y-axis "Revenue" 0 --> 1000
    line [100, 200, 300]`,
    'chart with Y-axis title'
  );

  testRoundTrip(
    `xychart-beta
    x-axis ["Jan", "Feb", "Mar"]
    y-axis 0 --> 500
    line [100, 200, 300]`,
    'chart with both axes'
  );

  testRoundTrip(
    `xychart-beta
    line "Series A" [1, 2, 3]
    line "Series B" [4, 5, 6]`,
    'multiple line series'
  );

  testRoundTrip(
    `xychart-beta
    line "Revenue" [100, 150, 200]
    bar "Target" [90, 140, 210]`,
    'mixed line and bar series'
  );

  testRoundTrip(
    `xychart-beta
    accTitle: Sales Chart
    line [1, 2, 3]`,
    'chart with accessibility title'
  );

  testRoundTrip(
    `xychart-beta
    accDescr: Chart showing sales over time
    line [1, 2, 3]`,
    'chart with accessibility description'
  );

  testRoundTrip(
    `xychart-beta
    line [1.5, 2.7, 3.14]`,
    'chart with decimal values'
  );

  testRoundTrip(
    `xychart-beta horizontal
    title "Quarterly Revenue"
    accTitle: Q Revenue Chart
    accDescr: Revenue comparison by quarter
    x-axis "Quarter" ["Q1", "Q2", "Q3", "Q4"]
    y-axis "Revenue ($K)" 0 --> 500
    line "2023" [100, 150, 200, 250]
    bar "2024" [120, 180, 220, 280]`,
    'complex chart with all features'
  );

  testRoundTrip(
    `xychart-beta
    x-axis "Hour" 0 --> 24
    y-axis "Temperature (°C)" -10 --> 40
    line "Today" [10, 12, 15, 18, 22, 25, 28, 30]`,
    'chart with numeric axes and special characters'
  );

  testRoundTrip(
    `xychart-beta
    line [100, 200, 300]
    line [150, 250, 350]
    line [200, 300, 400]
    bar [120, 220, 320]`,
    'chart with multiple series of different types'
  );
});
