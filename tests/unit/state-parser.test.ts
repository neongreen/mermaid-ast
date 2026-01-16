import { describe, expect, test } from 'bun:test';
import { isStateDiagram, parseStateDiagram } from '../../src/parser/state-parser.js';
import { renderStateDiagram } from '../../src/renderer/state-renderer.js';

describe('State Diagram Parser', () => {
  describe('isStateDiagram', () => {
    test('detects stateDiagram', () => {
      expect(isStateDiagram('stateDiagram\n  s1 --> s2')).toBe(true);
    });

    test('detects stateDiagram-v2', () => {
      expect(isStateDiagram('stateDiagram-v2\n  s1 --> s2')).toBe(true);
    });

    test('rejects non-state diagrams', () => {
      expect(isStateDiagram('flowchart TD\n  A --> B')).toBe(false);
      expect(isStateDiagram('sequenceDiagram\n  Alice->>Bob: Hi')).toBe(false);
      expect(isStateDiagram('classDiagram\n  class Animal')).toBe(false);
    });
  });

  describe('Basic States', () => {
    test('parses simple transition', () => {
      const input = `stateDiagram-v2
    s1 --> s2`;
      const ast = parseStateDiagram(input);
      expect(ast.type).toBe('state');
      expect(ast.states.has('s1')).toBe(true);
      expect(ast.states.has('s2')).toBe(true);
      expect(ast.transitions.length).toBe(1);
    });

    test('parses state with description', () => {
      const input = `stateDiagram-v2
    state "This is state 1" as s1`;
      const ast = parseStateDiagram(input);
      const s1 = ast.states.get('s1');
      expect(s1?.description).toBe('This is state 1');
    });

    test('parses multiple transitions', () => {
      const input = `stateDiagram-v2
    s1 --> s2
    s2 --> s3
    s3 --> s1`;
      const ast = parseStateDiagram(input);
      expect(ast.transitions.length).toBe(3);
    });

    test('parses transition with label', () => {
      const input = `stateDiagram-v2
    s1 --> s2 : transition label`;
      const ast = parseStateDiagram(input);
      expect(ast.transitions[0].description).toBe('transition label');
    });
  });

  describe('Start and End States', () => {
    test('parses start state', () => {
      const input = `stateDiagram-v2
    [*] --> s1`;
      const ast = parseStateDiagram(input);
      expect(ast.states.has('[*]')).toBe(true);
      expect(ast.transitions[0].state1.id).toBe('[*]');
    });

    test('parses end state', () => {
      const input = `stateDiagram-v2
    s1 --> [*]`;
      const ast = parseStateDiagram(input);
      expect(ast.transitions[0].state2.id).toBe('[*]');
    });

    test('parses complete flow with start and end', () => {
      const input = `stateDiagram-v2
    [*] --> s1
    s1 --> s2
    s2 --> [*]`;
      const ast = parseStateDiagram(input);
      expect(ast.transitions.length).toBe(3);
    });
  });

  describe('Special State Types', () => {
    test('parses fork state', () => {
      const input = `stateDiagram-v2
    state fork_state <<fork>>
    [*] --> fork_state`;
      const ast = parseStateDiagram(input);
      const forkState = ast.states.get('fork_state');
      expect(forkState?.type).toBe('fork');
    });

    test('parses join state', () => {
      const input = `stateDiagram-v2
    state join_state <<join>>
    join_state --> [*]`;
      const ast = parseStateDiagram(input);
      const joinState = ast.states.get('join_state');
      expect(joinState?.type).toBe('join');
    });

    test('parses choice state', () => {
      const input = `stateDiagram-v2
    state choice_state <<choice>>
    s1 --> choice_state`;
      const ast = parseStateDiagram(input);
      const choiceState = ast.states.get('choice_state');
      expect(choiceState?.type).toBe('choice');
    });

    test('parses fork and join together', () => {
      const input = `stateDiagram-v2
    state fork_state <<fork>>
    state join_state <<join>>
    [*] --> fork_state
    fork_state --> s1
    fork_state --> s2
    s1 --> join_state
    s2 --> join_state
    join_state --> [*]`;
      const ast = parseStateDiagram(input);
      expect(ast.states.get('fork_state')?.type).toBe('fork');
      expect(ast.states.get('join_state')?.type).toBe('join');
      expect(ast.transitions.length).toBe(6);
    });
  });

  describe('Direction', () => {
    test('parses LR direction', () => {
      const input = `stateDiagram-v2
    direction LR
    s1 --> s2`;
      const ast = parseStateDiagram(input);
      expect(ast.direction).toBe('LR');
    });

    test('parses RL direction', () => {
      const input = `stateDiagram-v2
    direction RL
    s1 --> s2`;
      const ast = parseStateDiagram(input);
      expect(ast.direction).toBe('RL');
    });

    test('parses TB direction', () => {
      const input = `stateDiagram-v2
    direction TB
    s1 --> s2`;
      const ast = parseStateDiagram(input);
      expect(ast.direction).toBe('TB');
    });

    test('parses BT direction', () => {
      const input = `stateDiagram-v2
    direction BT
    s1 --> s2`;
      const ast = parseStateDiagram(input);
      expect(ast.direction).toBe('BT');
    });

    test('defaults to TB direction', () => {
      const input = `stateDiagram-v2
    s1 --> s2`;
      const ast = parseStateDiagram(input);
      expect(ast.direction).toBe('TB');
    });
  });

  describe('Styling', () => {
    test('parses classDef', () => {
      const input = `stateDiagram-v2
    classDef highlight fill:#f9f,stroke:#333
    s1 --> s2`;
      const ast = parseStateDiagram(input);
      expect(ast.classDefs.has('highlight')).toBe(true);
      expect(ast.classDefs.get('highlight')?.classes).toBe('fill:#f9f,stroke:#333');
    });

    test('parses class application', () => {
      const input = `stateDiagram-v2
    s1 --> s2
    class s1 highlight`;
      const ast = parseStateDiagram(input);
      expect(ast.classApplications.length).toBe(1);
      expect(ast.classApplications[0].id).toBe('s1');
      expect(ast.classApplications[0].styleClass).toBe('highlight');
    });

    test('parses style definition', () => {
      const input = `stateDiagram-v2
    s1 --> s2
    style s1 fill:#f9f`;
      const ast = parseStateDiagram(input);
      expect(ast.styles.length).toBe(1);
      expect(ast.styles[0].id).toBe('s1');
      expect(ast.styles[0].styleClass).toBe('fill:#f9f');
    });
  });

  describe('Notes', () => {
    test('parses note right of state', () => {
      const input = `stateDiagram-v2
    s1 --> s2
    note right of s1 : This is a note`;
      const ast = parseStateDiagram(input);
      const s1 = ast.states.get('s1');
      expect(s1?.note?.position).toBe('right of');
      expect(s1?.note?.text).toBe('This is a note');
    });

    test('parses note left of state', () => {
      const input = `stateDiagram-v2
    s1 --> s2
    note left of s1 : Left note`;
      const ast = parseStateDiagram(input);
      const s1 = ast.states.get('s1');
      expect(s1?.note?.position).toBe('left of');
      expect(s1?.note?.text).toBe('Left note');
    });
  });

  describe('Click Handlers', () => {
    test('parses click with href', () => {
      const input = `stateDiagram-v2
    s1 --> s2
    click s1 href "https://example.com"`;
      const ast = parseStateDiagram(input);
      expect(ast.clicks.length).toBe(1);
      expect(ast.clicks[0].id).toBe('s1');
      expect(ast.clicks[0].url).toBe('https://example.com');
    });

    // Note: The state diagram parser doesn't support tooltip in click syntax
    // like flowchart does. This is a mermaid.js limitation.
  });

  describe('Complex Diagrams', () => {
    test('parses complete state diagram', () => {
      const input = `stateDiagram-v2
    direction LR
    [*] --> Still
    Still --> [*]
    Still --> Moving
    Moving --> Still
    Moving --> Crash
    Crash --> [*]`;
      const ast = parseStateDiagram(input);

      expect(ast.direction).toBe('LR');
      expect(ast.states.has('Still')).toBe(true);
      expect(ast.states.has('Moving')).toBe(true);
      expect(ast.states.has('Crash')).toBe(true);
      expect(ast.transitions.length).toBe(6);
    });

    test('parses state diagram with all features', () => {
      const input = `stateDiagram-v2
    direction LR
    classDef important fill:#f9f
    state "Idle State" as Idle
    state fork_state <<fork>>
    state join_state <<join>>
    
    [*] --> Idle
    Idle --> fork_state
    fork_state --> State1
    fork_state --> State2
    State1 --> join_state
    State2 --> join_state
    join_state --> Idle
    Idle --> [*]
    
    class Idle important`;
      const ast = parseStateDiagram(input);

      expect(ast.direction).toBe('LR');
      expect(ast.classDefs.has('important')).toBe(true);
      expect(ast.states.get('Idle')?.description).toBe('Idle State');
      expect(ast.states.get('fork_state')?.type).toBe('fork');
      expect(ast.states.get('join_state')?.type).toBe('join');
      expect(ast.classApplications.length).toBe(1);
    });
  });
});

describe('State Diagram Rendering', () => {
  test('renders simple state diagram', () => {
    const input = `stateDiagram-v2
    s1 --> s2`;
    const ast = parseStateDiagram(input);
    const output = renderStateDiagram(ast);

    expect(output).toContain('stateDiagram-v2');
    expect(output).toContain('s1 --> s2');
  });

  test('renders state with description', () => {
    const input = `stateDiagram-v2
    state "My State" as s1
    s1 --> s2`;
    const ast = parseStateDiagram(input);
    const output = renderStateDiagram(ast);

    expect(output).toContain('state "My State" as s1');
  });

  test('renders direction', () => {
    const input = `stateDiagram-v2
    direction LR
    s1 --> s2`;
    const ast = parseStateDiagram(input);
    const output = renderStateDiagram(ast);

    expect(output).toContain('direction LR');
  });

  test('renders special state types', () => {
    const input = `stateDiagram-v2
    state fork_state <<fork>>
    state join_state <<join>>
    fork_state --> s1
    s1 --> join_state`;
    const ast = parseStateDiagram(input);
    const output = renderStateDiagram(ast);

    expect(output).toContain('state fork_state <<fork>>');
    expect(output).toContain('state join_state <<join>>');
  });

  test('renders transition labels', () => {
    const input = `stateDiagram-v2
    s1 --> s2 : do something`;
    const ast = parseStateDiagram(input);
    const output = renderStateDiagram(ast);

    expect(output).toContain('s1 --> s2 : do something');
  });
});

describe('State Diagram Round-trip', () => {
  test('round-trips simple state diagram', () => {
    const input = `stateDiagram-v2
    [*] --> s1
    s1 --> s2
    s2 --> [*]`;
    const ast = parseStateDiagram(input);
    const output = renderStateDiagram(ast);
    const ast2 = parseStateDiagram(output);

    expect(ast2.transitions.length).toBe(ast.transitions.length);
    expect(ast2.states.size).toBe(ast.states.size);
  });

  test('round-trips state diagram with direction', () => {
    const input = `stateDiagram-v2
    direction LR
    s1 --> s2`;
    const ast = parseStateDiagram(input);
    const output = renderStateDiagram(ast);
    const ast2 = parseStateDiagram(output);

    expect(ast2.direction).toBe(ast.direction);
  });

  test('round-trips state diagram with special states', () => {
    const input = `stateDiagram-v2
    state fork_state <<fork>>
    state join_state <<join>>
    [*] --> fork_state
    fork_state --> s1
    fork_state --> s2
    s1 --> join_state
    s2 --> join_state
    join_state --> [*]`;
    const ast = parseStateDiagram(input);
    const output = renderStateDiagram(ast);
    const ast2 = parseStateDiagram(output);

    expect(ast2.states.get('fork_state')?.type).toBe('fork');
    expect(ast2.states.get('join_state')?.type).toBe('join');
    expect(ast2.transitions.length).toBe(ast.transitions.length);
  });

  test('round-trips state diagram with styling', () => {
    const input = `stateDiagram-v2
    classDef important fill:#f9f
    s1 --> s2
    class s1 important`;
    const ast = parseStateDiagram(input);
    const output = renderStateDiagram(ast);
    const ast2 = parseStateDiagram(output);

    expect(ast2.classDefs.has('important')).toBe(true);
    expect(ast2.classApplications.length).toBe(ast.classApplications.length);
  });
});
