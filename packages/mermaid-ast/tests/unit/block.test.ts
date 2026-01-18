/**
 * Block Diagram Wrapper Tests
 */

import { describe, expect, it } from 'bun:test';
import { Block } from '../../src/block.js';
import { createEmptyBlockAST } from '../../src/types/block.js';

describe('Block', () => {
  describe('Factory Methods', () => {
    it('should create an empty block diagram', () => {
      const diagram = Block.create();
      expect(diagram.toAST().type).toBe('block');
      expect(diagram.toAST().elements).toEqual([]);
    });

    it('should create from an existing AST', () => {
      const ast = createEmptyBlockAST();
      ast.accTitle = 'Test Title';
      const diagram = Block.from(ast);
      expect(diagram.getAccTitle()).toBe('Test Title');
    });

    it('should parse block-beta syntax', () => {
      const diagram = Block.parse(`block-beta
        columns 3
        a["A"] b["B"] c["C"]
      `);
      expect(diagram.toAST().type).toBe('block');
    });
  });

  describe('Core Methods', () => {
    it('should return AST via toAST()', () => {
      const diagram = Block.create();
      const ast = diagram.toAST();
      expect(ast.type).toBe('block');
    });

    it('should clone the diagram', () => {
      const original = Block.create().setColumns(3).addNode('a', { label: 'A' });
      const cloned = original.clone();

      // Modify original
      original.addNode('b', { label: 'B' });

      // Clone should be unchanged
      expect(cloned.nodeCount).toBe(1);
      expect(original.nodeCount).toBe(2);
    });

    it('should render to Mermaid syntax', () => {
      const diagram = Block.create().setColumns(2).addNode('a', { label: 'A' });
      const output = diagram.render();
      expect(output).toContain('block-beta');
      expect(output).toContain('columns 2');
    });
  });

  describe('Column Operations', () => {
    it('should set columns to a number', () => {
      const diagram = Block.create().setColumns(3);
      expect(diagram.getColumns()).toBe(3);
    });

    it('should set columns to auto', () => {
      const diagram = Block.create().setColumns('auto');
      expect(diagram.getColumns()).toBe('auto');
    });

    it('should replace existing column setting', () => {
      const diagram = Block.create().setColumns(3).setColumns(5);
      expect(diagram.getColumns()).toBe(5);
    });
  });

  describe('Node Operations', () => {
    it('should add a node with default shape', () => {
      const diagram = Block.create().addNode('a');
      expect(diagram.nodeCount).toBe(1);
      const node = diagram.getNode('a');
      expect(node?.id).toBe('a');
      expect(node?.shape).toBe('square');
    });

    it('should add a node with label', () => {
      const diagram = Block.create().addNode('a', { label: 'Node A' });
      const node = diagram.getNode('a');
      expect(node?.label).toBe('Node A');
    });

    it('should add a node with custom shape', () => {
      const diagram = Block.create().addNode('a', { shape: 'round' });
      const node = diagram.getNode('a');
      expect(node?.shape).toBe('round');
    });

    it('should add a node with width in columns', () => {
      const diagram = Block.create().addNode('a', { widthInColumns: 2 });
      const node = diagram.getNode('a');
      expect(node?.widthInColumns).toBe(2);
    });

    it('should find all nodes', () => {
      const diagram = Block.create().addNode('a').addNode('b').addNode('c');
      const nodes = diagram.findNodes();
      expect(nodes.length).toBe(3);
    });

    it('should remove a node', () => {
      const diagram = Block.create().addNode('a').addNode('b').removeNode('a');
      expect(diagram.nodeCount).toBe(1);
      expect(diagram.getNode('a')).toBeUndefined();
    });
  });

  describe('Edge Operations', () => {
    it('should add an edge', () => {
      const diagram = Block.create().addNode('a').addNode('b').addEdge('a', 'b');
      expect(diagram.edgeCount).toBe(1);
    });

    it('should add an edge with label', () => {
      const diagram = Block.create()
        .addNode('a')
        .addNode('b')
        .addEdge('a', 'b', { label: 'connects' });
      const edges = diagram.findEdges();
      expect(edges[0].label).toBe('connects');
    });

    it('should add an edge with custom type', () => {
      const diagram = Block.create()
        .addNode('a')
        .addNode('b')
        .addEdge('a', 'b', { edgeType: 'dotted' });
      const edges = diagram.findEdges();
      expect(edges[0].edgeType).toBe('dotted');
    });

    it('should find all edges', () => {
      const diagram = Block.create()
        .addNode('a')
        .addNode('b')
        .addNode('c')
        .addEdge('a', 'b')
        .addEdge('b', 'c');
      expect(diagram.findEdges().length).toBe(2);
    });

    it('should remove an edge by source/target', () => {
      const diagram = Block.create()
        .addNode('a')
        .addNode('b')
        .addEdge('a', 'b')
        .removeEdge('a', 'b');
      expect(diagram.edgeCount).toBe(0);
    });
  });

  describe('Space Operations', () => {
    it('should add a space with default width', () => {
      const diagram = Block.create().addSpace();
      const spaces = diagram.findSpaces();
      expect(spaces.length).toBe(1);
      expect(spaces[0].width).toBe(1);
    });

    it('should add a space with custom width', () => {
      const diagram = Block.create().addSpace(3);
      const spaces = diagram.findSpaces();
      expect(spaces[0].width).toBe(3);
    });
  });

  describe('Composite Block Operations', () => {
    it('should add a composite block', () => {
      const diagram = Block.create().addComposite('group1');
      const composites = diagram.findComposites();
      expect(composites.length).toBe(1);
      expect(composites[0].id).toBe('group1');
    });

    it('should add a composite block with label', () => {
      const diagram = Block.create().addComposite('group1', 'Group 1');
      const composite = diagram.getComposite('group1');
      expect(composite?.label).toBe('Group 1');
    });
  });

  describe('Style Operations', () => {
    it('should define a class', () => {
      const diagram = Block.create().defineClass('highlight', 'fill:#ff0');
      const classDefs = diagram.getClassDefs();
      expect(classDefs.get('highlight')).toBe('fill:#ff0');
    });

    it('should apply a class to nodes', () => {
      const diagram = Block.create()
        .addNode('a')
        .defineClass('highlight', 'fill:#ff0')
        .applyClass('a', 'highlight');
      expect(diagram.toAST().classAssignments.get('a')).toBe('highlight');
    });

    it('should apply inline styles', () => {
      const diagram = Block.create().addNode('a').applyStyles('a', 'fill:#ff0,stroke:#333');
      expect(diagram.toAST().styleAssignments.get('a')).toBe('fill:#ff0,stroke:#333');
    });
  });

  describe('Accessibility', () => {
    it('should set and get accessibility title', () => {
      const diagram = Block.create().setAccTitle('Block Diagram');
      expect(diagram.getAccTitle()).toBe('Block Diagram');
    });

    it('should set and get accessibility description', () => {
      const diagram = Block.create().setAccDescr('A block diagram showing...');
      expect(diagram.getAccDescr()).toBe('A block diagram showing...');
    });
  });

  describe('Complex Scenarios', () => {
    it('should build a complete block diagram', () => {
      const diagram = Block.create()
        .setColumns(3)
        .addNode('a', { label: 'Input', shape: 'stadium' })
        .addNode('b', { label: 'Process', shape: 'round' })
        .addNode('c', { label: 'Output', shape: 'stadium' })
        .addEdge('a', 'b')
        .addEdge('b', 'c')
        .defineClass('io', 'fill:#e1f5fe')
        .applyClass(['a', 'c'], 'io');

      expect(diagram.nodeCount).toBe(3);
      expect(diagram.edgeCount).toBe(2);
      expect(diagram.getColumns()).toBe(3);
    });
  });
});
