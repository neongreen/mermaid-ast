/**
 * Quadrant Chart Wrapper Class
 *
 * A unified API for building, mutating, and querying quadrant charts.
 * Provides a fluent interface that wraps the QuadrantAST.
 */

import { DiagramWrapper } from './diagram-wrapper.js';
import { parseQuadrant } from './parser/quadrant-parser.js';
import { renderQuadrant } from './renderer/quadrant-renderer.js';
import type { QuadrantAST, QuadrantClass, QuadrantPoint } from './types/quadrant.js';
import { createEmptyQuadrantAST } from './types/quadrant.js';
import type { RenderOptions } from './types/render-options.js';

/**
 * Options for adding a point
 */
export interface AddQuadrantPointOptions {
  /** Optional CSS class for styling */
  className?: string;
  /** Optional inline styles */
  styles?: string[];
}

/**
 * Query options for finding points
 */
export interface FindQuadrantPointsQuery {
  /** Find points whose name contains this string */
  nameContains?: string;
  /** Find points with x >= this value */
  minX?: number;
  /** Find points with x <= this value */
  maxX?: number;
  /** Find points with y >= this value */
  minY?: number;
  /** Find points with y <= this value */
  maxY?: number;
  /** Find points with this class */
  className?: string;
}

/**
 * A fluent wrapper for QuadrantAST that supports building, mutating, and querying.
 */
export class Quadrant extends DiagramWrapper<QuadrantAST> {
  private constructor(ast: QuadrantAST) {
    super(ast);
  }

  // ============================================
  // Static Factory Methods
  // ============================================

  /**
   * Create a new empty quadrant chart
   */
  static create(title?: string): Quadrant {
    const ast = createEmptyQuadrantAST();
    if (title) {
      ast.title = title;
    }
    return new Quadrant(ast);
  }

  /**
   * Create a Quadrant wrapper from an existing AST
   */
  static from(ast: QuadrantAST): Quadrant {
    return new Quadrant(ast);
  }

  /**
   * Parse Mermaid syntax and create a Quadrant wrapper
   */
  static parse(text: string): Quadrant {
    const ast = parseQuadrant(text);
    return new Quadrant(ast);
  }

  // ============================================
  // Core Methods
  // ============================================

  /**
   * Render to Mermaid syntax
   */
  render(options?: RenderOptions): string {
    return renderQuadrant(this.ast, options);
  }

  /**
   * Create a deep clone of this quadrant chart
   */
  clone(): Quadrant {
    const cloned: QuadrantAST = {
      type: 'quadrant',
      title: this.ast.title,
      accTitle: this.ast.accTitle,
      accDescription: this.ast.accDescription,
      points: this.ast.points.map((p) => ({ ...p, styles: p.styles ? [...p.styles] : undefined })),
      xAxisLeft: this.ast.xAxisLeft,
      xAxisRight: this.ast.xAxisRight,
      yAxisBottom: this.ast.yAxisBottom,
      yAxisTop: this.ast.yAxisTop,
      quadrant1: this.ast.quadrant1,
      quadrant2: this.ast.quadrant2,
      quadrant3: this.ast.quadrant3,
      quadrant4: this.ast.quadrant4,
      classes: this.ast.classes
        ? new Map(
            Array.from(this.ast.classes.entries()).map(([key, cls]) => [
              key,
              { ...cls, styles: [...cls.styles] },
            ])
          )
        : undefined,
    };
    return new Quadrant(cloned);
  }

  // ============================================
  // Getters
  // ============================================

  /**
   * Get diagram title
   */
  get title(): string | undefined {
    return this.ast.title;
  }

  /**
   * Get all points
   */
  get points(): QuadrantPoint[] {
    return this.ast.points;
  }

  /**
   * Get point count
   */
  get pointCount(): number {
    return this.ast.points.length;
  }

  // ============================================
  // Title Operations
  // ============================================

  /**
   * Set diagram title
   */
  setTitle(title: string): this {
    this.ast.title = title;
    return this;
  }

  // ============================================
  // Axis Operations
  // ============================================

  /**
   * Set X-axis labels
   */
  setXAxis(left: string, right: string): this {
    this.ast.xAxisLeft = left;
    this.ast.xAxisRight = right;
    return this;
  }

  /**
   * Set Y-axis labels
   */
  setYAxis(bottom: string, top: string): this {
    this.ast.yAxisBottom = bottom;
    this.ast.yAxisTop = top;
    return this;
  }

  // ============================================
  // Quadrant Operations
  // ============================================

  /**
   * Set quadrant labels
   */
  setQuadrantLabels(q1?: string, q2?: string, q3?: string, q4?: string): this {
    if (q1 !== undefined) this.ast.quadrant1 = q1;
    if (q2 !== undefined) this.ast.quadrant2 = q2;
    if (q3 !== undefined) this.ast.quadrant3 = q3;
    if (q4 !== undefined) this.ast.quadrant4 = q4;
    return this;
  }

  // ============================================
  // Point Operations
  // ============================================

  /**
   * Add a data point
   */
  addPoint(name: string, x: number, y: number, options?: AddQuadrantPointOptions): this {
    const point: QuadrantPoint = {
      name,
      x,
      y,
    };

    if (options?.className) {
      point.className = options.className;
    }

    if (options?.styles) {
      point.styles = options.styles;
    }

    this.ast.points.push(point);
    return this;
  }

  /**
   * Get a point by name
   */
  getPoint(name: string): QuadrantPoint | undefined {
    return this.ast.points.find((p) => p.name === name);
  }

  /**
   * Remove a point
   */
  removePoint(name: string): this {
    const idx = this.ast.points.findIndex((p) => p.name === name);
    if (idx !== -1) {
      this.ast.points.splice(idx, 1);
    }
    return this;
  }

  /**
   * Update point coordinates
   */
  updatePoint(name: string, x?: number, y?: number): this {
    const point = this.getPoint(name);
    if (point) {
      if (x !== undefined) point.x = x;
      if (y !== undefined) point.y = y;
    }
    return this;
  }

  // ============================================
  // Class Operations
  // ============================================

  /**
   * Add a CSS class definition
   */
  addClass(name: string, styles: string[]): this {
    if (!this.ast.classes) {
      this.ast.classes = new Map();
    }
    this.ast.classes.set(name, { name, styles });
    return this;
  }

  /**
   * Get a class definition
   */
  getClass(name: string): QuadrantClass | undefined {
    return this.ast.classes?.get(name);
  }

  // ============================================
  // Query Operations
  // ============================================

  /**
   * Find points matching a query
   */
  findPoints(query: FindQuadrantPointsQuery): QuadrantPoint[] {
    let points = this.ast.points;

    if (query.nameContains) {
      points = points.filter((p) => p.name.includes(query.nameContains!));
    }

    if (query.minX !== undefined) {
      points = points.filter((p) => p.x >= query.minX!);
    }

    if (query.maxX !== undefined) {
      points = points.filter((p) => p.x <= query.maxX!);
    }

    if (query.minY !== undefined) {
      points = points.filter((p) => p.y >= query.minY!);
    }

    if (query.maxY !== undefined) {
      points = points.filter((p) => p.y <= query.maxY!);
    }

    if (query.className) {
      points = points.filter((p) => p.className === query.className);
    }

    return points;
  }

  /**
   * Get points in a specific quadrant (1-4)
   */
  getPointsInQuadrant(quadrant: 1 | 2 | 3 | 4): QuadrantPoint[] {
    return this.ast.points.filter((p) => {
      if (quadrant === 1) return p.x >= 0.5 && p.y >= 0.5; // Top-right
      if (quadrant === 2) return p.x < 0.5 && p.y >= 0.5; // Top-left
      if (quadrant === 3) return p.x < 0.5 && p.y < 0.5; // Bottom-left
      if (quadrant === 4) return p.x >= 0.5 && p.y < 0.5; // Bottom-right
      return false;
    });
  }
}
