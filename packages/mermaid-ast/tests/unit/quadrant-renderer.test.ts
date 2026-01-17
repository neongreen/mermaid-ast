import { describe, it } from 'bun:test';
import { Quadrant } from '../../src/quadrant.js';
import { expectGolden } from '../golden/golden.js';

describe('Quadrant Renderer', () => {
  describe('Golden Tests', () => {
    it('should render simple quadrant chart', () => {
      const diagram = Quadrant.create('Priority Matrix')
        .setXAxis('Effort', 'High Effort')
        .setYAxis('Impact', 'High Impact')
        .addPoint('Task A', 0.3, 0.7)
        .addPoint('Task B', 0.8, 0.9);

      expectGolden(diagram.render(), 'quadrant/render-simple.mmd');
    });

    it('should render with quadrant labels', () => {
      const diagram = Quadrant.create()
        .setQuadrantLabels('Do First', 'Plan', 'Delegate', 'Eliminate')
        .setXAxis('Low', 'High')
        .setYAxis('Low', 'High')
        .addPoint('Project', 0.5, 0.5);

      expectGolden(diagram.render(), 'quadrant/render-labels.mmd');
    });
  });
});
