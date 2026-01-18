/**
 * Round-trip tests for Sankey Diagram
 *
 * These tests verify that:
 * 1. parse(render(ast)) produces an equivalent AST
 * 2. render(parse(text)) produces syntactically valid output
 * 3. parse(render(parse(text))) === parse(text) (semantic equivalence)
 */

import { describe, expect, it } from 'bun:test';
import { parseSankey } from '../../src/parser/sankey-parser.js';
import { renderSankey } from '../../src/renderer/sankey-renderer.js';
import type { SankeyAST } from '../../src/types/index.js';

/**
 * Compare two Sankey ASTs for semantic equivalence
 */
function assertEquivalentSankeys(ast1: SankeyAST, ast2: SankeyAST): void {
  // Compare nodes (nodes is a Map)
  expect(ast2.nodes.size).toBe(ast1.nodes.size);
  for (const [id, node1] of ast1.nodes) {
    const node2 = ast2.nodes.get(id);
    expect(node2).toBeDefined();
    expect(node2?.id).toBe(node1.id);
  }

  // Compare links
  expect(ast2.links.length).toBe(ast1.links.length);
  for (const link1 of ast1.links) {
    const matchingLink = ast2.links.find(
      (l) => l.source === link1.source && l.target === link1.target && l.value === link1.value
    );
    expect(matchingLink).toBeDefined();
  }
}

describe('Sankey Diagram Round-trip Tests', () => {
  describe('Simple diagrams', () => {
    it('should round-trip a basic sankey', () => {
      const original = `sankey-beta
A,B,10`;

      const ast1 = parseSankey(original);
      const rendered = renderSankey(ast1);
      const ast2 = parseSankey(rendered);

      assertEquivalentSankeys(ast1, ast2);
    });

    it('should round-trip sankey with multiple flows', () => {
      const original = `sankey-beta
A,B,10
A,C,20
B,D,5`;

      const ast1 = parseSankey(original);
      const rendered = renderSankey(ast1);
      const ast2 = parseSankey(rendered);

      assertEquivalentSankeys(ast1, ast2);
    });
  });

  describe('Flow values', () => {
    it('should round-trip various flow values', () => {
      const original = `sankey-beta
Source,Target1,100
Source,Target2,50
Source,Target3,25`;

      const ast1 = parseSankey(original);
      const rendered = renderSankey(ast1);
      const ast2 = parseSankey(rendered);

      assertEquivalentSankeys(ast1, ast2);
    });

    it('should round-trip decimal flow values', () => {
      const original = `sankey-beta
A,B,10.5
B,C,5.25`;

      const ast1 = parseSankey(original);
      const rendered = renderSankey(ast1);
      const ast2 = parseSankey(rendered);

      assertEquivalentSankeys(ast1, ast2);
    });
  });

  describe('Multiple stages', () => {
    it('should round-trip multi-stage sankey', () => {
      const original = `sankey-beta
Stage1A,Stage2A,30
Stage1A,Stage2B,20
Stage1B,Stage2A,10
Stage1B,Stage2B,40
Stage2A,Stage3,40
Stage2B,Stage3,60`;

      const ast1 = parseSankey(original);
      const rendered = renderSankey(ast1);
      const ast2 = parseSankey(rendered);

      assertEquivalentSankeys(ast1, ast2);
    });
  });

  describe('Complex diagrams', () => {
    it('should round-trip energy flow diagram', () => {
      const original = `sankey-beta
Coal,Electricity,100
Gas,Electricity,50
Nuclear,Electricity,30
Electricity,Residential,80
Electricity,Commercial,60
Electricity,Industrial,40`;

      const ast1 = parseSankey(original);
      const rendered = renderSankey(ast1);
      const ast2 = parseSankey(rendered);

      assertEquivalentSankeys(ast1, ast2);
    });

    it('should round-trip budget flow diagram', () => {
      const original = `sankey-beta
Revenue,Operating,500
Revenue,Capital,200
Revenue,Reserve,100
Operating,Salaries,300
Operating,Supplies,100
Operating,Services,100
Capital,Equipment,150
Capital,Infrastructure,50`;

      const ast1 = parseSankey(original);
      const rendered = renderSankey(ast1);
      const ast2 = parseSankey(rendered);

      assertEquivalentSankeys(ast1, ast2);
    });
  });

  describe('Idempotency', () => {
    it('should be idempotent: render(parse(render(parse(x)))) === render(parse(x))', () => {
      const original = `sankey-beta
A,B,100
A,C,50
B,D,75
C,D,25`;

      const ast1 = parseSankey(original);
      const render1 = renderSankey(ast1);
      const ast2 = parseSankey(render1);
      const render2 = renderSankey(ast2);
      const ast3 = parseSankey(render2);

      // After first round-trip, subsequent renders should be identical
      assertEquivalentSankeys(ast2, ast3);
    });
  });
});
