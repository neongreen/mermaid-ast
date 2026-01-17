import { describe, expect, test } from 'bun:test';
import { FlowchartValidationError, flowchart } from '../../src/builder/flowchart-builder.js';
import { parseFlowchart } from '../../src/parser/flowchart-parser.js';
import { renderFlowchart } from '../../src/renderer/flowchart-renderer.js';

describe('FlowchartBuilder', () => {
  test('builds a simple flowchart', () => {
    const ast = flowchart('LR').node('A', 'Start').node('B', 'End').link('A', 'B').build();

    expect(ast.type).toBe('flowchart');
    expect(ast.direction).toBe('LR');
    expect(ast.nodes.size).toBe(2);
    expect(ast.links.length).toBe(1);
  });

  test('builds nodes with shapes', () => {
    const ast = flowchart()
      .node('A', 'Stadium', { shape: 'stadium' })
      .node('B', 'Circle', { shape: 'circle' })
      .build();

    expect(ast.nodes.get('A')?.shape).toBe('stadium');
    expect(ast.nodes.get('B')?.shape).toBe('circle');
  });

  test('builds links with options', () => {
    const ast = flowchart()
      .node('A')
      .node('B')
      .link('A', 'B', { text: 'goes to', stroke: 'dotted', type: 'arrow_circle' })
      .build();

    const link = ast.links[0];
    expect(link.text?.text).toBe('goes to');
    expect(link.stroke).toBe('dotted');
    expect(link.type).toBe('arrow_circle');
  });

  test('builds subgraphs', () => {
    const ast = flowchart()
      .node('A')
      .subgraph('sub1', 'My Subgraph', (s) => {
        s.node('B').node('C').link('B', 'C');
      })
      .link('A', 'B')
      .build();

    expect(ast.subgraphs.length).toBe(1);
    expect(ast.subgraphs[0].id).toBe('sub1');
    expect(ast.subgraphs[0].title?.text).toBe('My Subgraph');
    expect(ast.subgraphs[0].nodes).toContain('B');
    expect(ast.subgraphs[0].nodes).toContain('C');
  });

  test('builds classDefs and class assignments', () => {
    const ast = flowchart()
      .node('A')
      .classDef('highlight', { fill: '#f9f', stroke: '#333' })
      .class('A', 'highlight')
      .build();

    expect(ast.classDefs.has('highlight')).toBe(true);
    expect(ast.classes.get('A')).toContain('highlight');
  });

  test('validates link references', () => {
    expect(() => {
      flowchart().node('A').link('A', 'B').build();
    }).toThrow(FlowchartValidationError);
  });

  test('allows skipping validation', () => {
    const ast = flowchart().node('A').link('A', 'B').build({ validate: false });

    expect(ast.links.length).toBe(1);
  });

  test('round-trips through render and parse', () => {
    const ast = flowchart('LR')
      .node('A', 'Start')
      .node('B', 'End')
      .link('A', 'B', { text: 'next' })
      .build();

    const rendered = renderFlowchart(ast);
    const parsed = parseFlowchart(rendered);

    expect(parsed.nodes.size).toBe(ast.nodes.size);
    expect(parsed.links.length).toBe(ast.links.length);
    expect(parsed.direction).toBe(ast.direction);
  });
});
