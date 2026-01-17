/**
 * Cross-runtime tests for mermaid-ast
 *
 * These tests verify that the library works identically across:
 * - Bun
 * - Node.js
 * - Deno
 */

// Import the library
import { parseFlowchart, parseSequence, renderFlowchart, renderSequence } from '../../src/index.ts';
import {
  assertDefined,
  assertEqual,
  assertTrue,
  runAllSuites,
  type TestSuite,
} from './test-runner.ts';

// ============================================================================
// Flowchart Tests
// ============================================================================

const flowchartParsingTests: TestSuite = {
  name: 'Flowchart Parsing',
  tests: [
    {
      name: 'should parse a simple flowchart',
      fn: () => {
        const input = `flowchart LR
    A --> B`;
        const ast = parseFlowchart(input);

        assertEqual(ast.direction, 'LR');
        assertEqual(ast.nodes.size, 2);
        assertEqual(ast.links.length, 1);
        assertTrue(ast.nodes.has('A'));
        assertTrue(ast.nodes.has('B'));
      },
    },
    {
      name: 'should parse node shapes',
      fn: () => {
        const input = `flowchart TD
    A[Rectangle]
    B(Rounded)
    C{Diamond}`;
        const ast = parseFlowchart(input);

        assertEqual(ast.nodes.size, 3);
        // A[text] is a square shape in mermaid
        assertEqual(ast.nodes.get('A')?.shape, 'square');
        assertEqual(ast.nodes.get('B')?.shape, 'round');
        assertEqual(ast.nodes.get('C')?.shape, 'diamond');
      },
    },
    {
      name: 'should parse link types',
      fn: () => {
        const input = `flowchart LR
    A --> B
    B -.-> C
    C ==> D`;
        const ast = parseFlowchart(input);

        assertEqual(ast.links.length, 3);
        assertEqual(ast.links[0].stroke, 'normal');
        assertEqual(ast.links[1].stroke, 'dotted');
        assertEqual(ast.links[2].stroke, 'thick');
      },
    },
    {
      name: 'should parse subgraphs',
      fn: () => {
        const input = `flowchart TB
    subgraph sub1[Subgraph Title]
        A --> B
    end`;
        const ast = parseFlowchart(input);

        assertEqual(ast.subgraphs.length, 1);
        assertEqual(ast.subgraphs[0].id, 'sub1');
        // title is an object with text property
        assertEqual(ast.subgraphs[0].title?.text, 'Subgraph Title');
      },
    },
  ],
};

const flowchartRenderingTests: TestSuite = {
  name: 'Flowchart Rendering',
  tests: [
    {
      name: 'should render a simple flowchart',
      fn: () => {
        const ast = parseFlowchart(`flowchart LR
    A --> B`);
        const rendered = renderFlowchart(ast);

        assertTrue(rendered.includes('flowchart LR'));
        assertTrue(rendered.includes('A'));
        assertTrue(rendered.includes('B'));
        assertTrue(rendered.includes('-->'));
      },
    },
    {
      name: 'should render node labels',
      fn: () => {
        const ast = parseFlowchart(`flowchart TD
    A[Hello World]`);
        const rendered = renderFlowchart(ast);

        assertTrue(rendered.includes('[Hello World]'));
      },
    },
  ],
};

const flowchartRoundtripTests: TestSuite = {
  name: 'Flowchart Round-trip',
  tests: [
    {
      name: 'should round-trip a simple flowchart',
      fn: () => {
        const original = `flowchart LR
    A --> B`;
        const ast1 = parseFlowchart(original);
        const rendered = renderFlowchart(ast1);
        const ast2 = parseFlowchart(rendered);

        assertEqual(ast1.direction, ast2.direction);
        assertEqual(ast1.nodes.size, ast2.nodes.size);
        assertEqual(ast1.links.length, ast2.links.length);
      },
    },
    {
      name: 'should be idempotent',
      fn: () => {
        const original = `flowchart TD
    A[Start] --> B{Decision}
    B -->|Yes| C[End]
    B -->|No| A`;

        const ast1 = parseFlowchart(original);
        const render1 = renderFlowchart(ast1);
        const ast2 = parseFlowchart(render1);
        const render2 = renderFlowchart(ast2);

        assertEqual(render1, render2);
      },
    },
  ],
};

// ============================================================================
// Sequence Diagram Tests
// ============================================================================

const sequenceParsingTests: TestSuite = {
  name: 'Sequence Diagram Parsing',
  tests: [
    {
      name: 'should parse a simple sequence diagram',
      fn: () => {
        const input = `sequenceDiagram
    Alice->>Bob: Hello`;
        const ast = parseSequence(input);

        // actors is a Map
        assertTrue(ast.actors.size >= 2);
        // statements contains the messages
        assertTrue(ast.statements.length >= 1);
      },
    },
    {
      name: 'should parse participant declarations',
      fn: () => {
        const input = `sequenceDiagram
    participant A as Alice
    participant B as Bob
    A->>B: Hello`;
        const ast = parseSequence(input);

        // actors is a Map, use .get()
        const alice = ast.actors.get('A');
        assertDefined(alice);
        // alias contains the display name for "participant A as Alice"
        assertEqual(alice.alias, 'Alice');
      },
    },
  ],
};

const sequenceRenderingTests: TestSuite = {
  name: 'Sequence Diagram Rendering',
  tests: [
    {
      name: 'should render a simple sequence diagram',
      fn: () => {
        const ast = parseSequence(`sequenceDiagram
    Alice->>Bob: Hello`);
        const rendered = renderSequence(ast);

        assertTrue(rendered.includes('sequenceDiagram'));
        assertTrue(rendered.includes('Alice'));
        assertTrue(rendered.includes('Bob'));
      },
    },
  ],
};

const sequenceRoundtripTests: TestSuite = {
  name: 'Sequence Diagram Round-trip',
  tests: [
    {
      name: 'should round-trip a simple sequence diagram',
      fn: () => {
        const original = `sequenceDiagram
    Alice->>Bob: Hello
    Bob-->>Alice: Hi`;

        const ast1 = parseSequence(original);
        const rendered = renderSequence(ast1);
        const ast2 = parseSequence(rendered);

        assertEqual(ast1.actors.size, ast2.actors.size);
        assertEqual(ast1.statements.length, ast2.statements.length);
      },
    },
  ],
};

// ============================================================================
// Run all tests
// ============================================================================

const allSuites: TestSuite[] = [
  flowchartParsingTests,
  flowchartRenderingTests,
  flowchartRoundtripTests,
  sequenceParsingTests,
  sequenceRenderingTests,
  sequenceRoundtripTests,
];

// Auto-run when executed directly
runAllSuites(allSuites);
