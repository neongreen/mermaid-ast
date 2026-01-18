/**
 * GitGraph Round-trip Tests
 */

import { describe, expect, it } from 'bun:test';
import { GitGraph } from '../../src/gitgraph.js';
import { parseGitGraph } from '../../src/parser/gitgraph-parser.js';
import { renderGitGraph } from '../../src/renderer/gitgraph-renderer.js';

describe('GitGraph Round-trip', () => {
  describe('Simple Round-trips', () => {
    it('should round-trip empty gitGraph', async () => {
      const original = GitGraph.create();
      const rendered = original.render();
      const parsed = await GitGraph.parse(rendered);

      expect(parsed.toAST().type).toBe('gitGraph');
      expect(parsed.statementCount).toBe(0);
    });

    it('should round-trip gitGraph with direction', async () => {
      const original = GitGraph.create('LR');
      const rendered = original.render();
      const parsed = await GitGraph.parse(rendered);

      expect(parsed.getDirection()).toBe('LR');
    });

    it('should round-trip simple commit', async () => {
      const original = GitGraph.create().commit({ id: 'c1' });
      const rendered = original.render();
      const parsed = await GitGraph.parse(rendered);

      expect(parsed.commitCount).toBe(1);
      expect(parsed.getCommit('c1')).toBeDefined();
    });

    it('should round-trip branch and checkout', async () => {
      const original = GitGraph.create().branch('develop').checkout('develop');
      const rendered = original.render();
      const parsed = await GitGraph.parse(rendered);

      expect(parsed.branchCount).toBe(1);
      expect(parsed.getBranch('develop')).toBeDefined();
    });
  });

  describe('Complex Round-trips', () => {
    it('should round-trip complete workflow', async () => {
      const original = GitGraph.create('LR')
        .commit({ id: 'initial', message: 'Initial commit' })
        .branch('develop')
        .checkout('develop')
        .commit({ id: 'dev1' })
        .branch('feature')
        .checkout('feature')
        .commit({ id: 'feat1' })
        .commit({ id: 'feat2' })
        .checkout('develop')
        .merge('feature', { tag: 'feature-done' })
        .checkout('main')
        .merge('develop', { tag: 'v1.0.0' });

      const rendered = original.render();
      const parsed = await GitGraph.parse(rendered);

      expect(parsed.getDirection()).toBe('LR');
      expect(parsed.commitCount).toBe(4);
      expect(parsed.branchCount).toBe(2);
      expect(parsed.mergeCount).toBe(2);
    });

    it('should round-trip commit with all attributes', async () => {
      const original = GitGraph.create().commit({
        id: 'c1',
        message: 'Test commit',
        tag: 'v1.0.0',
        commitType: 'HIGHLIGHT',
      });

      const rendered = original.render();
      const parsed = await GitGraph.parse(rendered);

      const commit = parsed.getCommit('c1');
      expect(commit).toBeDefined();
      expect(commit?.message).toBe('Test commit');
      expect(commit?.tag).toBe('v1.0.0');
      expect(commit?.commitType).toBe('HIGHLIGHT');
    });

    it('should round-trip branch with order', async () => {
      const original = GitGraph.create()
        .branch('develop', { order: 1 })
        .branch('feature', { order: 2 });

      const rendered = original.render();
      const parsed = await GitGraph.parse(rendered);

      const develop = parsed.getBranch('develop');
      const feature = parsed.getBranch('feature');
      expect(develop?.order).toBe(1);
      expect(feature?.order).toBe(2);
    });

    it('should round-trip merge with attributes', async () => {
      const original = GitGraph.create().branch('develop').merge('develop', {
        id: 'merge-1',
        tag: 'v1.0.0',
        commitType: 'HIGHLIGHT',
      });

      const rendered = original.render();
      const parsed = await GitGraph.parse(rendered);

      const statements = parsed.getStatements();
      const merge = statements.find((s) => s.type === 'merge');
      expect(merge?.type).toBe('merge');
      if (merge?.type === 'merge') {
        expect(merge.id).toBe('merge-1');
        expect(merge.tag).toBe('v1.0.0');
        expect(merge.commitType).toBe('HIGHLIGHT');
      }
    });

    it('should round-trip cherry-pick with attributes', async () => {
      const original = GitGraph.create()
        .commit({ id: 'c1' })
        .cherryPick('c1', { tag: 'picked', parent: 'main' });

      const rendered = original.render();
      const parsed = await GitGraph.parse(rendered);

      const statements = parsed.getStatements();
      const cherryPick = statements.find((s) => s.type === 'cherry-pick');
      expect(cherryPick?.type).toBe('cherry-pick');
      if (cherryPick?.type === 'cherry-pick') {
        expect(cherryPick.id).toBe('c1');
        expect(cherryPick.tag).toBe('picked');
        expect(cherryPick.parent).toBe('main');
      }
    });
  });

  describe('Idempotency', () => {
    it('should be idempotent', async () => {
      const original = GitGraph.create('LR')
        .commit({ id: 'c1' })
        .branch('develop')
        .checkout('develop')
        .commit({ id: 'c2' })
        .checkout('main')
        .merge('develop', { tag: 'v1.0.0' });

      // First round-trip
      const rendered1 = original.render();
      const parsed1 = await GitGraph.parse(rendered1);

      // Second round-trip
      const rendered2 = parsed1.render();
      const parsed2 = await GitGraph.parse(rendered2);

      // Third round-trip
      const rendered3 = parsed2.render();

      // Output should stabilize
      expect(rendered2).toBe(rendered3);
    });
  });

  describe('Parse-Render-Parse', () => {
    it('should preserve structure through parse-render-parse', async () => {
      const input = `gitGraph LR:
    commit id: "initial"
    branch develop
    checkout develop
    commit id: "dev1"
    checkout main
    merge develop tag: "v1.0.0"`;

      const ast1 = await parseGitGraph(input);
      const rendered = renderGitGraph(ast1);
      const ast2 = await parseGitGraph(rendered);

      expect(ast2.direction).toBe(ast1.direction);
      expect(ast2.statements.length).toBe(ast1.statements.length);

      for (let i = 0; i < ast1.statements.length; i++) {
        expect(ast2.statements[i].type).toBe(ast1.statements[i].type);
      }
    });
  });
});
