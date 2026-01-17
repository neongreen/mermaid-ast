/**
 * Kanban Renderer Tests
 */

import { describe, expect, it } from 'bun:test';
import { parseKanban } from '../../src/parser/kanban-parser.js';
import { renderKanban } from '../../src/renderer/kanban-renderer.js';
import { expectGolden } from '../golden/golden.js';
import { Kanban } from '../../src/kanban.js';
import { KanbanNodeType } from '../../src/types/kanban.js';

describe('Kanban Renderer', () => {
  describe('Basic Rendering', () => {
    it('should render single node', () => {
      const ast = parseKanban(`kanban
  node1`);
      const rendered = renderKanban(ast);
      expect(rendered).toContain('kanban');
      expect(rendered).toContain('node1');
    });

    it('should render node with description', () => {
      const ast = parseKanban(`kanban
  node1[Task Description]`);
      const rendered = renderKanban(ast);
      expect(rendered).toContain('node1[Task Description]');
    });

    it('should render nodes with different shapes', () => {
      const ast = parseKanban(`kanban
  n1(Round)
  n2[Square]
  n3{{Diamond}}
  n4((Stadium))`);
      const rendered = renderKanban(ast);
      expect(rendered).toContain('(Round)');
      expect(rendered).toContain('[Square]');
      expect(rendered).toContain('{{Diamond}}');
      expect(rendered).toContain('((Stadium))');
    });

    it('should round-trip all parseable node shapes', () => {
      // Note: Only 4 shapes are actually parseable by the Kanban JISON grammar.
      // SUBROUTINE and ASYMMETRIC exist in the enum but the lexer doesn't have
      // tokens to produce their delimiter combinations. This is a limitation
      // in mermaid.js's Kanban grammar (dead code in getType()).
      const input = `kanban
    n1(Round)
    n2[Square]
    n3{{Diamond}}
    n4((Stadium))`;

      const ast = parseKanban(input);
      const rendered = renderKanban(ast);
      const reparsed = parseKanban(rendered);
      const rerendered = renderKanban(reparsed);

      // Round-trip should be stable
      expect(rerendered).toBe(rendered);

      // All parseable shapes should be preserved
      expect(rendered).toContain('(Round)');
      expect(rendered).toContain('[Square]');
      expect(rendered).toContain('{{Diamond}}');
      expect(rendered).toContain('((Stadium))');
    });

    it('should render programmatically-created SUBROUTINE nodes', () => {
      // SUBROUTINE can be created programmatically but NOT parsed from Mermaid syntax
      // This tests that the renderer outputs the correct delimiters
      const diagram = Kanban.create().addNode('n1', 'Subroutine', {
        type: KanbanNodeType.SUBROUTINE,
      });
      const rendered = diagram.render();
      expect(rendered).toContain('([-Subroutine-])');
    });

    it('should render programmatically-created ASYMMETRIC nodes', () => {
      // ASYMMETRIC can be created programmatically but NOT parsed from Mermaid syntax
      // This tests that the renderer outputs the correct delimiters
      const diagram = Kanban.create().addNode('n1', 'Asymmetric', {
        type: KanbanNodeType.ASYMMETRIC,
      });
      const rendered = diagram.render();
      expect(rendered).toContain('(-)Asymmetric-)');
    });
  });

  describe('Hierarchical Rendering', () => {
    it('should render nested nodes with proper indentation', () => {
      const ast = parseKanban(`kanban
  parent
    child1
    child2`);
      const rendered = renderKanban(ast);
      const lines = rendered.split('\n');
      expect(lines[0]).toBe('kanban');
      expect(lines[1]).toBe('    parent');
      expect(lines[2]).toBe('        child1');
      expect(lines[3]).toBe('        child2');
    });

    it('should render multiple indent levels', () => {
      const ast = parseKanban(`kanban
  root
    level1
      level2`);
      const rendered = renderKanban(ast);
      const lines = rendered.split('\n');
      expect(lines[1]).toMatch(/^\s{4}root$/);
      expect(lines[2]).toMatch(/^\s{8}level1$/);
      expect(lines[3]).toMatch(/^\s{12}level2$/);
    });
  });

  describe('Decorations Rendering', () => {
    it('should render node with icon', () => {
      const ast = parseKanban(`kanban
  node1
  ::icon(fas fa-check)`);
      const rendered = renderKanban(ast);
      expect(rendered).toContain('::icon(fas fa-check)');
    });

    it('should render node with class', () => {
      const ast = parseKanban(`kanban
  node1
  :::className`);
      const rendered = renderKanban(ast);
      expect(rendered).toContain(':::className');
    });

    it('should render node with both icon and class', () => {
      const ast = parseKanban(`kanban
  node1
  ::icon(fas fa-star)
  :::highlight`);
      const rendered = renderKanban(ast);
      expect(rendered).toContain('::icon(fas fa-star)');
      expect(rendered).toContain(':::highlight');
    });
  });

  describe('Shape Data Rendering', () => {
    it('should render node with shape data', () => {
      const ast = parseKanban(`kanban
  node1@{data:value}`);
      const rendered = renderKanban(ast);
      expect(rendered).toContain('@{data:value}');
    });
  });

  describe('Golden Tests', () => {
    it('should render simple kanban board', () => {
      const diagram = Kanban.create()
        .addNode('todo', 'To Do')
        .addChild('todo', 'task1', 'Write code');

      expectGolden(diagram.render(), 'kanban/render-simple.mmd');
    });

    it('should render kanban with different shapes', () => {
      const diagram = Kanban.create()
        .addNode('n1', 'Round', { type: KanbanNodeType.ROUND })
        .addNode('n2', 'Square', { type: KanbanNodeType.SQUARE })
        .addNode('n3', 'Diamond', { type: KanbanNodeType.DIAMOND });

      expectGolden(diagram.render(), 'kanban/render-shapes.mmd');
    });

    it('should render kanban with decorations', () => {
      const diagram = Kanban.create().addNode('task1', 'Important Task', {
        icon: 'fas fa-star',
        class: 'highlight',
      });

      expectGolden(diagram.render(), 'kanban/render-decorations.mmd');
    });

    it('should render complex kanban board', () => {
      const diagram = Kanban.create()
        .addNode('backlog', 'Backlog')
        .addChild('backlog', 'feature1', 'New Feature', { icon: 'fas fa-lightbulb' })
        .addChild('backlog', 'bug1', 'Bug Fix', { class: 'urgent' })
        .addNode('inprogress', 'In Progress')
        .addChild('inprogress', 'task1', 'Implementing', { type: KanbanNodeType.ROUND })
        .addNode('done', 'Done')
        .addChild('done', 'task2', 'Completed', { type: KanbanNodeType.STADIUM });

      expectGolden(diagram.render(), 'kanban/render-complex.mmd');
    });
  });

  describe('Render Options', () => {
    it('should respect custom indent', () => {
      const ast = parseKanban(`kanban
  parent
    child`);
      const rendered = renderKanban(ast, { indent: 2 });
      const lines = rendered.split('\n');
      expect(lines[1]).toBe('  parent');
      expect(lines[2]).toBe('    child');
    });

    it('should support tab indent', () => {
      const ast = parseKanban(`kanban
  parent`);
      const rendered = renderKanban(ast, { indent: 'tab' });
      expect(rendered).toContain('\tparent');
    });
  });
});
