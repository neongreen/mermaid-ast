/**
 * XY Chart Diagram Renderer
 *
 * Renders an XY Chart AST back to Mermaid syntax.
 */

import type { XYChartAST } from '../types/xychart.js';
import type { RenderOptions } from '../types/render-options.js';
import { resolveOptions } from '../types/render-options.js';
import type { Doc } from './doc.js';
import { indent, render, when } from './doc.js';

/**
 * Render X-axis configuration
 */
function renderXAxis(xAxis: XYChartAST['xAxis']): Doc {
  if (!xAxis) return null;

  const parts: string[] = [];

  // Add title if present
  if (xAxis.title) {
    parts.push(`"${xAxis.title}"`);
  }

  // Add data based on type
  if (xAxis.type === 'band') {
    // Categorical bands: ["cat1", "cat2", ...]
    const categories = xAxis.categories.map((c) => `"${c}"`).join(', ');
    parts.push(`[${categories}]`);
  } else {
    // Numeric range: min --> max
    parts.push(`${xAxis.min} --> ${xAxis.max}`);
  }

  return `x-axis ${parts.join(' ')}`;
}

/**
 * Render Y-axis configuration
 */
function renderYAxis(yAxis: XYChartAST['yAxis']): Doc {
  if (!yAxis) return null;

  const parts: string[] = [];

  // Add title if present
  if (yAxis.title) {
    parts.push(`"${yAxis.title}"`);
  }

  // Add range
  parts.push(`${yAxis.min} --> ${yAxis.max}`);

  return `y-axis ${parts.join(' ')}`;
}

/**
 * Render a data series (line or bar)
 */
function renderSeries(series: XYChartAST['series'][0]): string {
  const values = series.values.join(', ');
  const label = series.label ? `"${series.label}" ` : '';
  return `${series.type} ${label}[${values}]`;
}

/**
 * Render an XY Chart AST to Mermaid syntax
 */
export function renderXYChart(ast: XYChartAST, options?: RenderOptions): string {
  const opts = resolveOptions(options);

  const header = ast.orientation ? `xychart-beta ${ast.orientation}` : 'xychart-beta';

  const doc: Doc = [
    header,
    indent([
      when(ast.title, () => `title "${ast.title}"`),
      when(ast.accTitle, () => `accTitle: ${ast.accTitle}`),
      when(ast.accDescription, () => `accDescr: ${ast.accDescription}`),
      renderXAxis(ast.xAxis),
      renderYAxis(ast.yAxis),
      ...ast.series.map(renderSeries),
    ]),
  ];

  return render(doc, opts.indent);
}
