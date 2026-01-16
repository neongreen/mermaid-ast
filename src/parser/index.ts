/**
 * Mermaid Parser
 * 
 * Main entry point for parsing Mermaid diagrams into ASTs.
 */

export { parseFlowchart, isFlowchartDiagram } from "./flowchart-parser.js";
export { parseSequence, isSequenceDiagram } from "./sequence-parser.js";

import type { MermaidAST, DiagramType } from "../types/index.js";
import { parseFlowchart, isFlowchartDiagram } from "./flowchart-parser.js";
import { parseSequence, isSequenceDiagram } from "./sequence-parser.js";

/**
 * Detect the diagram type from input text
 */
export function detectDiagramType(input: string): DiagramType | null {
  if (isFlowchartDiagram(input)) return "flowchart";
  if (isSequenceDiagram(input)) return "sequence";
  return null;
}

/**
 * Parse any supported Mermaid diagram into an AST
 */
export function parse(input: string): MermaidAST {
  const type = detectDiagramType(input);
  
  if (!type) {
    throw new Error(
      "Unable to detect diagram type. Supported types: flowchart, sequence"
    );
  }

  switch (type) {
    case "flowchart":
      return parseFlowchart(input);
    case "sequence":
      return parseSequence(input);
    default:
      throw new Error(`Unsupported diagram type: ${type}`);
  }
}