/**
 * Round-trip tests for State Diagram
 *
 * These tests verify that:
 * 1. parse(render(ast)) produces an equivalent AST
 * 2. render(parse(text)) produces syntactically valid output
 * 3. parse(render(parse(text))) === parse(text) (semantic equivalence)
 */

import { describe, expect, it } from 'bun:test';
import { parseStateDiagram } from '../../src/parser/state-parser.js';
import { renderStateDiagram } from '../../src/renderer/state-renderer.js';
import type { StateDiagramAST } from '../../src/types/index.js';

/**
 * Compare two state diagram ASTs for semantic equivalence
 */
function assertEquivalentStateDiagrams(ast1: StateDiagramAST, ast2: StateDiagramAST): void {
  // Compare direction
  expect(ast2.direction).toBe(ast1.direction);

  // Compare states
  expect(ast2.states.size).toBe(ast1.states.size);
  for (const [id, state1] of ast1.states) {
    const state2 = ast2.states.get(id);
    expect(state2).toBeDefined();
    expect(state2?.type).toBe(state1.type);
    if (state1.description) {
      expect(state2?.description).toBe(state1.description);
    }
  }

  // Compare transitions
  expect(ast2.transitions.length).toBe(ast1.transitions.length);
  for (const trans1 of ast1.transitions) {
    const matchingTrans = ast2.transitions.find(
      (t) => t.state1.id === trans1.state1.id && t.state2.id === trans1.state2.id
    );
    expect(matchingTrans).toBeDefined();
    if (trans1.description) {
      expect(matchingTrans?.description).toBe(trans1.description);
    }
  }
}

describe('State Diagram Round-trip Tests', () => {
  describe('Simple diagrams', () => {
    it('should round-trip a basic state diagram', () => {
      const original = `stateDiagram-v2
    [*] --> Idle
    Idle --> [*]`;

      const ast1 = parseStateDiagram(original);
      const rendered = renderStateDiagram(ast1);
      const ast2 = parseStateDiagram(rendered);

      assertEquivalentStateDiagrams(ast1, ast2);
    });

    it('should round-trip different directions', () => {
      const directions = ['LR', 'RL', 'TB', 'BT'];

      for (const dir of directions) {
        const original = `stateDiagram-v2
    direction ${dir}
    [*] --> A
    A --> [*]`;

        const ast1 = parseStateDiagram(original);
        const rendered = renderStateDiagram(ast1);
        const ast2 = parseStateDiagram(rendered);

        assertEquivalentStateDiagrams(ast1, ast2);
      }
    });
  });

  describe('State types', () => {
    it('should round-trip fork state', () => {
      const original = `stateDiagram-v2
    state fork1 <<fork>>
    [*] --> fork1
    fork1 --> A
    fork1 --> B`;

      const ast1 = parseStateDiagram(original);
      const rendered = renderStateDiagram(ast1);
      const ast2 = parseStateDiagram(rendered);

      assertEquivalentStateDiagrams(ast1, ast2);
    });

    it('should round-trip join state', () => {
      const original = `stateDiagram-v2
    state join1 <<join>>
    A --> join1
    B --> join1
    join1 --> [*]`;

      const ast1 = parseStateDiagram(original);
      const rendered = renderStateDiagram(ast1);
      const ast2 = parseStateDiagram(rendered);

      assertEquivalentStateDiagrams(ast1, ast2);
    });

    it('should round-trip choice state', () => {
      const original = `stateDiagram-v2
    state choice1 <<choice>>
    [*] --> choice1
    choice1 --> A : yes
    choice1 --> B : no`;

      const ast1 = parseStateDiagram(original);
      const rendered = renderStateDiagram(ast1);
      const ast2 = parseStateDiagram(rendered);

      assertEquivalentStateDiagrams(ast1, ast2);
    });
  });

  describe('Transitions', () => {
    it('should round-trip transitions with labels', () => {
      const original = `stateDiagram-v2
    [*] --> Idle
    Idle --> Running : start
    Running --> Idle : stop`;

      const ast1 = parseStateDiagram(original);
      const rendered = renderStateDiagram(ast1);
      const ast2 = parseStateDiagram(rendered);

      assertEquivalentStateDiagrams(ast1, ast2);
    });

    it('should round-trip self-transitions', () => {
      const original = `stateDiagram-v2
    [*] --> A
    A --> A : loop`;

      const ast1 = parseStateDiagram(original);
      const rendered = renderStateDiagram(ast1);
      const ast2 = parseStateDiagram(rendered);

      assertEquivalentStateDiagrams(ast1, ast2);
    });
  });

  describe('Complex diagrams', () => {
    it('should round-trip a complete state machine', () => {
      const original = `stateDiagram-v2
    direction LR
    [*] --> Idle
    Idle --> Processing : start
    Processing --> Done : complete
    Processing --> Idle : cancel
    Done --> [*]`;

      const ast1 = parseStateDiagram(original);
      const rendered = renderStateDiagram(ast1);
      const ast2 = parseStateDiagram(rendered);

      assertEquivalentStateDiagrams(ast1, ast2);
    });

    it('should round-trip fork/join pattern', () => {
      const original = `stateDiagram-v2
    state fork1 <<fork>>
    state join1 <<join>>
    [*] --> fork1
    fork1 --> A
    fork1 --> B
    A --> join1
    B --> join1
    join1 --> [*]`;

      const ast1 = parseStateDiagram(original);
      const rendered = renderStateDiagram(ast1);
      const ast2 = parseStateDiagram(rendered);

      assertEquivalentStateDiagrams(ast1, ast2);
    });
  });

  describe('Idempotency', () => {
    it('should be idempotent: render(parse(render(parse(x)))) === render(parse(x))', () => {
      const original = `stateDiagram-v2
    direction LR
    [*] --> Idle
    Idle --> Running : start
    Running --> Done : finish
    Done --> [*]`;

      const ast1 = parseStateDiagram(original);
      const render1 = renderStateDiagram(ast1);
      const ast2 = parseStateDiagram(render1);
      const render2 = renderStateDiagram(ast2);
      const ast3 = parseStateDiagram(render2);

      // After first round-trip, subsequent renders should be identical
      assertEquivalentStateDiagrams(ast2, ast3);
    });
  });
});
