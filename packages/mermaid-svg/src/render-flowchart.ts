/**
 * Main flowchart rendering function
 *
 * Combines layout, shapes, edges, and text to produce an SVG string.
 */

import type { FlowchartAST } from 'mermaid-ast';
import { renderEdges } from './edges/edge-renderer.js';
import { createMarkers } from './edges/markers.js';
import { layoutFlowchart } from './layout/elk-layout.js';
import { getShape } from './shapes/index.js';
import { createSvgContext } from './svg-context.js';
import { defaultTheme, mergeTheme } from './themes/default.js';
import type { RenderOptions } from './types.js';

/**
 * Default render options
 */
const DEFAULT_OPTIONS: Required<RenderOptions> = {
  theme: defaultTheme,
  width: 0, // Auto-calculated
  height: 0, // Auto-calculated
  padding: 20,
};

/**
 * Render a FlowchartAST to an SVG string
 *
 * @param ast - The flowchart AST to render
 * @param options - Rendering options
 * @returns SVG string
 */
export async function renderFlowchartToSVG(
  ast: FlowchartAST,
  options: RenderOptions = {}
): Promise<string> {
  // Merge options with defaults
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const theme = mergeTheme(opts.theme);

  // Run ELK layout to get positioned nodes and edges
  const layout = await layoutFlowchart(ast, theme);

  // Calculate SVG dimensions
  const width = opts.width || layout.width + opts.padding * 2;
  const height = opts.height || layout.height + opts.padding * 2;

  // Create SVG context
  const ctx = createSvgContext(width, height);
  const { canvas } = ctx;

  // Set background
  canvas.rect(width, height).fill(theme.background);

  // Create a group for the diagram content with padding offset
  const diagramGroup = canvas.group();
  diagramGroup.translate(opts.padding, opts.padding);

  // Create marker definitions
  const markers = createMarkers(canvas, theme);

  // Render edges first (so they appear behind nodes)
  renderEdges(canvas, layout.edges, layout.nodes, markers, theme, 'linear');

  // Render nodes
  for (const node of layout.nodes) {
    const shapeRenderer = getShape(node.shape);
    shapeRenderer.render(canvas, node, theme);
  }

  // Get SVG output
  const svg = ctx.toSvg();

  // Clean up
  ctx.dispose();

  return svg;
}
