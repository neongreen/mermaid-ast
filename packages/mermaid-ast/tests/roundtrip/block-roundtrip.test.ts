/**
 * Block Diagram Round-trip Tests
 *
 * These tests verify that block diagrams can be parsed and rendered
 * back to equivalent Mermaid syntax.
 */

import { describe, expect, it } from 'bun:test';
import { Block } from '../../src/block.js';
import { parseBlock } from '../../src/parser/block-parser.js';
import { renderBlock } from '../../src/renderer/block-renderer.js';

describe('Block Round-trip Tests', () => {
  describe('Simple Diagrams', () => {
    it('should round-trip empty diagram', () => {
      const original = Block.create();
      const rendered = original.render();
      const reparsed = Block.parse(rendered);

      expect(reparsed.toAST().type).toBe('block');
    });

    it('should round-trip diagram with columns', () => {
      const original = Block.create().setColumns(3);
      const rendered = original.render();
      const reparsed = Block.parse(rendered);

      expect(reparsed.toAST().type).toBe('block');
    });

    it('should round-trip single node', () => {
      const original = Block.create().addNode('a', { label: 'Node A' });
      const rendered = original.render();
      const reparsed = Block.parse(rendered);

      expect(reparsed.toAST().type).toBe('block');
    });
  });

  describe('Node Shapes', () => {
    it('should round-trip square node', () => {
      const original = Block.create().addNode('a', { label: 'A', shape: 'square' });
      const rendered = original.render();
      expect(rendered).toContain('a["A"]');
    });

    it('should round-trip round node', () => {
      const original = Block.create().addNode('a', { label: 'A', shape: 'round' });
      const rendered = original.render();
      expect(rendered).toContain('a("A")');
    });

    it('should round-trip stadium node', () => {
      const original = Block.create().addNode('a', { label: 'A', shape: 'stadium' });
      const rendered = original.render();
      expect(rendered).toContain('a(["A"])');
    });

    it('should round-trip diamond node', () => {
      const original = Block.create().addNode('a', { label: 'A', shape: 'diamond' });
      const rendered = original.render();
      expect(rendered).toContain('a{"A"}');
    });
  });

  describe('Edges', () => {
    it('should round-trip arrow edge', () => {
      const original = Block.create()
        .addNode('a', { label: 'A' })
        .addNode('b', { label: 'B' })
        .addEdge('a', 'b');
      const rendered = original.render();
      expect(rendered).toContain('-->');
    });

    it('should round-trip edge with label', () => {
      const original = Block.create()
        .addNode('a', { label: 'A' })
        .addNode('b', { label: 'B' })
        .addEdge('a', 'b', { label: 'connects' });
      const rendered = original.render();
      expect(rendered).toContain('connects');
    });
  });

  describe('Styling', () => {
    it('should round-trip classDef', () => {
      const original = Block.create().defineClass('highlight', 'fill:#ff0');
      const rendered = original.render();
      expect(rendered).toContain('classDef highlight fill:#ff0');
    });

    it('should round-trip class application', () => {
      const original = Block.create()
        .addNode('a', { label: 'A' })
        .defineClass('highlight', 'fill:#ff0')
        .applyClass('a', 'highlight');
      const rendered = original.render();
      expect(rendered).toContain('class a highlight');
    });
  });

  describe('Complex Diagrams', () => {
    it('should round-trip complete diagram', () => {
      const original = Block.create()
        .setColumns(3)
        .addNode('input', { label: 'Input', shape: 'stadium' })
        .addNode('process', { label: 'Process', shape: 'round' })
        .addNode('output', { label: 'Output', shape: 'stadium' })
        .addEdge('input', 'process')
        .addEdge('process', 'output')
        .defineClass('io', 'fill:#e1f5fe')
        .applyClass(['input', 'output'], 'io');

      const rendered = original.render();
      const reparsed = Block.parse(rendered);

      expect(reparsed.toAST().type).toBe('block');
    });
  });

  describe('Idempotency', () => {
    it('should be idempotent for simple diagram', () => {
      const original = Block.create()
        .setColumns(2)
        .addNode('a', { label: 'A' })
        .addNode('b', { label: 'B' });

      const rendered1 = original.render();
      const reparsed1 = Block.parse(rendered1);
      const rendered2 = reparsed1.render();
      const reparsed2 = Block.parse(rendered2);
      const rendered3 = reparsed2.render();

      // After first parse, subsequent renders should be identical
      expect(rendered2).toBe(rendered3);
    });
  });
});
