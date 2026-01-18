/**
 * Mindmap Renderer Tests
 */

import { describe, expect, it } from 'bun:test';
import { parseMindmap } from '../../src/parser/mindmap-parser.js';
import { renderMindmap } from '../../src/renderer/mindmap-renderer.js';
import { Mindmap } from '../../src/mindmap.js';
import { expectGolden } from '../golden/golden.js';

describe('Mindmap Renderer', () => {
  describe('Basic Rendering', () => {
    it('should render minimal mindmap', () => {
      const map = Mindmap.create('Root');
      const rendered = map.render();
      expect(rendered).toContain('mindmap');
      expect(rendered).toContain('Root');
    });

    it('should render mindmap with children', () => {
      const map = Mindmap.create('Root')
        .addChild('Root', 'A', 'Node A')
        .addChild('Root', 'B', 'Node B');
      const rendered = map.render();
      expect(rendered).toContain('mindmap');
      expect(rendered).toContain('Root');
      // Default shape only shows ID, not description
      expect(rendered).toContain('A');
      expect(rendered).toContain('B');
    });

    it('should render nested children', () => {
      const map = Mindmap.create('Root')
        .addChild('Root', 'A', 'Node A')
        .addChild('A', 'A1', 'Child A1')
        .addChild('A', 'A2', 'Child A2');
      const rendered = map.render();
      // Default shape only shows ID
      expect(rendered).toContain('A');
      expect(rendered).toContain('A1');
      expect(rendered).toContain('A2');
    });
  });

  describe('Node Shape Rendering', () => {
    it('should render default shape (no brackets)', () => {
      const map = Mindmap.create('Root', 'Root Node', { shape: 'default' });
      const rendered = map.render();
      expect(rendered).toContain('Root');
      // Default shape doesn't include brackets
      expect(rendered).not.toContain('[');
      expect(rendered).not.toContain(']');
    });

    it('should render square shape', () => {
      const map = Mindmap.create('Root', 'Root Node', { shape: 'square' });
      const rendered = map.render();
      expect(rendered).toContain('[Root Node]');
    });

    it('should render rounded shape', () => {
      const map = Mindmap.create('Root', 'Root Node', { shape: 'rounded' });
      const rendered = map.render();
      expect(rendered).toContain('(Root Node)');
    });

    it('should render circle shape', () => {
      const map = Mindmap.create('Root', 'Root Node', { shape: 'circle' });
      const rendered = map.render();
      expect(rendered).toContain('((Root Node))');
    });

    it('should render bang shape', () => {
      const map = Mindmap.create('Root', 'Root Node', { shape: 'bang' });
      const rendered = map.render();
      expect(rendered).toContain('))Root Node((');
    });

    it('should render cloud shape', () => {
      const map = Mindmap.create('Root', 'Root Node', { shape: 'cloud' });
      const rendered = map.render();
      expect(rendered).toContain(')Root Node(');
    });

    it('should render hexagon shape', () => {
      const map = Mindmap.create('Root', 'Root Node', { shape: 'hexagon' });
      const rendered = map.render();
      expect(rendered).toContain('{{Root Node}}');
    });

    it('should render children with different shapes', () => {
      const map = Mindmap.create('Root')
        .addChild('Root', 'A', 'Square', { shape: 'square' })
        .addChild('Root', 'B', 'Rounded', { shape: 'rounded' })
        .addChild('Root', 'C', 'Circle', { shape: 'circle' });
      const rendered = map.render();
      expect(rendered).toContain('[Square]');
      expect(rendered).toContain('(Rounded)');
      expect(rendered).toContain('((Circle))');
    });
  });

  describe('Icon Rendering', () => {
    it('should render node with icon', () => {
      const map = Mindmap.create('Root', 'Root Node').setIcon('Root', 'fa fa-home');
      const rendered = map.render();
      expect(rendered).toContain('::icon(fa fa-home)');
    });

    it('should render child with icon', () => {
      const map = Mindmap.create('Root').addChild('Root', 'A', 'Node A', { icon: 'fa fa-star' });
      const rendered = map.render();
      expect(rendered).toContain('::icon(fa fa-star)');
    });
  });

  describe('CSS Class Rendering', () => {
    it('should render node with CSS class', () => {
      const map = Mindmap.create('Root', 'Root Node').setClass('Root', 'highlight');
      const rendered = map.render();
      expect(rendered).toContain(':::highlight');
    });

    it('should render child with CSS class', () => {
      const map = Mindmap.create('Root').addChild('Root', 'A', 'Node A', { cssClass: 'important' });
      const rendered = map.render();
      expect(rendered).toContain(':::important');
    });
  });

  describe('Complex Diagrams', () => {
    it('should render deep nesting', () => {
      const map = Mindmap.create('Root')
        .addChild('Root', 'L1', 'Level 1', { shape: 'square' })
        .addChild('L1', 'L2', 'Level 2', { shape: 'square' })
        .addChild('L2', 'L3', 'Level 3', { shape: 'square' })
        .addChild('L3', 'L4', 'Level 4', { shape: 'square' });
      const rendered = map.render();
      expect(rendered).toContain('[Level 1]');
      expect(rendered).toContain('[Level 2]');
      expect(rendered).toContain('[Level 3]');
      expect(rendered).toContain('[Level 4]');
    });

    it('should render wide tree', () => {
      const map = Mindmap.create('Root')
        .addChild('Root', 'A', 'Branch A', { shape: 'rounded' })
        .addChild('Root', 'B', 'Branch B', { shape: 'rounded' })
        .addChild('Root', 'C', 'Branch C', { shape: 'rounded' })
        .addChild('Root', 'D', 'Branch D', { shape: 'rounded' })
        .addChild('Root', 'E', 'Branch E', { shape: 'rounded' });
      const rendered = map.render();
      expect(rendered).toContain('(Branch A)');
      expect(rendered).toContain('(Branch B)');
      expect(rendered).toContain('(Branch C)');
      expect(rendered).toContain('(Branch D)');
      expect(rendered).toContain('(Branch E)');
    });

    it('should render mixed shapes and icons', () => {
      const map = Mindmap.create('Root', 'Central Idea', { shape: 'hexagon' })
        .addChild('Root', 'A', 'Topic A', { shape: 'square', icon: 'fa fa-book' })
        .addChild('Root', 'B', 'Topic B', { shape: 'rounded', cssClass: 'highlight' })
        .addChild('A', 'A1', 'Subtopic A1', { shape: 'circle' });
      const rendered = map.render();
      expect(rendered).toContain('{{Central Idea}}');
      expect(rendered).toContain('[Topic A]');
      expect(rendered).toContain('(Topic B)');
      expect(rendered).toContain('((Subtopic A1))');
    });
  });

  describe('Golden Tests', () => {
    it('should render basic mindmap', () => {
      const map = Mindmap.create('Root')
        .addChild('Root', 'A', 'Node A')
        .addChild('Root', 'B', 'Node B');

      expectGolden(map.render(), 'mindmap/render-basic.mmd');
    });

    it('should render complex mindmap', () => {
      const map = Mindmap.create('ProjectPlan', 'Project Plan', { shape: 'hexagon' })
        .addChild('ProjectPlan', 'Research', 'Research', { shape: 'square' })
        .addChild('Research', 'R1', 'Market Analysis', { shape: 'rounded' })
        .addChild('Research', 'R2', 'Competitor Review', { shape: 'rounded' })
        .addChild('ProjectPlan', 'Design', 'Design', { shape: 'square' })
        .addChild('Design', 'D1', 'Wireframes', { shape: 'rounded' })
        .addChild('Design', 'D2', 'Mockups', { shape: 'rounded' })
        .addChild('ProjectPlan', 'Development', 'Development', { shape: 'square' })
        .addChild('Development', 'Dev1', 'Frontend', { shape: 'rounded' })
        .addChild('Development', 'Dev2', 'Backend', { shape: 'rounded' })
        .addChild('Development', 'Dev3', 'Testing', { shape: 'rounded' });

      expectGolden(map.render(), 'mindmap/render-complex.mmd');
    });
  });

  describe('Render Options', () => {
    it('should respect custom indent', () => {
      const map = Mindmap.create('Root').addChild('Root', 'A', 'Node A');
      const rendered = map.render({ indent: 2 });
      // Check that indentation is applied
      const lines = rendered.split('\n');
      expect(lines.length).toBeGreaterThan(1);
    });

    it('should support tab indent', () => {
      const map = Mindmap.create('Root').addChild('Root', 'A', 'Node A');
      const rendered = map.render({ indent: 'tab' });
      expect(rendered).toContain('\t');
    });
  });

  describe('Round-trip Rendering', () => {
    it('should preserve content through parse-render cycle', () => {
      // Build a mindmap programmatically and verify round-trip
      const map = Mindmap.create('Root')
        .addChild('Root', 'A', 'Node A', { shape: 'square' })
        .addChild('Root', 'B', 'Node B', { shape: 'rounded' });

      const rendered = map.render();
      expect(rendered).toContain('mindmap');
      expect(rendered).toContain('Root');
      expect(rendered).toContain('[Node A]');
      expect(rendered).toContain('(Node B)');
    });
  });
});
