/**
 * Kanban Wrapper Class Tests
 */

import { describe, expect, it } from 'bun:test';
import { Kanban } from '../../src/kanban.js';
import { KanbanNodeType } from '../../src/types/kanban.js';

describe('Kanban', () => {
  describe('Factory Methods', () => {
    it('should create empty kanban', () => {
      const kanban = Kanban.create();
      expect(kanban.nodes).toEqual([]);
      expect(kanban.nodeCount).toBe(0);
    });

    it('should parse from text', () => {
      const kanban = Kanban.parse(`kanban
  node1
    child1`);
      expect(kanban.nodeCount).toBe(2);
      expect(kanban.nodes[0].id).toBe('node1');
    });

    it('should create from AST', () => {
      const ast = {
        type: 'kanban' as const,
        nodes: [
          {
            id: 'test',
            descr: 'Test Node',
            type: KanbanNodeType.SQUARE,
            indent: 0,
            children: [],
          },
        ],
      };
      const kanban = Kanban.from(ast);
      expect(kanban.nodeCount).toBe(1);
    });
  });

  describe('Core Methods', () => {
    it('should render to Mermaid syntax', () => {
      const kanban = Kanban.create().addNode('task1', 'My Task');
      const rendered = kanban.render();
      expect(rendered).toContain('kanban');
      expect(rendered).toContain('task1');
    });

    it('should clone kanban', () => {
      const original = Kanban.create()
        .addNode('node1', 'Node 1')
        .addChild('node1', 'child1', 'Child 1');

      const cloned = original.clone();
      cloned.setNodeDescr('node1', 'Modified');

      expect(original.findNodeById('node1')?.descr).toBe('Node 1');
      expect(cloned.findNodeById('node1')?.descr).toBe('Modified');
    });

    it('should convert to AST', () => {
      const kanban = Kanban.create().addNode('node1', 'Node 1');
      const ast = kanban.toAST();
      expect(ast.type).toBe('kanban');
      expect(ast.nodes).toHaveLength(1);
    });
  });

  describe('Node Operations', () => {
    it('should add root nodes', () => {
      const kanban = Kanban.create().addNode('n1', 'Node 1').addNode('n2', 'Node 2');

      expect(kanban.nodes).toHaveLength(2);
      expect(kanban.nodes[0].id).toBe('n1');
      expect(kanban.nodes[1].id).toBe('n2');
    });

    it('should add child nodes', () => {
      const kanban = Kanban.create()
        .addNode('parent', 'Parent')
        .addChild('parent', 'child1', 'Child 1')
        .addChild('parent', 'child2', 'Child 2');

      expect(kanban.nodes[0].children).toHaveLength(2);
      expect(kanban.getChildren('parent')).toHaveLength(2);
    });

    it('should add nodes with options', () => {
      const kanban = Kanban.create().addNode('task', 'Important Task', {
        type: KanbanNodeType.DIAMOND,
        icon: 'fas fa-star',
        class: 'highlight',
        shapeData: 'priority:high',
      });

      const node = kanban.findNodeById('task');
      expect(node?.type).toBe(KanbanNodeType.DIAMOND);
      expect(node?.icon).toBe('fas fa-star');
      expect(node?.class).toBe('highlight');
      expect(node?.shapeData).toBe('priority:high');
    });

    it('should throw error when adding child to non-existent parent', () => {
      const kanban = Kanban.create();
      expect(() => {
        kanban.addChild('nonexistent', 'child', 'Child');
      }).toThrow();
    });

    it('should remove nodes', () => {
      const kanban = Kanban.create()
        .addNode('n1', 'Node 1')
        .addNode('n2', 'Node 2')
        .removeNode('n1');

      expect(kanban.nodes).toHaveLength(1);
      expect(kanban.findNodeById('n1')).toBeUndefined();
    });

    it('should remove child nodes', () => {
      const kanban = Kanban.create()
        .addNode('parent', 'Parent')
        .addChild('parent', 'child1', 'Child 1')
        .addChild('parent', 'child2', 'Child 2')
        .removeNode('child1');

      expect(kanban.getChildren('parent')).toHaveLength(1);
    });

    it('should set node description', () => {
      const kanban = Kanban.create()
        .addNode('task', 'Old Description')
        .setNodeDescr('task', 'New Description');

      expect(kanban.findNodeById('task')?.descr).toBe('New Description');
    });

    it('should set node type', () => {
      const kanban = Kanban.create()
        .addNode('task', 'Task')
        .setNodeType('task', KanbanNodeType.STADIUM);

      expect(kanban.findNodeById('task')?.type).toBe(KanbanNodeType.STADIUM);
    });

    it('should set and remove node icon', () => {
      const kanban = Kanban.create().addNode('task', 'Task').setNodeIcon('task', 'fas fa-check');

      expect(kanban.findNodeById('task')?.icon).toBe('fas fa-check');

      kanban.removeNodeIcon('task');
      expect(kanban.findNodeById('task')?.icon).toBeUndefined();
    });

    it('should set and remove node class', () => {
      const kanban = Kanban.create().addNode('task', 'Task').setNodeClass('task', 'highlight');

      expect(kanban.findNodeById('task')?.class).toBe('highlight');

      kanban.removeNodeClass('task');
      expect(kanban.findNodeById('task')?.class).toBeUndefined();
    });
  });

  describe('Query Operations', () => {
    it('should get all nodes', () => {
      const kanban = Kanban.create()
        .addNode('n1', 'Node 1')
        .addChild('n1', 'n2', 'Node 2')
        .addChild('n2', 'n3', 'Node 3');

      const allNodes = kanban.getAllNodes();
      expect(allNodes).toHaveLength(3);
    });

    it('should find node by ID', () => {
      const kanban = Kanban.create()
        .addNode('parent', 'Parent')
        .addChild('parent', 'child', 'Child');

      const child = kanban.findNodeById('child');
      expect(child?.id).toBe('child');
      expect(child?.descr).toBe('Child');
    });

    it('should find nodes by type', () => {
      const kanban = Kanban.create()
        .addNode('n1', 'Node 1', { type: KanbanNodeType.DIAMOND })
        .addNode('n2', 'Node 2', { type: KanbanNodeType.SQUARE })
        .addNode('n3', 'Node 3', { type: KanbanNodeType.DIAMOND });

      const diamonds = kanban.findNodes({ type: KanbanNodeType.DIAMOND });
      expect(diamonds).toHaveLength(2);
    });

    it('should find nodes by icon', () => {
      const kanban = Kanban.create()
        .addNode('n1', 'Node 1', { icon: 'fas fa-star' })
        .addNode('n2', 'Node 2', { icon: 'fas fa-check' })
        .addNode('n3', 'Node 3', { icon: 'fas fa-star' });

      const starred = kanban.findNodes({ icon: 'fas fa-star' });
      expect(starred).toHaveLength(2);
    });

    it('should find nodes by class', () => {
      const kanban = Kanban.create()
        .addNode('n1', 'Node 1', { class: 'highlight' })
        .addNode('n2', 'Node 2')
        .addNode('n3', 'Node 3', { class: 'highlight' });

      const highlighted = kanban.findNodes({ class: 'highlight' });
      expect(highlighted).toHaveLength(2);
    });

    it('should find nodes by description content', () => {
      const kanban = Kanban.create()
        .addNode('n1', 'Bug Fix')
        .addNode('n2', 'New Feature')
        .addNode('n3', 'Fix Documentation');

      const fixes = kanban.findNodes({ descrContains: 'Fix' });
      expect(fixes).toHaveLength(2);
    });

    it('should find nodes by indent level', () => {
      const kanban = Kanban.create()
        .addNode('root', 'Root')
        .addChild('root', 'child1', 'Child 1')
        .addChild('child1', 'grandchild', 'Grandchild');

      const level0 = kanban.findNodes({ indent: 0 });
      const level1 = kanban.findNodes({ indent: 1 });
      const level2 = kanban.findNodes({ indent: 2 });

      expect(level0).toHaveLength(1);
      expect(level1).toHaveLength(1);
      expect(level2).toHaveLength(1);
    });

    it('should get children of a node', () => {
      const kanban = Kanban.create()
        .addNode('parent', 'Parent')
        .addChild('parent', 'child1', 'Child 1')
        .addChild('parent', 'child2', 'Child 2');

      const children = kanban.getChildren('parent');
      expect(children).toHaveLength(2);
      expect(children[0].id).toBe('child1');
      expect(children[1].id).toBe('child2');
    });

    it('should get parent of a node', () => {
      const kanban = Kanban.create()
        .addNode('parent', 'Parent')
        .addChild('parent', 'child', 'Child');

      const parent = kanban.getParent('child');
      expect(parent?.id).toBe('parent');
    });

    it('should return undefined for parent of root node', () => {
      const kanban = Kanban.create().addNode('root', 'Root');
      const parent = kanban.getParent('root');
      expect(parent).toBeUndefined();
    });

    it('should get leaf nodes', () => {
      const kanban = Kanban.create()
        .addNode('root', 'Root')
        .addChild('root', 'branch', 'Branch')
        .addChild('branch', 'leaf1', 'Leaf 1')
        .addChild('root', 'leaf2', 'Leaf 2');

      const leaves = kanban.getLeafNodes();
      expect(leaves).toHaveLength(2);
      expect(leaves.map((n) => n.id)).toContain('leaf1');
      expect(leaves.map((n) => n.id)).toContain('leaf2');
    });

    it('should get tree depth', () => {
      const kanban1 = Kanban.create().addNode('root', 'Root');
      expect(kanban1.getDepth()).toBe(1);

      const kanban2 = Kanban.create()
        .addNode('root', 'Root')
        .addChild('root', 'child', 'Child')
        .addChild('child', 'grandchild', 'Grandchild');
      expect(kanban2.getDepth()).toBe(3);
    });
  });

  describe('Complex Scenarios', () => {
    it('should build a complete kanban board', () => {
      const kanban = Kanban.create()
        .addNode('backlog', 'Backlog')
        .addChild('backlog', 'feat1', 'New Feature', {
          type: KanbanNodeType.SQUARE,
          icon: 'fas fa-lightbulb',
        })
        .addChild('backlog', 'bug1', 'Bug Fix', {
          class: 'urgent',
        })
        .addNode('inprogress', 'In Progress')
        .addChild('inprogress', 'task1', 'Implementing', {
          type: KanbanNodeType.ROUND,
          icon: 'fas fa-code',
        })
        .addNode('review', 'In Review')
        .addChild('review', 'pr1', 'PR #123', {
          icon: 'fas fa-code-review',
        })
        .addNode('done', 'Done')
        .addChild('done', 'task2', 'Completed', {
          type: KanbanNodeType.STADIUM,
          class: 'complete',
        });

      expect(kanban.nodes).toHaveLength(4);
      expect(kanban.nodeCount).toBe(9); // 4 root + 5 children
      expect(kanban.getDepth()).toBe(2);

      const urgentTasks = kanban.findNodes({ class: 'urgent' });
      expect(urgentTasks).toHaveLength(1);

      const rendered = kanban.render();
      expect(rendered).toContain('backlog');
      expect(rendered).toContain('::icon(fas fa-lightbulb)');
      expect(rendered).toContain(':::urgent');
    });
  });
});
