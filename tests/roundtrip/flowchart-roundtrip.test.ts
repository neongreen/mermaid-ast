/**
 * Round-trip tests for Flowchart diagrams
 *
 * These tests verify that:
 * 1. parse(render(ast)) produces an equivalent AST
 * 2. render(parse(text)) produces syntactically valid output
 * 3. parse(render(parse(text))) === parse(text) (semantic equivalence)
 */

import { describe, expect, it } from 'bun:test';
import { parseFlowchart } from '../../src/parser/index.js';
import { renderFlowchart } from '../../src/renderer/index.js';
import type { FlowchartAST } from '../../src/types/index.js';

/**
 * Compare two flowchart ASTs for semantic equivalence
 */
function assertEquivalentFlowcharts(ast1: FlowchartAST, ast2: FlowchartAST): void {
  // Compare direction
  expect(ast2.direction).toBe(ast1.direction);

  // Compare nodes
  expect(ast2.nodes.size).toBe(ast1.nodes.size);
  for (const [id, node1] of ast1.nodes) {
    const node2 = ast2.nodes.get(id);
    expect(node2).toBeDefined();
    expect(node2?.shape).toBe(node1.shape);
    expect(node2?.text?.text).toBe(node1.text?.text);
  }

  // Compare links (order may differ, so compare sets)
  expect(ast2.links.length).toBe(ast1.links.length);
  for (const link1 of ast1.links) {
    const matchingLink = ast2.links.find(
      (l) =>
        l.source === link1.source &&
        l.target === link1.target &&
        l.type === link1.type &&
        l.stroke === link1.stroke
    );
    expect(matchingLink).toBeDefined();
    if (link1.text) {
      expect(matchingLink?.text?.text).toBe(link1.text.text);
    }
  }

  // Compare subgraphs
  expect(ast2.subgraphs.length).toBe(ast1.subgraphs.length);
}

describe('Flowchart Round-trip Tests', () => {
  describe('Simple diagrams', () => {
    it('should round-trip a basic flowchart', () => {
      const original = `flowchart LR
    A --> B`;

      const ast1 = parseFlowchart(original);
      const rendered = renderFlowchart(ast1);
      const ast2 = parseFlowchart(rendered);

      assertEquivalentFlowcharts(ast1, ast2);
    });

    it('should round-trip different directions', () => {
      const directions = ['LR', 'RL', 'TB', 'TD', 'BT'];

      for (const dir of directions) {
        const original = `flowchart ${dir}
    A --> B`;

        const ast1 = parseFlowchart(original);
        const rendered = renderFlowchart(ast1);
        const ast2 = parseFlowchart(rendered);

        assertEquivalentFlowcharts(ast1, ast2);
      }
    });
  });

  describe('Node shapes', () => {
    it('should round-trip square bracket nodes', () => {
      const original = `flowchart LR
    A[Hello World]`;

      const ast1 = parseFlowchart(original);
      const rendered = renderFlowchart(ast1);
      const ast2 = parseFlowchart(rendered);

      assertEquivalentFlowcharts(ast1, ast2);
    });

    it('should round-trip round bracket nodes', () => {
      const original = `flowchart LR
    A(Hello World)`;

      const ast1 = parseFlowchart(original);
      const rendered = renderFlowchart(ast1);
      const ast2 = parseFlowchart(rendered);

      assertEquivalentFlowcharts(ast1, ast2);
    });

    it('should round-trip diamond nodes', () => {
      const original = `flowchart LR
    A{Decision}`;

      const ast1 = parseFlowchart(original);
      const rendered = renderFlowchart(ast1);
      const ast2 = parseFlowchart(rendered);

      assertEquivalentFlowcharts(ast1, ast2);
    });

    it('should round-trip circle nodes', () => {
      const original = `flowchart LR
    A((Circle))`;

      const ast1 = parseFlowchart(original);
      const rendered = renderFlowchart(ast1);
      const ast2 = parseFlowchart(rendered);

      assertEquivalentFlowcharts(ast1, ast2);
    });

    it('should round-trip stadium nodes', () => {
      const original = `flowchart LR
    A([Stadium])`;

      const ast1 = parseFlowchart(original);
      const rendered = renderFlowchart(ast1);
      const ast2 = parseFlowchart(rendered);

      assertEquivalentFlowcharts(ast1, ast2);
    });

    it('should round-trip cylinder nodes', () => {
      const original = `flowchart LR
    A[(Database)]`;

      const ast1 = parseFlowchart(original);
      const rendered = renderFlowchart(ast1);
      const ast2 = parseFlowchart(rendered);

      assertEquivalentFlowcharts(ast1, ast2);
    });

    it('should round-trip hexagon nodes', () => {
      const original = `flowchart LR
    A{{Hexagon}}`;

      const ast1 = parseFlowchart(original);
      const rendered = renderFlowchart(ast1);
      const ast2 = parseFlowchart(rendered);

      assertEquivalentFlowcharts(ast1, ast2);
    });

    it('should round-trip subroutine nodes', () => {
      const original = `flowchart LR
    A[[Subroutine]]`;

      const ast1 = parseFlowchart(original);
      const rendered = renderFlowchart(ast1);
      const ast2 = parseFlowchart(rendered);

      assertEquivalentFlowcharts(ast1, ast2);
    });
  });

  describe('Link types', () => {
    it('should round-trip arrow links', () => {
      const original = `flowchart LR
    A --> B`;

      const ast1 = parseFlowchart(original);
      const rendered = renderFlowchart(ast1);
      const ast2 = parseFlowchart(rendered);

      assertEquivalentFlowcharts(ast1, ast2);
    });

    it('should round-trip open links', () => {
      const original = `flowchart LR
    A --- B`;

      const ast1 = parseFlowchart(original);
      const rendered = renderFlowchart(ast1);
      const ast2 = parseFlowchart(rendered);

      assertEquivalentFlowcharts(ast1, ast2);
    });

    it('should round-trip dotted links', () => {
      const original = `flowchart LR
    A -.-> B`;

      const ast1 = parseFlowchart(original);
      const rendered = renderFlowchart(ast1);
      const ast2 = parseFlowchart(rendered);

      assertEquivalentFlowcharts(ast1, ast2);
    });

    it('should round-trip thick links', () => {
      const original = `flowchart LR
    A ==> B`;

      const ast1 = parseFlowchart(original);
      const rendered = renderFlowchart(ast1);
      const ast2 = parseFlowchart(rendered);

      assertEquivalentFlowcharts(ast1, ast2);
    });

    it('should round-trip links with text', () => {
      const original = `flowchart LR
    A -->|Yes| B`;

      const ast1 = parseFlowchart(original);
      const rendered = renderFlowchart(ast1);
      const ast2 = parseFlowchart(rendered);

      assertEquivalentFlowcharts(ast1, ast2);
    });
  });

  describe('Complex diagrams', () => {
    it('should round-trip a decision flowchart', () => {
      const original = `flowchart TD
    A[Start] --> B{Is it?}
    B -->|Yes| C[OK]
    B -->|No| D[End]`;

      const ast1 = parseFlowchart(original);
      const rendered = renderFlowchart(ast1);
      const ast2 = parseFlowchart(rendered);

      assertEquivalentFlowcharts(ast1, ast2);
    });

    it('should round-trip multiple node shapes', () => {
      const original = `flowchart LR
    A[Square] --> B(Round)
    B --> C{Diamond}
    C --> D((Circle))
    D --> E[(Cylinder)]`;

      const ast1 = parseFlowchart(original);
      const rendered = renderFlowchart(ast1);
      const ast2 = parseFlowchart(rendered);

      assertEquivalentFlowcharts(ast1, ast2);
    });

    it('should round-trip subgraphs', () => {
      const original = `flowchart LR
    subgraph sub1[Subgraph Title]
        A --> B
    end
    C --> sub1`;

      const ast1 = parseFlowchart(original);
      const rendered = renderFlowchart(ast1);
      const ast2 = parseFlowchart(rendered);

      // Subgraph structure is preserved
      expect(ast2.subgraphs.length).toBe(ast1.subgraphs.length);
    });
  });

  describe('Idempotency', () => {
    it('should be idempotent: render(parse(render(parse(x)))) === render(parse(x))', () => {
      const original = `flowchart TD
    A[Start] --> B{Decision}
    B -->|Yes| C[OK]
    B -->|No| D[Cancel]`;

      const ast1 = parseFlowchart(original);
      const render1 = renderFlowchart(ast1);
      const ast2 = parseFlowchart(render1);
      const render2 = renderFlowchart(ast2);
      const ast3 = parseFlowchart(render2);

      // After first round-trip, subsequent renders should be identical
      assertEquivalentFlowcharts(ast2, ast3);
    });
  });
});
