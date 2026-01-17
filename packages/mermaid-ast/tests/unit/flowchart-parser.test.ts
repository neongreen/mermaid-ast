/**
 * Unit tests for Flowchart Parser
 */

import { describe, expect, it } from 'bun:test';
import { isFlowchartDiagram, parseFlowchart } from '../../src/parser/index.js';

describe('isFlowchartDiagram', () => {
  it('should detect flowchart keyword', () => {
    expect(isFlowchartDiagram('flowchart LR\n  A --> B')).toBe(true);
    expect(isFlowchartDiagram('flowchart TB\n  A --> B')).toBe(true);
    expect(isFlowchartDiagram('  flowchart LR\n  A --> B')).toBe(true);
  });

  it('should detect graph keyword', () => {
    expect(isFlowchartDiagram('graph LR\n  A --> B')).toBe(true);
    expect(isFlowchartDiagram('graph TD\n  A --> B')).toBe(true);
  });

  it('should detect flowchart-elk keyword', () => {
    expect(isFlowchartDiagram('flowchart-elk LR\n  A --> B')).toBe(true);
  });

  it('should not detect non-flowchart diagrams', () => {
    expect(isFlowchartDiagram('sequenceDiagram\n  A->>B: msg')).toBe(false);
    expect(isFlowchartDiagram('classDiagram\n  A --> B')).toBe(false);
  });
});

describe('parseFlowchart - Direction', () => {
  it('should parse LR direction', () => {
    const ast = parseFlowchart('flowchart LR\n  A --> B');
    expect(ast.direction).toBe('LR');
  });

  it('should parse RL direction', () => {
    const ast = parseFlowchart('flowchart RL\n  A --> B');
    expect(ast.direction).toBe('RL');
  });

  it('should parse TB direction', () => {
    const ast = parseFlowchart('flowchart TB\n  A --> B');
    expect(ast.direction).toBe('TB');
  });

  it('should parse TD direction (same as TB)', () => {
    const ast = parseFlowchart('flowchart TD\n  A --> B');
    expect(ast.direction).toBe('TD');
  });

  it('should parse BT direction', () => {
    const ast = parseFlowchart('flowchart BT\n  A --> B');
    expect(ast.direction).toBe('BT');
  });

  it('should default to TB when no direction', () => {
    const ast = parseFlowchart('flowchart\n  A --> B');
    expect(ast.direction).toBe('TB');
  });
});

describe('parseFlowchart - Nodes', () => {
  it('should parse simple node IDs', () => {
    const ast = parseFlowchart('flowchart LR\n  A --> B');
    expect(ast.nodes.has('A')).toBe(true);
    expect(ast.nodes.has('B')).toBe(true);
  });

  it('should parse square bracket nodes', () => {
    const ast = parseFlowchart('flowchart LR\n  A[Hello World]');
    const node = ast.nodes.get('A');
    expect(node).toBeDefined();
    expect(node?.text?.text).toBe('Hello World');
    expect(node?.shape).toBe('square');
  });

  it('should parse round bracket nodes', () => {
    const ast = parseFlowchart('flowchart LR\n  A(Hello World)');
    const node = ast.nodes.get('A');
    expect(node).toBeDefined();
    expect(node?.text?.text).toBe('Hello World');
    expect(node?.shape).toBe('round');
  });

  it('should parse circle nodes', () => {
    const ast = parseFlowchart('flowchart LR\n  A((Circle))');
    const node = ast.nodes.get('A');
    expect(node).toBeDefined();
    expect(node?.text?.text).toBe('Circle');
    expect(node?.shape).toBe('circle');
  });

  it('should parse diamond nodes', () => {
    const ast = parseFlowchart('flowchart LR\n  A{Decision}');
    const node = ast.nodes.get('A');
    expect(node).toBeDefined();
    expect(node?.text?.text).toBe('Decision');
    expect(node?.shape).toBe('diamond');
  });

  it('should parse hexagon nodes', () => {
    const ast = parseFlowchart('flowchart LR\n  A{{Hexagon}}');
    const node = ast.nodes.get('A');
    expect(node).toBeDefined();
    expect(node?.text?.text).toBe('Hexagon');
    expect(node?.shape).toBe('hexagon');
  });

  it('should parse stadium nodes', () => {
    const ast = parseFlowchart('flowchart LR\n  A([Stadium])');
    const node = ast.nodes.get('A');
    expect(node).toBeDefined();
    expect(node?.text?.text).toBe('Stadium');
    expect(node?.shape).toBe('stadium');
  });

  it('should parse subroutine nodes', () => {
    const ast = parseFlowchart('flowchart LR\n  A[[Subroutine]]');
    const node = ast.nodes.get('A');
    expect(node).toBeDefined();
    expect(node?.text?.text).toBe('Subroutine');
    expect(node?.shape).toBe('subroutine');
  });

  it('should parse cylinder nodes', () => {
    const ast = parseFlowchart('flowchart LR\n  A[(Database)]');
    const node = ast.nodes.get('A');
    expect(node).toBeDefined();
    expect(node?.text?.text).toBe('Database');
    expect(node?.shape).toBe('cylinder');
  });

  it('should parse asymmetric nodes', () => {
    const ast = parseFlowchart('flowchart LR\n  A>Flag]');
    const node = ast.nodes.get('A');
    expect(node).toBeDefined();
    expect(node?.text?.text).toBe('Flag');
    expect(node?.shape).toBe('odd');
  });

  it('should parse trapezoid nodes', () => {
    const ast = parseFlowchart('flowchart LR\n  A[/Trapezoid\\]');
    const node = ast.nodes.get('A');
    expect(node).toBeDefined();
    expect(node?.text?.text).toBe('Trapezoid');
    expect(node?.shape).toBe('trapezoid');
  });

  it('should parse inverted trapezoid nodes', () => {
    const ast = parseFlowchart('flowchart LR\n  A[\\Inverted/]');
    const node = ast.nodes.get('A');
    expect(node).toBeDefined();
    expect(node?.text?.text).toBe('Inverted');
    expect(node?.shape).toBe('inv_trapezoid');
  });

  it('should parse double circle nodes', () => {
    const ast = parseFlowchart('flowchart LR\n  A(((Double)))');
    const node = ast.nodes.get('A');
    expect(node).toBeDefined();
    expect(node?.text?.text).toBe('Double');
    expect(node?.shape).toBe('doublecircle');
  });
});

describe('parseFlowchart - Links', () => {
  it('should parse arrow links', () => {
    const ast = parseFlowchart('flowchart LR\n  A --> B');
    expect(ast.links.length).toBe(1);
    expect(ast.links[0].source).toBe('A');
    expect(ast.links[0].target).toBe('B');
    expect(ast.links[0].type).toBe('arrow_point');
    expect(ast.links[0].stroke).toBe('normal');
  });

  it('should parse open links', () => {
    const ast = parseFlowchart('flowchart LR\n  A --- B');
    expect(ast.links.length).toBe(1);
    expect(ast.links[0].type).toBe('arrow_open');
  });

  it('should parse dotted links', () => {
    const ast = parseFlowchart('flowchart LR\n  A -.-> B');
    expect(ast.links.length).toBe(1);
    expect(ast.links[0].stroke).toBe('dotted');
  });

  it('should parse thick links', () => {
    const ast = parseFlowchart('flowchart LR\n  A ==> B');
    expect(ast.links.length).toBe(1);
    expect(ast.links[0].stroke).toBe('thick');
  });

  it('should parse link text with pipes', () => {
    const ast = parseFlowchart('flowchart LR\n  A -->|Yes| B');
    expect(ast.links.length).toBe(1);
    expect(ast.links[0].text?.text).toBe('Yes');
  });

  it('should parse multiple links from same node', () => {
    const ast = parseFlowchart('flowchart LR\n  A --> B\n  A --> C');
    expect(ast.links.length).toBe(2);
  });

  it('should parse chained links', () => {
    const ast = parseFlowchart('flowchart LR\n  A --> B --> C');
    expect(ast.links.length).toBe(2);
    expect(ast.links[0].source).toBe('A');
    expect(ast.links[0].target).toBe('B');
    expect(ast.links[1].source).toBe('B');
    expect(ast.links[1].target).toBe('C');
  });
});

describe('parseFlowchart - Subgraphs', () => {
  it('should parse simple subgraph', () => {
    const ast = parseFlowchart(`flowchart LR
  subgraph sub1
    A --> B
  end`);
    expect(ast.subgraphs.length).toBe(1);
    expect(ast.subgraphs[0].id).toBe('sub1');
  });

  it('should parse subgraph with title', () => {
    const ast = parseFlowchart(`flowchart LR
  subgraph sub1[My Subgraph]
    A --> B
  end`);
    expect(ast.subgraphs.length).toBe(1);
    expect(ast.subgraphs[0].title?.text).toBe('My Subgraph');
  });

  it('should parse nested subgraphs', () => {
    const ast = parseFlowchart(`flowchart LR
  subgraph outer
    subgraph inner
      A --> B
    end
  end`);
    expect(ast.subgraphs.length).toBe(2);
  });
});

describe('parseFlowchart - Complex diagrams', () => {
  it('should parse a complete flowchart', () => {
    const ast = parseFlowchart(`flowchart TD
    A[Start] --> B{Is it?}
    B -->|Yes| C[OK]
    C --> D[Rethink]
    D --> B
    B -->|No| E[End]`);

    expect(ast.direction).toBe('TD');
    expect(ast.nodes.size).toBe(5);
    expect(ast.links.length).toBe(5);

    const nodeA = ast.nodes.get('A');
    expect(nodeA?.text?.text).toBe('Start');
    expect(nodeA?.shape).toBe('square');

    const nodeB = ast.nodes.get('B');
    expect(nodeB?.text?.text).toBe('Is it?');
    expect(nodeB?.shape).toBe('diamond');
  });
});
