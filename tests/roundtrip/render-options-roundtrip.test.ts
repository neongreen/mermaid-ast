/**
 * Round-trip tests with different RenderOptions
 *
 * These tests verify that parse(render(ast, options)) produces equivalent ASTs
 * regardless of the formatting options used. This ensures that all render options
 * produce valid, parseable output.
 *
 * Test matrix:
 * - All diagram types (flowchart, sequence, class, state)
 * - Various indent options (2 spaces, 4 spaces, tabs, 8 spaces)
 * - Diagram-specific options (sortNodes, inlineClasses, compactLinks)
 * - Combinations of options
 */

import { describe, expect, it } from 'bun:test';
import { parseClassDiagram } from '../../src/parser/class-parser.js';
import { parseFlowchart } from '../../src/parser/flowchart-parser.js';
import { parseSequence } from '../../src/parser/sequence-parser.js';
import { parseStateDiagram } from '../../src/parser/state-parser.js';
import { renderClassDiagram } from '../../src/renderer/class-renderer.js';
import { renderFlowchart } from '../../src/renderer/flowchart-renderer.js';
import { renderSequence } from '../../src/renderer/sequence-renderer.js';
import { renderStateDiagram } from '../../src/renderer/state-renderer.js';
import type { ClassDiagramAST } from '../../src/types/class.js';
import type { FlowchartAST } from '../../src/types/flowchart.js';
import type { RenderOptions } from '../../src/types/render-options.js';
import type { SequenceAST } from '../../src/types/sequence.js';
import type { StateDiagramAST } from '../../src/types/state.js';

// Test fixtures for each diagram type
const FLOWCHART_FIXTURES = [
  {
    name: 'simple',
    input: `flowchart LR
    A --> B
    B --> C`,
  },
  {
    name: 'with shapes',
    input: `flowchart TD
    A[Rectangle] --> B(Rounded)
    B --> C{Diamond}
    C -->|Yes| D([Stadium])
    C -->|No| E[(Database)]`,
  },
  {
    name: 'with subgraph',
    input: `flowchart TB
    subgraph sub1[Subgraph One]
        A --> B
        B --> C
    end
    subgraph sub2[Subgraph Two]
        D --> E
    end
    C --> D`,
  },
  {
    name: 'with styling',
    input: `flowchart LR
    classDef important fill:#f9f,stroke:#333
    A --> B
    B --> C
    class A important`,
  },
  {
    name: 'with link styles',
    input: `flowchart LR
    A --> B
    B --> C
    C --> D
    linkStyle 0 stroke:#ff0000`,
  },
  {
    name: 'complex',
    input: `flowchart TD
    A[Start] --> B{Is it?}
    B -->|Yes| C[OK]
    B -->|No| D[End]
    C --> E{Another?}
    E -->|Yes| B
    E -->|No| D`,
  },
];

const SEQUENCE_FIXTURES = [
  {
    name: 'simple',
    input: `sequenceDiagram
    Alice->>Bob: Hello
    Bob-->>Alice: Hi`,
  },
  {
    name: 'with participants',
    input: `sequenceDiagram
    participant A as Alice
    participant B as Bob
    participant C as Charlie
    A->>B: Hello Bob
    B->>C: Hello Charlie
    C-->>A: Hi Alice`,
  },
  {
    name: 'with loop',
    input: `sequenceDiagram
    Alice->>Bob: Hello
    loop Every minute
        Bob->>Alice: Ping
        Alice-->>Bob: Pong
    end`,
  },
  {
    name: 'with alt',
    input: `sequenceDiagram
    Alice->>Bob: Hello
    alt is sick
        Bob->>Alice: Not so good
    else is well
        Bob->>Alice: Great!
    end`,
  },
  {
    name: 'with notes',
    input: `sequenceDiagram
    Alice->>Bob: Hello
    Note right of Bob: Bob thinks
    Bob-->>Alice: Hi`,
  },
  {
    name: 'complex',
    input: `sequenceDiagram
    participant A as Alice
    participant B as Bob
    A->>B: Hello
    activate B
    B->>B: Think
    Note right of B: Internal process
    B-->>A: Response
    deactivate B
    loop Retry
        A->>B: Retry message
    end`,
  },
];

const CLASS_FIXTURES = [
  {
    name: 'simple',
    input: `classDiagram
    class Animal`,
  },
  {
    name: 'with members',
    input: `classDiagram
    class Animal {
        +String name
        +int age
        +eat()
        +sleep()
    }`,
  },
  {
    name: 'with relationships',
    input: `classDiagram
    Animal <|-- Duck
    Animal <|-- Fish
    Duck : +swim()
    Fish : +swim()`,
  },
  {
    name: 'with annotations',
    input: `classDiagram
    class Shape
    <<interface>> Shape
    class Circle
    Circle : +radius
    Shape <|-- Circle`,
  },
  {
    name: 'with namespace',
    input: `classDiagram
    namespace Animals {
        class Duck
        class Fish
    }
    Duck : +swim()
    Fish : +swim()`,
  },
  {
    name: 'complex',
    input: `classDiagram
    direction LR
    class Animal {
        +String name
        +int age
        +eat()
        +sleep()
    }
    class Duck {
        +String beakColor
        +swim()
        +quack()
    }
    Animal <|-- Duck
    note for Duck "Can fly and swim"`,
  },
];

const STATE_FIXTURES = [
  {
    name: 'simple',
    input: `stateDiagram-v2
    s1 --> s2`,
  },
  {
    name: 'with start and end',
    input: `stateDiagram-v2
    [*] --> s1
    s1 --> s2
    s2 --> [*]`,
  },
  {
    name: 'with descriptions',
    input: `stateDiagram-v2
    state "Idle State" as Idle
    state "Running State" as Running
    [*] --> Idle
    Idle --> Running
    Running --> Idle`,
  },
  {
    name: 'with fork and join',
    input: `stateDiagram-v2
    state fork_state <<fork>>
    state join_state <<join>>
    [*] --> fork_state
    fork_state --> State1
    fork_state --> State2
    State1 --> join_state
    State2 --> join_state
    join_state --> [*]`,
  },
  {
    name: 'with direction',
    input: `stateDiagram-v2
    direction LR
    s1 --> s2
    s2 --> s3`,
  },
  {
    name: 'complex',
    input: `stateDiagram-v2
    direction LR
    [*] --> Still
    Still --> [*]
    Still --> Moving
    Moving --> Still
    Moving --> Crash
    Crash --> [*]`,
  },
];

// Render options to test (using numeric indent values)
const INDENT_OPTIONS: RenderOptions[] = [
  { indent: 2 }, // 2 spaces
  { indent: 4 }, // 4 spaces (default)
  { indent: 'tab' }, // tabs
  { indent: 8 }, // 8 spaces
];

const FLOWCHART_OPTIONS: RenderOptions[] = [
  {},
  { sortNodes: true },
  { sortNodes: false },
  { inlineClasses: true },
  { inlineClasses: false },
  { compactLinks: true },
  { compactLinks: false },
  { sortNodes: true, inlineClasses: true },
  { sortNodes: true, compactLinks: true },
  { inlineClasses: true, compactLinks: true },
  { sortNodes: true, inlineClasses: true, compactLinks: true },
];

// Helper functions for comparing ASTs
function assertEquivalentFlowcharts(ast1: FlowchartAST, ast2: FlowchartAST, context: string): void {
  expect(ast2.direction, `${context}: direction`).toBe(ast1.direction);
  expect(ast2.nodes.size, `${context}: nodes count`).toBe(ast1.nodes.size);
  expect(ast2.links.length, `${context}: links count`).toBe(ast1.links.length);

  for (const [id, node1] of ast1.nodes) {
    const node2 = ast2.nodes.get(id);
    expect(node2, `${context}: node ${id} exists`).toBeDefined();
    expect(node2?.shape, `${context}: node ${id} shape`).toBe(node1.shape);
  }
}

function assertEquivalentSequences(ast1: SequenceAST, ast2: SequenceAST, context: string): void {
  expect(ast2.actors.size, `${context}: actors count`).toBe(ast1.actors.size);
  expect(ast2.statements.length, `${context}: statements count`).toBe(ast1.statements.length);

  for (const [id, actor1] of ast1.actors) {
    const actor2 = ast2.actors.get(id);
    expect(actor2, `${context}: actor ${id} exists`).toBeDefined();
    expect(actor2?.alias, `${context}: actor ${id} alias`).toBe(actor1.alias);
  }
}

function assertEquivalentClasses(
  ast1: ClassDiagramAST,
  ast2: ClassDiagramAST,
  context: string
): void {
  expect(ast2.classes.size, `${context}: classes count`).toBe(ast1.classes.size);
  expect(ast2.relations.length, `${context}: relations count`).toBe(ast1.relations.length);

  for (const [id, cls1] of ast1.classes) {
    const cls2 = ast2.classes.get(id);
    expect(cls2, `${context}: class ${id} exists`).toBeDefined();
    expect(cls2?.members.length, `${context}: class ${id} members`).toBe(cls1.members.length);
  }
}

function assertEquivalentStates(
  ast1: StateDiagramAST,
  ast2: StateDiagramAST,
  context: string
): void {
  expect(ast2.direction, `${context}: direction`).toBe(ast1.direction);
  expect(ast2.states.size, `${context}: states count`).toBe(ast1.states.size);
  expect(ast2.transitions.length, `${context}: transitions count`).toBe(ast1.transitions.length);

  for (const [id, state1] of ast1.states) {
    const state2 = ast2.states.get(id);
    expect(state2, `${context}: state ${id} exists`).toBeDefined();
    expect(state2?.type, `${context}: state ${id} type`).toBe(state1.type);
  }
}

describe('Flowchart Round-trip with RenderOptions', () => {
  describe('Indent options', () => {
    for (const fixture of FLOWCHART_FIXTURES) {
      for (const options of INDENT_OPTIONS) {
        const optionDesc = JSON.stringify(options);
        it(`${fixture.name} with ${optionDesc}`, () => {
          const ast1 = parseFlowchart(fixture.input);
          const rendered = renderFlowchart(ast1, options);
          const ast2 = parseFlowchart(rendered);
          assertEquivalentFlowcharts(ast1, ast2, `${fixture.name} ${optionDesc}`);
        });
      }
    }
  });

  describe('Flowchart-specific options', () => {
    for (const fixture of FLOWCHART_FIXTURES) {
      for (const options of FLOWCHART_OPTIONS) {
        const optionDesc = JSON.stringify(options);
        it(`${fixture.name} with ${optionDesc}`, () => {
          const ast1 = parseFlowchart(fixture.input);
          const rendered = renderFlowchart(ast1, options);
          const ast2 = parseFlowchart(rendered);
          assertEquivalentFlowcharts(ast1, ast2, `${fixture.name} ${optionDesc}`);
        });
      }
    }
  });

  describe('Combined indent and flowchart options', () => {
    const combinedOptions: RenderOptions[] = [
      { indent: 2, sortNodes: true },
      { indent: 'tab', inlineClasses: true },
      { indent: 2, sortNodes: true, inlineClasses: true, compactLinks: true },
    ];

    for (const fixture of FLOWCHART_FIXTURES) {
      for (const options of combinedOptions) {
        const optionDesc = JSON.stringify(options);
        it(`${fixture.name} with ${optionDesc}`, () => {
          const ast1 = parseFlowchart(fixture.input);
          const rendered = renderFlowchart(ast1, options);
          const ast2 = parseFlowchart(rendered);
          assertEquivalentFlowcharts(ast1, ast2, `${fixture.name} ${optionDesc}`);
        });
      }
    }
  });
});

describe('Sequence Round-trip with RenderOptions', () => {
  describe('Indent options', () => {
    for (const fixture of SEQUENCE_FIXTURES) {
      for (const options of INDENT_OPTIONS) {
        const optionDesc = JSON.stringify(options);
        it(`${fixture.name} with ${optionDesc}`, () => {
          const ast1 = parseSequence(fixture.input);
          const rendered = renderSequence(ast1, options);
          const ast2 = parseSequence(rendered);
          assertEquivalentSequences(ast1, ast2, `${fixture.name} ${optionDesc}`);
        });
      }
    }
  });
});

describe('Class Diagram Round-trip with RenderOptions', () => {
  describe('Indent options', () => {
    for (const fixture of CLASS_FIXTURES) {
      for (const options of INDENT_OPTIONS) {
        const optionDesc = JSON.stringify(options);
        it(`${fixture.name} with ${optionDesc}`, () => {
          const ast1 = parseClassDiagram(fixture.input);
          const rendered = renderClassDiagram(ast1, options);
          const ast2 = parseClassDiagram(rendered);
          assertEquivalentClasses(ast1, ast2, `${fixture.name} ${optionDesc}`);
        });
      }
    }
  });
});

describe('State Diagram Round-trip with RenderOptions', () => {
  describe('Indent options', () => {
    for (const fixture of STATE_FIXTURES) {
      for (const options of INDENT_OPTIONS) {
        const optionDesc = JSON.stringify(options);
        it(`${fixture.name} with ${optionDesc}`, () => {
          const ast1 = parseStateDiagram(fixture.input);
          const rendered = renderStateDiagram(ast1, options);
          const ast2 = parseStateDiagram(rendered);
          assertEquivalentStates(ast1, ast2, `${fixture.name} ${optionDesc}`);
        });
      }
    }
  });
});

describe('Idempotency with different options', () => {
  it('flowchart: multiple round-trips with varying options produce stable output', () => {
    const input = `flowchart TD
    A[Start] --> B{Decision}
    B -->|Yes| C[OK]
    B -->|No| D[Cancel]`;

    // Parse once
    const ast1 = parseFlowchart(input);

    // Render with option set 1, parse, render with option set 2
    const render1 = renderFlowchart(ast1, { indent: 2, sortNodes: true });
    const ast2 = parseFlowchart(render1);
    const render2 = renderFlowchart(ast2, { indent: 'tab', sortNodes: false });
    const ast3 = parseFlowchart(render2);
    const render3 = renderFlowchart(ast3, {
      indent: 4,
      inlineClasses: true,
    });
    const ast4 = parseFlowchart(render3);

    // All ASTs should be equivalent
    assertEquivalentFlowcharts(ast1, ast2, 'ast1 vs ast2');
    assertEquivalentFlowcharts(ast2, ast3, 'ast2 vs ast3');
    assertEquivalentFlowcharts(ast3, ast4, 'ast3 vs ast4');
  });

  it('sequence: multiple round-trips with varying options produce stable output', () => {
    const input = `sequenceDiagram
    participant A as Alice
    participant B as Bob
    A->>B: Hello
    loop Every minute
        B->>A: Ping
    end`;

    const ast1 = parseSequence(input);
    const render1 = renderSequence(ast1, { indent: 2 });
    const ast2 = parseSequence(render1);
    const render2 = renderSequence(ast2, { indent: 'tab' });
    const ast3 = parseSequence(render2);
    const render3 = renderSequence(ast3, { indent: 4 });
    const ast4 = parseSequence(render3);

    assertEquivalentSequences(ast1, ast2, 'ast1 vs ast2');
    assertEquivalentSequences(ast2, ast3, 'ast2 vs ast3');
    assertEquivalentSequences(ast3, ast4, 'ast3 vs ast4');
  });

  it('class: multiple round-trips with varying options produce stable output', () => {
    const input = `classDiagram
    class Animal {
        +String name
        +eat()
    }
    Animal <|-- Duck`;

    const ast1 = parseClassDiagram(input);
    const render1 = renderClassDiagram(ast1, { indent: 2 });
    const ast2 = parseClassDiagram(render1);
    const render2 = renderClassDiagram(ast2, { indent: 'tab' });
    const ast3 = parseClassDiagram(render2);

    assertEquivalentClasses(ast1, ast2, 'ast1 vs ast2');
    assertEquivalentClasses(ast2, ast3, 'ast2 vs ast3');
  });

  it('state: multiple round-trips with varying options produce stable output', () => {
    const input = `stateDiagram-v2
    [*] --> Still
    Still --> Moving
    Moving --> Crash
    Crash --> [*]`;

    const ast1 = parseStateDiagram(input);
    const render1 = renderStateDiagram(ast1, { indent: 2 });
    const ast2 = parseStateDiagram(render1);
    const render2 = renderStateDiagram(ast2, { indent: 'tab' });
    const ast3 = parseStateDiagram(render2);

    assertEquivalentStates(ast1, ast2, 'ast1 vs ast2');
    assertEquivalentStates(ast2, ast3, 'ast2 vs ast3');
  });
});

describe('Edge cases with render options', () => {
  it('handles zero indent', () => {
    const input = `flowchart LR
    A --> B`;
    const ast1 = parseFlowchart(input);
    const rendered = renderFlowchart(ast1, { indent: 0 });
    const ast2 = parseFlowchart(rendered);
    assertEquivalentFlowcharts(ast1, ast2, 'zero indent');
  });

  it('handles very large indent', () => {
    const input = `flowchart LR
    A --> B`;
    const ast1 = parseFlowchart(input);
    const rendered = renderFlowchart(ast1, { indent: 20 }); // 20 spaces
    const ast2 = parseFlowchart(rendered);
    assertEquivalentFlowcharts(ast1, ast2, 'large indent');
  });
});
