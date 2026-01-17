import { describe, expect, it } from 'bun:test';
import { parseTimeline } from '../../src/parser/timeline-parser.js';

describe('Timeline Diagram Parsing', () => {
  it('should parse a simple timeline with title', () => {
    const input = `timeline
    title Timeline Title
    section Phase 1`;

    const ast = parseTimeline(input);

    expect(ast.type).toBe('timeline');
    expect(ast.title).toBe('Timeline Title');
    expect(ast.sections.length).toBeGreaterThan(0);
  });

  it('should parse sections', () => {
    const input = `timeline
    section Phase 1
    section Phase 2
    section Phase 3`;

    const ast = parseTimeline(input);

    expect(ast.sections.length).toBe(3);
    expect(ast.sections[0].name).toBe('Phase 1');
    expect(ast.sections[1].name).toBe('Phase 2');
    expect(ast.sections[2].name).toBe('Phase 3');
  });

  it('should parse periods within sections', () => {
    const input = `timeline
    section Development
    2024-01: Period 1
    2024-02: Period 2
    2024-03: Period 3`;

    const ast = parseTimeline(input);

    expect(ast.sections[0].periods.length).toBe(3);
    expect(ast.sections[0].periods[0].name).toBe('2024-01');
    expect(ast.sections[0].periods[1].name).toBe('2024-02');
    expect(ast.sections[0].periods[2].name).toBe('2024-03');
  });

  it('should parse events within periods', () => {
    const input = `timeline
    section Timeline
    2024-01: Event 1 : Event 2 : Event 3`;

    const ast = parseTimeline(input);

    const period = ast.sections[0].periods[0];
    expect(period.events.length).toBe(3);
    expect(period.events[0].text).toBe('Event 1');
    expect(period.events[1].text).toBe('Event 2');
    expect(period.events[2].text).toBe('Event 3');
  });

  it('should parse accessibility title and description', () => {
    const input = `timeline
    accTitle: My Timeline
    accDescr: A timeline showing project phases
    section Phase 1`;

    const ast = parseTimeline(input);

    expect(ast.accTitle).toBe('My Timeline');
    expect(ast.accDescription).toBe('A timeline showing project phases');
  });
});
