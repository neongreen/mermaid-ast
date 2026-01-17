/**
 * Render Options
 *
 * Options for controlling the output format when rendering ASTs to Mermaid syntax.
 */

/**
 * Options for rendering Mermaid diagrams
 */
export interface RenderOptions {
  /**
   * Number of spaces for indentation, or 'tab' for tab character.
   * @default 4
   * @example
   * ```typescript
   * render(ast, { indent: 2 })    // 2 spaces
   * render(ast, { indent: 4 })    // 4 spaces (default)
   * render(ast, { indent: 'tab' }) // tab character
   * ```
   */
  indent?: number | 'tab';

  /**
   * Use inline class syntax (A:::className) instead of separate class statements.
   * Only applies to flowchart diagrams.
   * @default false
   */
  inlineClasses?: boolean;

  /**
   * Chain consecutive links from the same source (A --> B --> C).
   * Only applies to flowchart diagrams.
   * @default false
   */
  compactLinks?: boolean;

  /**
   * Sort node declarations alphabetically by ID.
   * @default false
   */
  sortNodes?: boolean;
}

/**
 * Internal resolved options with indent as string
 * @internal
 */
export interface ResolvedRenderOptions {
  indent: string;
  inlineClasses: boolean;
  compactLinks: boolean;
  sortNodes: boolean;
}

/**
 * Default render options
 */
export const DEFAULT_RENDER_OPTIONS: ResolvedRenderOptions = {
  indent: '    ',
  inlineClasses: false,
  compactLinks: false,
  sortNodes: false,
};

/**
 * Convert indent option to string
 */
function resolveIndent(indent: number | 'tab' | undefined): string {
  if (indent === undefined) {
    return DEFAULT_RENDER_OPTIONS.indent;
  }
  if (indent === 'tab') {
    return '\t';
  }
  return ' '.repeat(indent);
}

/**
 * Merge user options with defaults
 */
export function resolveOptions(options?: RenderOptions): ResolvedRenderOptions {
  return {
    indent: resolveIndent(options?.indent),
    inlineClasses: options?.inlineClasses ?? DEFAULT_RENDER_OPTIONS.inlineClasses,
    compactLinks: options?.compactLinks ?? DEFAULT_RENDER_OPTIONS.compactLinks,
    sortNodes: options?.sortNodes ?? DEFAULT_RENDER_OPTIONS.sortNodes,
  };
}
