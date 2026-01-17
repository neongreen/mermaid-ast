import { describe, expect, test } from 'bun:test';
import { Flowchart } from '../../src/flowchart.js';

describe('Flowchart Wrapper', () => {
  describe('Factory Methods', () => {
    test('create() creates empty flowchart with default direction', () => {
      const f = Flowchart.create();
      expect(f.direction).toBe('TD');
      expect(f.nodeCount).toBe(0);
      expect(f.linkCount).toBe(0);
    });

    test('create() accepts custom direction', () => {
      const f = Flowchart.create('LR');
      expect(f.direction).toBe('LR');
    });

    test('from() wraps existing AST', () => {
      const f1 = Flowchart.create().addNode('A').addNode('B').addLink('A', 'B');
      const ast = f1.toAST();
      const f2 = Flowchart.from(ast);
      expect(f2.nodeCount).toBe(2);
      expect(f2.linkCount).toBe(1);
    });

    test('parse() parses mermaid syntax', () => {
      const f = Flowchart.parse(`flowchart LR
        A[Start] --> B[End]`);
      expect(f.direction).toBe('LR');
      expect(f.nodeCount).toBe(2);
      expect(f.linkCount).toBe(1);
      expect(f.hasNode('A')).toBe(true);
      expect(f.hasNode('B')).toBe(true);
    });
  });

  describe('Core Methods', () => {
    test('toAST() returns the underlying AST', () => {
      const f = Flowchart.create().addNode('A');
      const ast = f.toAST();
      expect(ast.type).toBe('flowchart');
      expect(ast.nodes.has('A')).toBe(true);
    });

    test('clone() creates independent copy', () => {
      const f1 = Flowchart.create().addNode('A').addNode('B').addLink('A', 'B');
      const f2 = f1.clone();

      f2.addNode('C');
      expect(f1.nodeCount).toBe(2);
      expect(f2.nodeCount).toBe(3);
    });

    test('direction getter and setter', () => {
      const f = Flowchart.create('TD');
      expect(f.direction).toBe('TD');
      f.direction = 'LR';
      expect(f.direction).toBe('LR');
    });
  });

  describe('Node Operations', () => {
    test('addNode() adds a node', () => {
      const f = Flowchart.create().addNode('A');
      expect(f.hasNode('A')).toBe(true);
      expect(f.nodeCount).toBe(1);
    });

    test('addNode() with text', () => {
      const f = Flowchart.create().addNode('A', 'Hello World');
      const node = f.getNode('A');
      expect(node?.text?.text).toBe('Hello World');
    });

    test('addNode() with shape', () => {
      const f = Flowchart.create().addNode('A', 'Circle', { shape: 'circle' });
      const node = f.getNode('A');
      expect(node?.shape).toBe('circle');
    });

    test('addNode() with classes', () => {
      const f = Flowchart.create().addNode('A', 'Styled', { classes: ['highlight', 'bold'] });
      expect(f.getClasses('A')).toEqual(['highlight', 'bold']);
    });

    test('removeNode() removes a node', () => {
      const f = Flowchart.create().addNode('A').addNode('B').removeNode('A');
      expect(f.hasNode('A')).toBe(false);
      expect(f.hasNode('B')).toBe(true);
    });

    test('removeNode() removes associated links', () => {
      const f = Flowchart.create()
        .addNode('A')
        .addNode('B')
        .addNode('C')
        .addLink('A', 'B')
        .addLink('B', 'C')
        .removeNode('B');

      expect(f.linkCount).toBe(0);
    });

    test('removeNode() with reconnect', () => {
      const f = Flowchart.create()
        .addNode('A')
        .addNode('B')
        .addNode('C')
        .addLink('A', 'B')
        .addLink('B', 'C')
        .removeNode('B', { reconnect: true });

      expect(f.hasNode('B')).toBe(false);
      expect(f.linkCount).toBe(1);
      const link = f.getLink(0);
      expect(link?.source).toBe('A');
      expect(link?.target).toBe('C');
    });

    test('setNodeText() changes node text', () => {
      const f = Flowchart.create().addNode('A', 'Original').setNodeText('A', 'Updated');
      expect(f.getNode('A')?.text?.text).toBe('Updated');
    });

    test('setNodeShape() changes node shape', () => {
      const f = Flowchart.create().addNode('A').setNodeShape('A', 'diamond');
      expect(f.getNode('A')?.shape).toBe('diamond');
    });

    test('addClass() adds a class', () => {
      const f = Flowchart.create().addNode('A').addClass('A', 'highlight');
      expect(f.getClasses('A')).toContain('highlight');
    });

    test('addClass() does not duplicate', () => {
      const f = Flowchart.create()
        .addNode('A')
        .addClass('A', 'highlight')
        .addClass('A', 'highlight');
      expect(f.getClasses('A')).toEqual(['highlight']);
    });

    test('removeClass() removes a class', () => {
      const f = Flowchart.create()
        .addNode('A')
        .addClass('A', 'highlight')
        .addClass('A', 'bold')
        .removeClass('A', 'highlight');
      expect(f.getClasses('A')).toEqual(['bold']);
    });

    test('findNodes() by class', () => {
      const f = Flowchart.create()
        .addNode('A')
        .addNode('B')
        .addNode('C')
        .addClass('A', 'highlight')
        .addClass('C', 'highlight');

      const found = f.findNodes({ class: 'highlight' });
      expect(found).toContain('A');
      expect(found).toContain('C');
      expect(found).not.toContain('B');
    });

    test('findNodes() by shape', () => {
      const f = Flowchart.create()
        .addNode('A', 'A', { shape: 'diamond' })
        .addNode('B', 'B', { shape: 'circle' })
        .addNode('C', 'C', { shape: 'diamond' });

      const found = f.findNodes({ shape: 'diamond' });
      expect(found).toEqual(['A', 'C']);
    });

    test('findNodes() by text contains', () => {
      const f = Flowchart.create()
        .addNode('A', 'Hello World')
        .addNode('B', 'Goodbye World')
        .addNode('C', 'Hello There');

      const found = f.findNodes({ textContains: 'Hello' });
      expect(found).toEqual(['A', 'C']);
    });

    test('findNodes() by text regex', () => {
      const f = Flowchart.create()
        .addNode('A', 'Start Process')
        .addNode('B', 'End Process')
        .addNode('C', 'Process Data');

      const found = f.findNodes({ textMatches: /^(Start|End)/ });
      expect(found).toEqual(['A', 'B']);
    });
  });

  describe('Link Operations', () => {
    test('addLink() adds a link', () => {
      const f = Flowchart.create().addNode('A').addNode('B').addLink('A', 'B');
      expect(f.linkCount).toBe(1);
      const link = f.getLink(0);
      expect(link?.source).toBe('A');
      expect(link?.target).toBe('B');
    });

    test('addLink() with text', () => {
      const f = Flowchart.create().addNode('A').addNode('B').addLink('A', 'B', { text: 'yes' });
      expect(f.getLink(0)?.text?.text).toBe('yes');
    });

    test('addLink() with type', () => {
      const f = Flowchart.create()
        .addNode('A')
        .addNode('B')
        .addLink('A', 'B', { type: 'arrow_circle' });
      expect(f.getLink(0)?.type).toBe('arrow_circle');
    });

    test('addLink() with stroke', () => {
      const f = Flowchart.create()
        .addNode('A')
        .addNode('B')
        .addLink('A', 'B', { stroke: 'dotted' });
      expect(f.getLink(0)?.stroke).toBe('dotted');
    });

    test('removeLink() removes a link', () => {
      const f = Flowchart.create()
        .addNode('A')
        .addNode('B')
        .addNode('C')
        .addLink('A', 'B')
        .addLink('B', 'C')
        .removeLink(0);

      expect(f.linkCount).toBe(1);
      expect(f.getLink(0)?.source).toBe('B');
    });

    test('removeLinksBetween() removes all links between nodes', () => {
      const f = Flowchart.create()
        .addNode('A')
        .addNode('B')
        .addLink('A', 'B')
        .addLink('A', 'B', { text: 'second' })
        .removeLinksBetween('A', 'B');

      expect(f.linkCount).toBe(0);
    });

    test('flipLink() reverses direction', () => {
      const f = Flowchart.create().addNode('A').addNode('B').addLink('A', 'B').flipLink(0);
      const link = f.getLink(0);
      expect(link?.source).toBe('B');
      expect(link?.target).toBe('A');
    });

    test('setLinkType() changes arrow type', () => {
      const f = Flowchart.create()
        .addNode('A')
        .addNode('B')
        .addLink('A', 'B')
        .setLinkType(0, 'arrow_cross');
      expect(f.getLink(0)?.type).toBe('arrow_cross');
    });

    test('setLinkStroke() changes stroke style', () => {
      const f = Flowchart.create()
        .addNode('A')
        .addNode('B')
        .addLink('A', 'B')
        .setLinkStroke(0, 'thick');
      expect(f.getLink(0)?.stroke).toBe('thick');
    });

    test('setLinkText() changes link text', () => {
      const f = Flowchart.create()
        .addNode('A')
        .addNode('B')
        .addLink('A', 'B')
        .setLinkText(0, 'label');
      expect(f.getLink(0)?.text?.text).toBe('label');
    });

    test('setLinkText() removes text when undefined', () => {
      const f = Flowchart.create()
        .addNode('A')
        .addNode('B')
        .addLink('A', 'B', { text: 'label' })
        .setLinkText(0, undefined);
      expect(f.getLink(0)?.text).toBeUndefined();
    });

    test('getLinksFrom() returns outgoing links', () => {
      const f = Flowchart.create()
        .addNode('A')
        .addNode('B')
        .addNode('C')
        .addLink('A', 'B')
        .addLink('A', 'C')
        .addLink('B', 'C');

      const links = f.getLinksFrom('A');
      expect(links.length).toBe(2);
      expect(links.map((l) => l.link.target)).toEqual(['B', 'C']);
    });

    test('getLinksTo() returns incoming links', () => {
      const f = Flowchart.create()
        .addNode('A')
        .addNode('B')
        .addNode('C')
        .addLink('A', 'C')
        .addLink('B', 'C');

      const links = f.getLinksTo('C');
      expect(links.length).toBe(2);
      expect(links.map((l) => l.link.source)).toEqual(['A', 'B']);
    });

    test('addLinksFromMany() creates multiple links to one target', () => {
      const f = Flowchart.create()
        .addNode('A')
        .addNode('B')
        .addNode('C')
        .addNode('D')
        .addLinksFromMany(['A', 'B', 'C'], 'D');

      expect(f.linkCount).toBe(3);
      const linksToD = f.getLinksTo('D');
      expect(linksToD.length).toBe(3);
    });

    test('addLinksToMany() creates multiple links from one source', () => {
      const f = Flowchart.create()
        .addNode('A')
        .addNode('B')
        .addNode('C')
        .addNode('D')
        .addLinksToMany('A', ['B', 'C', 'D']);

      expect(f.linkCount).toBe(3);
      const linksFromA = f.getLinksFrom('A');
      expect(linksFromA.length).toBe(3);
    });
  });

  describe('Subgraph Operations', () => {
    test('createSubgraph() creates a subgraph', () => {
      const f = Flowchart.create()
        .addNode('A')
        .addNode('B')
        .addNode('C')
        .createSubgraph('sub1', ['A', 'B'], 'My Subgraph');

      expect(f.subgraphs.length).toBe(1);
      expect(f.getSubgraph('sub1')?.nodes).toEqual(['A', 'B']);
      expect(f.getSubgraph('sub1')?.title?.text).toBe('My Subgraph');
    });

    test('dissolveSubgraph() removes subgraph but keeps nodes', () => {
      const f = Flowchart.create()
        .addNode('A')
        .addNode('B')
        .createSubgraph('sub1', ['A', 'B'])
        .dissolveSubgraph('sub1');

      expect(f.subgraphs.length).toBe(0);
      expect(f.hasNode('A')).toBe(true);
      expect(f.hasNode('B')).toBe(true);
    });

    test('moveToSubgraph() moves nodes between subgraphs', () => {
      const f = Flowchart.create()
        .addNode('A')
        .addNode('B')
        .addNode('C')
        .createSubgraph('sub1', ['A', 'B'])
        .createSubgraph('sub2', ['C'])
        .moveToSubgraph(['B'], 'sub2');

      expect(f.getSubgraph('sub1')?.nodes).toEqual(['A']);
      expect(f.getSubgraph('sub2')?.nodes).toEqual(['C', 'B']);
    });

    test('extractFromSubgraph() moves nodes to root', () => {
      const f = Flowchart.create()
        .addNode('A')
        .addNode('B')
        .createSubgraph('sub1', ['A', 'B'])
        .extractFromSubgraph(['A']);

      expect(f.getSubgraph('sub1')?.nodes).toEqual(['B']);
    });

    test('mergeSubgraphs() combines two subgraphs', () => {
      const f = Flowchart.create()
        .addNode('A')
        .addNode('B')
        .addNode('C')
        .createSubgraph('sub1', ['A'])
        .createSubgraph('sub2', ['B', 'C'])
        .mergeSubgraphs('sub1', 'sub2');

      expect(f.subgraphs.length).toBe(1);
      expect(f.getSubgraph('sub2')?.nodes).toEqual(['B', 'C', 'A']);
    });
  });

  describe('Graph Surgery', () => {
    test('insertBetween() splices a node into existing link', () => {
      const f = Flowchart.create()
        .addNode('A')
        .addNode('C')
        .addLink('A', 'C')
        .insertBetween('B', 'A', 'C', 'Middle');

      expect(f.hasNode('B')).toBe(true);
      expect(f.linkCount).toBe(2);

      const linksFromA = f.getLinksFrom('A');
      expect(linksFromA.length).toBe(1);
      expect(linksFromA[0].link.target).toBe('B');

      const linksFromB = f.getLinksFrom('B');
      expect(linksFromB.length).toBe(1);
      expect(linksFromB[0].link.target).toBe('C');
    });

    test('insertBetween() creates links when no direct link exists', () => {
      const f = Flowchart.create().addNode('A').addNode('C').insertBetween('B', 'A', 'C');

      expect(f.hasNode('B')).toBe(true);
      expect(f.linkCount).toBe(2);
    });

    test('removeAndReconnect() is alias for removeNode with reconnect', () => {
      const f = Flowchart.create()
        .addNode('A')
        .addNode('B')
        .addNode('C')
        .addLink('A', 'B')
        .addLink('B', 'C')
        .removeAndReconnect('B');

      expect(f.hasNode('B')).toBe(false);
      expect(f.linkCount).toBe(1);
      expect(f.getLink(0)?.source).toBe('A');
      expect(f.getLink(0)?.target).toBe('C');
    });

    test('getReachable() finds all reachable nodes', () => {
      const f = Flowchart.create()
        .addNode('A')
        .addNode('B')
        .addNode('C')
        .addNode('D')
        .addLink('A', 'B')
        .addLink('B', 'C')
        .addLink('A', 'D');

      const reachable = f.getReachable('A');
      expect(reachable).toContain('A');
      expect(reachable).toContain('B');
      expect(reachable).toContain('C');
      expect(reachable).toContain('D');
    });

    test('getAncestors() finds all nodes that can reach target', () => {
      const f = Flowchart.create()
        .addNode('A')
        .addNode('B')
        .addNode('C')
        .addNode('D')
        .addLink('A', 'B')
        .addLink('B', 'C')
        .addLink('D', 'C');

      const ancestors = f.getAncestors('C');
      expect(ancestors).toContain('C');
      expect(ancestors).toContain('B');
      expect(ancestors).toContain('A');
      expect(ancestors).toContain('D');
    });

    test('getPath() finds shortest path', () => {
      const f = Flowchart.create()
        .addNode('A')
        .addNode('B')
        .addNode('C')
        .addNode('D')
        .addLink('A', 'B')
        .addLink('B', 'C')
        .addLink('A', 'D')
        .addLink('D', 'C');

      const path = f.getPath('A', 'C');
      // Should find A -> B -> C or A -> D -> C (both length 3)
      expect(path.length).toBe(3);
      expect(path[0]).toBe('A');
      expect(path[path.length - 1]).toBe('C');
    });

    test('getPath() returns empty for unreachable nodes', () => {
      const f = Flowchart.create().addNode('A').addNode('B');
      // No link between A and B
      const path = f.getPath('A', 'B');
      expect(path).toEqual([]);
    });

    test('getPath() returns single node for same source and target', () => {
      const f = Flowchart.create().addNode('A');
      const path = f.getPath('A', 'A');
      expect(path).toEqual(['A']);
    });
  });

  describe('Chaining', () => {
    test('all mutating methods return this for chaining', () => {
      const f = Flowchart.create()
        .addNode('A', 'Start')
        .addNode('B', 'Middle')
        .addNode('C', 'End')
        .addLink('A', 'B')
        .addLink('B', 'C')
        .setNodeText('A', 'Begin')
        .setNodeShape('C', 'circle')
        .addClass('B', 'highlight')
        .setLinkText(0, 'first')
        .createSubgraph('sub1', ['A', 'B']);

      expect(f.nodeCount).toBe(3);
      expect(f.linkCount).toBe(2);
      expect(f.subgraphs.length).toBe(1);
    });
  });

  describe('Chain Operations', () => {
    test('getChain() returns linear chain', () => {
      const f = Flowchart.create()
        .addNode('A')
        .addNode('B')
        .addNode('C')
        .addNode('D')
        .addLink('A', 'B')
        .addLink('B', 'C')
        .addLink('C', 'D');

      const chain = f.getChain('A', 'D');
      expect(chain).toEqual(['A', 'B', 'C', 'D']);
    });

    test('getChain() returns empty for branching paths', () => {
      const f = Flowchart.create()
        .addNode('A')
        .addNode('B')
        .addNode('C')
        .addNode('D')
        .addLink('A', 'B')
        .addLink('A', 'C') // Branch!
        .addLink('B', 'D')
        .addLink('C', 'D');

      const chain = f.getChain('A', 'D');
      expect(chain).toEqual([]); // No linear chain
    });

    test('getChain() returns single node for same start and end', () => {
      const f = Flowchart.create().addNode('A');
      const chain = f.getChain('A', 'A');
      expect(chain).toEqual(['A']);
    });

    test('yankChain() removes chain and reconnects', () => {
      const f = Flowchart.create()
        .addNode('X')
        .addNode('A')
        .addNode('B')
        .addNode('C')
        .addNode('Y')
        .addLink('X', 'A')
        .addLink('A', 'B')
        .addLink('B', 'C')
        .addLink('C', 'Y')
        .yankChain(['A', 'B', 'C']);

      expect(f.hasNode('A')).toBe(false);
      expect(f.hasNode('B')).toBe(false);
      expect(f.hasNode('C')).toBe(false);
      expect(f.hasNode('X')).toBe(true);
      expect(f.hasNode('Y')).toBe(true);

      // X should now link directly to Y
      const linksFromX = f.getLinksFrom('X');
      expect(linksFromX.length).toBe(1);
      expect(linksFromX[0].link.target).toBe('Y');
    });

    test('yankChain() handles multiple incoming/outgoing', () => {
      const f = Flowchart.create()
        .addNode('X1')
        .addNode('X2')
        .addNode('A')
        .addNode('Y1')
        .addNode('Y2')
        .addLink('X1', 'A')
        .addLink('X2', 'A')
        .addLink('A', 'Y1')
        .addLink('A', 'Y2')
        .yankChain(['A']);

      // Should have 4 links: X1->Y1, X1->Y2, X2->Y1, X2->Y2
      expect(f.linkCount).toBe(4);
    });

    test('spliceChain() inserts chain between nodes', () => {
      const f = Flowchart.create()
        .addNode('X')
        .addNode('Y')
        .addNode('A')
        .addNode('B')
        .addNode('C')
        .addLink('X', 'Y')
        .addLink('A', 'B')
        .addLink('B', 'C')
        .spliceChain(['A', 'B', 'C'], 'X', 'Y');

      // X -> Y should be replaced with X -> A -> B -> C -> Y
      const linksFromX = f.getLinksFrom('X');
      expect(linksFromX.length).toBe(1);
      expect(linksFromX[0].link.target).toBe('A');

      const linksFromC = f.getLinksFrom('C');
      expect(linksFromC.length).toBe(1);
      expect(linksFromC[0].link.target).toBe('Y');
    });

    test('spliceChain() with empty chain just connects source to target', () => {
      const f = Flowchart.create().addNode('X').addNode('Y').spliceChain([], 'X', 'Y');

      expect(f.linkCount).toBe(1);
      expect(f.getLink(0)?.source).toBe('X');
      expect(f.getLink(0)?.target).toBe('Y');
    });

    test('reverseChain() flips link directions', () => {
      const f = Flowchart.create()
        .addNode('A')
        .addNode('B')
        .addNode('C')
        .addLink('A', 'B')
        .addLink('B', 'C')
        .reverseChain(['A', 'B', 'C']);

      // Links should now be B -> A and C -> B
      const linksToA = f.getLinksTo('A');
      expect(linksToA.length).toBe(1);
      expect(linksToA[0].link.source).toBe('B');

      const linksToB = f.getLinksTo('B');
      expect(linksToB.length).toBe(1);
      expect(linksToB[0].link.source).toBe('C');
    });

    test('extractChain() removes and returns chain as new Flowchart', () => {
      const f = Flowchart.create()
        .addNode('X')
        .addNode('A')
        .addNode('B')
        .addNode('Y')
        .addLink('X', 'A')
        .addLink('A', 'B')
        .addLink('B', 'Y');

      const extracted = f.extractChain(['A', 'B']);

      // Original should have X -> Y
      expect(f.hasNode('A')).toBe(false);
      expect(f.hasNode('B')).toBe(false);
      expect(f.linkCount).toBe(1);
      expect(f.getLink(0)?.source).toBe('X');
      expect(f.getLink(0)?.target).toBe('Y');

      // Extracted should have A -> B
      expect(extracted.hasNode('A')).toBe(true);
      expect(extracted.hasNode('B')).toBe(true);
      expect(extracted.linkCount).toBe(1);
      expect(extracted.getLink(0)?.source).toBe('A');
      expect(extracted.getLink(0)?.target).toBe('B');
    });

    test('rebaseNodes() moves nodes to new parent', () => {
      const f = Flowchart.create()
        .addNode('OldParent')
        .addNode('A')
        .addNode('B')
        .addNode('NewParent')
        .addLink('OldParent', 'A')
        .addLink('A', 'B')
        .rebaseNodes(['A', 'B'], 'NewParent');

      // OldParent should no longer link to A
      const linksFromOld = f.getLinksFrom('OldParent');
      expect(linksFromOld.length).toBe(0);

      // NewParent should link to A
      const linksFromNew = f.getLinksFrom('NewParent');
      expect(linksFromNew.length).toBe(1);
      expect(linksFromNew[0].link.target).toBe('A');

      // A -> B should still exist
      const linksFromA = f.getLinksFrom('A');
      expect(linksFromA.length).toBe(1);
      expect(linksFromA[0].link.target).toBe('B');
    });
  });

  describe('Round-trip', () => {
    test('parse -> render -> parse produces equivalent AST', () => {
      const input = `flowchart LR
    A[Start] --> B[Process]
    B --> C[End]
    subgraph sub1[Processing]
        B
    end`;

      const f1 = Flowchart.parse(input);
      const rendered = f1.render();
      const f2 = Flowchart.parse(rendered);

      expect(f2.nodeCount).toBe(f1.nodeCount);
      expect(f2.linkCount).toBe(f1.linkCount);
      expect(f2.direction).toBe(f1.direction);
    });

    test('build -> render -> parse produces equivalent AST', () => {
      const f1 = Flowchart.create('LR')
        .addNode('A', 'Start')
        .addNode('B', 'Process')
        .addNode('C', 'End')
        .addLink('A', 'B')
        .addLink('B', 'C')
        .createSubgraph('sub1', ['B'], 'Processing');

      const rendered = f1.render();
      const f2 = Flowchart.parse(rendered);

      expect(f2.nodeCount).toBe(f1.nodeCount);
      expect(f2.linkCount).toBe(f1.linkCount);
      expect(f2.subgraphs.length).toBe(f1.subgraphs.length);
    });
  });
});
