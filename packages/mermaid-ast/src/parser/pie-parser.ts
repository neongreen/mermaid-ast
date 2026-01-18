/**
 * Pie Chart Parser
 *
 * Uses @mermaid-js/parser (Langium-based) for parsing pie charts.
 * This is an async parser since Langium parsing is async.
 */

import { parse as langiumParse } from '@mermaid-js/parser';
import type { PieAST, PieSection } from '../types/pie.js';
import { createEmptyPieAST } from '../types/pie.js';

/**
 * Detects if the input is a pie chart diagram
 */
export function isPieDiagram(input: string): boolean {
  const trimmed = input.trim();
  return /^pie\b/i.test(trimmed);
}

/**
 * Parses a Mermaid pie chart into an AST
 *
 * @param input - The Mermaid pie chart syntax
 * @returns Promise resolving to PieAST
 * @throws Error if parsing fails
 */
export async function parsePie(input: string): Promise<PieAST> {
  const ast = createEmptyPieAST();

  // Use Langium parser
  const result = await langiumParse('pie', input);

  // Transform Langium AST to our format
  if (result.title) {
    ast.title = result.title;
  }

  if (result.showData) {
    ast.showData = result.showData;
  }

  if (result.accTitle) {
    ast.accTitle = result.accTitle;
  }

  if (result.accDescr) {
    ast.accDescr = result.accDescr;
  }

  // Transform sections
  if (result.sections && Array.isArray(result.sections)) {
    ast.sections = result.sections.map(
      (section: { label: string; value: number }): PieSection => ({
        label: section.label,
        value: section.value,
      })
    );
  }

  return ast;
}

/**
 * Synchronous detection wrapper for compatibility
 */
export function detectPie(input: string): boolean {
  return isPieDiagram(input);
}
