import { describe, it } from 'bun:test';
import { Timeline } from '../../src/timeline.js';
import { expectGolden } from '../golden/golden.js';

describe('Timeline Renderer', () => {
  describe('Basic Rendering', () => {
    it('should render to Mermaid syntax', () => {
      const timeline = Timeline.create('My Timeline')
        .addSection('2020s')
        .addPeriod('2020s', '2020')
        .addEvent('2020', 'Major event');

      expectGolden(timeline.render(), 'timeline/render-basic.mmd');
    });
  });
});
