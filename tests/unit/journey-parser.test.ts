import { describe, expect, it } from 'bun:test';
import { parseJourney } from '../../src/parser/journey-parser.js';

describe('Journey Diagram Parsing', () => {
  it('should parse a simple journey diagram', () => {
    const input = `journey
    title My Journey
    section Getting Started
    Task 1: 5: Me`;

    const ast = parseJourney(input);

    expect(ast.type).toBe('journey');
    expect(ast.title).toBe('My Journey');
    expect(ast.sections.length).toBe(1);
    expect(ast.sections[0].name).toBe('Getting Started');
    expect(ast.sections[0].tasks.length).toBe(1);
  });

  it('should parse tasks with scores', () => {
    const input = `journey
    section Tasks
    Happy task: 5: Me
    Sad task: 1: Me
    Medium task: 3: Me`;

    const ast = parseJourney(input);

    expect(ast.sections[0].tasks.length).toBe(3);
    expect(ast.sections[0].tasks[0].score).toBe(5);
    expect(ast.sections[0].tasks[1].score).toBe(1);
    expect(ast.sections[0].tasks[2].score).toBe(3);
  });

  it('should parse tasks with multiple actors', () => {
    const input = `journey
    section Collaboration
    Team meeting: 4: Alice, Bob, Charlie`;

    const ast = parseJourney(input);

    const task = ast.sections[0].tasks[0];
    expect(task.name).toBe('Team meeting');
    expect(task.score).toBe(4);
    expect(task.actors).toEqual(['Alice', 'Bob', 'Charlie']);
  });

  it('should parse multiple sections', () => {
    const input = `journey
    title User Onboarding
    section Discovery
    Visit website: 5: User
    section Signup
    Create account: 3: User
    section Usage
    First task: 4: User`;

    const ast = parseJourney(input);

    expect(ast.sections.length).toBe(3);
    expect(ast.sections[0].name).toBe('Discovery');
    expect(ast.sections[1].name).toBe('Signup');
    expect(ast.sections[2].name).toBe('Usage');
  });

  it('should parse accessibility title and description', () => {
    const input = `journey
    accTitle: My Journey Chart
    accDescr: A chart showing user journey
    section Start
    Task: 5: Me`;

    const ast = parseJourney(input);

    expect(ast.accTitle).toBe('My Journey Chart');
    expect(ast.accDescription).toBe('A chart showing user journey');
  });

  it('should handle tasks without explicit actors', () => {
    const input = `journey
    section Solo
    Do something: 5`;

    const ast = parseJourney(input);

    const task = ast.sections[0].tasks[0];
    expect(task.name).toBe('Do something');
    expect(task.score).toBe(5);
    expect(task.actors).toEqual([]);
  });

  it('should create default section for tasks without section', () => {
    const input = `journey
    title Quick Journey
    Task without section: 4: Me`;

    const ast = parseJourney(input);

    expect(ast.sections.length).toBe(1);
    expect(ast.sections[0].name).toBe('');
    expect(ast.sections[0].tasks[0].name).toBe('Task without section');
  });
});
