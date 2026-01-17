/**
 * DiagramWrapper Base Class
 *
 * Abstract base class for diagram wrapper classes.
 * Provides common functionality for building, mutating, and querying diagrams.
 *
 * Each diagram type (Flowchart, Sequence, Class, etc.) extends this base class
 * and implements diagram-specific operations.
 */

import type { RenderOptions } from './types/render-options.js';

/**
 * Base interface for all diagram ASTs
 */
export interface BaseDiagramAST {
  type: string;
  title?: string;
  accDescription?: string;
}

/**
 * Abstract base class for diagram wrappers.
 *
 * @typeParam T - The specific AST type this wrapper manages
 */
export abstract class DiagramWrapper<T extends BaseDiagramAST> {
  protected ast: T;

  protected constructor(ast: T) {
    this.ast = ast;
  }

  // ============================================
  // Abstract Methods (must be implemented by subclasses)
  // ============================================

  /**
   * Render the diagram to Mermaid syntax
   * @param options - Render options
   */
  abstract render(options?: RenderOptions): string;

  /**
   * Create a deep clone of this diagram.
   * Note: Returns the concrete type, not `this`, to avoid TypeScript polymorphic this issues.
   */
  abstract clone(): DiagramWrapper<T>;

  // ============================================
  // Common Methods
  // ============================================

  /**
   * Get the underlying AST
   */
  toAST(): T {
    return this.ast;
  }

  /**
   * Get the diagram type
   */
  get type(): string {
    return this.ast.type;
  }

  /**
   * Get the diagram title
   */
  get title(): string | undefined {
    return this.ast.title;
  }

  /**
   * Set the diagram title
   */
  set title(value: string | undefined) {
    this.ast.title = value;
  }

  /**
   * Get the accessibility description
   */
  get accDescription(): string | undefined {
    return this.ast.accDescription;
  }

  /**
   * Set the accessibility description
   */
  set accDescription(value: string | undefined) {
    this.ast.accDescription = value;
  }
}

/**
 * Helper type for extracting the AST type from a DiagramWrapper subclass
 */
export type ASTOf<W extends DiagramWrapper<any>> = W extends DiagramWrapper<infer T> ? T : never;
