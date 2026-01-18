/**
 * Quadrant Renderer Tests
 */

import { describe, expect, it } from 'bun:test';
import { parseQuadrant } from '../../src/parser/quadrant-parser.js';
import { renderQuadrant } from '../../src/renderer/quadrant-renderer.js';
import { Quadrant } from '../../src/quadrant.js';
import { expectGolden } from '../golden/golden.js';

describe('Quadrant Renderer', () => {
  describe('Basic Rendering', () => {
    it('should render minimal quadrant chart', () => {
      const diagram = Quadrant.create();
      const rendered = diagram.render();
      expect(rendered).toContain('quadrantChart');
    });

    it('should render quadrant chart with title', () => {
      const diagram = Quadrant.create('My Chart');
      const rendered = diagram.render();
      expect(rendered).toContain('quadrantChart');
      expect(rendered).toContain('title My Chart');
    });

    it('should render quadrant chart without title', () => {
      const diagram = Quadrant.create();
      const rendered = diagram.render();
      expect(rendered).toContain('quadrantChart');
      expect(rendered).not.toContain('title');
    });
  });

  describe('Axis Rendering', () => {
    it('should render x-axis labels', () => {
      const diagram = Quadrant.create().setXAxis('Low Effort', 'High Effort');
      const rendered = diagram.render();
      expect(rendered).toContain('x-axis "Low Effort" --> "High Effort"');
    });

    it('should render y-axis labels', () => {
      const diagram = Quadrant.create().setYAxis('Low Impact', 'High Impact');
      const rendered = diagram.render();
      expect(rendered).toContain('y-axis "Low Impact" --> "High Impact"');
    });

    it('should render both axes', () => {
      const diagram = Quadrant.create().setXAxis('Left', 'Right').setYAxis('Bottom', 'Top');
      const rendered = diagram.render();
      expect(rendered).toContain('x-axis "Left" --> "Right"');
      expect(rendered).toContain('y-axis "Bottom" --> "Top"');
    });
  });

  describe('Quadrant Label Rendering', () => {
    it('should render quadrant-1 label', () => {
      const diagram = Quadrant.create().setQuadrantLabels('Do First');
      const rendered = diagram.render();
      expect(rendered).toContain('quadrant-1 "Do First"');
    });

    it('should render all quadrant labels', () => {
      const diagram = Quadrant.create().setQuadrantLabels(
        'Do First',
        'Plan',
        'Delegate',
        'Eliminate'
      );
      const rendered = diagram.render();
      expect(rendered).toContain('quadrant-1 "Do First"');
      expect(rendered).toContain('quadrant-2 "Plan"');
      expect(rendered).toContain('quadrant-3 "Delegate"');
      expect(rendered).toContain('quadrant-4 "Eliminate"');
    });

    it('should render quadrant labels in correct order', () => {
      const diagram = Quadrant.create().setQuadrantLabels('Q1', 'Q2', 'Q3', 'Q4');
      const rendered = diagram.render();
      const q1Idx = rendered.indexOf('quadrant-1');
      const q2Idx = rendered.indexOf('quadrant-2');
      const q3Idx = rendered.indexOf('quadrant-3');
      const q4Idx = rendered.indexOf('quadrant-4');
      expect(q1Idx).toBeLessThan(q2Idx);
      expect(q2Idx).toBeLessThan(q3Idx);
      expect(q3Idx).toBeLessThan(q4Idx);
    });
  });

  describe('Point Rendering', () => {
    it('should render single point', () => {
      const diagram = Quadrant.create().addPoint('Task A', 0.5, 0.5);
      const rendered = diagram.render();
      expect(rendered).toContain('Task A: [0.5, 0.5]');
    });

    it('should render multiple points', () => {
      const diagram = Quadrant.create()
        .addPoint('Task A', 0.3, 0.7)
        .addPoint('Task B', 0.8, 0.2)
        .addPoint('Task C', 0.1, 0.9);
      const rendered = diagram.render();
      expect(rendered).toContain('Task A: [0.3, 0.7]');
      expect(rendered).toContain('Task B: [0.8, 0.2]');
      expect(rendered).toContain('Task C: [0.1, 0.9]');
    });

    it('should render point with class name', () => {
      const diagram = Quadrant.create()
        .addClass('urgent', ['fill: red'])
        .addPoint('Critical', 0.9, 0.9, { className: 'urgent' });
      const rendered = diagram.render();
      expect(rendered).toContain('Critical:::urgent: [0.9, 0.9]');
    });

    it('should render points in order', () => {
      const diagram = Quadrant.create()
        .addPoint('First', 0.1, 0.1)
        .addPoint('Second', 0.5, 0.5)
        .addPoint('Third', 0.9, 0.9);
      const rendered = diagram.render();
      const firstIdx = rendered.indexOf('First');
      const secondIdx = rendered.indexOf('Second');
      const thirdIdx = rendered.indexOf('Third');
      expect(firstIdx).toBeLessThan(secondIdx);
      expect(secondIdx).toBeLessThan(thirdIdx);
    });
  });

  describe('Class Definition Rendering', () => {
    it('should render class definition', () => {
      const diagram = Quadrant.create().addClass('highlight', ['fill: yellow', 'stroke: black']);
      const rendered = diagram.render();
      expect(rendered).toContain('classDef highlight fill: yellow, stroke: black');
    });

    it('should render multiple class definitions', () => {
      const diagram = Quadrant.create()
        .addClass('urgent', ['fill: red'])
        .addClass('normal', ['fill: blue']);
      const rendered = diagram.render();
      expect(rendered).toContain('classDef urgent fill: red');
      expect(rendered).toContain('classDef normal fill: blue');
    });
  });

  describe('Complex Diagrams', () => {
    it('should render complete priority matrix', () => {
      const diagram = Quadrant.create('Priority Matrix')
        .setXAxis('Low Effort', 'High Effort')
        .setYAxis('Low Impact', 'High Impact')
        .setQuadrantLabels('Quick Wins', 'Major Projects', 'Fill-ins', 'Thankless Tasks')
        .addPoint('Task A', 0.2, 0.8)
        .addPoint('Task B', 0.8, 0.9)
        .addPoint('Task C', 0.3, 0.2)
        .addPoint('Task D', 0.7, 0.3);

      const rendered = diagram.render();
      expect(rendered).toContain('title Priority Matrix');
      expect(rendered).toContain('x-axis "Low Effort" --> "High Effort"');
      expect(rendered).toContain('y-axis "Low Impact" --> "High Impact"');
      expect(rendered).toContain('quadrant-1 "Quick Wins"');
      expect(rendered).toContain('Task A: [0.2, 0.8]');
      expect(rendered).toContain('Task B: [0.8, 0.9]');
    });

    it('should render chart with styled points', () => {
      const diagram = Quadrant.create('Styled Chart')
        .addClass('high', ['fill: green'])
        .addClass('low', ['fill: red'])
        .addPoint('Good', 0.8, 0.8, { className: 'high' })
        .addPoint('Bad', 0.2, 0.2, { className: 'low' });

      const rendered = diagram.render();
      expect(rendered).toContain('classDef high fill: green');
      expect(rendered).toContain('classDef low fill: red');
      expect(rendered).toContain('Good:::high: [0.8, 0.8]');
      expect(rendered).toContain('Bad:::low: [0.2, 0.2]');
    });
  });

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

    it('should render complex quadrant chart', () => {
      const diagram = Quadrant.create('Product Backlog Prioritization')
        .setXAxis('Low Value', 'High Value')
        .setYAxis('Low Complexity', 'High Complexity')
        .setQuadrantLabels('High Priority', 'Strategic', 'Quick Wins', 'Low Priority')
        .addClass('critical', ['fill: #ff6b6b'])
        .addClass('normal', ['fill: #4ecdc4'])
        .addPoint('Feature A', 0.9, 0.2, { className: 'critical' })
        .addPoint('Feature B', 0.8, 0.8, { className: 'normal' })
        .addPoint('Feature C', 0.2, 0.3, { className: 'normal' })
        .addPoint('Feature D', 0.3, 0.9);

      expectGolden(diagram.render(), 'quadrant/render-complex.mmd');
    });
  });

  describe('Render Options', () => {
    it('should respect custom indent', () => {
      const diagram = Quadrant.create('Test');
      const rendered = diagram.render({ indent: 2 });
      const lines = rendered.split('\n');
      // Title line should have 2-space indent
      expect(lines[1]).toMatch(/^\s{2}title/);
    });

    it('should support tab indent', () => {
      const diagram = Quadrant.create('Test');
      const rendered = diagram.render({ indent: 'tab' });
      expect(rendered).toContain('\ttitle');
    });
  });

  describe('Round-trip Rendering', () => {
    it('should preserve content through wrapper build and render', () => {
      const diagram = Quadrant.create('Test Chart')
        .setXAxis('Left', 'Right')
        .setYAxis('Bottom', 'Top')
        .addPoint('Point A', 0.25, 0.75)
        .addPoint('Point B', 0.75, 0.25);

      const rendered = diagram.render();
      expect(rendered).toContain('quadrantChart');
      expect(rendered).toContain('title Test Chart');
      expect(rendered).toContain('x-axis "Left" --> "Right"');
      expect(rendered).toContain('y-axis "Bottom" --> "Top"');
      expect(rendered).toContain('Point A: [0.25, 0.75]');
      expect(rendered).toContain('Point B: [0.75, 0.25]');
    });
  });
});
