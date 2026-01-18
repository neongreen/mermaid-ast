/**
 * Round-trip tests for Quadrant Chart
 *
 * These tests verify that:
 * 1. parse(render(ast)) produces an equivalent AST
 * 2. render(parse(text)) produces syntactically valid output
 * 3. parse(render(parse(text))) === parse(text) (semantic equivalence)
 */

import { describe, expect, it } from 'bun:test';
import { parseQuadrant } from '../../src/parser/quadrant-parser.js';
import { renderQuadrant } from '../../src/renderer/quadrant-renderer.js';
import type { QuadrantAST } from '../../src/types/index.js';

/**
 * Compare two Quadrant ASTs for semantic equivalence
 */
function assertEquivalentQuadrants(ast1: QuadrantAST, ast2: QuadrantAST): void {
  // Compare title
  expect(ast2.title).toBe(ast1.title);

  // Compare axis labels
  expect(ast2.xAxisLeft).toBe(ast1.xAxisLeft);
  expect(ast2.xAxisRight).toBe(ast1.xAxisRight);
  expect(ast2.yAxisBottom).toBe(ast1.yAxisBottom);
  expect(ast2.yAxisTop).toBe(ast1.yAxisTop);

  // Compare quadrant labels
  expect(ast2.quadrant1).toBe(ast1.quadrant1);
  expect(ast2.quadrant2).toBe(ast1.quadrant2);
  expect(ast2.quadrant3).toBe(ast1.quadrant3);
  expect(ast2.quadrant4).toBe(ast1.quadrant4);

  // Compare points
  expect(ast2.points.length).toBe(ast1.points.length);
  for (const point1 of ast1.points) {
    const matchingPoint = ast2.points.find(
      (p) =>
        p.name === point1.name && Math.abs(p.x - point1.x) < 0.01 && Math.abs(p.y - point1.y) < 0.01
    );
    expect(matchingPoint).toBeDefined();
  }
}

describe('Quadrant Chart Round-trip Tests', () => {
  describe('Simple diagrams', () => {
    it('should round-trip a basic quadrant chart', () => {
      const original = `quadrantChart
    title Basic Chart
    x-axis Low --> High
    y-axis Low --> High
    A: [0.5, 0.5]`;

      const ast1 = parseQuadrant(original);
      const rendered = renderQuadrant(ast1);
      const ast2 = parseQuadrant(rendered);

      assertEquivalentQuadrants(ast1, ast2);
    });

    it('should round-trip quadrant with title only', () => {
      const original = `quadrantChart
    title My Quadrant
    Point A: [0.3, 0.7]`;

      const ast1 = parseQuadrant(original);
      const rendered = renderQuadrant(ast1);
      const ast2 = parseQuadrant(rendered);

      assertEquivalentQuadrants(ast1, ast2);
    });
  });

  describe('Axis labels', () => {
    it('should round-trip x-axis labels', () => {
      const original = `quadrantChart
    x-axis Effort --> Impact
    Point: [0.5, 0.5]`;

      const ast1 = parseQuadrant(original);
      const rendered = renderQuadrant(ast1);
      const ast2 = parseQuadrant(rendered);

      assertEquivalentQuadrants(ast1, ast2);
    });

    it('should round-trip y-axis labels', () => {
      const original = `quadrantChart
    y-axis Cost --> Value
    Point: [0.5, 0.5]`;

      const ast1 = parseQuadrant(original);
      const rendered = renderQuadrant(ast1);
      const ast2 = parseQuadrant(rendered);

      assertEquivalentQuadrants(ast1, ast2);
    });

    it('should round-trip both axis labels', () => {
      const original = `quadrantChart
    x-axis Low Effort --> High Effort
    y-axis Low Impact --> High Impact
    Task A: [0.2, 0.8]`;

      const ast1 = parseQuadrant(original);
      const rendered = renderQuadrant(ast1);
      const ast2 = parseQuadrant(rendered);

      assertEquivalentQuadrants(ast1, ast2);
    });
  });

  describe('Quadrant labels', () => {
    it('should round-trip quadrant labels', () => {
      const original = `quadrantChart
    quadrant-1 Do First
    quadrant-2 Schedule
    quadrant-3 Delegate
    quadrant-4 Eliminate
    Task: [0.5, 0.5]`;

      const ast1 = parseQuadrant(original);
      const rendered = renderQuadrant(ast1);
      const ast2 = parseQuadrant(rendered);

      assertEquivalentQuadrants(ast1, ast2);
    });
  });

  describe('Multiple points', () => {
    it('should round-trip multiple points', () => {
      const original = `quadrantChart
    title Feature Prioritization
    Point A: [0.1, 0.9]
    Point B: [0.9, 0.9]
    Point C: [0.1, 0.1]
    Point D: [0.9, 0.1]
    Point E: [0.5, 0.5]`;

      const ast1 = parseQuadrant(original);
      const rendered = renderQuadrant(ast1);
      const ast2 = parseQuadrant(rendered);

      assertEquivalentQuadrants(ast1, ast2);
    });
  });

  describe('Complex diagrams', () => {
    it('should round-trip a complete quadrant chart', () => {
      const original = `quadrantChart
    title Eisenhower Matrix
    x-axis Urgent --> Not Urgent
    y-axis Not Important --> Important
    quadrant-1 Do First
    quadrant-2 Schedule
    quadrant-3 Delegate
    quadrant-4 Eliminate
    Crisis: [0.9, 0.9]
    Planning: [0.2, 0.8]
    Interruptions: [0.8, 0.2]
    Time Wasters: [0.2, 0.2]`;

      const ast1 = parseQuadrant(original);
      const rendered = renderQuadrant(ast1);
      const ast2 = parseQuadrant(rendered);

      assertEquivalentQuadrants(ast1, ast2);
    });

    it('should round-trip product prioritization chart', () => {
      const original = `quadrantChart
    title Product Feature Prioritization
    x-axis Low Development Effort --> High Development Effort
    y-axis Low User Value --> High User Value
    quadrant-1 Quick Wins
    quadrant-2 Major Projects
    quadrant-3 Fill-ins
    quadrant-4 Thankless Tasks
    Feature A: [0.15, 0.85]
    Feature B: [0.75, 0.90]
    Feature C: [0.25, 0.20]
    Feature D: [0.80, 0.15]
    Feature E: [0.50, 0.60]`;

      const ast1 = parseQuadrant(original);
      const rendered = renderQuadrant(ast1);
      const ast2 = parseQuadrant(rendered);

      assertEquivalentQuadrants(ast1, ast2);
    });
  });

  describe('Idempotency', () => {
    it('should be idempotent: render(parse(render(parse(x)))) === render(parse(x))', () => {
      const original = `quadrantChart
    title Test Chart
    x-axis Left --> Right
    y-axis Bottom --> Top
    quadrant-1 Q1
    quadrant-2 Q2
    quadrant-3 Q3
    quadrant-4 Q4
    Point A: [0.25, 0.75]
    Point B: [0.75, 0.25]`;

      const ast1 = parseQuadrant(original);
      const render1 = renderQuadrant(ast1);
      const ast2 = parseQuadrant(render1);
      const render2 = renderQuadrant(ast2);
      const ast3 = parseQuadrant(render2);

      // After first round-trip, subsequent renders should be identical
      assertEquivalentQuadrants(ast2, ast3);
    });
  });
});
