import { describe, expect, it } from 'bun:test';
import { Mindmap } from '../../src/mindmap.js';

describe('Mindmap Wrapper', () => {
  describe('Factory Methods', () => {
    it('should create a mindmap with root node', () => {
      const map = Mindmap.create('Root', 'Root Node');
      expect(map.root).toBeDefined();
      expect(map.root!.id).toBe('Root');
      expect(map.root!.description).toBe('Root Node');
      expect(map.nodeCount).toBe(1);
    });

    it('should create with shape option', () => {
      const map = Mindmap.create('Root', 'Root Node', { shape: 'circle' });
      expect(map.root!.shape).toBe('circle');
    });

    it('should parse Mermaid syntax', () => {
      const map = Mindmap.parse(`mindmap
Root
    Child1
    Child2`);

      expect(map.root).toBeDefined();
      expect(map.root!.id).toBe('Root');
      expect(map.root!.children.length).toBe(2);
    });

    it('should create from existing AST', () => {
      const original = Mindmap.create('Root').addChild('Root', 'A');
      const copy = Mindmap.from(original.toAST());
      expect(copy.nodeCount).toBe(2);
    });
  });

  describe('Node Operations', () => {
    it('should add child nodes', () => {
      const map = Mindmap.create('Root')
        .addChild('Root', 'A', 'Node A')
        .addChild('Root', 'B', 'Node B');

      expect(map.nodeCount).toBe(3);
      expect(map.root!.children.length).toBe(2);
    });

    it('should add nested children', () => {
      const map = Mindmap.create('Root')
        .addChild('Root', 'A')
        .addChild('A', 'A1')
        .addChild('A', 'A2');

      expect(map.nodeCount).toBe(4);
      expect(map.maxDepth).toBe(3);
    });

    it('should get node by ID', () => {
      const map = Mindmap.create('Root').addChild('Root', 'A', 'Node A');

      const node = map.getNode('A');
      expect(node).toBeDefined();
      expect(node!.description).toBe('Node A');
    });

    it('should get parent of node', () => {
      const map = Mindmap.create('Root').addChild('Root', 'A').addChild('A', 'A1');

      const parent = map.getParent('A1');
      expect(parent).toBeDefined();
      expect(parent!.id).toBe('A');
    });

    it('should remove nodes', () => {
      const map = Mindmap.create('Root')
        .addChild('Root', 'A')
        .addChild('Root', 'B')
        .removeNode('A');

      expect(map.nodeCount).toBe(2);
      expect(map.getNode('A')).toBeUndefined();
    });

    it('should remove node and its children', () => {
      const map = Mindmap.create('Root')
        .addChild('Root', 'A')
        .addChild('A', 'A1')
        .addChild('A', 'A2')
        .removeNode('A');

      expect(map.nodeCount).toBe(1);
    });

    it('should set description', () => {
      const map = Mindmap.create('Root')
        .addChild('Root', 'A')
        .setDescription('A', 'New Description');

      expect(map.getNode('A')!.description).toBe('New Description');
    });

    it('should set shape', () => {
      const map = Mindmap.create('Root').addChild('Root', 'A').setShape('A', 'hexagon');

      expect(map.getNode('A')!.shape).toBe('hexagon');
    });

    it('should set and remove icon', () => {
      const map = Mindmap.create('Root').addChild('Root', 'A').setIcon('A', 'fa fa-book');

      expect(map.getNode('A')!.icon).toBe('fa fa-book');

      map.removeIcon('A');
      expect(map.getNode('A')!.icon).toBeUndefined();
    });

    it('should set and remove class', () => {
      const map = Mindmap.create('Root').addChild('Root', 'A').setClass('A', 'highlight');

      expect(map.getNode('A')!.cssClass).toBe('highlight');

      map.removeClass('A');
      expect(map.getNode('A')!.cssClass).toBeUndefined();
    });

    it('should move nodes', () => {
      const map = Mindmap.create('Root')
        .addChild('Root', 'A')
        .addChild('Root', 'B')
        .addChild('A', 'A1')
        .moveNode('A1', 'B');

      expect(map.getNode('A')!.children.length).toBe(0);
      expect(map.getNode('B')!.children.length).toBe(1);
      expect(map.getNode('A1')!.level).toBe(2);
    });
  });

  describe('Query Operations', () => {
    it('should get all nodes', () => {
      const map = Mindmap.create('Root')
        .addChild('Root', 'A')
        .addChild('Root', 'B')
        .addChild('A', 'A1');

      expect(map.getAllNodes().length).toBe(4);
    });

    it('should find nodes by shape', () => {
      const map = Mindmap.create('Root')
        .addChild('Root', 'A', 'A', { shape: 'circle' })
        .addChild('Root', 'B', 'B', { shape: 'square' })
        .addChild('Root', 'C', 'C', { shape: 'circle' });

      const found = map.findNodes({ shape: 'circle' });
      expect(found.length).toBe(2);
    });

    it('should find nodes by text', () => {
      const map = Mindmap.create('Root')
        .addChild('Root', 'A', 'Design Phase')
        .addChild('Root', 'B', 'Development Phase')
        .addChild('Root', 'C', 'Testing Phase');

      const found = map.findNodes({ textContains: 'Phase' });
      expect(found.length).toBe(3);
    });

    it('should find nodes by level', () => {
      const map = Mindmap.create('Root')
        .addChild('Root', 'A')
        .addChild('Root', 'B')
        .addChild('A', 'A1')
        .addChild('B', 'B1');

      const level1 = map.getNodesAtLevel(1);
      expect(level1.length).toBe(2);

      const level2 = map.getNodesAtLevel(2);
      expect(level2.length).toBe(2);
    });

    it('should get leaf nodes', () => {
      const map = Mindmap.create('Root')
        .addChild('Root', 'A')
        .addChild('Root', 'B')
        .addChild('A', 'A1');

      const leaves = map.getLeafNodes();
      expect(leaves.length).toBe(2);
      expect(leaves.map((n) => n.id)).toContain('A1');
      expect(leaves.map((n) => n.id)).toContain('B');
    });

    it('should get path to node', () => {
      const map = Mindmap.create('Root')
        .addChild('Root', 'A')
        .addChild('A', 'A1')
        .addChild('A1', 'A1a');

      const path = map.getPath('A1a');
      expect(path.length).toBe(4);
      expect(path.map((n) => n.id)).toEqual(['Root', 'A', 'A1', 'A1a']);
    });

    it('should get siblings', () => {
      const map = Mindmap.create('Root')
        .addChild('Root', 'A')
        .addChild('Root', 'B')
        .addChild('Root', 'C');

      const siblings = map.getSiblings('B');
      expect(siblings.length).toBe(2);
      expect(siblings.map((n) => n.id)).toContain('A');
      expect(siblings.map((n) => n.id)).toContain('C');
    });
  });

  describe('Clone', () => {
    it('should clone the mindmap', () => {
      const original = Mindmap.create('Root').addChild('Root', 'A').addChild('A', 'A1');

      const clone = original.clone();
      clone.addChild('Root', 'B');

      expect(original.nodeCount).toBe(3);
      expect(clone.nodeCount).toBe(4);
    });
  });
});
