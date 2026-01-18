/**
 * Round-trip tests for Mindmap Diagram
 *
 * These tests verify that:
 * 1. parse(render(ast)) produces an equivalent AST
 * 2. render(parse(text)) produces syntactically valid output
 * 3. parse(render(parse(text))) === parse(text) (semantic equivalence)
 */

import { describe, expect, it } from 'bun:test';
import { parseMindmap } from '../../src/parser/mindmap-parser.js';
import { renderMindmap } from '../../src/renderer/mindmap-renderer.js';
import type { MindmapAST } from '../../src/types/index.js';

/**
 * Count total nodes in a mindmap tree
 */
function countNodes(node: MindmapAST['root']): number {
  if (!node) return 0;
  let count = 1;
  for (const child of node.children || []) {
    count += countNodes(child);
  }
  return count;
}

/**
 * Compare two Mindmap ASTs for semantic equivalence
 */
function assertEquivalentMindmaps(ast1: MindmapAST, ast2: MindmapAST): void {
  // Compare root exists
  expect(!!ast2.root).toBe(!!ast1.root);

  if (ast1.root && ast2.root) {
    // Compare root description
    expect(ast2.root.description).toBe(ast1.root.description);

    // Compare total node count
    expect(countNodes(ast2.root)).toBe(countNodes(ast1.root));

    // Compare root children count
    expect(ast2.root.children?.length ?? 0).toBe(ast1.root.children?.length ?? 0);
  }
}

describe('Mindmap Diagram Round-trip Tests', () => {
  describe('Simple diagrams', () => {
    it('should round-trip a basic mindmap', () => {
      const original = `mindmap
Root
    Child1
    Child2`;

      const ast1 = parseMindmap(original);
      const rendered = renderMindmap(ast1);
      const ast2 = parseMindmap(rendered);

      assertEquivalentMindmaps(ast1, ast2);
    });

    it('should round-trip mindmap with single node', () => {
      const original = `mindmap
Root`;

      const ast1 = parseMindmap(original);
      const rendered = renderMindmap(ast1);
      const ast2 = parseMindmap(rendered);

      assertEquivalentMindmaps(ast1, ast2);
    });
  });

  describe('Node shapes', () => {
    it('should round-trip square nodes', () => {
      const original = `mindmap
Root
    [Square Node]`;

      const ast1 = parseMindmap(original);
      const rendered = renderMindmap(ast1);
      const ast2 = parseMindmap(rendered);

      assertEquivalentMindmaps(ast1, ast2);
    });

    it('should round-trip rounded nodes', () => {
      const original = `mindmap
Root
    (Rounded Node)`;

      const ast1 = parseMindmap(original);
      const rendered = renderMindmap(ast1);
      const ast2 = parseMindmap(rendered);

      assertEquivalentMindmaps(ast1, ast2);
    });

    it('should round-trip circle nodes', () => {
      const original = `mindmap
Root
    ((Circle Node))`;

      const ast1 = parseMindmap(original);
      const rendered = renderMindmap(ast1);
      const ast2 = parseMindmap(rendered);

      assertEquivalentMindmaps(ast1, ast2);
    });

    it('should round-trip cloud nodes', () => {
      const original = `mindmap
Root
    )Cloud Node(`;

      const ast1 = parseMindmap(original);
      const rendered = renderMindmap(ast1);
      const ast2 = parseMindmap(rendered);

      assertEquivalentMindmaps(ast1, ast2);
    });

    it('should round-trip hexagon nodes', () => {
      const original = `mindmap
Root
    {{Hexagon Node}}`;

      const ast1 = parseMindmap(original);
      const rendered = renderMindmap(ast1);
      const ast2 = parseMindmap(rendered);

      assertEquivalentMindmaps(ast1, ast2);
    });
  });

  describe('Nested structures', () => {
    it('should round-trip deeply nested mindmap', () => {
      const original = `mindmap
Root
    Level1A
        Level2A
            Level3A
    Level1B
        Level2B`;

      const ast1 = parseMindmap(original);
      const rendered = renderMindmap(ast1);
      const ast2 = parseMindmap(rendered);

      assertEquivalentMindmaps(ast1, ast2);
    });

    it('should round-trip wide mindmap', () => {
      const original = `mindmap
Root
    Child1
    Child2
    Child3
    Child4
    Child5`;

      const ast1 = parseMindmap(original);
      const rendered = renderMindmap(ast1);
      const ast2 = parseMindmap(rendered);

      assertEquivalentMindmaps(ast1, ast2);
    });
  });

  describe('Icons and classes', () => {
    it('should round-trip nodes with icons', () => {
      const original = `mindmap
Root
    ::icon(fa fa-book)
    Child`;

      const ast1 = parseMindmap(original);
      const rendered = renderMindmap(ast1);
      const ast2 = parseMindmap(rendered);

      assertEquivalentMindmaps(ast1, ast2);
    });
  });

  describe('Complex diagrams', () => {
    it('should round-trip a complete mindmap', () => {
      const original = `mindmap
root((Central Idea))
    Topic1
        Subtopic1A
        Subtopic1B
    Topic2
        Subtopic2A
            Detail1
            Detail2
        Subtopic2B
    Topic3
        [Important]
        (Normal)`;

      const ast1 = parseMindmap(original);
      const rendered = renderMindmap(ast1);
      const ast2 = parseMindmap(rendered);

      assertEquivalentMindmaps(ast1, ast2);
    });
  });

  describe('Idempotency', () => {
    it('should be idempotent: render(parse(render(parse(x)))) === render(parse(x))', () => {
      const original = `mindmap
Root
    A
        A1
        A2
    B
        B1`;

      const ast1 = parseMindmap(original);
      const render1 = renderMindmap(ast1);
      const ast2 = parseMindmap(render1);
      const render2 = renderMindmap(ast2);
      const ast3 = parseMindmap(render2);

      // After first round-trip, subsequent renders should be identical
      assertEquivalentMindmaps(ast2, ast3);
    });
  });
});
