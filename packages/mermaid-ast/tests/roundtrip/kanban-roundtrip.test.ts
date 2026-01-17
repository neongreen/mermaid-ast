import { describe, expect, test } from 'bun:test';
import { parseKanban } from '../../src/parser/kanban-parser.js';
import { renderKanban } from '../../src/renderer/kanban-renderer.js';

/**
 * Test round-trip: parse -> render -> parse should produce equivalent AST
 */
function testRoundTrip(input: string, description: string) {
  test(description, () => {
    const ast1 = parseKanban(input);
    const rendered = renderKanban(ast1);
    const ast2 = parseKanban(rendered);

    // Compare key properties
    expect(ast2.type).toBe(ast1.type);
    expect(ast2.nodes.length).toBe(ast1.nodes.length);

    // Deep compare nodes recursively
    function compareNodes(nodes1: typeof ast1.nodes, nodes2: typeof ast2.nodes) {
      expect(nodes2.length).toBe(nodes1.length);

      for (let i = 0; i < nodes1.length; i++) {
        const node1 = nodes1[i];
        const node2 = nodes2[i];

        expect(node2.id).toBe(node1.id);
        expect(node2.descr).toBe(node1.descr);
        expect(node2.type).toBe(node1.type);
        expect(node2.indent).toBe(node1.indent);
        expect(node2.icon).toBe(node1.icon);
        expect(node2.class).toBe(node1.class);
        expect(node2.shapeData).toBe(node1.shapeData);

        // Compare children recursively
        compareNodes(node1.children, node2.children);
      }
    }

    compareNodes(ast1.nodes, ast2.nodes);
  });
}

describe('Kanban Round-Trip Tests', () => {
  testRoundTrip(
    `kanban
  task1`,
    'single node'
  );

  testRoundTrip(
    `kanban
  task1[Description]`,
    'node with description'
  );

  testRoundTrip(
    `kanban
  parent
    child1
    child2`,
    'nested nodes'
  );

  testRoundTrip(
    `kanban
  task1
  ::icon(fas fa-check)`,
    'node with icon'
  );

  testRoundTrip(
    `kanban
  task1
  :::highlight`,
    'node with class'
  );

  testRoundTrip(
    `kanban
  task1
  ::icon(fas fa-star)
  :::important`,
    'node with icon and class'
  );

  testRoundTrip(
    `kanban
  n1(Round)
  n2[Square]
  n3{{Diamond}}
  n4((Stadium))`,
    'nodes with different shapes'
  );

  testRoundTrip(
    `kanban
  backlog
    feat1[New Feature]
    ::icon(fas fa-lightbulb)
    bug1[Bug Fix]
    :::urgent
  inprogress
    task1(Implementing)
  done
    task2((Completed))
    :::complete`,
    'complex kanban board'
  );

  testRoundTrip(
    `kanban
  root
    level1
      level2
        level3`,
    'deep nesting'
  );

  testRoundTrip(
    `kanban
  node1@{data:value}`,
    'node with shape data'
  );
});
