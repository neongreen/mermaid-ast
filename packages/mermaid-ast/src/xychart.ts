/**
 * XY Chart Diagram Wrapper Class
 *
 * A unified API for building, mutating, and querying XY chart diagrams.
 * Provides a fluent interface that wraps the XYChartAST.
 */

import { DiagramWrapper } from './diagram-wrapper.js';
import { parseXYChart } from './parser/xychart-parser.js';
import { renderXYChart } from './renderer/xychart-renderer.js';
import type {
  DataSeries,
  XAxis,
  XAxisBand,
  XAxisRange,
  XYChartAST,
  XYChartOrientation,
  YAxis,
} from './types/xychart.js';
import { createEmptyXYChartAST } from './types/xychart.js';
import type { RenderOptions } from './types/render-options.js';

/**
 * Query options for finding series
 */
export interface FindSeriesQuery {
  /** Find series of this type */
  type?: 'line' | 'bar';
  /** Find series with this label */
  label?: string;
  /** Find series whose label contains this string */
  labelContains?: string;
}

/**
 * A fluent wrapper for XYChartAST that supports building, mutating, and querying.
 */
export class XYChart extends DiagramWrapper<XYChartAST> {
  private constructor(ast: XYChartAST) {
    super(ast);
  }

  // ============================================
  // Static Factory Methods
  // ============================================

  /**
   * Create a new empty XY chart diagram
   * @param orientation - Optional chart orientation (vertical or horizontal)
   */
  static create(orientation?: XYChartOrientation): XYChart {
    const ast = createEmptyXYChartAST();
    if (orientation) {
      ast.orientation = orientation;
    }
    return new XYChart(ast);
  }

  /**
   * Create an XYChart wrapper from an existing AST
   */
  static from(ast: XYChartAST): XYChart {
    return new XYChart(ast);
  }

  /**
   * Parse Mermaid syntax and create an XYChart wrapper
   */
  static parse(text: string): XYChart {
    const ast = parseXYChart(text);
    return new XYChart(ast);
  }

  // ============================================
  // Core Methods
  // ============================================

  /**
   * Render to Mermaid syntax
   */
  render(options?: RenderOptions): string {
    return renderXYChart(this.ast, options);
  }

  /**
   * Create a deep clone of this chart
   */
  clone(): XYChart {
    const cloneSeries = (series: DataSeries): DataSeries => ({
      ...series,
      values: [...series.values],
    });

    const cloned: XYChartAST = {
      type: 'xychart',
      title: this.ast.title,
      orientation: this.ast.orientation,
      xAxis: this.ast.xAxis
        ? this.ast.xAxis.type === 'band'
          ? { ...this.ast.xAxis, categories: [...this.ast.xAxis.categories] }
          : { ...this.ast.xAxis }
        : undefined,
      yAxis: this.ast.yAxis ? { ...this.ast.yAxis } : undefined,
      series: this.ast.series.map(cloneSeries),
      accTitle: this.ast.accTitle,
      accDescription: this.ast.accDescription,
    };
    return new XYChart(cloned);
  }

  // ============================================
  // Getters
  // ============================================

  /**
   * Get chart title
   */
  get title(): string | undefined {
    return this.ast.title;
  }

  /**
   * Get chart orientation
   */
  get orientation(): XYChartOrientation | undefined {
    return this.ast.orientation;
  }

  /**
   * Get X-axis configuration
   */
  get xAxis(): XAxis | undefined {
    return this.ast.xAxis;
  }

  /**
   * Get Y-axis configuration
   */
  get yAxis(): YAxis | undefined {
    return this.ast.yAxis;
  }

  /**
   * Get all data series
   */
  get series(): DataSeries[] {
    return this.ast.series;
  }

  /**
   * Get number of series
   */
  get seriesCount(): number {
    return this.ast.series.length;
  }

  /**
   * Get accessibility title
   */
  get accTitle(): string | undefined {
    return this.ast.accTitle;
  }

  /**
   * Get accessibility description
   */
  get accDescription(): string | undefined {
    return this.ast.accDescription;
  }

  // ============================================
  // Chart Configuration Operations
  // ============================================

  /**
   * Set chart title
   */
  setTitle(title: string): this {
    this.ast.title = title;
    return this;
  }

  /**
   * Remove chart title
   */
  removeTitle(): this {
    delete this.ast.title;
    return this;
  }

  /**
   * Set chart orientation
   */
  setOrientation(orientation: XYChartOrientation): this {
    this.ast.orientation = orientation;
    return this;
  }

  /**
   * Remove chart orientation (defaults to vertical)
   */
  removeOrientation(): this {
    delete this.ast.orientation;
    return this;
  }

  /**
   * Set accessibility title
   */
  setAccessibilityTitle(title: string): this {
    this.ast.accTitle = title;
    return this;
  }

  /**
   * Remove accessibility title
   */
  removeAccessibilityTitle(): this {
    delete this.ast.accTitle;
    return this;
  }

  /**
   * Set accessibility description
   */
  setAccessibilityDescription(description: string): this {
    this.ast.accDescription = description;
    return this;
  }

  /**
   * Remove accessibility description
   */
  removeAccessibilityDescription(): this {
    delete this.ast.accDescription;
    return this;
  }

  // ============================================
  // X-Axis Operations
  // ============================================

  /**
   * Set X-axis with categorical bands
   * @param categories - Array of category labels
   * @param title - Optional axis title
   */
  setXAxisBand(categories: string[], title?: string): this {
    const xAxis: XAxisBand = {
      type: 'band',
      categories,
    };
    if (title) {
      xAxis.title = title;
    }
    this.ast.xAxis = xAxis;
    return this;
  }

  /**
   * Set X-axis with numeric range
   * @param min - Minimum value
   * @param max - Maximum value
   * @param title - Optional axis title
   */
  setXAxisRange(min: number, max: number, title?: string): this {
    const xAxis: XAxisRange = {
      type: 'range',
      min,
      max,
    };
    if (title) {
      xAxis.title = title;
    }
    this.ast.xAxis = xAxis;
    return this;
  }

  /**
   * Set X-axis title (preserves existing axis configuration)
   */
  setXAxisTitle(title: string): this {
    if (!this.ast.xAxis) {
      this.ast.xAxis = { type: 'range', min: 0, max: 0 };
    }
    this.ast.xAxis.title = title;
    return this;
  }

  /**
   * Remove X-axis title
   */
  removeXAxisTitle(): this {
    if (this.ast.xAxis) {
      delete this.ast.xAxis.title;
    }
    return this;
  }

  /**
   * Remove X-axis entirely
   */
  removeXAxis(): this {
    delete this.ast.xAxis;
    return this;
  }

  // ============================================
  // Y-Axis Operations
  // ============================================

  /**
   * Set Y-axis with numeric range
   * @param min - Minimum value
   * @param max - Maximum value
   * @param title - Optional axis title
   */
  setYAxisRange(min: number, max: number, title?: string): this {
    const yAxis: YAxis = { min, max };
    if (title) {
      yAxis.title = title;
    }
    this.ast.yAxis = yAxis;
    return this;
  }

  /**
   * Set Y-axis title (preserves existing axis configuration)
   */
  setYAxisTitle(title: string): this {
    if (!this.ast.yAxis) {
      this.ast.yAxis = { min: 0, max: 0 };
    }
    this.ast.yAxis.title = title;
    return this;
  }

  /**
   * Remove Y-axis title
   */
  removeYAxisTitle(): this {
    if (this.ast.yAxis) {
      delete this.ast.yAxis.title;
    }
    return this;
  }

  /**
   * Remove Y-axis entirely
   */
  removeYAxis(): this {
    delete this.ast.yAxis;
    return this;
  }

  // ============================================
  // Series Operations
  // ============================================

  /**
   * Add a line series
   * @param values - Array of numeric values
   * @param label - Optional series label
   */
  addLineSeries(values: number[], label?: string): this {
    const series: DataSeries = {
      type: 'line',
      label: label || '',
      values,
    };
    this.ast.series.push(series);
    return this;
  }

  /**
   * Add a bar series
   * @param values - Array of numeric values
   * @param label - Optional series label
   */
  addBarSeries(values: number[], label?: string): this {
    const series: DataSeries = {
      type: 'bar',
      label: label || '',
      values,
    };
    this.ast.series.push(series);
    return this;
  }

  /**
   * Remove a series by index
   */
  removeSeries(index: number): this {
    if (index >= 0 && index < this.ast.series.length) {
      this.ast.series.splice(index, 1);
    }
    return this;
  }

  /**
   * Remove series by label
   */
  removeSeriesByLabel(label: string): this {
    this.ast.series = this.ast.series.filter((s) => s.label !== label);
    return this;
  }

  /**
   * Clear all series
   */
  clearSeries(): this {
    this.ast.series = [];
    return this;
  }

  /**
   * Set series label
   */
  setSeriesLabel(index: number, label: string): this {
    if (index >= 0 && index < this.ast.series.length) {
      this.ast.series[index].label = label;
    }
    return this;
  }

  /**
   * Set series values
   */
  setSeriesValues(index: number, values: number[]): this {
    if (index >= 0 && index < this.ast.series.length) {
      this.ast.series[index].values = values;
    }
    return this;
  }

  /**
   * Set series type
   */
  setSeriesType(index: number, type: 'line' | 'bar'): this {
    if (index >= 0 && index < this.ast.series.length) {
      this.ast.series[index].type = type;
    }
    return this;
  }

  // ============================================
  // Query Operations
  // ============================================

  /**
   * Get a series by index
   */
  getSeries(index: number): DataSeries | undefined {
    return this.ast.series[index];
  }

  /**
   * Find series matching a query
   */
  findSeries(query: FindSeriesQuery): DataSeries[] {
    return this.ast.series.filter((series) => {
      if (query.type !== undefined && series.type !== query.type) return false;
      if (query.label !== undefined && series.label !== query.label) return false;
      if (query.labelContains && !series.label.includes(query.labelContains)) return false;
      return true;
    });
  }

  /**
   * Get all line series
   */
  getLineSeries(): DataSeries[] {
    return this.ast.series.filter((s) => s.type === 'line');
  }

  /**
   * Get all bar series
   */
  getBarSeries(): DataSeries[] {
    return this.ast.series.filter((s) => s.type === 'bar');
  }

  /**
   * Check if X-axis is band (categorical)
   */
  isXAxisBand(): boolean {
    return this.ast.xAxis?.type === 'band';
  }

  /**
   * Check if X-axis is range (numeric)
   */
  isXAxisRange(): boolean {
    return this.ast.xAxis?.type === 'range';
  }

  /**
   * Get X-axis categories (if band type)
   */
  getXAxisCategories(): string[] | undefined {
    return this.ast.xAxis?.type === 'band' ? this.ast.xAxis.categories : undefined;
  }

  /**
   * Get X-axis range (if range type)
   */
  getXAxisRange(): { min: number; max: number } | undefined {
    return this.ast.xAxis?.type === 'range'
      ? { min: this.ast.xAxis.min, max: this.ast.xAxis.max }
      : undefined;
  }

  /**
   * Get Y-axis range
   */
  getYAxisRange(): { min: number; max: number } | undefined {
    return this.ast.yAxis ? { min: this.ast.yAxis.min, max: this.ast.yAxis.max } : undefined;
  }
}
