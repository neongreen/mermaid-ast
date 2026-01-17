import { describe, it } from 'bun:test';
import { StateDiagram } from '../../src/state-diagram.js';
import { expectGolden } from '../golden/golden.js';

describe('StateDiagram Renderer', () => {
  describe('Basic Rendering', () => {
    it('should render to Mermaid syntax', () => {
      const diagram = StateDiagram.create()
        .addInitial('Idle')
        .addTransition('Idle', 'Running', { label: 'start' })
        .addFinal('Running');

      expectGolden(diagram.render(), 'state/render-basic.mmd');
    });
  });
});
