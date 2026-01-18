/**
 * Mermaid Parser
 *
 * Main entry point for parsing Mermaid diagrams into ASTs.
 */

export { isBlockDiagram, parseBlock } from './block-parser.js';
export { isC4Diagram, parseC4 } from './c4-parser.js';
export { isClassDiagram, parseClassDiagram } from './class-parser.js';
export { isErDiagram, parseErDiagram } from './er-parser.js';
export { isFlowchartDiagram, parseFlowchart } from './flowchart-parser.js';
export { isGanttDiagram, parseGantt } from './gantt-parser.js';
export { isGitGraphDiagram, parseGitGraph } from './gitgraph-parser.js';
export { isJourneyDiagram, parseJourney } from './journey-parser.js';
export { isKanbanDiagram, parseKanban } from './kanban-parser.js';
export { isMindmapDiagram, parseMindmap } from './mindmap-parser.js';
export { isPieDiagram, parsePie } from './pie-parser.js';
export { isQuadrantDiagram, parseQuadrant } from './quadrant-parser.js';
export { isRequirementDiagram, parseRequirement } from './requirement-parser.js';
export { isSankeyDiagram, parseSankey } from './sankey-parser.js';
export { isSequenceDiagram, parseSequence } from './sequence-parser.js';
export { isStateDiagram, parseStateDiagram } from './state-parser.js';
export { isTimelineDiagram, parseTimeline } from './timeline-parser.js';
export { isXYChartDiagram, parseXYChart } from './xychart-parser.js';

import type { DiagramType, MermaidAST } from '../types/index.js';
import { assertNever } from '../utils.js';
import { isBlockDiagram, parseBlock } from './block-parser.js';
import { isC4Diagram, parseC4 } from './c4-parser.js';
import { isClassDiagram, parseClassDiagram } from './class-parser.js';
import { isErDiagram, parseErDiagram } from './er-parser.js';
import { isFlowchartDiagram, parseFlowchart } from './flowchart-parser.js';
import { isGanttDiagram, parseGantt } from './gantt-parser.js';
import { isGitGraphDiagram, parseGitGraph } from './gitgraph-parser.js';
import { isJourneyDiagram, parseJourney } from './journey-parser.js';
import { isKanbanDiagram, parseKanban } from './kanban-parser.js';
import { isMindmapDiagram, parseMindmap } from './mindmap-parser.js';
import { isPieDiagram, parsePie } from './pie-parser.js';
import { isQuadrantDiagram, parseQuadrant } from './quadrant-parser.js';
import { isRequirementDiagram, parseRequirement } from './requirement-parser.js';
import { isSankeyDiagram, parseSankey } from './sankey-parser.js';
import { isSequenceDiagram, parseSequence } from './sequence-parser.js';
import { isStateDiagram, parseStateDiagram } from './state-parser.js';
import { isTimelineDiagram, parseTimeline } from './timeline-parser.js';
import { isXYChartDiagram, parseXYChart } from './xychart-parser.js';

/**
 * Detect the diagram type from input text
 */
export function detectDiagramType(input: string): DiagramType | null {
  if (isBlockDiagram(input)) return 'block';
  if (isC4Diagram(input)) return 'c4';
  if (isFlowchartDiagram(input)) return 'flowchart';
  if (isSequenceDiagram(input)) return 'sequence';
  if (isClassDiagram(input)) return 'class';
  if (isStateDiagram(input)) return 'state';
  if (isErDiagram(input)) return 'erDiagram';
  if (isGanttDiagram(input)) return 'gantt';
  if (isGitGraphDiagram(input)) return 'gitGraph';
  if (isMindmapDiagram(input)) return 'mindmap';
  if (isJourneyDiagram(input)) return 'journey';
  if (isKanbanDiagram(input)) return 'kanban';
  if (isPieDiagram(input)) return 'pie';
  if (isTimelineDiagram(input)) return 'timeline';
  if (isSankeyDiagram(input)) return 'sankey';
  if (isQuadrantDiagram(input)) return 'quadrant';
  if (isRequirementDiagram(input)) return 'requirement';
  if (isXYChartDiagram(input)) return 'xychart';
  return null;
}

/**
 * Parse any supported Mermaid diagram into an AST
 *
 * Note: Pie and GitGraph diagrams use async parsers (via @mermaid-js/parser).
 * Use `Pie.parse()` or `GitGraph.parse()` directly for those diagram types,
 * or use `parseAsync()` for a unified async interface.
 */
export function parse(input: string): MermaidAST {
  const type = detectDiagramType(input);
  if (!type) {
    throw new Error(
      'Unable to detect diagram type. Supported types: flowchart, sequence, class, state, erDiagram, gantt, gitGraph, mindmap, journey, kanban, pie, timeline, sankey, quadrant, requirement, xychart, c4, block'
    );
  }

  switch (type) {
    case 'block':
      return parseBlock(input);
    case 'c4':
      return parseC4(input);
    case 'flowchart':
      return parseFlowchart(input);
    case 'sequence':
      return parseSequence(input);
    case 'class':
      return parseClassDiagram(input);
    case 'state':
      return parseStateDiagram(input);
    case 'erDiagram':
      return parseErDiagram(input);
    case 'gantt':
      return parseGantt(input);
    case 'gitGraph':
      throw new Error(
        'GitGraph diagrams use an async parser. Use `GitGraph.parse()` or `parseAsync()` instead.'
      );
    case 'mindmap':
      return parseMindmap(input);
    case 'journey':
      return parseJourney(input);
    case 'kanban':
      return parseKanban(input);
    case 'pie':
      throw new Error(
        'Pie diagrams use an async parser. Use `Pie.parse()` or `parseAsync()` instead.'
      );
    case 'timeline':
      return parseTimeline(input);
    case 'sankey':
      return parseSankey(input);
    case 'quadrant':
      return parseQuadrant(input);
    case 'requirement':
      return parseRequirement(input);
    case 'xychart':
      return parseXYChart(input);
    default:
      return assertNever(type);
  }
}

/**
 * Parse any supported Mermaid diagram into an AST (async version)
 *
 * This function supports all diagram types including those with async parsers
 * (pie, gitGraph).
 */
export async function parseAsync(input: string): Promise<MermaidAST> {
  const type = detectDiagramType(input);
  if (!type) {
    throw new Error(
      'Unable to detect diagram type. Supported types: flowchart, sequence, class, state, erDiagram, gantt, gitGraph, mindmap, journey, kanban, pie, timeline, sankey, quadrant, requirement, xychart, c4, block'
    );
  }

  switch (type) {
    case 'pie':
      return parsePie(input);
    case 'gitGraph':
      return parseGitGraph(input);
    default:
      // All other types use sync parsers
      return parse(input);
  }
}
