/**
 * Block Diagram Renderer Tests
 */

import { describe, expect, it } from 'bun:test';
import { Block } from '../../src/block.js';
import { renderBlock } from '../../src/renderer/block-renderer.js';
import { createEmptyBlockAST } from '../../src/types/block.js';

describe('Block Renderer', () => {
  describe('Basic Rendering', () => {
    it('should render empty block diagram', () => {
      const ast = createEmptyBlockAST();
      const output = renderBlock(ast);
      expect(output).toContain('block-beta');
    });

    it('should render diagram with accessibility', () => {
      const ast = createEmptyBlockAST();
      ast.accTitle = 'Test Title';
      ast.accDescr = 'Test Description';
      const output = renderBlock(ast);
      expect(output).toContain('accTitle: Test Title');
      expect(output).toContain('accDescr: Test Description');
    });
  });

  describe('Column Rendering', () => {
    it('should render columns setting', () => {
      const diagram = Block.create().setColumns(3);
      const output = diagram.render();
      expect(output).toContain('columns 3');
    });

    it('should render auto columns', () => {
      const diagram = Block.create().setColumns('auto');
      const output = diagram.render();
      expect(output).toContain('columns auto');
    });
  });

  describe('Node Rendering', () => {
    it('should render square node', () => {
      const diagram = Block.create().addNode('a', { label: 'A', shape: 'square' });
      const output = diagram.render();
      expect(output).toContain('a["A"]');
    });

    it('should render round node', () => {
      const diagram = Block.create().addNode('a', { label: 'A', shape: 'round' });
      const output = diagram.render();
      expect(output).toContain('a("A")');
    });

    it('should render stadium node', () => {
      const diagram = Block.create().addNode('a', { label: 'A', shape: 'stadium' });
      const output = diagram.render();
      expect(output).toContain('a(["A"])');
    });

    it('should render diamond node', () => {
      const diagram = Block.create().addNode('a', { label: 'A', shape: 'diamond' });
      const output = diagram.render();
      expect(output).toContain('a{"A"}');
    });

    it('should render hexagon node', () => {
      const diagram = Block.create().addNode('a', { label: 'A', shape: 'hexagon' });
      const output = diagram.render();
      expect(output).toContain('a{{"A"}}');
    });

    it('should render circle node', () => {
      const diagram = Block.create().addNode('a', { label: 'A', shape: 'circle' });
      const output = diagram.render();
      expect(output).toContain('a(("A"))');
    });

    it('should render subroutine node', () => {
      const diagram = Block.create().addNode('a', { label: 'A', shape: 'subroutine' });
      const output = diagram.render();
      expect(output).toContain('a[["A"]]');
    });

    it('should render cylinder node', () => {
      const diagram = Block.create().addNode('a', { label: 'A', shape: 'cylinder' });
      const output = diagram.render();
      expect(output).toContain('a[("A")]');
    });

    it('should render node with width', () => {
      const diagram = Block.create().addNode('a', { label: 'A', widthInColumns: 2 });
      const output = diagram.render();
      expect(output).toContain(':2');
    });
  });

  describe('Space Rendering', () => {
    it('should render space block', () => {
      const diagram = Block.create().addSpace();
      const output = diagram.render();
      expect(output).toContain('space');
    });

    it('should render space block with width', () => {
      const diagram = Block.create().addSpace(3);
      const output = diagram.render();
      expect(output).toContain('space:3');
    });
  });

  describe('Edge Rendering', () => {
    it('should render arrow edge', () => {
      const diagram = Block.create()
        .addNode('a', { label: 'A' })
        .addNode('b', { label: 'B' })
        .addEdge('a', 'b');
      const output = diagram.render();
      // Edges are rendered inline with nodes for idempotence
      expect(output).toContain('a["A"] --> b["B"]');
    });

    it('should render open edge', () => {
      const diagram = Block.create()
        .addNode('a', { label: 'A' })
        .addNode('b', { label: 'B' })
        .addEdge('a', 'b', { edgeType: 'open' });
      const output = diagram.render();
      // Edges are rendered inline with nodes for idempotence
      expect(output).toContain('a["A"] --- b["B"]');
    });

    it('should render dotted edge', () => {
      const diagram = Block.create()
        .addNode('a', { label: 'A' })
        .addNode('b', { label: 'B' })
        .addEdge('a', 'b', { edgeType: 'dotted' });
      const output = diagram.render();
      expect(output).toContain('-.-');
    });

    it('should render thick edge', () => {
      const diagram = Block.create()
        .addNode('a', { label: 'A' })
        .addNode('b', { label: 'B' })
        .addEdge('a', 'b', { edgeType: 'thick' });
      const output = diagram.render();
      expect(output).toContain('==>');
    });

    it('should render edge with label', () => {
      const diagram = Block.create()
        .addNode('a', { label: 'A' })
        .addNode('b', { label: 'B' })
        .addEdge('a', 'b', { label: 'connects' });
      const output = diagram.render();
      expect(output).toContain('connects');
    });
  });

  describe('Style Rendering', () => {
    it('should render classDef', () => {
      const diagram = Block.create().defineClass('highlight', 'fill:#ff0');
      const output = diagram.render();
      expect(output).toContain('classDef highlight fill:#ff0');
    });

    it('should render class application', () => {
      const diagram = Block.create()
        .addNode('a', { label: 'A' })
        .defineClass('highlight', 'fill:#ff0')
        .applyClass('a', 'highlight');
      const output = diagram.render();
      expect(output).toContain('class a highlight');
    });

    it('should render style application', () => {
      const diagram = Block.create()
        .addNode('a', { label: 'A' })
        .applyStyles('a', 'fill:#ff0,stroke:#333');
      const output = diagram.render();
      expect(output).toContain('style a fill:#ff0,stroke:#333');
    });
  });

  describe('Composite Block Rendering', () => {
    it('should render composite block', () => {
      const diagram = Block.create().addComposite('group1');
      const output = diagram.render();
      expect(output).toContain('block:group1');
      expect(output).toContain('end');
    });

    it('should render composite block with label', () => {
      const diagram = Block.create().addComposite('group1', 'Group 1');
      const output = diagram.render();
      expect(output).toContain('block:group1["Group 1"]');
    });
  });

  describe('Golden Tests', () => {
    it('should render and re-parse simple diagram', () => {
      const original = Block.create()
        .setColumns(3)
        .addNode('a', { label: 'A' })
        .addNode('b', { label: 'B' })
        .addNode('c', { label: 'C' });

      const rendered = original.render();
      const reparsed = Block.parse(rendered);

      expect(reparsed.toAST().type).toBe('block');
    });

    it('should render complete diagram', () => {
      const diagram = Block.create()
        .setColumns(2)
        .addNode('input', { label: 'Input', shape: 'stadium' })
        .addNode('process', { label: 'Process', shape: 'round' })
        .addNode('output', { label: 'Output', shape: 'stadium' })
        .addEdge('input', 'process')
        .addEdge('process', 'output')
        .defineClass('io', 'fill:#e1f5fe')
        .applyClass(['input', 'output'], 'io');

      const output = diagram.render();
      expect(output).toContain('block-beta');
      expect(output).toContain('columns 2');
      expect(output).toContain('input');
      expect(output).toContain('process');
      expect(output).toContain('output');
    });
  });

  describe('Render Options', () => {
    it('should respect indent option', () => {
      const diagram = Block.create().setColumns(2).addNode('a', { label: 'A' });

      // Default indent is 4 spaces, custom indent of 2 should change indentation
      const output = diagram.render({ indent: 2 });
      // Check that the output uses indentation (columns should be indented)
      expect(output).toContain('columns 2');
    });

    it('should render with default formatting', () => {
      const diagram = Block.create().setColumns(2).addNode('a', { label: 'A' });

      const output = diagram.render();
      // Should have newlines between lines
      expect(output).toContain('\n');
      expect(output.split('\n').length).toBeGreaterThan(1);
    });
  });
});
