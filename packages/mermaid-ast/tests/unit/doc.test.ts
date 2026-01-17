/**
 * Document Builder Tests
 */

import { describe, expect, test } from 'bun:test';
import {
  blank,
  block,
  type Doc,
  indent,
  isBlank,
  isIndent,
  join,
  render,
  when,
} from '../../src/renderer/doc.js';

describe('Doc Builder', () => {
  describe('render', () => {
    test('renders a simple string', () => {
      const doc: Doc = 'hello';
      expect(render(doc)).toBe('hello');
    });

    test('renders an array of strings as separate lines', () => {
      const doc: Doc = ['line 1', 'line 2', 'line 3'];
      expect(render(doc)).toBe('line 1\nline 2\nline 3');
    });

    test('renders nested arrays flattened', () => {
      const doc: Doc = ['a', ['b', 'c'], 'd'];
      expect(render(doc)).toBe('a\nb\nc\nd');
    });

    test('skips null values', () => {
      const doc: Doc = ['a', null, 'b'];
      expect(render(doc)).toBe('a\nb');
    });

    test('skips undefined values', () => {
      const doc: Doc = ['a', undefined, 'b'];
      expect(render(doc)).toBe('a\nb');
    });

    test('skips false values', () => {
      const doc: Doc = ['a', false, 'b'];
      expect(render(doc)).toBe('a\nb');
    });

    test('skips empty strings', () => {
      const doc: Doc = ['a', '', 'b'];
      expect(render(doc)).toBe('a\nb');
    });
  });

  describe('indent', () => {
    test('indents content by one level', () => {
      const doc: Doc = ['parent', indent(['child'])];
      expect(render(doc)).toBe('parent\n    child');
    });

    test('indents multiple lines', () => {
      const doc: Doc = ['parent', indent(['child 1', 'child 2'])];
      expect(render(doc)).toBe('parent\n    child 1\n    child 2');
    });

    test('supports nested indentation', () => {
      const doc: Doc = ['level 0', indent(['level 1', indent(['level 2'])])];
      expect(render(doc)).toBe('level 0\n    level 1\n        level 2');
    });

    test('uses custom indent string', () => {
      const doc: Doc = ['parent', indent(['child'])];
      expect(render(doc, '  ')).toBe('parent\n  child');
    });

    test('uses tab indent', () => {
      const doc: Doc = ['parent', indent(['child'])];
      expect(render(doc, '\t')).toBe('parent\n\tchild');
    });
  });

  describe('when', () => {
    test('includes doc when condition is true', () => {
      const doc: Doc = ['a', when(true, 'b'), 'c'];
      expect(render(doc)).toBe('a\nb\nc');
    });

    test('excludes doc when condition is false', () => {
      const doc: Doc = ['a', when(false, 'b'), 'c'];
      expect(render(doc)).toBe('a\nc');
    });

    test('includes doc when condition is truthy', () => {
      const doc: Doc = ['a', when('truthy', 'b'), 'c'];
      expect(render(doc)).toBe('a\nb\nc');
    });

    test('excludes doc when condition is null', () => {
      const doc: Doc = ['a', when(null, 'b'), 'c'];
      expect(render(doc)).toBe('a\nc');
    });

    test('excludes doc when condition is undefined', () => {
      const doc: Doc = ['a', when(undefined, 'b'), 'c'];
      expect(render(doc)).toBe('a\nc');
    });

    test('excludes doc when condition is 0', () => {
      const doc: Doc = ['a', when(0, 'b'), 'c'];
      expect(render(doc)).toBe('a\nc');
    });

    test('includes doc when condition is non-zero number', () => {
      const doc: Doc = ['a', when(1, 'b'), 'c'];
      expect(render(doc)).toBe('a\nb\nc');
    });
  });

  describe('block', () => {
    test('creates a block with open, body, close', () => {
      const doc = block('class Foo {', ['+name', '+age'], '}');
      expect(render(doc)).toBe('class Foo {\n    +name\n    +age\n}');
    });

    test('creates an empty block', () => {
      const doc = block('subgraph sub1', [], 'end');
      expect(render(doc)).toBe('subgraph sub1\nend');
    });

    test('supports nested blocks', () => {
      const doc = block('outer {', ['a', block('inner {', ['b'], '}')], '}');
      expect(render(doc)).toBe('outer {\n    a\n    inner {\n        b\n    }\n}');
    });
  });

  describe('join', () => {
    test('joins docs with separator', () => {
      const doc = join(['a', 'b', 'c'], ', ');
      // Note: join returns a flat array, each element becomes a line
      // For inline joining, you'd need to handle differently
      expect(render(doc)).toBe('a\n, \nb\n, \nc');
    });

    test('returns single element unchanged', () => {
      const doc = join(['a'], ', ');
      expect(render(doc)).toBe('a');
    });

    test('returns empty for empty array', () => {
      const doc = join([], ', ');
      expect(render(doc)).toBe('');
    });
  });

  describe('isIndent', () => {
    test('returns true for indent nodes', () => {
      expect(isIndent(indent('test'))).toBe(true);
    });

    test('returns false for strings', () => {
      expect(isIndent('test')).toBe(false);
    });

    test('returns false for arrays', () => {
      expect(isIndent(['a', 'b'])).toBe(false);
    });

    test('returns false for null', () => {
      expect(isIndent(null)).toBe(false);
    });
  });

  describe('isBlank', () => {
    test('returns true for blank nodes', () => {
      expect(isBlank(blank)).toBe(true);
    });

    test('returns false for strings', () => {
      expect(isBlank('test')).toBe(false);
    });

    test('returns false for arrays', () => {
      expect(isBlank(['a', 'b'])).toBe(false);
    });

    test('returns false for null', () => {
      expect(isBlank(null)).toBe(false);
    });

    test('returns false for indent nodes', () => {
      expect(isBlank(indent('test'))).toBe(false);
    });
  });

  describe('real-world examples', () => {
    test('renders a class diagram', () => {
      const doc: Doc = [
        'classDiagram',
        indent([block('class Animal {', ['+String name', '+eat()'], '}'), 'Animal <|-- Dog']),
      ];

      const expected = `classDiagram
    class Animal {
        +String name
        +eat()
    }
    Animal <|-- Dog`;

      expect(render(doc)).toBe(expected);
    });

    test('renders a flowchart with conditional direction', () => {
      const direction: string = 'TB';
      const doc: Doc = [
        'flowchart LR',
        when(direction !== 'LR', `direction ${direction}`),
        indent(['A[Start] --> B[End]']),
      ];

      const expected = `flowchart LR
direction TB
    A[Start] --> B[End]`;

      expect(render(doc)).toBe(expected);
    });

    test('renders a sequence diagram', () => {
      const doc: Doc = [
        'sequenceDiagram',
        indent([
          'participant A',
          'participant B',
          'A->>B: Hello',
          block('loop Every minute', ['A->>B: Ping'], 'end'),
        ]),
      ];

      const expected = `sequenceDiagram
    participant A
    participant B
    A->>B: Hello
    loop Every minute
        A->>B: Ping
    end`;

      expect(render(doc)).toBe(expected);
    });
  });
});
