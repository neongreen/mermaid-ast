/**
 * Pie Chart Renderer
 *
 * Renders a PieAST back to Mermaid pie chart syntax.
 */

import type { PieAST } from '../types/pie.js';
import type { RenderOptions } from '../types/render-options.js';
import { resolveOptions } from '../types/render-options.js';
import type { Doc } from './doc.js';
import { render, when, blank } from './doc.js';

/**
 * Renders a PieAST to Mermaid syntax
 */
export function renderPie(ast: PieAST, options?: RenderOptions): string {
  const opts = resolveOptions(options);

  const doc: Doc = [
    // Header with optional showData
    ast.showData ? 'pie showData' : 'pie',

    // Accessibility
    when(ast.accTitle, () => `accTitle: ${ast.accTitle}`),
    when(ast.accDescr, () => `accDescr: ${ast.accDescr}`),

    // Title
    when(ast.title, () => `title ${ast.title}`),

    // Sections
    ...ast.sections.map((section) => `"${section.label}" : ${section.value}`),
  ];

  return render(doc, opts.indent);
}
