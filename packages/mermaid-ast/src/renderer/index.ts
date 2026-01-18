/**
 * Mermaid Renderer
 *
 * Main entry point for rendering Mermaid ASTs back to diagram syntax.
 */

export { renderBlock } from './block-renderer.js';
export { renderC4 } from './c4-renderer.js';
export { renderClassDiagram } from './class-renderer.js';
export { renderErDiagram } from './er-renderer.js';
export { renderFlowchart } from './flowchart-renderer.js';
export { renderGantt } from './gantt-renderer.js';
export { renderGitGraph } from './gitgraph-renderer.js';
export { renderJourney } from './journey-renderer.js';
export { renderKanban } from './kanban-renderer.js';
export { renderMindmap } from './mindmap-renderer.js';
export { renderPie } from './pie-renderer.js';
export { renderQuadrant } from './quadrant-renderer.js';
export { renderRequirement } from './requirement-renderer.js';
export { renderSankey } from './sankey-renderer.js';
export { renderSequence } from './sequence-renderer.js';
export { renderStateDiagram } from './state-diagram-renderer.js';
export { renderTimeline } from './timeline-renderer.js';
export { renderXYChart } from './xychart-renderer.js';

import type { MermaidAST, RenderOptions } from '../types/index.js';
import {
  isBlockAST,
  isC4AST,
  isClassDiagramAST,
  isErDiagramAST,
  isFlowchartAST,
  isGanttAST,
  isGitGraphAST,
  isJourneyAST,
  isKanbanAST,
  isMindmapAST,
  isPieAST,
  isQuadrantAST,
  isRequirementAST,
  isSankeyAST,
  isSequenceAST,
  isStateDiagramAST,
  isTimelineAST,
  isXYChartAST,
} from '../types/index.js';
import { renderBlock } from './block-renderer.js';
import { renderC4 } from './c4-renderer.js';
import { renderClassDiagram } from './class-renderer.js';
import { renderErDiagram } from './er-renderer.js';
import { renderFlowchart } from './flowchart-renderer.js';
import { renderGantt } from './gantt-renderer.js';
import { renderGitGraph } from './gitgraph-renderer.js';
import { renderJourney } from './journey-renderer.js';
import { renderKanban } from './kanban-renderer.js';
import { renderMindmap } from './mindmap-renderer.js';
import { renderPie } from './pie-renderer.js';
import { renderQuadrant } from './quadrant-renderer.js';
import { renderRequirement } from './requirement-renderer.js';
import { renderSankey } from './sankey-renderer.js';
import { renderSequence } from './sequence-renderer.js';
import { renderStateDiagram } from './state-diagram-renderer.js';
import { renderTimeline } from './timeline-renderer.js';
import { renderXYChart } from './xychart-renderer.js';

/**
 * Render any supported Mermaid AST to diagram syntax
 */
export function render(ast: MermaidAST, options?: RenderOptions): string {
  if (isBlockAST(ast)) {
    return renderBlock(ast, options);
  }
  if (isC4AST(ast)) {
    return renderC4(ast, options);
  }
  if (isFlowchartAST(ast)) {
    return renderFlowchart(ast, options);
  }
  if (isSequenceAST(ast)) {
    return renderSequence(ast, options);
  }
  if (isClassDiagramAST(ast)) {
    return renderClassDiagram(ast, options);
  }
  if (isErDiagramAST(ast)) {
    return renderErDiagram(ast, options);
  }
  if (isSankeyAST(ast)) {
    return renderSankey(ast, options);
  }
  if (isPieAST(ast)) {
    return renderPie(ast, options);
  }
  if (isGitGraphAST(ast)) {
    return renderGitGraph(ast, options);
  }
  if (isQuadrantAST(ast)) {
    return renderQuadrant(ast, options);
  }
  if (isXYChartAST(ast)) {
    return renderXYChart(ast, options);
  }
  if (isKanbanAST(ast)) {
    return renderKanban(ast, options);
  }
  if (isRequirementAST(ast)) {
    return renderRequirement(ast, options);
  }
  if (isStateDiagramAST(ast)) {
    return renderStateDiagram(ast, options);
  }
  if (isGanttAST(ast)) {
    return renderGantt(ast, options);
  }
  if (isJourneyAST(ast)) {
    return renderJourney(ast, options);
  }
  if (isMindmapAST(ast)) {
    return renderMindmap(ast, options);
  }
  if (isTimelineAST(ast)) {
    return renderTimeline(ast, options);
  }

  throw new Error(`Unsupported AST type: ${(ast as { type: string }).type}`);
}
