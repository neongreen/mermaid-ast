/**
 * Round-trip tests for Gantt Chart
 *
 * These tests verify that:
 * 1. parse(render(ast)) produces an equivalent AST
 * 2. render(parse(text)) produces syntactically valid output
 * 3. parse(render(parse(text))) === parse(text) (semantic equivalence)
 */

import { describe, expect, it } from 'bun:test';
import { parseGantt } from '../../src/parser/gantt-parser.js';
import { renderGantt } from '../../src/renderer/gantt-renderer.js';
import type { GanttAST } from '../../src/types/index.js';

/**
 * Compare two Gantt ASTs for semantic equivalence
 */
function assertEquivalentGantts(ast1: GanttAST, ast2: GanttAST): void {
  // Compare title
  expect(ast2.title).toBe(ast1.title);

  // Compare date format
  expect(ast2.dateFormat).toBe(ast1.dateFormat);

  // Compare sections
  expect(ast2.sections.length).toBe(ast1.sections.length);
  for (let i = 0; i < ast1.sections.length; i++) {
    const section1 = ast1.sections[i];
    const section2 = ast2.sections[i];
    expect(section2.name).toBe(section1.name);
    expect(section2.tasks.length).toBe(section1.tasks.length);

    for (let j = 0; j < section1.tasks.length; j++) {
      const task1 = section1.tasks[j];
      const task2 = section2.tasks[j];
      expect(task2.name).toBe(task1.name);
      expect(task2.id).toBe(task1.id);
    }
  }
}

describe('Gantt Chart Round-trip Tests', () => {
  describe('Simple diagrams', () => {
    it('should round-trip a basic gantt chart', () => {
      const original = `gantt
    title A Gantt Diagram
    dateFormat YYYY-MM-DD
    section Section
    A task : a1, 2024-01-01, 30d`;

      const ast1 = parseGantt(original);
      const rendered = renderGantt(ast1);
      const ast2 = parseGantt(rendered);

      assertEquivalentGantts(ast1, ast2);
    });

    it('should round-trip gantt with title only', () => {
      const original = `gantt
    title Project Plan
    section Tasks
    Task 1 : t1, 2024-01-01, 7d`;

      const ast1 = parseGantt(original);
      const rendered = renderGantt(ast1);
      const ast2 = parseGantt(rendered);

      assertEquivalentGantts(ast1, ast2);
    });
  });

  describe('Task types', () => {
    it('should round-trip active tasks', () => {
      const original = `gantt
    dateFormat YYYY-MM-DD
    section Work
    Active task : active, a1, 2024-01-01, 10d`;

      const ast1 = parseGantt(original);
      const rendered = renderGantt(ast1);
      const ast2 = parseGantt(rendered);

      assertEquivalentGantts(ast1, ast2);
    });

    it('should round-trip done tasks', () => {
      const original = `gantt
    dateFormat YYYY-MM-DD
    section Work
    Done task : done, d1, 2024-01-01, 10d`;

      const ast1 = parseGantt(original);
      const rendered = renderGantt(ast1);
      const ast2 = parseGantt(rendered);

      assertEquivalentGantts(ast1, ast2);
    });

    it('should round-trip critical tasks', () => {
      const original = `gantt
    dateFormat YYYY-MM-DD
    section Work
    Critical task : crit, c1, 2024-01-01, 10d`;

      const ast1 = parseGantt(original);
      const rendered = renderGantt(ast1);
      const ast2 = parseGantt(rendered);

      assertEquivalentGantts(ast1, ast2);
    });

    it('should round-trip milestone tasks', () => {
      const original = `gantt
    dateFormat YYYY-MM-DD
    section Milestones
    Release : milestone, m1, 2024-01-15, 0d`;

      const ast1 = parseGantt(original);
      const rendered = renderGantt(ast1);
      const ast2 = parseGantt(rendered);

      assertEquivalentGantts(ast1, ast2);
    });
  });

  describe('Multiple sections', () => {
    it('should round-trip multiple sections', () => {
      const original = `gantt
    title Multi-Section Project
    dateFormat YYYY-MM-DD
    section Design
    Design task : des1, 2024-01-01, 14d
    section Development
    Dev task : dev1, 2024-01-15, 30d
    section Testing
    Test task : test1, 2024-02-14, 14d`;

      const ast1 = parseGantt(original);
      const rendered = renderGantt(ast1);
      const ast2 = parseGantt(rendered);

      assertEquivalentGantts(ast1, ast2);
    });
  });

  describe('Task dependencies', () => {
    it('should round-trip tasks with dependencies', () => {
      const original = `gantt
    dateFormat YYYY-MM-DD
    section Project
    Task A : a, 2024-01-01, 7d
    Task B : b, after a, 7d
    Task C : c, after b, 7d`;

      const ast1 = parseGantt(original);
      const rendered = renderGantt(ast1);
      const ast2 = parseGantt(rendered);

      assertEquivalentGantts(ast1, ast2);
    });
  });

  describe('Complex diagrams', () => {
    it('should round-trip a complete project plan', () => {
      const original = `gantt
    title Software Development Lifecycle
    dateFormat YYYY-MM-DD
    excludes weekends
    section Planning
    Requirements : done, req, 2024-01-01, 14d
    Design : active, des, after req, 21d
    section Development
    Backend : dev1, after des, 30d
    Frontend : dev2, after des, 30d
    section Testing
    Unit Tests : crit, test1, after dev1, 14d
    Integration : test2, after test1, 7d
    section Deployment
    Release : milestone, rel, after test2, 0d`;

      const ast1 = parseGantt(original);
      const rendered = renderGantt(ast1);
      const ast2 = parseGantt(rendered);

      assertEquivalentGantts(ast1, ast2);
    });
  });

  describe('Idempotency', () => {
    it('should be idempotent: render(parse(render(parse(x)))) === render(parse(x))', () => {
      const original = `gantt
    title Test Project
    dateFormat YYYY-MM-DD
    section Phase 1
    Task A : a, 2024-01-01, 7d
    Task B : b, after a, 7d
    section Phase 2
    Task C : c, after b, 14d`;

      const ast1 = parseGantt(original);
      const render1 = renderGantt(ast1);
      const ast2 = parseGantt(render1);
      const render2 = renderGantt(ast2);
      const ast3 = parseGantt(render2);

      // After first round-trip, subsequent renders should be identical
      assertEquivalentGantts(ast2, ast3);
    });
  });
});
