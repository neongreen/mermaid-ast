import { describe, it } from 'bun:test';
import { Gantt } from '../../src/gantt.js';
import { expectGolden } from '../golden/golden.js';

describe('Gantt Renderer', () => {
  describe('Basic Rendering', () => {
    it('should render to Mermaid syntax', () => {
      const chart = Gantt.create()
        .setTitle('My Project')
        .setDateFormat('YYYY-MM-DD')
        .addSection('Phase 1')
        .addTask('Task A', 'Phase 1', { id: 'a', start: '2024-01-01', end: '5d' });

      expectGolden(chart.render(), 'gantt/render-basic.mmd');
    });
  });
});
