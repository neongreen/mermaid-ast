/**
 * GitGraph Diagram Wrapper Tests
 */

import { describe, expect, it } from 'bun:test';
import { GitGraph } from '../../src/gitgraph.js';
import type { GitGraphAST } from '../../src/types/index.js';

describe('GitGraph', () => {
  describe('Factory Methods', () => {
    it('should create empty gitGraph diagram', () => {
      const diagram = GitGraph.create();
      const ast = diagram.toAST();
      expect(ast.type).toBe('gitGraph');
      expect(ast.statements.length).toBe(0);
    });

    it('should create gitGraph with direction', () => {
      const diagram = GitGraph.create('LR');
      expect(diagram.getDirection()).toBe('LR');
    });

    it('should create from existing AST', () => {
      const ast: GitGraphAST = {
        type: 'gitGraph',
        direction: 'TB',
        statements: [
          { type: 'commit', id: 'c1' },
          { type: 'branch', name: 'develop' },
        ],
      };
      const diagram = GitGraph.from(ast);
      expect(diagram.getDirection()).toBe('TB');
      expect(diagram.commitCount).toBe(1);
      expect(diagram.branchCount).toBe(1);
    });

    it('should parse gitGraph diagram', async () => {
      const text = `gitGraph
    commit
    branch develop
    checkout develop
    commit`;
      const diagram = await GitGraph.parse(text);
      expect(diagram.toAST().type).toBe('gitGraph');
    });
  });

  describe('Core Methods', () => {
    it('should return AST with toAST()', () => {
      const diagram = GitGraph.create();
      const ast = diagram.toAST();
      expect(ast.type).toBe('gitGraph');
    });

    it('should clone diagram', () => {
      const original = GitGraph.create().commit({ id: 'c1' }).branch('develop');
      const cloned = original.clone();

      expect(cloned.commitCount).toBe(1);
      expect(cloned.branchCount).toBe(1);

      // Verify independence
      cloned.commit({ id: 'c2' });
      expect(original.commitCount).toBe(1);
      expect(cloned.commitCount).toBe(2);
    });

    it('should render diagram', () => {
      const diagram = GitGraph.create().commit().branch('develop');
      const output = diagram.render();
      expect(output).toContain('gitGraph');
      expect(output).toContain('commit');
      expect(output).toContain('branch develop');
    });
  });

  describe('Direction Operations', () => {
    it('should set direction', () => {
      const diagram = GitGraph.create().setDirection('LR');
      expect(diagram.getDirection()).toBe('LR');
    });

    it('should get direction', () => {
      const diagram = GitGraph.create('TB');
      expect(diagram.getDirection()).toBe('TB');
    });

    it('should support all directions', () => {
      expect(GitGraph.create('LR').getDirection()).toBe('LR');
      expect(GitGraph.create('TB').getDirection()).toBe('TB');
      expect(GitGraph.create('BT').getDirection()).toBe('BT');
    });
  });

  describe('Title Operations', () => {
    it('should set title', () => {
      const diagram = GitGraph.create().setTitle('My Git History');
      expect(diagram.getTitle()).toBe('My Git History');
    });

    it('should get title', () => {
      const diagram = GitGraph.create().setTitle('Test');
      expect(diagram.getTitle()).toBe('Test');
    });

    it('should remove title', () => {
      const diagram = GitGraph.create().setTitle('Test').removeTitle();
      expect(diagram.getTitle()).toBeUndefined();
    });
  });

  describe('Accessibility Operations', () => {
    it('should set accessibility title', () => {
      const diagram = GitGraph.create().setAccTitle('Accessible Title');
      expect(diagram.getAccTitle()).toBe('Accessible Title');
    });

    it('should set accessibility description', () => {
      const diagram = GitGraph.create().setAccDescr('Accessible Description');
      expect(diagram.getAccDescr()).toBe('Accessible Description');
    });
  });

  describe('Commit Operations', () => {
    it('should add commit', () => {
      const diagram = GitGraph.create().commit();
      expect(diagram.commitCount).toBe(1);
    });

    it('should add commit with id', () => {
      const diagram = GitGraph.create().commit({ id: 'abc123' });
      const commit = diagram.getCommit('abc123');
      expect(commit).toBeDefined();
      expect(commit?.id).toBe('abc123');
    });

    it('should add commit with message', () => {
      const diagram = GitGraph.create().commit({ message: 'Initial commit' });
      const commits = diagram.findCommits();
      expect(commits[0].message).toBe('Initial commit');
    });

    it('should add commit with tag', () => {
      const diagram = GitGraph.create().commit({ tag: 'v1.0.0' });
      const commits = diagram.findCommits({ tag: 'v1.0.0' });
      expect(commits.length).toBe(1);
    });

    it('should add commit with type REVERSE', () => {
      const diagram = GitGraph.create().commit({ commitType: 'REVERSE' });
      const commits = diagram.findCommits({ commitType: 'REVERSE' });
      expect(commits.length).toBe(1);
    });

    it('should add commit with type HIGHLIGHT', () => {
      const diagram = GitGraph.create().commit({ commitType: 'HIGHLIGHT' });
      const commits = diagram.findCommits({ commitType: 'HIGHLIGHT' });
      expect(commits.length).toBe(1);
    });

    it('should find commits by id', () => {
      const diagram = GitGraph.create().commit({ id: 'c1' }).commit({ id: 'c2' });
      const commits = diagram.findCommits({ id: 'c1' });
      expect(commits.length).toBe(1);
    });

    it('should get commit by id', () => {
      const diagram = GitGraph.create().commit({ id: 'test' });
      expect(diagram.getCommit('test')).toBeDefined();
      expect(diagram.getCommit('nonexistent')).toBeUndefined();
    });
  });

  describe('Branch Operations', () => {
    it('should create branch', () => {
      const diagram = GitGraph.create().branch('develop');
      expect(diagram.branchCount).toBe(1);
    });

    it('should create branch with order', () => {
      const diagram = GitGraph.create()
        .branch('feature', { order: 1 })
        .branch('develop', { order: 2 });
      const branches = diagram.findBranches();
      expect(branches[0].order).toBe(1);
      expect(branches[1].order).toBe(2);
    });

    it('should checkout branch', () => {
      const diagram = GitGraph.create().branch('develop').checkout('develop');
      const statements = diagram.getStatements();
      expect(statements.length).toBe(2);
      expect(statements[1].type).toBe('checkout');
    });

    it('should find branches by name', () => {
      const diagram = GitGraph.create().branch('develop').branch('feature');
      const branches = diagram.findBranches({ name: 'develop' });
      expect(branches.length).toBe(1);
    });

    it('should get branch by name', () => {
      const diagram = GitGraph.create().branch('develop');
      expect(diagram.getBranch('develop')).toBeDefined();
      expect(diagram.getBranch('nonexistent')).toBeUndefined();
    });
  });

  describe('Merge Operations', () => {
    it('should merge branch', () => {
      const diagram = GitGraph.create()
        .commit()
        .branch('develop')
        .checkout('develop')
        .commit()
        .checkout('main')
        .merge('develop');
      expect(diagram.mergeCount).toBe(1);
    });

    it('should merge with id', () => {
      const diagram = GitGraph.create().branch('develop').merge('develop', { id: 'merge-1' });
      const statements = diagram.getStatements();
      const merge = statements.find((s) => s.type === 'merge');
      expect(merge?.type).toBe('merge');
      if (merge?.type === 'merge') {
        expect(merge.id).toBe('merge-1');
      }
    });

    it('should merge with tag', () => {
      const diagram = GitGraph.create().branch('develop').merge('develop', { tag: 'v1.0.0' });
      const statements = diagram.getStatements();
      const merge = statements.find((s) => s.type === 'merge');
      if (merge?.type === 'merge') {
        expect(merge.tag).toBe('v1.0.0');
      }
    });

    it('should merge with commit type', () => {
      const diagram = GitGraph.create()
        .branch('develop')
        .merge('develop', { commitType: 'HIGHLIGHT' });
      const statements = diagram.getStatements();
      const merge = statements.find((s) => s.type === 'merge');
      if (merge?.type === 'merge') {
        expect(merge.commitType).toBe('HIGHLIGHT');
      }
    });
  });

  describe('Cherry-pick Operations', () => {
    it('should cherry-pick commit', () => {
      const diagram = GitGraph.create()
        .commit({ id: 'c1' })
        .branch('develop')
        .checkout('develop')
        .cherryPick('c1');
      const statements = diagram.getStatements();
      const cherryPick = statements.find((s) => s.type === 'cherry-pick');
      expect(cherryPick).toBeDefined();
    });

    it('should cherry-pick with tag', () => {
      const diagram = GitGraph.create().commit({ id: 'c1' }).cherryPick('c1', { tag: 'picked' });
      const statements = diagram.getStatements();
      const cherryPick = statements.find((s) => s.type === 'cherry-pick');
      if (cherryPick?.type === 'cherry-pick') {
        expect(cherryPick.tag).toBe('picked');
      }
    });

    it('should cherry-pick with parent', () => {
      const diagram = GitGraph.create().commit({ id: 'c1' }).cherryPick('c1', { parent: 'main' });
      const statements = diagram.getStatements();
      const cherryPick = statements.find((s) => s.type === 'cherry-pick');
      if (cherryPick?.type === 'cherry-pick') {
        expect(cherryPick.parent).toBe('main');
      }
    });
  });

  describe('General Statement Operations', () => {
    it('should get all statements', () => {
      const diagram = GitGraph.create().commit().branch('develop').checkout('develop').commit();
      const statements = diagram.getStatements();
      expect(statements.length).toBe(4);
    });

    it('should get statement count', () => {
      const diagram = GitGraph.create().commit().branch('develop');
      expect(diagram.statementCount).toBe(2);
    });
  });

  describe('Complex Scenarios', () => {
    it('should build feature branch workflow', () => {
      const diagram = GitGraph.create()
        .commit({ id: 'c1', message: 'Initial commit' })
        .branch('develop')
        .checkout('develop')
        .commit({ id: 'c2', message: 'Add feature' })
        .branch('feature')
        .checkout('feature')
        .commit({ id: 'c3', message: 'Work on feature' })
        .commit({ id: 'c4', message: 'Complete feature' })
        .checkout('develop')
        .merge('feature', { tag: 'feature-complete' })
        .checkout('main')
        .merge('develop', { tag: 'v1.0.0' });

      expect(diagram.commitCount).toBe(4);
      expect(diagram.branchCount).toBe(2);
      expect(diagram.mergeCount).toBe(2);
    });

    it('should build gitflow workflow', () => {
      const diagram = GitGraph.create('LR')
        .commit({ id: 'initial' })
        .branch('develop', { order: 1 })
        .checkout('develop')
        .commit()
        .branch('feature-1', { order: 2 })
        .checkout('feature-1')
        .commit()
        .commit()
        .checkout('develop')
        .merge('feature-1')
        .branch('release', { order: 3 })
        .checkout('release')
        .commit({ tag: 'v1.0.0-rc1' })
        .checkout('main')
        .merge('release', { tag: 'v1.0.0' })
        .checkout('develop')
        .merge('release');

      const ast = diagram.toAST();
      expect(ast.direction).toBe('LR');
      expect(diagram.branchCount).toBe(3);
    });
  });
});
