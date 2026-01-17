/**
 * Kanban Parser Tests
 */

import { describe, expect, it } from 'bun:test';
import { isKanbanDiagram, parseKanban } from '../../src/parser/kanban-parser.js';
import { KanbanNodeType } from '../../src/types/kanban.js';

describe('Kanban Parser', () => {
  describe('isKanbanDiagram', () => {
    it('should detect kanban diagrams', () => {
      expect(isKanbanDiagram('kanban')).toBe(true);
      expect(isKanbanDiagram('kanban\n  node1')).toBe(true);
      expect(isKanbanDiagram('KANBAN')).toBe(true);
      expect(isKanbanDiagram('  kanban  ')).toBe(true);
    });

    it('should reject non-kanban diagrams', () => {
      expect(isKanbanDiagram('flowchart LR')).toBe(false);
      expect(isKanbanDiagram('sequenceDiagram')).toBe(false);
      expect(isKanbanDiagram('not kanban')).toBe(false);
    });
  });

  describe('Basic Parsing', () => {
    it('should parse minimal kanban with single root node', () => {
      const ast = parseKanban(`kanban
  root`);
      expect(ast.type).toBe('kanban');
      expect(ast.nodes).toHaveLength(1);
      expect(ast.nodes[0].id).toBe('root');
    });

    it('should parse single node with ID only', () => {
      const ast = parseKanban(`kanban
  node1`);
      expect(ast.nodes).toHaveLength(1);
      expect(ast.nodes[0].id).toBe('node1');
      expect(ast.nodes[0].descr).toBe('node1');
      expect(ast.nodes[0].indent).toBe(0);
    });

    it('should parse node with square brackets', () => {
      const ast = parseKanban(`kanban
  node1[Task Description]`);
      expect(ast.nodes).toHaveLength(1);
      expect(ast.nodes[0].id).toBe('node1');
      expect(ast.nodes[0].descr).toBe('Task Description');
      expect(ast.nodes[0].type).toBe(KanbanNodeType.SQUARE);
    });

    it('should parse node with round brackets', () => {
      const ast = parseKanban(`kanban
  node1(Task Description)`);
      expect(ast.nodes[0].type).toBe(KanbanNodeType.ROUND);
    });

    it('should parse node with stadium shape', () => {
      const ast = parseKanban(`kanban
  node1((Task Description))`);
      expect(ast.nodes[0].type).toBe(KanbanNodeType.STADIUM);
    });

    it('should parse node with diamond shape', () => {
      const ast = parseKanban(`kanban
  node1{{Task Description}}`);
      expect(ast.nodes[0].type).toBe(KanbanNodeType.DIAMOND);
    });
  });

  describe('Hierarchical Parsing', () => {
    it('should parse nested nodes', () => {
      const ast = parseKanban(`kanban
  parent
    child1
    child2`);
      expect(ast.nodes).toHaveLength(1);
      expect(ast.nodes[0].id).toBe('parent');
      expect(ast.nodes[0].children).toHaveLength(2);
      expect(ast.nodes[0].children[0].id).toBe('child1');
      expect(ast.nodes[0].children[1].id).toBe('child2');
    });

    it('should parse multiple indent levels', () => {
      const ast = parseKanban(`kanban
  root
    level1
      level2
        level3`);
      expect(ast.nodes[0].id).toBe('root');
      expect(ast.nodes[0].indent).toBe(0);
      expect(ast.nodes[0].children[0].indent).toBe(1);
      expect(ast.nodes[0].children[0].children[0].indent).toBe(2);
      expect(ast.nodes[0].children[0].children[0].children[0].indent).toBe(3);
    });

    it('should parse multiple root nodes', () => {
      const ast = parseKanban(`kanban
  root1
    child1
  root2
    child2`);
      expect(ast.nodes).toHaveLength(2);
      expect(ast.nodes[0].id).toBe('root1');
      expect(ast.nodes[1].id).toBe('root2');
    });
  });

  describe('Decorations', () => {
    it('should parse node with icon', () => {
      const ast = parseKanban(`kanban
  node1
  ::icon(fas fa-check)`);
      expect(ast.nodes[0].icon).toBe('fas fa-check');
    });

    it('should parse node with class', () => {
      const ast = parseKanban(`kanban
  node1
  :::className`);
      expect(ast.nodes[0].class).toBe('className');
    });

    it('should parse node with both icon and class', () => {
      const ast = parseKanban(`kanban
  node1
  ::icon(fas fa-star)
  :::highlight`);
      expect(ast.nodes[0].icon).toBe('fas fa-star');
      expect(ast.nodes[0].class).toBe('highlight');
    });
  });

  describe('Shape Data', () => {
    it('should parse node with shape data', () => {
      const ast = parseKanban(`kanban
  node1@{data:value}`);
      expect(ast.nodes[0].shapeData).toBe('data:value');
    });

    it('should parse node with quoted shape data', () => {
      const ast = parseKanban(`kanban
  node1@{"complex data"}`);
      expect(ast.nodes[0].shapeData).toContain('complex data');
    });
  });

  describe('Complex Scenarios', () => {
    it('should parse complete kanban board', () => {
      const ast = parseKanban(`kanban
  Todo
    task1[Write tests]
    task2[Fix bugs]
  InProgress
    task3[Review PR]
    ::icon(fas fa-code-review)
  Done
    task4[Deploy]
    :::complete`);

      expect(ast.nodes).toHaveLength(3);
      expect(ast.nodes[0].id).toBe('Todo');
      expect(ast.nodes[0].children).toHaveLength(2);
      expect(ast.nodes[1].children[0].icon).toBe('fas fa-code-review');
      expect(ast.nodes[2].children[0].class).toBe('complete');
    });
  });
});
