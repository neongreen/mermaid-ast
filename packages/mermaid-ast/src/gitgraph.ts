/**
 * GitGraph Diagram Wrapper
 *
 * Provides a fluent API for creating and manipulating gitGraph diagrams.
 */

import { DiagramWrapper } from './diagram-wrapper.js';
import { parseGitGraph } from './parser/gitgraph-parser.js';
import { renderGitGraph } from './renderer/gitgraph-renderer.js';
import type {
  GitGraphAST,
  GitGraphDirection,
  GitStatement,
  GitCommit,
  GitBranch,
  GitCheckout,
  GitMerge,
  GitCherryPick,
} from './types/gitgraph.js';
import { createEmptyGitGraphAST } from './types/gitgraph.js';
import type { RenderOptions } from './types/render-options.js';

/**
 * Options for adding a commit
 */
export interface AddCommitOptions {
  id?: string;
  message?: string;
  tag?: string;
  commitType?: 'NORMAL' | 'REVERSE' | 'HIGHLIGHT';
}

/**
 * Options for adding a branch
 */
export interface AddBranchOptions {
  order?: number;
}

/**
 * Options for merging
 */
export interface MergeOptions {
  id?: string;
  tag?: string;
  commitType?: 'NORMAL' | 'REVERSE' | 'HIGHLIGHT';
}

/**
 * Options for cherry-picking
 */
export interface CherryPickOptions {
  tag?: string;
  parent?: string;
}

/**
 * Query for finding commits
 */
export interface FindCommitsQuery {
  id?: string;
  tag?: string;
  commitType?: 'NORMAL' | 'REVERSE' | 'HIGHLIGHT';
}

/**
 * Query for finding branches
 */
export interface FindBranchesQuery {
  name?: string;
}

/**
 * GitGraph diagram wrapper class
 */
export class GitGraph extends DiagramWrapper<GitGraphAST> {
  private constructor(ast: GitGraphAST) {
    super(ast);
  }

  // ============================================
  // Factory Methods
  // ============================================

  /**
   * Creates a new empty gitGraph diagram
   */
  static create(direction?: GitGraphDirection): GitGraph {
    const ast = createEmptyGitGraphAST();
    if (direction) {
      ast.direction = direction;
    }
    return new GitGraph(ast);
  }

  /**
   * Creates a GitGraph from an existing AST
   */
  static from(ast: GitGraphAST): GitGraph {
    return new GitGraph(structuredClone(ast));
  }

  /**
   * Parses gitGraph syntax into a GitGraph instance
   */
  static async parse(text: string): Promise<GitGraph> {
    const ast = await parseGitGraph(text);
    return new GitGraph(ast);
  }

  // ============================================
  // Core Methods
  // ============================================

  /**
   * Renders the diagram to Mermaid syntax
   */
  render(options?: RenderOptions): string {
    return renderGitGraph(this.ast, options);
  }

  /**
   * Creates a deep clone of this diagram
   */
  clone(): GitGraph {
    return GitGraph.from(this.ast);
  }

  // ============================================
  // Direction Operations
  // ============================================

  /**
   * Sets the graph direction
   */
  setDirection(direction: GitGraphDirection): this {
    this.ast.direction = direction;
    return this;
  }

  /**
   * Gets the graph direction
   */
  getDirection(): GitGraphDirection | undefined {
    return this.ast.direction;
  }

  // ============================================
  // Title Operations
  // ============================================

  /**
   * Sets the diagram title
   */
  setTitle(title: string): this {
    this.ast.title = title;
    return this;
  }

  /**
   * Gets the diagram title
   */
  getTitle(): string | undefined {
    return this.ast.title;
  }

  /**
   * Removes the diagram title
   */
  removeTitle(): this {
    this.ast.title = undefined;
    return this;
  }

  // ============================================
  // Accessibility Operations
  // ============================================

  /**
   * Sets the accessibility title
   */
  setAccTitle(title: string): this {
    this.ast.accTitle = title;
    return this;
  }

  /**
   * Gets the accessibility title
   */
  getAccTitle(): string | undefined {
    return this.ast.accTitle;
  }

  /**
   * Sets the accessibility description
   */
  setAccDescr(descr: string): this {
    this.ast.accDescr = descr;
    return this;
  }

  /**
   * Gets the accessibility description
   */
  getAccDescr(): string | undefined {
    return this.ast.accDescr;
  }

  // ============================================
  // Commit Operations
  // ============================================

  /**
   * Adds a commit
   */
  commit(options?: AddCommitOptions): this {
    const commit: GitCommit = {
      type: 'commit',
    };
    if (options?.id) commit.id = options.id;
    if (options?.message) commit.message = options.message;
    if (options?.tag) commit.tag = options.tag;
    if (options?.commitType) commit.commitType = options.commitType;

    this.ast.statements.push(commit);
    return this;
  }

  /**
   * Gets the number of commits
   */
  get commitCount(): number {
    return this.ast.statements.filter((s) => s.type === 'commit').length;
  }

  /**
   * Finds commits matching the query
   */
  findCommits(query?: FindCommitsQuery): GitCommit[] {
    const commits = this.ast.statements.filter((s): s is GitCommit => s.type === 'commit');

    if (!query) return commits;

    return commits.filter((commit) => {
      if (query.id && commit.id !== query.id) return false;
      if (query.tag && commit.tag !== query.tag) return false;
      if (query.commitType && commit.commitType !== query.commitType) return false;
      return true;
    });
  }

  /**
   * Gets a commit by ID
   */
  getCommit(id: string): GitCommit | undefined {
    return this.ast.statements.find((s): s is GitCommit => s.type === 'commit' && s.id === id);
  }

  // ============================================
  // Branch Operations
  // ============================================

  /**
   * Creates a new branch
   */
  branch(name: string, options?: AddBranchOptions): this {
    const branch: GitBranch = {
      type: 'branch',
      name,
    };
    if (options?.order !== undefined) branch.order = options.order;

    this.ast.statements.push(branch);
    return this;
  }

  /**
   * Checks out a branch
   */
  checkout(branchName: string): this {
    const checkout: GitCheckout = {
      type: 'checkout',
      branch: branchName,
    };
    this.ast.statements.push(checkout);
    return this;
  }

  /**
   * Gets the number of branches
   */
  get branchCount(): number {
    return this.ast.statements.filter((s) => s.type === 'branch').length;
  }

  /**
   * Finds branches matching the query
   */
  findBranches(query?: FindBranchesQuery): GitBranch[] {
    const branches = this.ast.statements.filter((s): s is GitBranch => s.type === 'branch');

    if (!query) return branches;

    return branches.filter((branch) => {
      if (query.name && branch.name !== query.name) return false;
      return true;
    });
  }

  /**
   * Gets a branch by name
   */
  getBranch(name: string): GitBranch | undefined {
    return this.ast.statements.find((s): s is GitBranch => s.type === 'branch' && s.name === name);
  }

  // ============================================
  // Merge Operations
  // ============================================

  /**
   * Merges a branch into the current branch
   */
  merge(branchName: string, options?: MergeOptions): this {
    const merge: GitMerge = {
      type: 'merge',
      branch: branchName,
    };
    if (options?.id) merge.id = options.id;
    if (options?.tag) merge.tag = options.tag;
    if (options?.commitType) merge.commitType = options.commitType;

    this.ast.statements.push(merge);
    return this;
  }

  /**
   * Gets the number of merges
   */
  get mergeCount(): number {
    return this.ast.statements.filter((s) => s.type === 'merge').length;
  }

  // ============================================
  // Cherry-pick Operations
  // ============================================

  /**
   * Cherry-picks a commit
   */
  cherryPick(commitId: string, options?: CherryPickOptions): this {
    const cherryPick: GitCherryPick = {
      type: 'cherry-pick',
      id: commitId,
    };
    if (options?.tag) cherryPick.tag = options.tag;
    if (options?.parent) cherryPick.parent = options.parent;

    this.ast.statements.push(cherryPick);
    return this;
  }

  // ============================================
  // General Statement Operations
  // ============================================

  /**
   * Gets all statements
   */
  getStatements(): GitStatement[] {
    return [...this.ast.statements];
  }

  /**
   * Gets the total number of statements
   */
  get statementCount(): number {
    return this.ast.statements.length;
  }
}
