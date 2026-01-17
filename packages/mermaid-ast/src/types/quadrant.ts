/**
 * Quadrant Chart AST Types
 *
 * Represents quadrant charts with data points positioned on X-Y axes divided into four quadrants.
 */

/**
 * A data point in the quadrant chart
 */
export interface QuadrantPoint {
  /** Point name/label */
  name: string;
  /** X coordinate (0-1) */
  x: number;
  /** Y coordinate (0-1) */
  y: number;
  /** Optional CSS class for styling */
  className?: string;
  /** Optional inline styles */
  styles?: string[];
}

/**
 * CSS class definition for styling
 */
export interface QuadrantClass {
  /** Class name */
  name: string;
  /** Style properties */
  styles: string[];
}

/**
 * The complete Quadrant Chart AST
 */
export interface QuadrantAST {
  type: 'quadrant';
  /** Diagram title */
  title?: string;
  /** Accessibility title */
  accTitle?: string;
  /** Accessibility description */
  accDescription?: string;
  /** All data points */
  points: QuadrantPoint[];
  /** X-axis left label */
  xAxisLeft?: string;
  /** X-axis right label */
  xAxisRight?: string;
  /** Y-axis bottom label */
  yAxisBottom?: string;
  /** Y-axis top label */
  yAxisTop?: string;
  /** Quadrant 1 label (top-right) */
  quadrant1?: string;
  /** Quadrant 2 label (top-left) */
  quadrant2?: string;
  /** Quadrant 3 label (bottom-left) */
  quadrant3?: string;
  /** Quadrant 4 label (bottom-right) */
  quadrant4?: string;
  /** CSS class definitions */
  classes?: Map<string, QuadrantClass>;
}

/**
 * Create an empty Quadrant AST
 */
export function createEmptyQuadrantAST(): QuadrantAST {
  return {
    type: 'quadrant',
    points: [],
    classes: new Map(),
  };
}
