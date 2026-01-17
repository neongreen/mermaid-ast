/**
 * Mermaid Renderer
 *
 * Main entry point for rendering Mermaid ASTs back to diagram syntax.
 */

export { renderClassDiagram } from './class-renderer.js';
export { renderFlowchart } from './flowchart-renderer.js';
export { renderKanban } from './kanban-renderer.js';
export { renderQuadrant } from './quadrant-renderer.js';
export { renderSankey } from './sankey-renderer.js';
export { renderSequence } from './sequence-renderer.js';

import type { MermaidAST, RenderOptions } from '../types/index.js';
import {
  isClassDiagramAST,
  isFlowchartAST,
  isQuadrantAST,
  isSankeyAST,
  isSequenceAST,
} from '../types/index.js';
import { renderClassDiagram } from './class-renderer.js';
import { renderFlowchart } from './flowchart-renderer.js';
import { renderQuadrant } from './quadrant-renderer.js';
import { renderSankey } from './sankey-renderer.js';
import { renderSequence } from './sequence-renderer.js';

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

  if (isSankeyAST(ast)) {
    return renderSankey(ast, options);
  }

  if (isQuadrantAST(ast)) {
    return renderQuadrant(ast, options);
  }

  throw new Error(`Unsupported AST type: ${(ast as { type: string }).type}`);
}
