import { describe, it } from 'bun:test';
import { ErDiagram } from '../../src/er-diagram.js';
import { expectGolden } from '../golden/golden.js';

describe('ErDiagram Renderer', () => {
  describe('Basic Rendering', () => {
    it('should render to Mermaid syntax', () => {
      const diagram = ErDiagram.create()
        .addEntity('CUSTOMER')
        .addAttribute('CUSTOMER', 'string', 'name')
        .addRelationship('CUSTOMER', 'ORDER', 'places', {
          cardA: 'ONLY_ONE',
          cardB: 'ZERO_OR_MORE',
        });

      expectGolden(diagram.render(), 'er/render-basic.mmd');
    });
  });
});
