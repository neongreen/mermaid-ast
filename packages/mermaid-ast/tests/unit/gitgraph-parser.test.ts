/**
 * GitGraph Parser Tests
 */

import { describe, expect, it } from 'bun:test';
import { isGitGraphDiagram, parseGitGraph } from '../../src/parser/gitgraph-parser.js';

describe('GitGraph Parser', () => {
  describe('isGitGraphDiagram', () => {
    it('should detect gitGraph diagram', () => {
      expect(isGitGraphDiagram('gitGraph')).toBe(true);
      expect(isGitGraphDiagram('gitGraph LR:')).toBe(true);
      expect(isGitGraphDiagram('gitGraph TB:')).toBe(true);
      expect(isGitGraphDiagram('  gitGraph')).toBe(true);
      expect(isGitGraphDiagram('\ngitGraph')).toBe(true);
    });

    it('should not detect non-gitGraph diagrams', () => {
      expect(isGitGraphDiagram('flowchart LR')).toBe(false);
      expect(isGitGraphDiagram('sequenceDiagram')).toBe(false);
      expect(isGitGraphDiagram('classDiagram')).toBe(false);
      expect(isGitGraphDiagram('gitGraphxyz')).toBe(false);
    });

    it('should be case insensitive', () => {
      expect(isGitGraphDiagram('GITGRAPH')).toBe(true);
      expect(isGitGraphDiagram('GitGraph')).toBe(true);
      expect(isGitGraphDiagram('gitgraph')).toBe(true);
    });
  });

  describe('Basic Parsing', () => {
    it('should parse empty gitGraph', async () => {
      const input = 'gitGraph';
      const ast = await parseGitGraph(input);
      expect(ast.type).toBe('gitGraph');
      expect(ast.statements.length).toBe(0);
    });

    it('should parse gitGraph with direction', async () => {
      const input = 'gitGraph LR:';
      const ast = await parseGitGraph(input);
      expect(ast.direction).toBe('LR');
    });

    it('should parse gitGraph with TB direction', async () => {
      const input = 'gitGraph TB:';
      const ast = await parseGitGraph(input);
      expect(ast.direction).toBe('TB');
    });

    it('should parse simple commit', async () => {
      const input = `gitGraph
    commit`;
      const ast = await parseGitGraph(input);
      expect(ast.statements.length).toBe(1);
      expect(ast.statements[0].type).toBe('commit');
    });
  });

  describe('Commit Parsing', () => {
    it('should parse commit with id', async () => {
      const input = `gitGraph
    commit id: "abc123"`;
      const ast = await parseGitGraph(input);
      const commit = ast.statements[0];
      expect(commit.type).toBe('commit');
      if (commit.type === 'commit') {
        expect(commit.id).toBe('abc123');
      }
    });

    it('should parse commit with message', async () => {
      const input = `gitGraph
    commit msg: "Initial commit"`;
      const ast = await parseGitGraph(input);
      const commit = ast.statements[0];
      if (commit.type === 'commit') {
        expect(commit.message).toBe('Initial commit');
      }
    });

    it('should parse commit with tag', async () => {
      const input = `gitGraph
    commit tag: "v1.0.0"`;
      const ast = await parseGitGraph(input);
      const commit = ast.statements[0];
      if (commit.type === 'commit') {
        expect(commit.tag).toBe('v1.0.0');
      }
    });

    it('should parse commit with type REVERSE', async () => {
      const input = `gitGraph
    commit type: REVERSE`;
      const ast = await parseGitGraph(input);
      const commit = ast.statements[0];
      if (commit.type === 'commit') {
        expect(commit.commitType).toBe('REVERSE');
      }
    });

    it('should parse commit with type HIGHLIGHT', async () => {
      const input = `gitGraph
    commit type: HIGHLIGHT`;
      const ast = await parseGitGraph(input);
      const commit = ast.statements[0];
      if (commit.type === 'commit') {
        expect(commit.commitType).toBe('HIGHLIGHT');
      }
    });

    it('should parse commit with multiple attributes', async () => {
      const input = `gitGraph
    commit id: "c1" msg: "First commit" tag: "v0.1.0"`;
      const ast = await parseGitGraph(input);
      const commit = ast.statements[0];
      if (commit.type === 'commit') {
        expect(commit.id).toBe('c1');
        expect(commit.message).toBe('First commit');
        expect(commit.tag).toBe('v0.1.0');
      }
    });
  });

  describe('Branch Parsing', () => {
    it('should parse branch', async () => {
      const input = `gitGraph
    branch develop`;
      const ast = await parseGitGraph(input);
      expect(ast.statements.length).toBe(1);
      const branch = ast.statements[0];
      expect(branch.type).toBe('branch');
      if (branch.type === 'branch') {
        expect(branch.name).toBe('develop');
      }
    });

    it('should parse branch with order', async () => {
      const input = `gitGraph
    branch develop order: 1`;
      const ast = await parseGitGraph(input);
      const branch = ast.statements[0];
      if (branch.type === 'branch') {
        expect(branch.order).toBe(1);
      }
    });
  });

  describe('Checkout Parsing', () => {
    it('should parse checkout', async () => {
      const input = `gitGraph
    checkout main`;
      const ast = await parseGitGraph(input);
      const checkout = ast.statements[0];
      expect(checkout.type).toBe('checkout');
      if (checkout.type === 'checkout') {
        expect(checkout.branch).toBe('main');
      }
    });
  });

  describe('Merge Parsing', () => {
    it('should parse merge', async () => {
      const input = `gitGraph
    merge develop`;
      const ast = await parseGitGraph(input);
      const merge = ast.statements[0];
      expect(merge.type).toBe('merge');
      if (merge.type === 'merge') {
        expect(merge.branch).toBe('develop');
      }
    });

    it('should parse merge with id', async () => {
      const input = `gitGraph
    merge develop id: "merge-1"`;
      const ast = await parseGitGraph(input);
      const merge = ast.statements[0];
      if (merge.type === 'merge') {
        expect(merge.id).toBe('merge-1');
      }
    });

    it('should parse merge with tag', async () => {
      const input = `gitGraph
    merge develop tag: "v1.0.0"`;
      const ast = await parseGitGraph(input);
      const merge = ast.statements[0];
      if (merge.type === 'merge') {
        expect(merge.tag).toBe('v1.0.0');
      }
    });

    it('should parse merge with type', async () => {
      const input = `gitGraph
    merge develop type: HIGHLIGHT`;
      const ast = await parseGitGraph(input);
      const merge = ast.statements[0];
      if (merge.type === 'merge') {
        expect(merge.commitType).toBe('HIGHLIGHT');
      }
    });
  });

  describe('Cherry-pick Parsing', () => {
    it('should parse cherry-pick', async () => {
      const input = `gitGraph
    cherry-pick id: "abc123"`;
      const ast = await parseGitGraph(input);
      const cherryPick = ast.statements[0];
      expect(cherryPick.type).toBe('cherry-pick');
      if (cherryPick.type === 'cherry-pick') {
        expect(cherryPick.id).toBe('abc123');
      }
    });

    it('should parse cherry-pick with tag', async () => {
      const input = `gitGraph
    cherry-pick id: "abc123" tag: "picked"`;
      const ast = await parseGitGraph(input);
      const cherryPick = ast.statements[0];
      if (cherryPick.type === 'cherry-pick') {
        expect(cherryPick.tag).toBe('picked');
      }
    });

    it('should parse cherry-pick with parent', async () => {
      const input = `gitGraph
    cherry-pick id: "abc123" parent: "main"`;
      const ast = await parseGitGraph(input);
      const cherryPick = ast.statements[0];
      if (cherryPick.type === 'cherry-pick') {
        expect(cherryPick.parent).toBe('main');
      }
    });
  });

  describe('Complex Diagrams', () => {
    it('should parse complete gitGraph workflow', async () => {
      const input = `gitGraph
    commit id: "initial"
    branch develop
    checkout develop
    commit id: "dev1"
    branch feature
    checkout feature
    commit id: "feat1"
    commit id: "feat2"
    checkout develop
    merge feature
    checkout main
    merge develop tag: "v1.0.0"`;
      const ast = await parseGitGraph(input);
      expect(ast.statements.length).toBe(12);

      const commits = ast.statements.filter((s) => s.type === 'commit');
      const branches = ast.statements.filter((s) => s.type === 'branch');
      const checkouts = ast.statements.filter((s) => s.type === 'checkout');
      const merges = ast.statements.filter((s) => s.type === 'merge');

      expect(commits.length).toBe(4);
      expect(branches.length).toBe(2);
      expect(checkouts.length).toBe(4);
      expect(merges.length).toBe(2);
    });
  });
});
