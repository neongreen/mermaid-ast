/**
 * Timeline Renderer Tests
 */

import { describe, expect, it } from 'bun:test';
import { parseTimeline } from '../../src/parser/timeline-parser.js';
import { renderTimeline } from '../../src/renderer/timeline-renderer.js';
import { Timeline } from '../../src/timeline.js';
import { expectGolden } from '../golden/golden.js';

describe('Timeline Renderer', () => {
  describe('Basic Rendering', () => {
    it('should render minimal timeline', () => {
      const timeline = Timeline.create('My Timeline');
      const rendered = timeline.render();
      expect(rendered).toContain('timeline');
      expect(rendered).toContain('title My Timeline');
    });

    it('should render timeline without title', () => {
      const timeline = Timeline.create();
      const rendered = timeline.render();
      expect(rendered).toContain('timeline');
      expect(rendered).not.toContain('title');
    });

    it('should render timeline with title only', () => {
      const timeline = Timeline.create('Project History');
      const rendered = timeline.render();
      expect(rendered).toContain('timeline');
      expect(rendered).toContain('title Project History');
    });
  });

  describe('Section Rendering', () => {
    it('should render single section', () => {
      const timeline = Timeline.create('My Timeline').addSection('2020s');
      const rendered = timeline.render();
      expect(rendered).toContain('section 2020s');
    });

    it('should render multiple sections', () => {
      const timeline = Timeline.create('History')
        .addSection('Ancient')
        .addSection('Medieval')
        .addSection('Modern');
      const rendered = timeline.render();
      expect(rendered).toContain('section Ancient');
      expect(rendered).toContain('section Medieval');
      expect(rendered).toContain('section Modern');
    });

    it('should render sections in order', () => {
      const timeline = Timeline.create('History')
        .addSection('First')
        .addSection('Second')
        .addSection('Third');
      const rendered = timeline.render();
      const firstIdx = rendered.indexOf('section First');
      const secondIdx = rendered.indexOf('section Second');
      const thirdIdx = rendered.indexOf('section Third');
      expect(firstIdx).toBeLessThan(secondIdx);
      expect(secondIdx).toBeLessThan(thirdIdx);
    });
  });

  describe('Period Rendering', () => {
    it('should render period in section', () => {
      const timeline = Timeline.create('My Timeline')
        .addSection('2020s')
        .addPeriod('2020s', '2020');
      const rendered = timeline.render();
      expect(rendered).toContain('2020');
    });

    it('should render multiple periods', () => {
      const timeline = Timeline.create('My Timeline')
        .addSection('2020s')
        .addPeriod('2020s', '2020')
        .addPeriod('2020s', '2021')
        .addPeriod('2020s', '2022');
      const rendered = timeline.render();
      expect(rendered).toContain('2020');
      expect(rendered).toContain('2021');
      expect(rendered).toContain('2022');
    });

    it('should render periods in order', () => {
      const timeline = Timeline.create('My Timeline')
        .addSection('Years')
        .addPeriod('Years', '2020')
        .addPeriod('Years', '2021')
        .addPeriod('Years', '2022');
      const rendered = timeline.render();
      const idx2020 = rendered.indexOf('2020');
      const idx2021 = rendered.indexOf('2021');
      const idx2022 = rendered.indexOf('2022');
      expect(idx2020).toBeLessThan(idx2021);
      expect(idx2021).toBeLessThan(idx2022);
    });
  });

  describe('Event Rendering', () => {
    it('should render event under period', () => {
      const timeline = Timeline.create('My Timeline')
        .addSection('2020s')
        .addPeriod('2020s', '2020')
        .addEvent('2020', 'Major event');
      const rendered = timeline.render();
      expect(rendered).toContain(': Major event');
    });

    it('should render multiple events', () => {
      const timeline = Timeline.create('My Timeline')
        .addSection('2020s')
        .addPeriod('2020s', '2020')
        .addEvent('2020', 'Event A')
        .addEvent('2020', 'Event B')
        .addEvent('2020', 'Event C');
      const rendered = timeline.render();
      expect(rendered).toContain(': Event A');
      expect(rendered).toContain(': Event B');
      expect(rendered).toContain(': Event C');
    });

    it('should render events in order', () => {
      const timeline = Timeline.create('My Timeline')
        .addSection('2020s')
        .addPeriod('2020s', '2020')
        .addEvent('2020', 'First')
        .addEvent('2020', 'Second')
        .addEvent('2020', 'Third');
      const rendered = timeline.render();
      const firstIdx = rendered.indexOf(': First');
      const secondIdx = rendered.indexOf(': Second');
      const thirdIdx = rendered.indexOf(': Third');
      expect(firstIdx).toBeLessThan(secondIdx);
      expect(secondIdx).toBeLessThan(thirdIdx);
    });
  });

  describe('Complex Diagrams', () => {
    it('should render complete timeline with sections, periods, and events', () => {
      const timeline = Timeline.create('Company History')
        .addSection('Early Days')
        .addPeriod('Early Days', '2010')
        .addEvent('2010', 'Company founded')
        .addEvent('2010', 'First product launched')
        .addPeriod('Early Days', '2011')
        .addEvent('2011', 'Series A funding')
        .addSection('Growth')
        .addPeriod('Growth', '2015')
        .addEvent('2015', 'IPO')
        .addEvent('2015', '1000 employees')
        .addPeriod('Growth', '2020')
        .addEvent('2020', 'Global expansion');

      const rendered = timeline.render();
      expect(rendered).toContain('title Company History');
      expect(rendered).toContain('section Early Days');
      expect(rendered).toContain('section Growth');
      expect(rendered).toContain('2010');
      expect(rendered).toContain('2011');
      expect(rendered).toContain('2015');
      expect(rendered).toContain('2020');
      expect(rendered).toContain(': Company founded');
      expect(rendered).toContain(': IPO');
    });

    it('should render timeline with many sections', () => {
      const timeline = Timeline.create('Decades')
        .addSection('1990s')
        .addPeriod('1990s', '1995')
        .addEvent('1995', 'Event 1995')
        .addSection('2000s')
        .addPeriod('2000s', '2005')
        .addEvent('2005', 'Event 2005')
        .addSection('2010s')
        .addPeriod('2010s', '2015')
        .addEvent('2015', 'Event 2015')
        .addSection('2020s')
        .addPeriod('2020s', '2025')
        .addEvent('2025', 'Event 2025');

      const rendered = timeline.render();
      expect(rendered).toContain('section 1990s');
      expect(rendered).toContain('section 2000s');
      expect(rendered).toContain('section 2010s');
      expect(rendered).toContain('section 2020s');
    });
  });

  describe('Golden Tests', () => {
    it('should render basic timeline', () => {
      const timeline = Timeline.create('My Timeline')
        .addSection('2020s')
        .addPeriod('2020s', '2020')
        .addEvent('2020', 'Major event');

      expectGolden(timeline.render(), 'timeline/render-basic.mmd');
    });

    it('should render complex timeline', () => {
      const timeline = Timeline.create('Software Development History')
        .addSection('Planning')
        .addPeriod('Planning', 'Q1 2023')
        .addEvent('Q1 2023', 'Requirements gathered')
        .addEvent('Q1 2023', 'Architecture designed')
        .addPeriod('Planning', 'Q2 2023')
        .addEvent('Q2 2023', 'Team assembled')
        .addSection('Development')
        .addPeriod('Development', 'Q3 2023')
        .addEvent('Q3 2023', 'MVP completed')
        .addEvent('Q3 2023', 'Alpha testing')
        .addPeriod('Development', 'Q4 2023')
        .addEvent('Q4 2023', 'Beta release')
        .addSection('Launch')
        .addPeriod('Launch', 'Q1 2024')
        .addEvent('Q1 2024', 'Public release')
        .addEvent('Q1 2024', 'Marketing campaign');

      expectGolden(timeline.render(), 'timeline/render-complex.mmd');
    });
  });

  describe('Render Options', () => {
    it('should respect custom indent', () => {
      const timeline = Timeline.create('Test').addSection('Section').addPeriod('Section', 'Period');
      const rendered = timeline.render({ indent: 2 });
      const lines = rendered.split('\n');
      // Check that indentation is applied (title should have 2 spaces)
      expect(lines[1]).toMatch(/^\s{2}title/);
    });

    it('should support tab indent', () => {
      const timeline = Timeline.create('Test');
      const rendered = timeline.render({ indent: 'tab' });
      expect(rendered).toContain('\ttitle');
    });
  });

  describe('Round-trip Rendering', () => {
    it('should preserve content through wrapper build and render', () => {
      const timeline = Timeline.create('Test Timeline')
        .addSection('Section A')
        .addPeriod('Section A', '2020')
        .addEvent('2020', 'Event 1')
        .addEvent('2020', 'Event 2');

      const rendered = timeline.render();
      expect(rendered).toContain('timeline');
      expect(rendered).toContain('title Test Timeline');
      expect(rendered).toContain('section Section A');
      expect(rendered).toContain('2020');
      expect(rendered).toContain(': Event 1');
      expect(rendered).toContain(': Event 2');
    });
  });
});
