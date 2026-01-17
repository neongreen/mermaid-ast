import { describe, test } from 'bun:test';
import { Flowchart } from '../../src/flowchart.js';
import { expectGolden } from '../golden/golden.js';

describe('Flowchart Renderer', () => {
  describe('Basic Rendering', () => {
    test('should render to Mermaid syntax', () => {
      const f = Flowchart.create('LR').addNode('A', 'Start').addNode('B', 'End').addLink('A', 'B');
      const output = f.render();
      expectGolden(output, 'flowchart/render-basic.mmd');
    });
  });
});
