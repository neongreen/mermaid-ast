/**
 * GitGraph Diagram AST Types
 *
 * Represents the structure of a Mermaid gitGraph diagram.
 */

/**
 * Git commit statement
 */
export interface GitCommit {
  type: 'commit';
  id?: string;
  message?: string;
  tag?: string;
  commitType?: 'NORMAL' | 'REVERSE' | 'HIGHLIGHT';
}

/**
 * Git branch statement
 */
export interface GitBranch {
  type: 'branch';
  name: string;
  order?: number;
}

/**
 * Git checkout statement
 */
export interface GitCheckout {
  type: 'checkout';
  branch: string;
}

/**
 * Git merge statement
 */
export interface GitMerge {
  type: 'merge';
  branch: string;
  id?: string;
  tag?: string;
  commitType?: 'NORMAL' | 'REVERSE' | 'HIGHLIGHT';
}

/**
 * Git cherry-pick statement
 */
export interface GitCherryPick {
  type: 'cherry-pick';
  id: string;
  tag?: string;
  parent?: string;
}

/**
 * Union type for all git statements
 */
export type GitStatement = GitCommit | GitBranch | GitCheckout | GitMerge | GitCherryPick;

/**
 * GitGraph diagram direction
 */
export type GitGraphDirection = 'LR' | 'TB' | 'BT';

/**
 * GitGraph AST
 */
export interface GitGraphAST {
  type: 'gitGraph';
  direction?: GitGraphDirection;
  statements: GitStatement[];
  title?: string;
  accTitle?: string;
  accDescr?: string;
}

/**
 * Creates an empty GitGraph AST
 */
export function createEmptyGitGraphAST(): GitGraphAST {
  return {
    type: 'gitGraph',
    statements: [],
  };
}
