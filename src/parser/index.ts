/**
 * Mermaid Parser
 *
 * Main entry point for parsing Mermaid diagrams into ASTs.
 */

export { isClassDiagram, parseClassDiagram } from './class-parser.js';
export { isFlowchartDiagram, parseFlowchart } from './flowchart-parser.js';
export { isQuadrantDiagram, parseQuadrant } from './quadrant-parser.js';
export { isSankeyDiagram, parseSankey } from './sankey-parser.js';
export { isSequenceDiagram, parseSequence } from './sequence-parser.js';

import type { DiagramType, MermaidAST } from '../types/index.js';
import { isClassDiagram, parseClassDiagram } from './class-parser.js';
import { isFlowchartDiagram, parseFlowchart } from './flowchart-parser.js';
import { isQuadrantDiagram, parseQuadrant } from './quadrant-parser.js';
import { isSankeyDiagram, parseSankey } from './sankey-parser.js';
import { isSequenceDiagram, parseSequence } from './sequence-parser.js';

/**
 * Detect the diagram type from input text
 */
export function detectDiagramType(input: string): DiagramType | null {
  if (isFlowchartDiagram(input)) return 'flowchart';
  if (isSequenceDiagram(input)) return 'sequence';
  if (isClassDiagram(input)) return 'class';
  if (isSankeyDiagram(input)) return 'sankey';
  if (isQuadrantDiagram(input)) return 'quadrant';
  return null;
}

/**
 * Parse any supported Mermaid diagram into an AST
 */
export function parse(input: string): MermaidAST {
  const type = detectDiagramType(input);

  if (!type) {
    throw new Error(
      'Unable to detect diagram type. Supported types: flowchart, sequence, class, sankey, quadrant'
    );
  }

  switch (type) {
    case 'flowchart':
      return parseFlowchart(input);
    case 'sequence':
      return parseSequence(input);
    case 'class':
      return parseClassDiagram(input);
    case 'sankey':
      return parseSankey(input);
    case 'quadrant':
      return parseQuadrant(input);
    default:
      throw new Error(`Unsupported diagram type: ${type}`);
  }
}
