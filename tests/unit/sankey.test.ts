import { describe, expect, it } from 'bun:test';
import { Sankey } from '../../src/sankey.js';

describe('Sankey Wrapper', () => {
  describe('Factory Methods', () => {
    it('should create an empty sankey diagram', () => {
      const sankey = Sankey.create();
      expect(sankey.nodeCount).toBe(0);
      expect(sankey.linkCount).toBe(0);
    });

    it('should parse Mermaid syntax', () => {
      const sankey = Sankey.parse(`sankey-beta
A,B,10
B,C,20`);

      expect(sankey.nodeCount).toBe(3);
      expect(sankey.linkCount).toBe(2);
    });

    it('should create from existing AST', () => {
      const original = Sankey.create().addLink('A', 'B', 10);

      const copy = Sankey.from(original.toAST());
      expect(copy.nodeCount).toBe(2);
      expect(copy.linkCount).toBe(1);
    });
  });

  describe('Core Methods', () => {
    it('should render to Mermaid syntax', () => {
      const sankey = Sankey.create().addLink('A', 'B', 10).addLink('B', 'C', 20);

      const output = sankey.render();
      expect(output).toContain('sankey-beta');
      expect(output).toContain('A,B,10');
      expect(output).toContain('B,C,20');
    });

    it('should clone the diagram', () => {
      const original = Sankey.create().addLink('A', 'B', 10);

      const cloned = original.clone();
      cloned.addLink('B', 'C', 20);

      expect(original.linkCount).toBe(1);
      expect(cloned.linkCount).toBe(2);
    });

    it('should get AST', () => {
      const sankey = Sankey.create().addLink('A', 'B', 10);

      const ast = sankey.toAST();
      expect(ast.type).toBe('sankey');
      expect(ast.nodes.size).toBe(2);
      expect(ast.links.length).toBe(1);
    });
  });

  describe('Node Operations', () => {
    it('should add nodes', () => {
      const sankey = Sankey.create().addNode('A').addNode('B', 'Node B');

      expect(sankey.nodeCount).toBe(2);
      expect(sankey.getNode('B')?.label).toBe('Node B');
    });

    it('should get nodes', () => {
      const sankey = Sankey.create().addNode('A').addNode('B');

      const nodeA = sankey.getNode('A');
      expect(nodeA).toBeDefined();
      expect(nodeA?.id).toBe('A');
    });

    it('should remove nodes and connected links', () => {
      const sankey = Sankey.create().addLink('A', 'B', 10).addLink('B', 'C', 20).removeNode('B');

      expect(sankey.nodeCount).toBe(2);
      expect(sankey.linkCount).toBe(0);
    });

    it('should update node labels', () => {
      const sankey = Sankey.create().addNode('A').updateNodeLabel('A', 'Updated A');

      expect(sankey.getNode('A')?.label).toBe('Updated A');
    });

    it('should list all nodes', () => {
      const sankey = Sankey.create().addLink('A', 'B', 10).addLink('B', 'C', 20);

      const nodes = sankey.nodes;
      expect(nodes.length).toBe(3);
      expect(nodes.map((n) => n.id).sort()).toEqual(['A', 'B', 'C']);
    });
  });

  describe('Link Operations', () => {
    it('should add links', () => {
      const sankey = Sankey.create().addLink('A', 'B', 10);

      expect(sankey.linkCount).toBe(1);
      expect(sankey.links[0]).toEqual({
        source: 'A',
        target: 'B',
        value: 10,
      });
    });

    it('should create nodes automatically when adding links', () => {
      const sankey = Sankey.create().addLink('A', 'B', 10);

      expect(sankey.nodeCount).toBe(2);
    });

    it('should get links from a source', () => {
      const sankey = Sankey.create()
        .addLink('A', 'B', 10)
        .addLink('A', 'C', 20)
        .addLink('B', 'C', 5);

      const linksFromA = sankey.getLinksFrom('A');
      expect(linksFromA.length).toBe(2);
      expect(linksFromA.map((l) => l.target).sort()).toEqual(['B', 'C']);
    });

    it('should get links to a target', () => {
      const sankey = Sankey.create()
        .addLink('A', 'C', 10)
        .addLink('B', 'C', 20)
        .addLink('B', 'D', 5);

      const linksToC = sankey.getLinksTo('C');
      expect(linksToC.length).toBe(2);
      expect(linksToC.map((l) => l.source).sort()).toEqual(['A', 'B']);
    });

    it('should remove links', () => {
      const sankey = Sankey.create()
        .addLink('A', 'B', 10)
        .addLink('B', 'C', 20)
        .removeLink('A', 'B');

      expect(sankey.linkCount).toBe(1);
      expect(sankey.links[0].source).toBe('B');
    });

    it('should update link values', () => {
      const sankey = Sankey.create().addLink('A', 'B', 10).updateLinkValue('A', 'B', 25);

      expect(sankey.links[0].value).toBe(25);
    });
  });

  describe('Query Operations', () => {
    it('should find nodes by label', () => {
      const sankey = Sankey.create()
        .addNode('A', 'Product A')
        .addNode('B', 'Product B')
        .addNode('C', 'Customer');

      const products = sankey.findNodes({ labelContains: 'Product' });
      expect(products.length).toBe(2);
    });

    it('should find links by source', () => {
      const sankey = Sankey.create()
        .addLink('A', 'B', 10)
        .addLink('A', 'C', 20)
        .addLink('B', 'C', 5);

      const links = sankey.findLinks({ source: 'A' });
      expect(links.length).toBe(2);
    });

    it('should find links by target', () => {
      const sankey = Sankey.create()
        .addLink('A', 'C', 10)
        .addLink('B', 'C', 20)
        .addLink('B', 'D', 5);

      const links = sankey.findLinks({ target: 'C' });
      expect(links.length).toBe(2);
    });

    it('should find links by value range', () => {
      const sankey = Sankey.create()
        .addLink('A', 'B', 5)
        .addLink('B', 'C', 15)
        .addLink('C', 'D', 25);

      const links = sankey.findLinks({ minValue: 10, maxValue: 20 });
      expect(links.length).toBe(1);
      expect(links[0].value).toBe(15);
    });

    it('should calculate total flow', () => {
      const sankey = Sankey.create()
        .addLink('A', 'B', 10)
        .addLink('B', 'C', 20)
        .addLink('A', 'C', 5);

      expect(sankey.getTotalFlow()).toBe(35);
    });
  });
});
