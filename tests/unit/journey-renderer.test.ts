import { describe, it } from 'bun:test';
import { Journey } from '../../src/journey.js';
import { expectGolden } from '../golden/golden.js';

describe('Journey Renderer', () => {
  describe('Basic Rendering', () => {
    it('should render to Mermaid syntax', () => {
      const journey = Journey.create('My Journey')
        .addSection('Morning')
        .addTask('Morning', 'Wake up', { score: 3, actors: ['Me'] });

      expectGolden(journey.render(), 'journey/render-basic.mmd');
    });
  });
});
