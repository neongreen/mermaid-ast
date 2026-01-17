/**
 * Sankey Diagram Parser
 *
 * Parses Mermaid sankey diagram syntax into an AST using the vendored JISON parser.
 */

import type { SankeyAST, SankeyNode } from '../types/sankey.js';
import { createEmptySankeyAST } from '../types/sankey.js';

// @ts-expect-error - JISON parser has no types
import sankeyParser from '../vendored/parsers/sankey.js';

/**
 * Create the yy object that the JISON parser uses to build the AST
 */
function createSankeyYY(ast: SankeyAST) {
  return {
    /**
     * Find or create a node by name
     */
    findOrCreateNode(name: string): SankeyNode {
      if (!ast.nodes.has(name)) {
        ast.nodes.set(name, {
          id: name,
          label: name,
        });
      }
      return ast.nodes.get(name)!;
    },

    /**
     * Add a link between two nodes
     */
    addLink(source: SankeyNode, target: SankeyNode, value: number): void {
      ast.links.push({
        source: source.id,
        target: target.id,
        value,
      });
    },
  };
}

/**
 * Check if input is a sankey diagram
 */
export function isSankeyDiagram(input: string): boolean {
  const trimmed = input.trim();
  return /^sankey(-beta)?(\s|$)/i.test(trimmed);
}

/**
 * Parse sankey diagram syntax into an AST
 * @param input - Mermaid sankey diagram syntax
 * @returns The parsed AST
 */
export function parseSankey(input: string): SankeyAST {
  const ast = createEmptySankeyAST();

  // Normalize input - ensure it starts with sankey
  let normalizedInput = input.trim();
  if (!normalizedInput.toLowerCase().startsWith('sankey')) {
    normalizedInput = `sankey\n${normalizedInput}`;
  }

  // Set up the yy object
  sankeyParser.yy = createSankeyYY(ast);

  // Parse the input
  sankeyParser.parse(normalizedInput);

  return ast;
}
