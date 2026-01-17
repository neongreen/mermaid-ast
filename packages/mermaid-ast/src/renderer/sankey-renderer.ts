/**
 * Sankey Diagram Renderer
 *
 * Renders a Sankey AST back to Mermaid syntax.
 */

import type { RenderOptions } from '../types/render-options.js';
import type { SankeyAST } from '../types/sankey.js';

/**
 * Render a Sankey AST to Mermaid syntax
 */
export function renderSankey(ast: SankeyAST, _options?: RenderOptions): string {
  const lines: string[] = [];

  // Header
  lines.push('sankey-beta');

  // Links in CSV format
  for (const link of ast.links) {
    const source = ast.nodes.get(link.source)?.label || link.source;
    const target = ast.nodes.get(link.target)?.label || link.target;

    // Escape quotes and add quotes if the label contains special characters
    const escapeCSV = (str: string): string => {
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    lines.push(`${escapeCSV(source)},${escapeCSV(target)},${link.value}`);
  }

  return lines.join('\n');
}
