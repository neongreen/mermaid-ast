/**
 * Quadrant Chart Parser
 *
 * Parses Mermaid quadrant chart syntax into an AST using the vendored JISON parser.
 */

import type { QuadrantAST, QuadrantPoint } from '../types/quadrant.js';
import { createEmptyQuadrantAST } from '../types/quadrant.js';

// @ts-expect-error - JISON parser has no types
import quadrantParser from '../vendored/parsers/quadrant.js';

/**
 * Create the yy object that the JISON parser uses to build the AST
 */
function createQuadrantYY(ast: QuadrantAST) {
  return {
    // Class definitions
    addClass(className: string, styles: string[]): void {
      if (!ast.classes) {
        ast.classes = new Map();
      }
      ast.classes.set(className, {
        name: className,
        styles,
      });
    },

    // Metadata
    setDiagramTitle(title: string): void {
      ast.title = title;
    },

    setAccTitle(title: string): void {
      ast.accTitle = title;
    },

    setAccDescription(description: string): void {
      ast.accDescription = description;
    },

    // Add data point
    // Note: JISON grammar passes text as {text: string, type: string} object
    addPoint(
      name: string | { text: string },
      className: string,
      xValue: number,
      yValue: number,
      styles: string[]
    ): void {
      const point: QuadrantPoint = {
        name: typeof name === 'string' ? name : name.text,
        x: xValue,
        y: yValue,
      };

      if (className) {
        point.className = className;
      }

      if (styles && styles.length > 0) {
        point.styles = styles;
      }

      ast.points.push(point);
    },

    // Axis labels
    setXAxisLeftText(textObj: { text: string }): void {
      ast.xAxisLeft = textObj.text;
    },

    setXAxisRightText(textObj: { text: string }): void {
      ast.xAxisRight = textObj.text;
    },

    setYAxisBottomText(textObj: { text: string }): void {
      ast.yAxisBottom = textObj.text;
    },

    setYAxisTopText(textObj: { text: string }): void {
      ast.yAxisTop = textObj.text;
    },

    // Quadrant labels
    setQuadrant1Text(textObj: { text: string }): void {
      ast.quadrant1 = textObj.text;
    },

    setQuadrant2Text(textObj: { text: string }): void {
      ast.quadrant2 = textObj.text;
    },

    setQuadrant3Text(textObj: { text: string }): void {
      ast.quadrant3 = textObj.text;
    },

    setQuadrant4Text(textObj: { text: string }): void {
      ast.quadrant4 = textObj.text;
    },
  };
}

/**
 * Check if input is a quadrant chart
 */
export function isQuadrantDiagram(input: string): boolean {
  const trimmed = input.trim();
  return /^quadrantChart(\s|$)/i.test(trimmed);
}

/**
 * Parse quadrant chart syntax into an AST
 * @param input - Mermaid quadrant chart syntax
 * @returns The parsed AST
 */
export function parseQuadrant(input: string): QuadrantAST {
  const ast = createEmptyQuadrantAST();

  // Normalize input - ensure it starts with quadrantChart
  let normalizedInput = input.trim();
  if (!normalizedInput.toLowerCase().startsWith('quadrantchart')) {
    normalizedInput = `quadrantChart\n${normalizedInput}`;
  }

  // Set up the yy object
  quadrantParser.yy = createQuadrantYY(ast);

  // Parse the input
  quadrantParser.parse(normalizedInput);

  return ast;
}
