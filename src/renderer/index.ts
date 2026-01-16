/**
 * Mermaid Renderer
 * 
 * Main entry point for rendering Mermaid ASTs back to diagram syntax.
 */

export { renderFlowchart } from "./flowchart-renderer.js";
export { renderSequence } from "./sequence-renderer.js";
export { renderClassDiagram } from "./class-renderer.js";

import type { MermaidAST, RenderOptions } from "../types/index.js";
import { isFlowchartAST, isSequenceAST, isClassDiagramAST } from "../types/index.js";
import { renderFlowchart } from "./flowchart-renderer.js";
import { renderSequence } from "./sequence-renderer.js";
import { renderClassDiagram } from "./class-renderer.js";

/**
 * Render any supported Mermaid AST to diagram syntax
 */
export function render(ast: MermaidAST, options?: RenderOptions): string {
  if (isFlowchartAST(ast)) {
    return renderFlowchart(ast, options);
  }
  
  if (isSequenceAST(ast)) {
    return renderSequence(ast, options);
  }
  
  if (isClassDiagramAST(ast)) {
    return renderClassDiagram(ast, options);
  }
  
  throw new Error(`Unsupported AST type: ${(ast as { type: string }).type}`);
}