/**
 * Gantt Renderer Tests
 */

import { describe, expect, it } from 'bun:test';
import { parseGantt } from '../../src/parser/gantt-parser.js';
import { renderGantt } from '../../src/renderer/gantt-renderer.js';
import { Gantt } from '../../src/gantt.js';
import { expectGolden } from '../golden/golden.js';

describe('Gantt Renderer', () => {
  describe('Basic Rendering', () => {
    it('should render minimal gantt chart', () => {
      const ast = parseGantt(`gantt
    title My Project`);
      const rendered = renderGantt(ast);
      expect(rendered).toContain('gantt');
      expect(rendered).toContain('title My Project');
    });

    it('should render gantt with dateFormat', () => {
      const ast = parseGantt(`gantt
    dateFormat YYYY-MM-DD`);
      const rendered = renderGantt(ast);
      expect(rendered).toContain('dateFormat YYYY-MM-DD');
    });

    it('should render gantt with title and dateFormat', () => {
      const chart = Gantt.create().setTitle('Project Plan').setDateFormat('YYYY-MM-DD');
      const rendered = chart.render();
      expect(rendered).toContain('gantt');
      expect(rendered).toContain('title Project Plan');
      expect(rendered).toContain('dateFormat YYYY-MM-DD');
    });
  });

  describe('Configuration Rendering', () => {
    it('should render axisFormat', () => {
      const chart = Gantt.create().setAxisFormat('%Y-%m-%d');
      const rendered = chart.render();
      expect(rendered).toContain('axisFormat %Y-%m-%d');
    });

    it('should render tickInterval', () => {
      const chart = Gantt.create().setTickInterval('1week');
      const rendered = chart.render();
      expect(rendered).toContain('tickInterval 1week');
    });

    it('should render inclusiveEndDates', () => {
      const chart = Gantt.create().enableInclusiveEndDates();
      const rendered = chart.render();
      expect(rendered).toContain('inclusiveEndDates');
    });

    it('should render topAxis', () => {
      const chart = Gantt.create().enableTopAxis();
      const rendered = chart.render();
      expect(rendered).toContain('topAxis');
    });

    it('should render excludes', () => {
      const chart = Gantt.create().setExcludes('weekends');
      const rendered = chart.render();
      expect(rendered).toContain('excludes weekends');
    });

    it('should render includes', () => {
      const chart = Gantt.create().setIncludes('2024-01-01');
      const rendered = chart.render();
      expect(rendered).toContain('includes 2024-01-01');
    });

    it('should render todayMarker', () => {
      const chart = Gantt.create().setTodayMarker('off');
      const rendered = chart.render();
      expect(rendered).toContain('todayMarker off');
    });

    it('should render weekday', () => {
      const chart = Gantt.create().setWeekday('monday');
      const rendered = chart.render();
      expect(rendered).toContain('weekday monday');
    });

    it('should render weekend', () => {
      const chart = Gantt.create().setWeekend('friday');
      const rendered = chart.render();
      expect(rendered).toContain('weekend friday');
    });
  });

  describe('Accessibility Rendering', () => {
    it('should render accessibility title', () => {
      const ast = parseGantt(`gantt
    accTitle: Project Timeline`);
      const rendered = renderGantt(ast);
      expect(rendered).toContain('accTitle: Project Timeline');
    });

    it('should render accessibility description', () => {
      const ast = parseGantt(`gantt
    accDescr: Timeline showing project phases`);
      const rendered = renderGantt(ast);
      expect(rendered).toContain('accDescr: Timeline showing project phases');
    });
  });

  describe('Task Rendering', () => {
    it('should render simple task', () => {
      const chart = Gantt.create()
        .setDateFormat('YYYY-MM-DD')
        .addTask('Task A', undefined, { id: 'a', start: '2024-01-01', end: '5d' });
      const rendered = chart.render();
      expect(rendered).toContain('Task A');
    });

    it('should render task with done status', () => {
      const chart = Gantt.create()
        .setDateFormat('YYYY-MM-DD')
        .addTask('Completed Task', undefined, {
          id: 'done1',
          status: 'done',
          start: '2024-01-01',
          end: '2024-01-05',
        });
      const rendered = chart.render();
      expect(rendered).toContain('Completed Task');
      expect(rendered).toContain('done');
    });

    it('should render task with active status', () => {
      const chart = Gantt.create().setDateFormat('YYYY-MM-DD').addTask('Active Task', undefined, {
        id: 'active1',
        status: 'active',
        start: '2024-01-01',
        end: '2024-01-10',
      });
      const rendered = chart.render();
      expect(rendered).toContain('Active Task');
      expect(rendered).toContain('active');
    });

    it('should render task with crit status', () => {
      const chart = Gantt.create().setDateFormat('YYYY-MM-DD').addTask('Critical Task', undefined, {
        id: 'crit1',
        status: 'crit',
        start: '2024-01-01',
        end: '2024-01-03',
      });
      const rendered = chart.render();
      expect(rendered).toContain('Critical Task');
      expect(rendered).toContain('crit');
    });

    it('should render milestone', () => {
      const chart = Gantt.create().setDateFormat('YYYY-MM-DD').addTask('Release', undefined, {
        id: 'ms1',
        status: 'milestone',
        start: '2024-01-15',
        end: '0d',
      });
      const rendered = chart.render();
      expect(rendered).toContain('Release');
      expect(rendered).toContain('milestone');
    });
  });

  describe('Section Rendering', () => {
    it('should render section with tasks', () => {
      const chart = Gantt.create()
        .setDateFormat('YYYY-MM-DD')
        .addSection('Phase 1')
        .addTask('Task A', 'Phase 1', { id: 'a', start: '2024-01-01', end: '5d' })
        .addTask('Task B', 'Phase 1', { id: 'b', start: 'after a', end: '3d' });
      const rendered = chart.render();
      expect(rendered).toContain('section Phase 1');
      expect(rendered).toContain('Task A');
      expect(rendered).toContain('Task B');
    });

    it('should render multiple sections', () => {
      const chart = Gantt.create()
        .setDateFormat('YYYY-MM-DD')
        .addSection('Design')
        .addTask('Mockups', 'Design', { id: 'd1', start: '2024-01-01', end: '5d' })
        .addSection('Development')
        .addTask('Coding', 'Development', { id: 'dev1', start: 'after d1', end: '10d' });
      const rendered = chart.render();
      expect(rendered).toContain('section Design');
      expect(rendered).toContain('section Development');
      expect(rendered).toContain('Mockups');
      expect(rendered).toContain('Coding');
    });
  });

  describe('Click Events Rendering', () => {
    it('should render click callback', () => {
      const chart = Gantt.create()
        .setDateFormat('YYYY-MM-DD')
        .addTask('Task A', undefined, { id: 'a', start: '2024-01-01', end: '5d' })
        .setClickCallback('a', 'handleClick');
      const rendered = chart.render();
      expect(rendered).toContain('click a call handleClick()');
    });

    it('should render click callback with args', () => {
      const chart = Gantt.create()
        .setDateFormat('YYYY-MM-DD')
        .addTask('Task A', undefined, { id: 'a', start: '2024-01-01', end: '5d' })
        .setClickCallback('a', 'handleClick', '"arg1", "arg2"');
      const rendered = chart.render();
      expect(rendered).toContain('click a call handleClick("arg1", "arg2")');
    });

    it('should render click link', () => {
      const chart = Gantt.create()
        .setDateFormat('YYYY-MM-DD')
        .addTask('Task A', undefined, { id: 'a', start: '2024-01-01', end: '5d' })
        .setLink('a', 'https://example.com');
      const rendered = chart.render();
      expect(rendered).toContain('click a');
      expect(rendered).toContain('href "https://example.com"');
    });
  });

  describe('Golden Tests', () => {
    it('should render basic gantt chart', () => {
      const chart = Gantt.create()
        .setTitle('My Project')
        .setDateFormat('YYYY-MM-DD')
        .addSection('Phase 1')
        .addTask('Task A', 'Phase 1', { id: 'a', start: '2024-01-01', end: '5d' });

      expectGolden(chart.render(), 'gantt/render-basic.mmd');
    });

    it('should render complex gantt chart', () => {
      const chart = Gantt.create()
        .setTitle('Software Project')
        .setDateFormat('YYYY-MM-DD')
        .setAxisFormat('%m/%d')
        .setExcludes('weekends')
        .addSection('Planning')
        .addTask('Requirements', 'Planning', {
          id: 'req',
          status: 'done',
          start: '2024-01-01',
          end: '2024-01-05',
        })
        .addTask('Design', 'Planning', { id: 'des', status: 'done', start: 'after req', end: '5d' })
        .addSection('Development')
        .addTask('Backend', 'Development', {
          id: 'be',
          status: 'active',
          start: 'after des',
          end: '10d',
        })
        .addTask('Frontend', 'Development', { id: 'fe', start: 'after des', end: '10d' })
        .addSection('Release')
        .addTask('Testing', 'Release', { id: 'test', status: 'crit', start: 'after be', end: '5d' })
        .addTask('Launch', 'Release', {
          id: 'launch',
          status: 'milestone',
          start: 'after test',
          end: '0d',
        });

      expectGolden(chart.render(), 'gantt/render-complex.mmd');
    });
  });

  describe('Render Options', () => {
    it('should respect custom indent', () => {
      const ast = parseGantt(`gantt
    title Test`);
      const rendered = renderGantt(ast, { indent: 2 });
      const lines = rendered.split('\n');
      expect(lines[1]).toMatch(/^\s{2}title/);
    });

    it('should support tab indent', () => {
      const ast = parseGantt(`gantt
    title Test`);
      const rendered = renderGantt(ast, { indent: 'tab' });
      expect(rendered).toContain('\ttitle');
    });
  });
});
