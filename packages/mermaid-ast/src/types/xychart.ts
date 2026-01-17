/**
 * XY Chart Diagram AST Types
 *
 * Represents XY chart diagrams with axes, line/bar series, and data points.
 */

/**
 * Chart orientation
 */
export type XYChartOrientation = 'vertical' | 'horizontal';

/**
 * X-axis can be either categorical (band) or numeric (range)
 */
export type XAxisType = 'band' | 'range';

/**
 * X-axis with categorical bands
 */
export interface XAxisBand {
  type: 'band';
  title?: string;
  categories: string[];
}

/**
 * X-axis with numeric range
 */
export interface XAxisRange {
  type: 'range';
  title?: string;
  min: number;
  max: number;
}

/**
 * X-axis definition (either band or range)
 */
export type XAxis = XAxisBand | XAxisRange;

/**
 * Y-axis with numeric range
 */
export interface YAxis {
  title?: string;
  min: number;
  max: number;
}

/**
 * Data series type
 */
export type SeriesType = 'line' | 'bar';

/**
 * A data series (line or bar)
 */
export interface DataSeries {
  type: SeriesType;
  label: string;
  values: number[];
}

/**
 * The complete XY Chart Diagram AST
 */
export interface XYChartAST {
  type: 'xychart';
  /** Chart title */
  title?: string;
  /** Chart orientation (vertical or horizontal) */
  orientation?: XYChartOrientation;
  /** X-axis configuration */
  xAxis?: XAxis;
  /** Y-axis configuration */
  yAxis?: YAxis;
  /** Data series (lines and bars) */
  series: DataSeries[];
  /** Accessibility title */
  accTitle?: string;
  /** Accessibility description */
  accDescription?: string;
}

/**
 * Create an empty XY Chart AST
 */
export function createEmptyXYChartAST(): XYChartAST {
  return {
    type: 'xychart',
    series: [],
  };
}
