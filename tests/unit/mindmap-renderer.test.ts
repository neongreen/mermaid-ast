import { describe, it } from 'bun:test';
import { Mindmap } from '../../src/mindmap.js';
import { expectGolden } from '../golden/golden.js';

describe('Mindmap Renderer', () => {
  describe('Basic Rendering', () => {
    it('should render to Mermaid syntax', () => {
      const map = Mindmap.create('Root')
        .addChild('Root', 'A', 'Node A')
        .addChild('Root', 'B', 'Node B');

      expectGolden(map.render(), 'mindmap/render-basic.mmd');
    });
  });
});
