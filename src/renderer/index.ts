/**
 * Mermaid Renderer
 * 
 * Main entry point for rendering Mermaid ASTs back to diagram syntax.
 */

export { renderFlowchart } from "./flowchart-renderer.js";
export { renderSequence } from "./sequence-renderer.js";

import type { MermaidAST } from "../types/index.js";
import { isFlowchartAST, isSequenceAST } from "../types/index.js";
import { renderFlowchart } from "./flowchart-renderer.js";
import { renderSequence } from "./sequence-renderer.js";

/**
 * Render any supported Mermaid AST to diagram syntax
 */
export function render(ast: MermaidAST): string {
  if (isFlowchartAST(ast)) {
    return renderFlowchart(ast);
  }
  
  if (isSequenceAST(ast)) {
    return renderSequence(ast);
  }
  
  throw new Error(`Unsupported AST type: ${(ast as { type: string }).type}`);
}