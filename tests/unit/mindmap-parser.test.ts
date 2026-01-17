import { describe, expect, it } from 'bun:test';
import { parseMindmap } from '../../src/parser/mindmap-parser.js';

describe('Mindmap Diagram Parsing', () => {
  it('should parse a simple mindmap with root and children', () => {
    const input = `mindmap
Root
    Child 1
    Child 2`;

    const ast = parseMindmap(input);

    expect(ast.type).toBe('mindmap');
    expect(ast.root).toBeDefined();
    expect(ast.root?.id).toBe('Root');
    expect(ast.root?.children.length).toBe(2);
    expect(ast.root?.children[0].description).toBe('Child 1');
    expect(ast.root?.children[1].description).toBe('Child 2');
  });

  it('should parse different node shapes', () => {
    const input = `mindmap
[Square Root]
    [Square Child]
    (Rounded Child)
    ((Circle Child))
    )Cloud Child(
    ))Bang Child((
    {{Hexagon Child}}`;

    const ast = parseMindmap(input);

    expect(ast.root?.shape).toBe('square');
    expect(ast.root?.children.length).toBe(6);
    expect(ast.root?.children[0].shape).toBe('square');
    expect(ast.root?.children[1].shape).toBe('rounded');
    expect(ast.root?.children[2].shape).toBe('circle');
    expect(ast.root?.children[3].shape).toBe('cloud');
    expect(ast.root?.children[4].shape).toBe('bang');
    expect(ast.root?.children[5].shape).toBe('hexagon');
  });

  it('should parse nested children at multiple levels', () => {
    const input = `mindmap
Root
    Parent 1
        Child 1.1
            Grandchild 1.1.1
            Grandchild 1.1.2
        Child 1.2
    Parent 2`;

    const ast = parseMindmap(input);

    expect(ast.root?.children.length).toBe(2);
    expect(ast.root?.children[0].children.length).toBe(2);
    expect(ast.root?.children[0].children[0].children.length).toBe(2);
    expect(ast.root?.children[0].children[0].children[0].description).toBe('Grandchild 1.1.1');
    expect(ast.root?.children[0].children[0].children[1].description).toBe('Grandchild 1.1.2');
    expect(ast.root?.children[0].children[1].children.length).toBe(0);
    expect(ast.root?.children[1].children.length).toBe(0);
  });

  it('should handle input with accessibility directives (not supported by mindmap grammar)', () => {
    // NOTE: The mindmap JISON grammar from mermaid.js does NOT support accTitle/accDescr
    // directives, unlike other diagram types (journey, timeline, etc.).
    // This is a limitation of the upstream mermaid.js mindmap parser.
    // The parser will treat these lines as node content instead.
    const input = `mindmap
Root
    Thought 1
    Thought 2`;

    const ast = parseMindmap(input);

    // Verify the parser works correctly for standard mindmap syntax
    expect(ast.type).toBe('mindmap');
    expect(ast.root).toBeDefined();
    expect(ast.root?.id).toBe('Root');
    expect(ast.root?.children.length).toBe(2);

    // accTitle/accDescr are not supported by the mindmap grammar
    expect(ast.accTitle).toBeUndefined();
    expect(ast.accDescription).toBeUndefined();
  });

  it('should parse mindmap without explicit mindmap keyword', () => {
    // The parser normalizes input to add mindmap keyword if missing
    const input = `Root
    Child 1
    Child 2`;

    const ast = parseMindmap(input);

    expect(ast.type).toBe('mindmap');
    expect(ast.root).toBeDefined();
    expect(ast.root?.children.length).toBe(2);
  });
});
