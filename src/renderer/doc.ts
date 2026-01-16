/**
 * Document Builder for Pretty-Printing
 *
 * A lightweight, composable document builder for generating formatted text output.
 * Inspired by Wadler's "A Prettier Printer" but simplified for predictable output
 * (no automatic line-breaking decisions).
 *
 * @example Basic usage
 * ```typescript
 * import { Doc, indent, render } from './doc.js';
 *
 * const doc: Doc = [
 *   'classDiagram',
 *   indent([
 *     'class Animal {',
 *     indent(['+String name', '+eat()']),
 *     '}',
 *   ]),
 * ];
 *
 * console.log(render(doc));
 * // classDiagram
 * //     class Animal {
 * //         +String name
 * //         +eat()
 * //     }
 * ```
 *
 * @example With helpers
 * ```typescript
 * import { Doc, indent, block, when, blank, render } from './doc.js';
 *
 * const doc: Doc = [
 *   'flowchart LR',
 *   when(hasTitle, () => `title ${title}`),
 *   indent([
 *     block('subgraph sub1', nodes.map(renderNode), 'end'),
 *     blank,
 *     'A --> B',
 *   ]),
 * ];
 * ```
 *
 * @module
 */

/**
 * A document node that can be rendered to a string.
 *
 * Documents are composable - you can nest them arbitrarily:
 * - `string` - Literal text (rendered as a single line)
 * - `Doc[]` - Concatenation of documents (each rendered on its own line)
 * - `{ _indent: Doc }` - Indented content (increases indent level)
 * - `{ _blank: true }` - An empty line (no indentation)
 * - `null | undefined | false` - Skipped (useful for conditional rendering)
 *
 * @example
 * ```typescript
 * // Simple string
 * const a: Doc = 'hello';
 *
 * // Array of strings (each on its own line)
 * const b: Doc = ['line 1', 'line 2', 'line 3'];
 *
 * // Nested with indentation
 * const c: Doc = [
 *   'parent',
 *   indent(['child 1', 'child 2']),
 * ];
 *
 * // Conditional content
 * const d: Doc = [
 *   'always shown',
 *   condition ? 'sometimes shown' : null,
 * ];
 *
 * // With blank lines for visual separation
 * const e: Doc = [
 *   'section 1',
 *   blank,
 *   'section 2',
 * ];
 * ```
 */
export type Doc = string | Doc[] | { _indent: Doc } | { _blank: true } | null | undefined | false;

/**
 * An empty line marker.
 *
 * Use this to add visual separation between sections.
 * Unlike an empty string, this produces an actual blank line in the output.
 *
 * @example
 * ```typescript
 * const doc: Doc = [
 *   'class Foo {',
 *   indent([
 *     '+name: string',
 *     blank,
 *     '+getName(): string',
 *   ]),
 *   '}',
 * ];
 *
 * render(doc);
 * // class Foo {
 * //     +name: string
 * //
 * //     +getName(): string
 * // }
 * ```
 */
export const blank: Doc = { _blank: true };

/**
 * Increases the indentation level for the given content.
 *
 * The actual indent string is determined at render time via {@link render}.
 *
 * @param content - The document content to indent
 * @returns A document node with increased indentation
 *
 * @example
 * ```typescript
 * const doc: Doc = [
 *   'class Foo {',
 *   indent([
 *     '+name: string',
 *     '+age: number',
 *   ]),
 *   '}',
 * ];
 *
 * render(doc);
 * // class Foo {
 * //     +name: string
 * //     +age: number
 * // }
 * ```
 */
export const indent = (content: Doc): Doc => ({ _indent: content });

/**
 * Conditionally includes a document.
 *
 * Returns the document if the condition is truthy, otherwise returns `null`
 * (which is skipped during rendering).
 *
 * The document can be provided directly or as a function (lazy evaluation).
 * Use the function form when the document is expensive to compute.
 *
 * @param condition - The condition to evaluate
 * @param doc - The document to include if condition is truthy, or a function that returns it
 * @returns The document or null
 *
 * @example Direct value
 * ```typescript
 * const doc: Doc = [
 *   'flowchart LR',
 *   when(direction !== 'LR', `direction ${direction}`),
 *   indent(nodes),
 * ];
 * ```
 *
 * @example Lazy evaluation (function)
 * ```typescript
 * const doc: Doc = [
 *   'flowchart LR',
 *   when(hasComplexSubgraph, () => renderComplexSubgraph(data)),
 *   indent(nodes),
 * ];
 * ```
 */
export const when = (condition: unknown, doc: Doc | (() => Doc)): Doc => {
  if (!condition) return null;
  return typeof doc === 'function' ? doc() : doc;
};

/**
 * Options for the block helper.
 */
export interface BlockOptions {
  /**
   * Whether to indent the body content.
   * Set to false for blocks where the body should not be indented
   * (e.g., alt/else sections in sequence diagrams).
   * @default true
   */
  indent?: boolean;
}

/**
 * Creates a block structure with opening line, body, and closing line.
 *
 * This is a common pattern for class definitions, subgraphs, loops, etc.
 * By default, the body is indented. Use `options.indent: false` to disable.
 *
 * @param open - The opening line (e.g., 'class Foo {', 'subgraph sub1')
 * @param body - The body content (will be indented by default)
 * @param close - The closing line (e.g., '}', 'end')
 * @param options - Optional settings for the block
 * @returns A document representing the block
 *
 * @example Default (indented body)
 * ```typescript
 * const doc = block(
 *   'class Animal {',
 *   ['+name: string', '+eat()'],
 *   '}'
 * );
 *
 * render(doc);
 * // class Animal {
 * //     +name: string
 * //     +eat()
 * // }
 * ```
 *
 * @example No indent (for alt/else sections)
 * ```typescript
 * const doc = block(
 *   'alt condition',
 *   ['A->>B: message'],
 *   'end',
 *   { indent: false }
 * );
 *
 * render(doc);
 * // alt condition
 * // A->>B: message
 * // end
 * ```
 *
 * @example Nested blocks
 * ```typescript
 * const doc = block(
 *   'subgraph outer',
 *   [
 *     'A --> B',
 *     block('subgraph inner', ['C --> D'], 'end'),
 *   ],
 *   'end'
 * );
 * ```
 */
export const block = (open: string, body: Doc, close: string, options?: BlockOptions): Doc => {
  const shouldIndent = options?.indent !== false;
  return [open, shouldIndent ? indent(body) : body, close];
};

/**
 * Joins multiple documents with a separator document between each.
 *
 * Similar to `Array.join()` but for documents. Filters out falsy values
 * before joining.
 *
 * @param docs - The documents to join
 * @param separator - The separator to insert between documents
 * @returns A flattened document array with separators
 *
 * @example Join with comma
 * ```typescript
 * const items = ['a', 'b', 'c'];
 * const doc = join(items, ', ');
 * render(doc); // 'a, b, c' (on one line since separator isn't a newline)
 * ```
 *
 * @example Join with blank line
 * ```typescript
 * const sections = [renderClasses(), renderRelations()];
 * const doc = join(sections, blank);
 * // Adds blank line between sections
 * ```
 */
export const join = (docs: Doc[], separator: Doc): Doc => {
  const filtered = docs.filter((d): d is Exclude<Doc, null | undefined | false> => Boolean(d));
  return filtered.flatMap((d, i) => (i === 0 ? [d] : [separator, d]));
};

/**
 * Renders a document to a string.
 *
 * Each document node is rendered on its own line. Indentation is applied
 * based on the nesting of `indent()` calls.
 *
 * @param doc - The document to render
 * @param indentStr - The string to use for each indent level (default: 4 spaces)
 * @returns The rendered string
 *
 * @example Default indent (4 spaces)
 * ```typescript
 * const doc: Doc = ['parent', indent(['child'])];
 * render(doc);
 * // parent
 * //     child
 * ```
 *
 * @example Custom indent (2 spaces)
 * ```typescript
 * render(doc, '  ');
 * // parent
 * //   child
 * ```
 *
 * @example Tab indent
 * ```typescript
 * render(doc, '\t');
 * // parent
 * // \tchild
 * ```
 */
export function render(doc: Doc, indentStr = '    '): string {
  const lines: string[] = [];

  function walk(d: Doc, level: number): void {
    // Skip falsy values (null, undefined, false)
    // Note: empty string '' is falsy but we skip it intentionally
    if (!d) return;

    if (typeof d === 'string') {
      // String = single line with current indentation
      lines.push(indentStr.repeat(level) + d);
    } else if (Array.isArray(d)) {
      // Array = concatenation, each child on its own line
      for (const child of d) {
        walk(child, level);
      }
    } else if (typeof d === 'object' && '_indent' in d) {
      // Indent marker = increase level for content
      walk(d._indent, level + 1);
    } else if (typeof d === 'object' && '_blank' in d) {
      // Blank line marker = empty line (no indentation)
      lines.push('');
    }
  }

  walk(doc, 0);
  return lines.join('\n');
}

/**
 * Type guard to check if a value is a Doc indent node.
 *
 * @param d - The value to check
 * @returns True if the value is an indent node
 */
export function isIndent(d: Doc): d is { _indent: Doc } {
  return typeof d === 'object' && d !== null && '_indent' in d;
}

/**
 * Type guard to check if a value is a Doc blank node.
 *
 * @param d - The value to check
 * @returns True if the value is a blank node
 */
export function isBlank(d: Doc): d is { _blank: true } {
  return typeof d === 'object' && d !== null && '_blank' in d;
}
