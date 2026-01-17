/**
 * Mermaid Parser
 *
 * Main entry point for parsing Mermaid diagrams into ASTs.
 */

export { isClassDiagram, parseClassDiagram } from './class-parser.js';
export { isErDiagram, parseErDiagram } from './er-parser.js';
export { isFlowchartDiagram, parseFlowchart } from './flowchart-parser.js';
export { isGanttDiagram, parseGantt } from './gantt-parser.js';
export { isJourneyDiagram, parseJourney } from './journey-parser.js';
export { isKanbanDiagram, parseKanban } from './kanban-parser.js';
export { isMindmapDiagram, parseMindmap } from './mindmap-parser.js';
export { isQuadrantDiagram, parseQuadrant } from './quadrant-parser.js';
export { isSankeyDiagram, parseSankey } from './sankey-parser.js';
export { isSequenceDiagram, parseSequence } from './sequence-parser.js';
export { isStateDiagram, parseStateDiagram } from './state-parser.js';
export { isTimelineDiagram, parseTimeline } from './timeline-parser.js';

import type { DiagramType, MermaidAST } from '../types/index.js';
import { assertNever } from '../utils.js';
import { isClassDiagram, parseClassDiagram } from './class-parser.js';
import { isErDiagram, parseErDiagram } from './er-parser.js';
import { isFlowchartDiagram, parseFlowchart } from './flowchart-parser.js';
import { isGanttDiagram, parseGantt } from './gantt-parser.js';
import { isJourneyDiagram, parseJourney } from './journey-parser.js';
import { isKanbanDiagram, parseKanban } from './kanban-parser.js';
import { isMindmapDiagram, parseMindmap } from './mindmap-parser.js';
import { isQuadrantDiagram, parseQuadrant } from './quadrant-parser.js';
import { isSankeyDiagram, parseSankey } from './sankey-parser.js';
import { isSequenceDiagram, parseSequence } from './sequence-parser.js';
import { isStateDiagram, parseStateDiagram } from './state-parser.js';
import { isTimelineDiagram, parseTimeline } from './timeline-parser.js';

/**
 * Detect the diagram type from input text
 */
export function detectDiagramType(input: string): DiagramType | null {
  if (isFlowchartDiagram(input)) return 'flowchart';
  if (isSequenceDiagram(input)) return 'sequence';
  if (isClassDiagram(input)) return 'class';
  if (isStateDiagram(input)) return 'state';
  if (isErDiagram(input)) return 'erDiagram';
  if (isGanttDiagram(input)) return 'gantt';
  if (isMindmapDiagram(input)) return 'mindmap';
  if (isJourneyDiagram(input)) return 'journey';
  if (isKanbanDiagram(input)) return 'kanban';
  if (isTimelineDiagram(input)) return 'timeline';
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
      'Unable to detect diagram type. Supported types: flowchart, sequence, class, state, erDiagram, gantt, mindmap, journey, kanban, timeline, sankey, quadrant'
    );
  }

  switch (type) {
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
    case 'mindmap':
      return parseMindmap(input);
    case 'journey':
      return parseJourney(input);
    case 'kanban':
      return parseKanban(input);
    case 'timeline':
      return parseTimeline(input);
    case 'sankey':
      return parseSankey(input);
    case 'quadrant':
      return parseQuadrant(input);
    default:
      return assertNever(type);
  }
}
