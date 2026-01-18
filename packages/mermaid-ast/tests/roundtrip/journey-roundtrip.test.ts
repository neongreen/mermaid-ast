/**
 * Round-trip tests for User Journey Diagram
 *
 * These tests verify that:
 * 1. parse(render(ast)) produces an equivalent AST
 * 2. render(parse(text)) produces syntactically valid output
 * 3. parse(render(parse(text))) === parse(text) (semantic equivalence)
 */

import { describe, expect, it } from 'bun:test';
import { parseJourney } from '../../src/parser/journey-parser.js';
import { renderJourney } from '../../src/renderer/journey-renderer.js';
import type { JourneyAST } from '../../src/types/index.js';

/**
 * Compare two Journey ASTs for semantic equivalence
 */
function assertEquivalentJourneys(ast1: JourneyAST, ast2: JourneyAST): void {
  // Compare title
  expect(ast2.title).toBe(ast1.title);

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
      expect(task2.score).toBe(task1.score);
      expect(task2.actors.length).toBe(task1.actors.length);
    }
  }
}

describe('Journey Diagram Round-trip Tests', () => {
  describe('Simple diagrams', () => {
    it('should round-trip a basic journey', () => {
      const original = `journey
    title My Journey
    section Getting Started
    Make tea: 5: Me`;

      const ast1 = parseJourney(original);
      const rendered = renderJourney(ast1);
      const ast2 = parseJourney(rendered);

      assertEquivalentJourneys(ast1, ast2);
    });

    it('should round-trip journey with title only', () => {
      const original = `journey
    title Simple Journey
    section First
    Task: 3: Actor`;

      const ast1 = parseJourney(original);
      const rendered = renderJourney(ast1);
      const ast2 = parseJourney(rendered);

      assertEquivalentJourneys(ast1, ast2);
    });
  });

  describe('Scores', () => {
    it('should round-trip various scores', () => {
      const original = `journey
    title Score Test
    section Scores
    Bad: 1: Me
    Poor: 2: Me
    Okay: 3: Me
    Good: 4: Me
    Great: 5: Me`;

      const ast1 = parseJourney(original);
      const rendered = renderJourney(ast1);
      const ast2 = parseJourney(rendered);

      assertEquivalentJourneys(ast1, ast2);
    });
  });

  describe('Multiple actors', () => {
    it('should round-trip tasks with multiple actors', () => {
      const original = `journey
    title Team Journey
    section Planning
    Meeting: 4: Alice, Bob
    Review: 3: Alice, Bob, Charlie`;

      const ast1 = parseJourney(original);
      const rendered = renderJourney(ast1);
      const ast2 = parseJourney(rendered);

      assertEquivalentJourneys(ast1, ast2);
    });
  });

  describe('Multiple sections', () => {
    it('should round-trip multiple sections', () => {
      const original = `journey
    title Multi-Section Journey
    section Morning
    Wake up: 3: Me
    Breakfast: 4: Me
    section Afternoon
    Work: 2: Me
    Lunch: 5: Me
    section Evening
    Dinner: 4: Me
    Sleep: 5: Me`;

      const ast1 = parseJourney(original);
      const rendered = renderJourney(ast1);
      const ast2 = parseJourney(rendered);

      assertEquivalentJourneys(ast1, ast2);
    });
  });

  describe('Complex diagrams', () => {
    it('should round-trip a complete user journey', () => {
      const original = `journey
    title Customer Shopping Experience
    section Discovery
    Browse website: 4: Customer
    Search for product: 3: Customer
    section Selection
    View product details: 4: Customer
    Add to cart: 5: Customer
    section Checkout
    Enter shipping info: 2: Customer
    Enter payment: 1: Customer
    Confirm order: 4: Customer
    section Post-Purchase
    Receive confirmation: 5: Customer, System
    Track shipping: 3: Customer`;

      const ast1 = parseJourney(original);
      const rendered = renderJourney(ast1);
      const ast2 = parseJourney(rendered);

      assertEquivalentJourneys(ast1, ast2);
    });
  });

  describe('Idempotency', () => {
    it('should be idempotent: render(parse(render(parse(x)))) === render(parse(x))', () => {
      const original = `journey
    title Test Journey
    section Phase 1
    Task A: 4: Actor1
    Task B: 3: Actor1, Actor2
    section Phase 2
    Task C: 5: Actor2`;

      const ast1 = parseJourney(original);
      const render1 = renderJourney(ast1);
      const ast2 = parseJourney(render1);
      const render2 = renderJourney(ast2);
      const ast3 = parseJourney(render2);

      // After first round-trip, subsequent renders should be identical
      assertEquivalentJourneys(ast2, ast3);
    });
  });
});
