import { describe, expect, test } from 'bun:test';
import { StateDiagramValidationError, stateDiagram } from '../../src/builder/state-builder.js';
import { parseStateDiagram } from '../../src/parser/state-parser.js';
import { renderStateDiagram } from '../../src/renderer/state-renderer.js';

describe('StateDiagramBuilder', () => {
  test('builds a simple state diagram', () => {
    const ast = stateDiagram().state('Idle').state('Running').transition('Idle', 'Running').build();

    expect(ast.type).toBe('state');
    expect(ast.states.size).toBe(2);
    expect(ast.transitions.length).toBe(1);
  });

  test('builds states with descriptions', () => {
    const ast = stateDiagram().state('Idle', { description: 'Waiting for input' }).build();

    expect(ast.states.get('Idle')?.description).toBe('Waiting for input');
  });

  test('builds transitions with labels', () => {
    const ast = stateDiagram()
      .state('A')
      .state('B')
      .transition('A', 'B', { label: 'start' })
      .build();

    expect(ast.transitions[0].description).toBe('start');
  });

  test('builds initial and final transitions', () => {
    const ast = stateDiagram().state('Running').initial('Running').final('Running').build();

    expect(ast.transitions.length).toBe(2);
    expect(ast.transitions[0].state1.id).toBe('[*]');
    expect(ast.transitions[1].state2.id).toBe('[*]');
  });

  test('builds fork and join states', () => {
    const ast = stateDiagram().fork('fork1').join('join1').build();

    expect(ast.states.get('fork1')?.type).toBe('fork');
    expect(ast.states.get('join1')?.type).toBe('join');
  });

  test('builds choice states', () => {
    const ast = stateDiagram().choice('choice1').build();

    expect(ast.states.get('choice1')?.type).toBe('choice');
  });

  test('builds composite states', () => {
    const ast = stateDiagram()
      .composite('Outer', (c) => {
        c.state('Inner1').state('Inner2').transition('Inner1', 'Inner2');
      })
      .build();

    const outer = ast.states.get('Outer');
    expect(outer?.doc).toBeDefined();
    expect(outer?.doc?.length).toBeGreaterThan(0);
  });

  test('builds notes', () => {
    const ast = stateDiagram().state('MyState').note('MyState', 'Important note').build();

    const state = ast.states.get('MyState');
    expect(state?.note?.text).toBe('Important note');
  });

  test('builds classDefs and applies them', () => {
    const ast = stateDiagram()
      .state('A')
      .classDef('highlight', 'fill:#f9f')
      .applyClass('A', 'highlight')
      .build();

    expect(ast.classDefs.has('highlight')).toBe(true);
    expect(ast.classApplications.length).toBe(1);
  });

  test('validates transition references', () => {
    expect(() => {
      stateDiagram().state('A').transition('A', 'B').build();
    }).toThrow(StateDiagramValidationError);
  });

  test('allows skipping validation', () => {
    const ast = stateDiagram().state('A').transition('A', 'B').build({ validate: false });

    expect(ast.transitions.length).toBe(1);
  });

  test('round-trips through render and parse', () => {
    const ast = stateDiagram()
      .state('Idle')
      .state('Running')
      .initial('Idle')
      .transition('Idle', 'Running', { label: 'start' })
      .final('Running')
      .build();

    const rendered = renderStateDiagram(ast);
    const parsed = parseStateDiagram(rendered);

    expect(parsed.states.size).toBeGreaterThanOrEqual(2);
    expect(parsed.transitions.length).toBe(ast.transitions.length);
  });
});
