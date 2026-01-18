/**
 * GitGraph Renderer
 *
 * Renders a GitGraphAST back to Mermaid gitGraph syntax.
 */

import type {
  GitGraphAST,
  GitStatement,
  GitCommit,
  GitBranch,
  GitCheckout,
  GitMerge,
  GitCherryPick,
} from '../types/gitgraph.js';
import type { RenderOptions } from '../types/render-options.js';
import { resolveOptions } from '../types/render-options.js';
import type { Doc } from './doc.js';
import { indent, render, when } from './doc.js';

/**
 * Renders a commit statement
 */
function renderCommit(commit: GitCommit): string {
  const parts = ['commit'];

  if (commit.id) {
    parts.push(`id: "${commit.id}"`);
  }
  if (commit.message) {
    parts.push(`msg: "${commit.message}"`);
  }
  if (commit.tag) {
    parts.push(`tag: "${commit.tag}"`);
  }
  if (commit.commitType && commit.commitType !== 'NORMAL') {
    parts.push(`type: ${commit.commitType}`);
  }

  return parts.join(' ');
}

/**
 * Renders a branch statement
 */
function renderBranch(branch: GitBranch): string {
  const parts = [`branch ${branch.name}`];

  if (branch.order !== undefined) {
    parts.push(`order: ${branch.order}`);
  }

  return parts.join(' ');
}

/**
 * Renders a checkout statement
 */
function renderCheckout(checkout: GitCheckout): string {
  return `checkout ${checkout.branch}`;
}

/**
 * Renders a merge statement
 */
function renderMerge(merge: GitMerge): string {
  const parts = [`merge ${merge.branch}`];

  if (merge.id) {
    parts.push(`id: "${merge.id}"`);
  }
  if (merge.tag) {
    parts.push(`tag: "${merge.tag}"`);
  }
  if (merge.commitType && merge.commitType !== 'NORMAL') {
    parts.push(`type: ${merge.commitType}`);
  }

  return parts.join(' ');
}

/**
 * Renders a cherry-pick statement
 */
function renderCherryPick(cherryPick: GitCherryPick): string {
  const parts = [`cherry-pick id: "${cherryPick.id}"`];

  if (cherryPick.tag) {
    parts.push(`tag: "${cherryPick.tag}"`);
  }
  if (cherryPick.parent) {
    parts.push(`parent: "${cherryPick.parent}"`);
  }

  return parts.join(' ');
}

/**
 * Renders a single statement
 */
function renderStatement(statement: GitStatement): string {
  switch (statement.type) {
    case 'commit':
      return renderCommit(statement);
    case 'branch':
      return renderBranch(statement);
    case 'checkout':
      return renderCheckout(statement);
    case 'merge':
      return renderMerge(statement);
    case 'cherry-pick':
      return renderCherryPick(statement);
  }
}

/**
 * Renders a GitGraphAST to Mermaid syntax
 */
export function renderGitGraph(ast: GitGraphAST, options?: RenderOptions): string {
  const opts = resolveOptions(options);

  // Build header
  let header = 'gitGraph';
  if (ast.direction) {
    header += ` ${ast.direction}:`;
  }

  const doc: Doc = [
    header,

    // Accessibility
    when(ast.accTitle, () => `accTitle: ${ast.accTitle}`),
    when(ast.accDescr, () => `accDescr: ${ast.accDescr}`),

    // Title
    when(ast.title, () => `title ${ast.title}`),

    // Statements
    indent(ast.statements.map(renderStatement)),
  ];

  return render(doc, opts.indent);
}
