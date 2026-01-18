/**
 * GitGraph Parser
 *
 * Parses Mermaid gitGraph syntax into a GitGraphAST using @mermaid-js/parser.
 */

import { parse as langiumParse } from '@mermaid-js/parser';
import type {
  GitGraphAST,
  GitGraphDirection,
  GitStatement,
  GitCommit,
  GitBranch,
  GitCheckout,
  GitMerge,
  GitCherryPick,
} from '../types/gitgraph.js';
import { createEmptyGitGraphAST } from '../types/gitgraph.js';

/**
 * Detects if input is a gitGraph diagram
 */
export function isGitGraphDiagram(input: string): boolean {
  const trimmed = input.trim();
  // Match gitGraph followed by end of string, whitespace, colon, or newline
  return /^gitGraph(\s|:|$)/i.test(trimmed);
}

/**
 * Transforms Langium AST to our GitGraphAST
 */
function transformLangiumAST(langiumAST: unknown): GitGraphAST {
  const ast = createEmptyGitGraphAST();

  // Handle undefined/null result (empty gitGraph)
  if (!langiumAST) {
    return ast;
  }

  const parsed = langiumAST as {
    $type: string;
    dir?: string; // Langium uses 'dir' not 'direction'
    statements?: Array<{
      $type: string;
      id?: string;
      message?: string;
      tags?: string[];
      type?: string;
      name?: string;
      order?: number;
      branch?: string;
      parent?: string;
    }>;
  };

  // Extract direction if present (Langium uses 'dir')
  if (parsed.dir) {
    ast.direction = parsed.dir as GitGraphDirection;
  }

  // Transform statements
  if (parsed.statements) {
    for (const stmt of parsed.statements) {
      const statement = transformStatement(stmt);
      if (statement) {
        ast.statements.push(statement);
      }
    }
  }

  return ast;
}

/**
 * Transforms a single Langium statement to our GitStatement
 */
function transformStatement(stmt: {
  $type: string;
  id?: string;
  message?: string;
  tags?: string[];
  type?: string;
  name?: string;
  order?: number;
  branch?: string;
  parent?: string;
}): GitStatement | null {
  switch (stmt.$type) {
    case 'Commit': {
      const commit: GitCommit = {
        type: 'commit',
      };
      if (stmt.id) commit.id = stmt.id;
      if (stmt.message) commit.message = stmt.message;
      if (stmt.tags && stmt.tags.length > 0) commit.tag = stmt.tags[0];
      if (stmt.type) {
        commit.commitType = stmt.type as 'NORMAL' | 'REVERSE' | 'HIGHLIGHT';
      }
      return commit;
    }

    case 'Branch': {
      const branch: GitBranch = {
        type: 'branch',
        name: stmt.name || '',
      };
      if (stmt.order !== undefined) branch.order = stmt.order;
      return branch;
    }

    case 'Checkout': {
      const checkout: GitCheckout = {
        type: 'checkout',
        branch: stmt.branch || '',
      };
      return checkout;
    }

    case 'Merge': {
      const merge: GitMerge = {
        type: 'merge',
        branch: stmt.branch || '',
      };
      if (stmt.id) merge.id = stmt.id;
      if (stmt.tags && stmt.tags.length > 0) merge.tag = stmt.tags[0];
      if (stmt.type) {
        merge.commitType = stmt.type as 'NORMAL' | 'REVERSE' | 'HIGHLIGHT';
      }
      return merge;
    }

    case 'CherryPicking': {
      const cherryPick: GitCherryPick = {
        type: 'cherry-pick',
        id: stmt.id || '',
      };
      if (stmt.tags && stmt.tags.length > 0) cherryPick.tag = stmt.tags[0];
      if (stmt.parent) cherryPick.parent = stmt.parent;
      return cherryPick;
    }

    default:
      return null;
  }
}

/**
 * Parses gitGraph syntax into a GitGraphAST
 */
export async function parseGitGraph(input: string): Promise<GitGraphAST> {
  // The Langium parser returns the AST directly, not wrapped in a value property
  const result = await langiumParse('gitGraph', input);

  // Check for errors - these are properties on the result object for some diagram types
  // but for gitGraph the result IS the AST directly
  const resultAny = result as unknown as Record<string, unknown>;
  if (
    resultAny.lexerErrors &&
    Array.isArray(resultAny.lexerErrors) &&
    resultAny.lexerErrors.length > 0
  ) {
    throw new Error(`Lexer error: ${(resultAny.lexerErrors[0] as { message: string }).message}`);
  }

  if (
    resultAny.parserErrors &&
    Array.isArray(resultAny.parserErrors) &&
    resultAny.parserErrors.length > 0
  ) {
    throw new Error(`Parser error: ${(resultAny.parserErrors[0] as { message: string }).message}`);
  }

  // The result IS the AST directly (has $type, statements, etc.)
  return transformLangiumAST(result);
}
