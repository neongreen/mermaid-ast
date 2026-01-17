import { describe, expect, it } from 'bun:test';
import { Gantt } from '../../src/gantt.js';

describe('Gantt Wrapper', () => {
  describe('Factory Methods', () => {
    it('should create an empty Gantt chart', () => {
      const chart = Gantt.create();
      expect(chart.taskCount).toBe(0);
      expect(chart.sectionCount).toBe(0);
    });

    it('should parse Mermaid syntax', () => {
      const chart = Gantt.parse(`gantt
        title My Project
        section Phase 1
        Task A :a, 2024-01-01, 5d`);

      expect(chart.title).toBe('My Project');
      expect(chart.sectionCount).toBe(1);
      expect(chart.taskCount).toBe(1);
    });

    it('should create from existing AST', () => {
      const original = Gantt.create().setTitle('Test').addSection('Section 1');
      const copy = Gantt.from(original.toAST());
      expect(copy.title).toBe('Test');
      expect(copy.sectionCount).toBe(1);
    });
  });

  describe('Configuration', () => {
    it('should set title', () => {
      const chart = Gantt.create().setTitle('My Project');
      expect(chart.title).toBe('My Project');
    });

    it('should set date format', () => {
      const chart = Gantt.create().setDateFormat('YYYY-MM-DD');
      expect(chart.dateFormat).toBe('YYYY-MM-DD');
    });

    it('should set axis format', () => {
      const chart = Gantt.create().setAxisFormat('%m/%d');
      expect(chart.axisFormat).toBe('%m/%d');
    });

    it('should enable inclusive end dates', () => {
      const chart = Gantt.create().enableInclusiveEndDates();
      expect(chart.toAST().inclusiveEndDates).toBe(true);
    });

    it('should enable top axis', () => {
      const chart = Gantt.create().enableTopAxis();
      expect(chart.toAST().topAxis).toBe(true);
    });

    it('should set excludes', () => {
      const chart = Gantt.create().setExcludes('weekends');
      expect(chart.toAST().excludes).toBe('weekends');
    });

    it('should set today marker', () => {
      const chart = Gantt.create().setTodayMarker('off');
      expect(chart.toAST().todayMarker).toBe('off');
    });

    it('should set weekday', () => {
      const chart = Gantt.create().setWeekday('monday');
      expect(chart.toAST().weekday).toBe('monday');
    });
  });

  describe('Section Operations', () => {
    it('should add sections', () => {
      const chart = Gantt.create().addSection('Phase 1').addSection('Phase 2');

      expect(chart.sectionCount).toBe(2);
      expect(chart.sections[0].name).toBe('Phase 1');
      expect(chart.sections[1].name).toBe('Phase 2');
    });

    it('should get section by name', () => {
      const chart = Gantt.create().addSection('Phase 1').addTask('Task A', 'Phase 1');

      const section = chart.getSection('Phase 1');
      expect(section).toBeDefined();
      expect(section!.tasks.length).toBe(1);
    });

    it('should remove sections', () => {
      const chart = Gantt.create()
        .addSection('Phase 1')
        .addSection('Phase 2')
        .removeSection('Phase 1');

      expect(chart.sectionCount).toBe(1);
      expect(chart.sections[0].name).toBe('Phase 2');
    });

    it('should rename sections', () => {
      const chart = Gantt.create()
        .addSection('Old Name')
        .addTask('Task A', 'Old Name')
        .renameSection('Old Name', 'New Name');

      expect(chart.sections[0].name).toBe('New Name');
      expect(chart.sections[0].tasks[0].section).toBe('New Name');
    });
  });

  describe('Task Operations', () => {
    it('should add tasks to sections', () => {
      const chart = Gantt.create().addTask('Task A', 'Phase 1', {
        id: 'a',
        start: '2024-01-01',
        end: '5d',
      });

      expect(chart.taskCount).toBe(1);
      expect(chart.sectionCount).toBe(1);
      const task = chart.getTask('a');
      expect(task).toBeDefined();
      expect(task!.name).toBe('Task A');
    });

    it('should add tasks without section', () => {
      const chart = Gantt.create().addTask('Task A', undefined, { id: 'a' });

      expect(chart.taskCount).toBe(1);
      expect(chart.sectionCount).toBe(0);
    });

    it('should remove tasks', () => {
      const chart = Gantt.create()
        .addTask('Task A', 'Phase 1', { id: 'a' })
        .addTask('Task B', 'Phase 1', { id: 'b' })
        .removeTask('a');

      expect(chart.taskCount).toBe(1);
      expect(chart.getTask('a')).toBeUndefined();
    });

    it('should set task status', () => {
      const chart = Gantt.create()
        .addTask('Task A', undefined, { id: 'a' })
        .setTaskStatus('a', 'done');

      expect(chart.getTask('a')!.status).toBe('done');
    });

    it('should set milestone', () => {
      const chart = Gantt.create().addTask('Milestone', undefined, { id: 'm' }).setMilestone('m');

      expect(chart.getTask('m')!.status).toBe('milestone');
    });

    it('should set critical', () => {
      const chart = Gantt.create()
        .addTask('Critical Task', undefined, { id: 'c' })
        .setCritical('c');

      expect(chart.getTask('c')!.status).toBe('crit');
    });

    it('should move tasks between sections', () => {
      const chart = Gantt.create()
        .addTask('Task A', 'Phase 1', { id: 'a' })
        .moveTask('a', 'Phase 2');

      expect(chart.getTasksInSection('Phase 1').length).toBe(0);
      expect(chart.getTasksInSection('Phase 2').length).toBe(1);
    });
  });

  describe('Click Events', () => {
    it('should set click callback', () => {
      const chart = Gantt.create()
        .addTask('Task A', undefined, { id: 'a' })
        .setClickCallback('a', 'handleClick', 'arg1');

      const events = chart.toAST().clickEvents;
      expect(events.length).toBe(1);
      expect(events[0].callback).toBe('handleClick');
      expect(events[0].callbackArgs).toBe('arg1');
    });

    it('should set link', () => {
      const chart = Gantt.create()
        .addTask('Task A', undefined, { id: 'a' })
        .setLink('a', 'https://example.com');

      const events = chart.toAST().clickEvents;
      expect(events.length).toBe(1);
      expect(events[0].href).toBe('https://example.com');
    });
  });

  describe('Query Operations', () => {
    it('should get all tasks', () => {
      const chart = Gantt.create()
        .addTask('Task A', 'Phase 1', { id: 'a' })
        .addTask('Task B', 'Phase 2', { id: 'b' })
        .addTask('Task C', undefined, { id: 'c' });

      expect(chart.getAllTasks().length).toBe(3);
    });

    it('should find tasks by section', () => {
      const chart = Gantt.create()
        .addTask('Task A', 'Phase 1', { id: 'a' })
        .addTask('Task B', 'Phase 1', { id: 'b' })
        .addTask('Task C', 'Phase 2', { id: 'c' });

      const found = chart.findTasks({ section: 'Phase 1' });
      expect(found.length).toBe(2);
    });

    it('should find tasks by status', () => {
      const chart = Gantt.create()
        .addTask('Task A', undefined, { id: 'a', status: 'done' })
        .addTask('Task B', undefined, { id: 'b', status: 'crit' })
        .addTask('Task C', undefined, { id: 'c', status: 'done' });

      const found = chart.findTasks({ status: 'done' });
      expect(found.length).toBe(2);
    });

    it('should find tasks by name', () => {
      const chart = Gantt.create()
        .addTask('Design UI', undefined, { id: 'a' })
        .addTask('Design API', undefined, { id: 'b' })
        .addTask('Implement API', undefined, { id: 'c' });

      const found = chart.findTasks({ nameContains: 'Design' });
      expect(found.length).toBe(2);
    });

    it('should get critical tasks', () => {
      const chart = Gantt.create()
        .addTask('Task A', undefined, { id: 'a', status: 'crit' })
        .addTask('Task B', undefined, { id: 'b' })
        .addTask('Task C', undefined, { id: 'c', status: 'crit' });

      expect(chart.getCriticalTasks().length).toBe(2);
    });

    it('should get milestones', () => {
      const chart = Gantt.create()
        .addTask('Milestone 1', undefined, { id: 'm1', status: 'milestone' })
        .addTask('Task A', undefined, { id: 'a' })
        .addTask('Milestone 2', undefined, { id: 'm2', status: 'milestone' });

      expect(chart.getMilestones().length).toBe(2);
    });
  });

  describe('Clone', () => {
    it('should clone the chart', () => {
      const original = Gantt.create()
        .setTitle('My Project')
        .addTask('Task A', 'Phase 1', { id: 'a' });

      const clone = original.clone();
      clone.setTitle('Cloned Project');
      clone.addTask('Task B', 'Phase 1', { id: 'b' });

      expect(original.title).toBe('My Project');
      expect(original.taskCount).toBe(1);
      expect(clone.title).toBe('Cloned Project');
      expect(clone.taskCount).toBe(2);
    });
  });

  describe('Round-trip', () => {
    it('should round-trip a simple chart', () => {
      const input = `gantt
    title My Project
    dateFormat YYYY-MM-DD
    section Phase 1
    Task A :a, 2024-01-01, 5d
    Task B :b, after a, 3d`;

      const chart = Gantt.parse(input);
      const output = chart.render();
      const reparsed = Gantt.parse(output);

      expect(reparsed.title).toBe(chart.title);
      expect(reparsed.sectionCount).toBe(chart.sectionCount);
      expect(reparsed.taskCount).toBe(chart.taskCount);
    });
  });
});
