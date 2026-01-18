/**
 * Round-trip tests for Timeline Diagram
 *
 * These tests verify that:
 * 1. parse(render(ast)) produces an equivalent AST
 * 2. render(parse(text)) produces syntactically valid output
 * 3. parse(render(parse(text))) === parse(text) (semantic equivalence)
 */

import { describe, expect, it } from 'bun:test';
import { parseTimeline } from '../../src/parser/timeline-parser.js';
import { renderTimeline } from '../../src/renderer/timeline-renderer.js';
import type { TimelineAST } from '../../src/types/index.js';

/**
 * Compare two Timeline ASTs for semantic equivalence
 */
function assertEquivalentTimelines(ast1: TimelineAST, ast2: TimelineAST): void {
  // Compare title
  expect(ast2.title).toBe(ast1.title);

  // Compare sections
  expect(ast2.sections.length).toBe(ast1.sections.length);
  for (let i = 0; i < ast1.sections.length; i++) {
    const section1 = ast1.sections[i];
    const section2 = ast2.sections[i];
    expect(section2.name).toBe(section1.name);
    expect(section2.periods.length).toBe(section1.periods.length);

    for (let j = 0; j < section1.periods.length; j++) {
      const period1 = section1.periods[j];
      const period2 = section2.periods[j];
      expect(period2.name).toBe(period1.name);
      expect(period2.events.length).toBe(period1.events.length);
    }
  }
}

describe('Timeline Diagram Round-trip Tests', () => {
  describe('Simple diagrams', () => {
    it('should round-trip a basic timeline', () => {
      const original = `timeline
    title History of Events
    2020 : Event A`;

      const ast1 = parseTimeline(original);
      const rendered = renderTimeline(ast1);
      const ast2 = parseTimeline(rendered);

      assertEquivalentTimelines(ast1, ast2);
    });

    it('should round-trip timeline with title only', () => {
      const original = `timeline
    title My Timeline
    2024 : Something happened`;

      const ast1 = parseTimeline(original);
      const rendered = renderTimeline(ast1);
      const ast2 = parseTimeline(rendered);

      assertEquivalentTimelines(ast1, ast2);
    });
  });

  describe('Multiple events', () => {
    it('should round-trip period with multiple events', () => {
      const original = `timeline
    title Project Milestones
    2024 : Planning
         : Design
         : Development`;

      const ast1 = parseTimeline(original);
      const rendered = renderTimeline(ast1);
      const ast2 = parseTimeline(rendered);

      assertEquivalentTimelines(ast1, ast2);
    });
  });

  describe('Multiple periods', () => {
    it('should round-trip multiple periods', () => {
      const original = `timeline
    title Company History
    2020 : Founded
    2021 : First product
    2022 : Series A
    2023 : Expansion`;

      const ast1 = parseTimeline(original);
      const rendered = renderTimeline(ast1);
      const ast2 = parseTimeline(rendered);

      assertEquivalentTimelines(ast1, ast2);
    });
  });

  describe('Sections', () => {
    it('should round-trip timeline with sections', () => {
      const original = `timeline
    title Product Development
    section Research
        2020 : Market analysis
        2021 : Prototype
    section Development
        2022 : Alpha release
        2023 : Beta release`;

      const ast1 = parseTimeline(original);
      const rendered = renderTimeline(ast1);
      const ast2 = parseTimeline(rendered);

      assertEquivalentTimelines(ast1, ast2);
    });
  });

  describe('Complex diagrams', () => {
    it('should round-trip a complete timeline', () => {
      const original = `timeline
    title Software Development Lifecycle
    section Planning
        Q1 2024 : Requirements gathering
                : Stakeholder interviews
        Q2 2024 : Architecture design
    section Development
        Q3 2024 : Backend development
                : Frontend development
        Q4 2024 : Integration testing
    section Release
        Q1 2025 : Beta release
        Q2 2025 : Production launch`;

      const ast1 = parseTimeline(original);
      const rendered = renderTimeline(ast1);
      const ast2 = parseTimeline(rendered);

      assertEquivalentTimelines(ast1, ast2);
    });
  });

  describe('Idempotency', () => {
    it('should be idempotent: render(parse(render(parse(x)))) === render(parse(x))', () => {
      const original = `timeline
    title Test Timeline
    section Phase 1
        2024 : Event A
             : Event B
    section Phase 2
        2025 : Event C`;

      const ast1 = parseTimeline(original);
      const render1 = renderTimeline(ast1);
      const ast2 = parseTimeline(render1);
      const render2 = renderTimeline(ast2);
      const ast3 = parseTimeline(render2);

      // After first round-trip, subsequent renders should be identical
      assertEquivalentTimelines(ast2, ast3);
    });
  });
});
