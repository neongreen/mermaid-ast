/**
 * GitGraph Renderer Tests
 */

import { describe, expect, it } from 'bun:test';
import { renderGitGraph } from '../../src/renderer/gitgraph-renderer.js';
import type { GitGraphAST } from '../../src/types/index.js';

describe('GitGraph Renderer', () => {
  describe('Basic Rendering', () => {
    it('should render empty gitGraph', () => {
      const ast: GitGraphAST = {
        type: 'gitGraph',
        statements: [],
      };
      const output = renderGitGraph(ast);
      expect(output).toBe('gitGraph');
    });

    it('should render gitGraph with direction', () => {
      const ast: GitGraphAST = {
        type: 'gitGraph',
        direction: 'LR',
        statements: [],
      };
      const output = renderGitGraph(ast);
      expect(output).toContain('gitGraph LR:');
    });

    it('should render gitGraph with TB direction', () => {
      const ast: GitGraphAST = {
        type: 'gitGraph',
        direction: 'TB',
        statements: [],
      };
      const output = renderGitGraph(ast);
      expect(output).toContain('gitGraph TB:');
    });
  });

  describe('Commit Rendering', () => {
    it('should render simple commit', () => {
      const ast: GitGraphAST = {
        type: 'gitGraph',
        statements: [{ type: 'commit' }],
      };
      const output = renderGitGraph(ast);
      expect(output).toContain('commit');
    });

    it('should render commit with id', () => {
      const ast: GitGraphAST = {
        type: 'gitGraph',
        statements: [{ type: 'commit', id: 'abc123' }],
      };
      const output = renderGitGraph(ast);
      expect(output).toContain('commit id: "abc123"');
    });

    it('should render commit with message', () => {
      const ast: GitGraphAST = {
        type: 'gitGraph',
        statements: [{ type: 'commit', message: 'Initial commit' }],
      };
      const output = renderGitGraph(ast);
      expect(output).toContain('msg: "Initial commit"');
    });

    it('should render commit with tag', () => {
      const ast: GitGraphAST = {
        type: 'gitGraph',
        statements: [{ type: 'commit', tag: 'v1.0.0' }],
      };
      const output = renderGitGraph(ast);
      expect(output).toContain('tag: "v1.0.0"');
    });

    it('should render commit with type REVERSE', () => {
      const ast: GitGraphAST = {
        type: 'gitGraph',
        statements: [{ type: 'commit', commitType: 'REVERSE' }],
      };
      const output = renderGitGraph(ast);
      expect(output).toContain('type: REVERSE');
    });

    it('should render commit with type HIGHLIGHT', () => {
      const ast: GitGraphAST = {
        type: 'gitGraph',
        statements: [{ type: 'commit', commitType: 'HIGHLIGHT' }],
      };
      const output = renderGitGraph(ast);
      expect(output).toContain('type: HIGHLIGHT');
    });

    it('should not render NORMAL commit type', () => {
      const ast: GitGraphAST = {
        type: 'gitGraph',
        statements: [{ type: 'commit', commitType: 'NORMAL' }],
      };
      const output = renderGitGraph(ast);
      expect(output).not.toContain('type: NORMAL');
    });

    it('should render commit with multiple attributes', () => {
      const ast: GitGraphAST = {
        type: 'gitGraph',
        statements: [{ type: 'commit', id: 'c1', message: 'First', tag: 'v1.0.0' }],
      };
      const output = renderGitGraph(ast);
      expect(output).toContain('id: "c1"');
      expect(output).toContain('msg: "First"');
      expect(output).toContain('tag: "v1.0.0"');
    });
  });

  describe('Branch Rendering', () => {
    it('should render branch', () => {
      const ast: GitGraphAST = {
        type: 'gitGraph',
        statements: [{ type: 'branch', name: 'develop' }],
      };
      const output = renderGitGraph(ast);
      expect(output).toContain('branch develop');
    });

    it('should render branch with order', () => {
      const ast: GitGraphAST = {
        type: 'gitGraph',
        statements: [{ type: 'branch', name: 'develop', order: 1 }],
      };
      const output = renderGitGraph(ast);
      expect(output).toContain('branch develop order: 1');
    });
  });

  describe('Checkout Rendering', () => {
    it('should render checkout', () => {
      const ast: GitGraphAST = {
        type: 'gitGraph',
        statements: [{ type: 'checkout', branch: 'main' }],
      };
      const output = renderGitGraph(ast);
      expect(output).toContain('checkout main');
    });
  });

  describe('Merge Rendering', () => {
    it('should render merge', () => {
      const ast: GitGraphAST = {
        type: 'gitGraph',
        statements: [{ type: 'merge', branch: 'develop' }],
      };
      const output = renderGitGraph(ast);
      expect(output).toContain('merge develop');
    });

    it('should render merge with id', () => {
      const ast: GitGraphAST = {
        type: 'gitGraph',
        statements: [{ type: 'merge', branch: 'develop', id: 'merge-1' }],
      };
      const output = renderGitGraph(ast);
      expect(output).toContain('id: "merge-1"');
    });

    it('should render merge with tag', () => {
      const ast: GitGraphAST = {
        type: 'gitGraph',
        statements: [{ type: 'merge', branch: 'develop', tag: 'v1.0.0' }],
      };
      const output = renderGitGraph(ast);
      expect(output).toContain('tag: "v1.0.0"');
    });

    it('should render merge with type', () => {
      const ast: GitGraphAST = {
        type: 'gitGraph',
        statements: [{ type: 'merge', branch: 'develop', commitType: 'HIGHLIGHT' }],
      };
      const output = renderGitGraph(ast);
      expect(output).toContain('type: HIGHLIGHT');
    });
  });

  describe('Cherry-pick Rendering', () => {
    it('should render cherry-pick', () => {
      const ast: GitGraphAST = {
        type: 'gitGraph',
        statements: [{ type: 'cherry-pick', id: 'abc123' }],
      };
      const output = renderGitGraph(ast);
      expect(output).toContain('cherry-pick id: "abc123"');
    });

    it('should render cherry-pick with tag', () => {
      const ast: GitGraphAST = {
        type: 'gitGraph',
        statements: [{ type: 'cherry-pick', id: 'abc123', tag: 'picked' }],
      };
      const output = renderGitGraph(ast);
      expect(output).toContain('tag: "picked"');
    });

    it('should render cherry-pick with parent', () => {
      const ast: GitGraphAST = {
        type: 'gitGraph',
        statements: [{ type: 'cherry-pick', id: 'abc123', parent: 'main' }],
      };
      const output = renderGitGraph(ast);
      expect(output).toContain('parent: "main"');
    });
  });

  describe('Accessibility Rendering', () => {
    it('should render accessibility title', () => {
      const ast: GitGraphAST = {
        type: 'gitGraph',
        statements: [],
        accTitle: 'Git History',
      };
      const output = renderGitGraph(ast);
      expect(output).toContain('accTitle: Git History');
    });

    it('should render accessibility description', () => {
      const ast: GitGraphAST = {
        type: 'gitGraph',
        statements: [],
        accDescr: 'A diagram showing git history',
      };
      const output = renderGitGraph(ast);
      expect(output).toContain('accDescr: A diagram showing git history');
    });
  });

  describe('Complete Diagrams', () => {
    it('should render complete gitGraph workflow', () => {
      const ast: GitGraphAST = {
        type: 'gitGraph',
        direction: 'LR',
        statements: [
          { type: 'commit', id: 'initial' },
          { type: 'branch', name: 'develop' },
          { type: 'checkout', branch: 'develop' },
          { type: 'commit', id: 'dev1' },
          { type: 'checkout', branch: 'main' },
          { type: 'merge', branch: 'develop', tag: 'v1.0.0' },
        ],
      };
      const output = renderGitGraph(ast);
      expect(output).toContain('gitGraph LR:');
      expect(output).toContain('commit id: "initial"');
      expect(output).toContain('branch develop');
      expect(output).toContain('checkout develop');
      expect(output).toContain('commit id: "dev1"');
      expect(output).toContain('checkout main');
      expect(output).toContain('merge develop');
      expect(output).toContain('tag: "v1.0.0"');
    });
  });
});
