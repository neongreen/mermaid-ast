import { describe, expect, test } from 'bun:test';
import { Flowchart } from '../../src/flowchart.js';
import { renderFlowchart } from '../../src/renderer/flowchart-renderer.js';
import type { FlowchartAST } from '../../src/types/flowchart.js';
import { expectGolden } from '../golden/golden.js';

describe('Flowchart Renderer', () => {
  describe('Basic Rendering', () => {
    test('should render to Mermaid syntax', () => {
      const f = Flowchart.create('LR').addNode('A', 'Start').addNode('B', 'End').addLink('A', 'B');
      const output = f.render();
      expectGolden(output, 'flowchart/render-basic.mmd');
    });
  });

  describe('Node Shapes', () => {
    test('should render ellipse shape', () => {
      const f = Flowchart.create('LR').addNode('A', 'Ellipse', { shape: 'ellipse' });
      const output = f.render();
      expect(output).toContain('(-Ellipse-)');
    });

    test('should handle node with unknown shape and no text', () => {
      // Create an AST directly with a node that has an unknown shape and no text
      const ast: FlowchartAST = {
        type: 'flowchart',
        direction: 'LR',
        nodes: new Map([['A', { id: 'A', shape: 'unknown_shape' as any, text: undefined }]]),
        links: [],
        subgraphs: [],
        classes: new Map(),
        classDefs: new Map(),
        clicks: [],
        linkStyles: [],
      };
      const output = renderFlowchart(ast);
      // Node with unknown shape and no text should render just the id
      expect(output).toContain('A');
      expect(output).not.toContain('A[');
    });

    test('should handle node with unknown shape but with text', () => {
      // Create an AST directly with a node that has an unknown shape but has text
      const ast: FlowchartAST = {
        type: 'flowchart',
        direction: 'LR',
        nodes: new Map([
          ['A', { id: 'A', shape: 'unknown_shape' as any, text: { text: 'Hello', type: 'text' } }],
        ]),
        links: [],
        subgraphs: [],
        classes: new Map(),
        classDefs: new Map(),
        clicks: [],
        linkStyles: [],
      };
      const output = renderFlowchart(ast);
      // Node with unknown shape but with text should render with square brackets
      expect(output).toContain('A[Hello]');
    });
  });

  describe('Click Handlers', () => {
    test('should handle click with neither href nor callback', () => {
      // Create an AST with a click that has neither href nor callback
      const ast: FlowchartAST = {
        type: 'flowchart',
        direction: 'LR',
        nodes: new Map([['A', { id: 'A', shape: 'square', text: { text: 'Node', type: 'text' } }]]),
        links: [],
        subgraphs: [],
        classes: new Map(),
        classDefs: new Map(),
        clicks: [{ nodeId: 'A' }], // Click with no href or callback
        linkStyles: [],
      };
      const output = renderFlowchart(ast);
      // Should not render any click statement
      expect(output).not.toContain('click A');
    });
  });
});
