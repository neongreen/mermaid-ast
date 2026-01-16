/**
 * Advanced Flowchart Parser Tests
 *
 * Tests for: classDef, class assignments, click handlers, link styles, subgraph direction
 */

import { describe, expect, it } from 'bun:test';
import { parseFlowchart } from '../../src/parser/index.js';
import { renderFlowchart } from '../../src/renderer/index.js';

describe('parseFlowchart - Class Definitions', () => {
  it('should parse classDef with single style', () => {
    const ast = parseFlowchart(`flowchart LR
    A --> B
    classDef red fill:#f00`);

    expect(ast.classDefs.has('red')).toBe(true);
    const classDef = ast.classDefs.get('red');
    expect(classDef?.styles.fill).toBe('#f00');
  });

  it('should parse classDef with multiple styles', () => {
    const ast = parseFlowchart(`flowchart LR
    A --> B
    classDef highlight fill:#ff0,stroke:#333,stroke-width:2px`);

    expect(ast.classDefs.has('highlight')).toBe(true);
    const classDef = ast.classDefs.get('highlight');
    expect(classDef?.styles.fill).toBe('#ff0');
    expect(classDef?.styles.stroke).toBe('#333');
    expect(classDef?.styles['stroke-width']).toBe('2px');
  });

  it('should parse multiple classDef statements', () => {
    const ast = parseFlowchart(`flowchart LR
    A --> B
    classDef red fill:#f00
    classDef blue fill:#00f`);

    expect(ast.classDefs.size).toBe(2);
    expect(ast.classDefs.has('red')).toBe(true);
    expect(ast.classDefs.has('blue')).toBe(true);
  });
});

describe('parseFlowchart - Class Assignments', () => {
  it('should parse class assignment to single node', () => {
    const ast = parseFlowchart(`flowchart LR
    A --> B
    classDef red fill:#f00
    class A red`);

    expect(ast.classes.has('A')).toBe(true);
    expect(ast.classes.get('A')).toContain('red');
  });

  it('should parse class assignment to multiple nodes', () => {
    const ast = parseFlowchart(`flowchart LR
    A --> B --> C
    classDef highlight fill:#ff0
    class A,B,C highlight`);

    expect(ast.classes.get('A')).toContain('highlight');
    expect(ast.classes.get('B')).toContain('highlight');
    expect(ast.classes.get('C')).toContain('highlight');
  });

  it('should parse triple colon class syntax', () => {
    const ast = parseFlowchart(`flowchart LR
    A:::red --> B
    classDef red fill:#f00`);

    expect(ast.classes.has('A')).toBe(true);
    expect(ast.classes.get('A')).toContain('red');
  });
});

describe('parseFlowchart - Click Handlers', () => {
  it('should parse click with callback', () => {
    const ast = parseFlowchart(`flowchart LR
    A --> B
    click A callback`);

    expect(ast.clicks.length).toBe(1);
    expect(ast.clicks[0].nodeId).toBe('A');
    expect(ast.clicks[0].callback).toBe('callback');
  });

  it('should parse click with href', () => {
    const ast = parseFlowchart(`flowchart LR
    A --> B
    click A href "https://example.com"`);

    expect(ast.clicks.length).toBe(1);
    expect(ast.clicks[0].nodeId).toBe('A');
    expect(ast.clicks[0].href).toBe('https://example.com');
  });

  it('should parse click with href and target', () => {
    const ast = parseFlowchart(`flowchart LR
    A --> B
    click A href "https://example.com" _blank`);

    expect(ast.clicks.length).toBe(1);
    expect(ast.clicks[0].href).toBe('https://example.com');
    expect(ast.clicks[0].target).toBe('_blank');
  });
});

describe('parseFlowchart - Link Styles', () => {
  it('should parse linkStyle for specific link', () => {
    const ast = parseFlowchart(`flowchart LR
    A --> B
    linkStyle 0 stroke:#ff0,stroke-width:2px`);

    expect(ast.linkStyles.length).toBe(1);
    expect(ast.linkStyles[0].index).toBe(0);
    expect(ast.linkStyles[0].styles.stroke).toBe('#ff0');
  });

  it('should parse linkStyle default', () => {
    const ast = parseFlowchart(`flowchart LR
    A --> B
    linkStyle default stroke:#333`);

    expect(ast.linkStyles.length).toBe(1);
    expect(ast.linkStyles[0].index).toBe('default');
  });
});

describe('parseFlowchart - Subgraph Direction', () => {
  it('should parse subgraph with direction', () => {
    const ast = parseFlowchart(`flowchart LR
    subgraph sub1
        direction TB
        A --> B
    end`);

    expect(ast.subgraphs.length).toBe(1);
    expect(ast.subgraphs[0].direction).toBe('TB');
  });

  it('should parse nested subgraphs with different directions', () => {
    const ast = parseFlowchart(`flowchart LR
    subgraph outer
        direction TB
        subgraph inner
            direction RL
            A --> B
        end
    end`);

    expect(ast.subgraphs.length).toBe(2);
    // Inner subgraph should have RL direction
    const innerSubgraph = ast.subgraphs.find((s) => s.id === 'inner');
    expect(innerSubgraph?.direction).toBe('RL');
  });
});

describe('renderFlowchart - Advanced Features', () => {
  it('should render classDef', () => {
    const ast = parseFlowchart(`flowchart LR
    A --> B
    classDef red fill:#f00`);

    const rendered = renderFlowchart(ast);
    expect(rendered).toContain('classDef red fill:#f00');
  });

  it('should render class assignments', () => {
    const ast = parseFlowchart(`flowchart LR
    A --> B
    classDef red fill:#f00
    class A red`);

    const rendered = renderFlowchart(ast);
    expect(rendered).toContain('class A red');
  });

  it('should render click handlers', () => {
    const ast = parseFlowchart(`flowchart LR
    A --> B
    click A href "https://example.com"`);

    const rendered = renderFlowchart(ast);
    expect(rendered).toContain('click A href "https://example.com"');
  });

  it('should render linkStyle', () => {
    const ast = parseFlowchart(`flowchart LR
    A --> B
    linkStyle 0 stroke:#ff0`);

    const rendered = renderFlowchart(ast);
    expect(rendered).toContain('linkStyle 0 stroke:#ff0');
  });

  it('should render subgraph direction', () => {
    const ast = parseFlowchart(`flowchart LR
    subgraph sub1
        direction TB
        A --> B
    end`);

    const rendered = renderFlowchart(ast);
    expect(rendered).toContain('direction TB');
  });
});
