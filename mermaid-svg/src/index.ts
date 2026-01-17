/**
 * mermaid-svg - Server-side SVG renderer for Mermaid diagrams
 *
 * Uses ELK for layout and svg.js + svgdom for SVG generation.
 * Works in Bun, Node.js, and Deno without requiring a browser.
 */

export { renderFlowchartToSVG } from './render-flowchart.js';
export type {
  RenderOptions,
  Theme,
  PositionedNode,
  PositionedEdge,
  LayoutResult,
} from './types.js';

// Re-export layout for advanced use cases
export { layoutFlowchart } from './layout/elk-layout.js';

// Re-export shape utilities
export { getShape, shapeRegistry } from './shapes/index.js';
export type { ShapeRenderer } from './shapes/types.js';

// Re-export theme utilities
export { defaultTheme, mergeTheme } from './themes/default.js';