import { describe, expect, it } from 'bun:test';
import { parseGantt } from '../../src/parser/gantt-parser.js';

describe('Gantt Chart Parsing', () => {
  it('should parse a simple Gantt chart', () => {
    const input = `gantt
    title My Project
    dateFormat YYYY-MM-DD
    section Planning
    Task 1 :a1, 2024-01-01, 5d`;

    const ast = parseGantt(input);

    expect(ast.type).toBe('gantt');
    expect(ast.title).toBe('My Project');
    expect(ast.dateFormat).toBe('YYYY-MM-DD');
    expect(ast.sections.length).toBe(1);
    expect(ast.sections[0].name).toBe('Planning');
    expect(ast.sections[0].tasks.length).toBe(1);
  });

  it('should parse tasks with different statuses', () => {
    const input = `gantt
    Task Done :done, t1, 2024-01-01, 5d
    Task Active :active, t2, 2024-01-06, 3d
    Task Critical :crit, t3, 2024-01-09, 2d
    Milestone :milestone, t4, 2024-01-11, 0d`;

    const ast = parseGantt(input);

    expect(ast.tasks.length).toBe(4);
    expect(ast.tasks[0].status).toBe('done');
    expect(ast.tasks[1].status).toBe('active');
    expect(ast.tasks[2].status).toBe('crit');
    expect(ast.tasks[3].status).toBe('milestone');
  });

  it('should parse multiple sections', () => {
    const input = `gantt
    section Phase 1
    Task A :a, 2024-01-01, 5d
    section Phase 2
    Task B :b, 2024-01-06, 3d
    section Phase 3
    Task C :c, 2024-01-09, 2d`;

    const ast = parseGantt(input);

    expect(ast.sections.length).toBe(3);
    expect(ast.sections[0].name).toBe('Phase 1');
    expect(ast.sections[1].name).toBe('Phase 2');
    expect(ast.sections[2].name).toBe('Phase 3');
  });

  it('should parse axis format', () => {
    const input = `gantt
    dateFormat YYYY-MM-DD
    axisFormat %m/%d`;

    const ast = parseGantt(input);

    expect(ast.dateFormat).toBe('YYYY-MM-DD');
    expect(ast.axisFormat).toBe('%m/%d');
  });

  it('should parse inclusiveEndDates', () => {
    const input = `gantt
    inclusiveEndDates
    Task :t1, 2024-01-01, 5d`;

    const ast = parseGantt(input);

    expect(ast.inclusiveEndDates).toBe(true);
  });

  it('should parse topAxis', () => {
    const input = `gantt
    topAxis
    Task :t1, 2024-01-01, 5d`;

    const ast = parseGantt(input);

    expect(ast.topAxis).toBe(true);
  });

  it('should parse excludes', () => {
    const input = `gantt
    excludes weekends`;

    const ast = parseGantt(input);

    expect(ast.excludes).toBe('weekends');
  });

  it('should parse todayMarker', () => {
    const input = `gantt
    todayMarker stroke-width:5px,stroke:#0f0,opacity:0.5`;

    const ast = parseGantt(input);

    expect(ast.todayMarker).toBe('stroke-width:5px,stroke:#0f0,opacity:0.5');
  });

  it('should parse accessibility title and description', () => {
    const input = `gantt
    accTitle: My Gantt Chart
    accDescr: A chart showing project timeline
    Task :t1, 2024-01-01, 5d`;

    const ast = parseGantt(input);

    expect(ast.accTitle).toBe('My Gantt Chart');
    expect(ast.accDescription).toBe('A chart showing project timeline');
  });
});
