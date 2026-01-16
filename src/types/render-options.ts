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
   * Indentation string for nested content.
   * @default "    " (4 spaces)
   */
  indent?: string;

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
 * Default render options
 */
export const DEFAULT_RENDER_OPTIONS: Required<RenderOptions> = {
  indent: "    ",
  inlineClasses: false,
  compactLinks: false,
  sortNodes: false,
};

/**
 * Merge user options with defaults
 */
export function resolveOptions(options?: RenderOptions): Required<RenderOptions> {
  return {
    ...DEFAULT_RENDER_OPTIONS,
    ...options,
  };
}