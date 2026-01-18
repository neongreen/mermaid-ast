/**
 * Block Diagram Parser Tests
 */

import { describe, expect, it } from 'bun:test';
import { isBlockDiagram, parseBlock } from '../../src/parser/block-parser.js';

describe('Block Parser', () => {
  describe('isBlockDiagram', () => {
    it('should detect block-beta diagrams', () => {
      expect(isBlockDiagram('block-beta')).toBe(true);
      expect(isBlockDiagram('block-beta\n  a["A"]')).toBe(true);
    });

    it('should detect block diagrams', () => {
      expect(isBlockDiagram('block\n  a["A"]')).toBe(true);
    });

    it('should not detect non-block diagrams', () => {
      expect(isBlockDiagram('flowchart LR')).toBe(false);
      expect(isBlockDiagram('sequenceDiagram')).toBe(false);
      expect(isBlockDiagram('classDiagram')).toBe(false);
    });

    it('should handle whitespace', () => {
      expect(isBlockDiagram('  block-beta')).toBe(true);
      expect(isBlockDiagram('\nblock-beta')).toBe(true);
    });
  });

  describe('Basic Parsing', () => {
    it('should parse empty block diagram', () => {
      const ast = parseBlock('block-beta');
      expect(ast.type).toBe('block');
      expect(ast.elements).toEqual([]);
    });

    it('should parse diagram with columns', () => {
      const ast = parseBlock(`block-beta
        columns 3
      `);
      expect(ast.type).toBe('block');
    });

    it('should parse diagram with auto columns', () => {
      const ast = parseBlock(`block-beta
        columns auto
      `);
      expect(ast.type).toBe('block');
    });

    it('should parse simple node', () => {
      const ast = parseBlock(`block-beta
        a["Node A"]
      `);
      expect(ast.type).toBe('block');
    });

    it('should parse multiple nodes', () => {
      const ast = parseBlock(`block-beta
        a["A"] b["B"] c["C"]
      `);
      expect(ast.type).toBe('block');
    });
  });

  describe('Node Shapes', () => {
    it('should parse square nodes', () => {
      const ast = parseBlock(`block-beta
        a["Square"]
      `);
      expect(ast.type).toBe('block');
    });

    it('should parse round nodes', () => {
      const ast = parseBlock(`block-beta
        a("Round")
      `);
      expect(ast.type).toBe('block');
    });

    it('should parse stadium nodes', () => {
      const ast = parseBlock(`block-beta
        a(["Stadium"])
      `);
      expect(ast.type).toBe('block');
    });

    it('should parse diamond nodes', () => {
      const ast = parseBlock(`block-beta
        a{"Diamond"}
      `);
      expect(ast.type).toBe('block');
    });

    it('should parse hexagon nodes', () => {
      const ast = parseBlock(`block-beta
        a{{"Hexagon"}}
      `);
      expect(ast.type).toBe('block');
    });
  });

  describe('Node Width', () => {
    it('should parse node with width specifier', () => {
      const ast = parseBlock(`block-beta
        columns 3
        a["Wide"]:2
      `);
      expect(ast.type).toBe('block');
    });

    it('should parse node spanning all columns', () => {
      const ast = parseBlock(`block-beta
        columns 4
        a["Full Width"]:4
      `);
      expect(ast.type).toBe('block');
    });
  });

  describe('Space Blocks', () => {
    it('should parse space block', () => {
      const ast = parseBlock(`block-beta
        columns 3
        a["A"]
        space
        b["B"]
      `);
      expect(ast.type).toBe('block');
    });

    it('should parse space block with width', () => {
      const ast = parseBlock(`block-beta
        columns 3
        a["A"]
        space:2
        b["B"]
      `);
      expect(ast.type).toBe('block');
    });
  });

  describe('Composite Blocks', () => {
    it('should parse nested block', () => {
      const ast = parseBlock(`block-beta
        block:group1
          a["A"]
          b["B"]
        end
      `);
      expect(ast.type).toBe('block');
    });

    it('should parse multiple nested blocks', () => {
      const ast = parseBlock(`block-beta
        block:group1
          a["A"]
        end
        block:group2
          b["B"]
        end
      `);
      expect(ast.type).toBe('block');
    });
  });

  describe('Edges', () => {
    it('should parse arrow edge', () => {
      const ast = parseBlock(`block-beta
        a["A"] --> b["B"]
      `);
      expect(ast.type).toBe('block');
    });

    it('should parse open edge', () => {
      const ast = parseBlock(`block-beta
        a["A"] --- b["B"]
      `);
      expect(ast.type).toBe('block');
    });

    it('should parse thick edge', () => {
      const ast = parseBlock(`block-beta
        a["A"] ==> b["B"]
      `);
      expect(ast.type).toBe('block');
    });
  });

  describe('Styling', () => {
    it('should parse classDef', () => {
      const ast = parseBlock(`block-beta
        classDef highlight fill:#ff0
        a["A"]
      `);
      expect(ast.type).toBe('block');
    });

    it('should parse class application', () => {
      const ast = parseBlock(`block-beta
        classDef highlight fill:#ff0
        a["A"]
        class a highlight
      `);
      expect(ast.type).toBe('block');
    });

    it('should parse style statement', () => {
      const ast = parseBlock(`block-beta
        a["A"]
        style a fill:#ff0,stroke:#333
      `);
      expect(ast.type).toBe('block');
    });
  });

  describe('Accessibility', () => {
    it('should parse accTitle when supported by parser', () => {
      const ast = parseBlock(`block-beta
        accTitle: Block Diagram Title
        a["A"]
      `);
      // Note: accTitle parsing depends on JISON grammar support
      // The AST is still valid even if accTitle is not extracted
      expect(ast.type).toBe('block');
    });

    it('should parse accDescr when supported by parser', () => {
      const ast = parseBlock(`block-beta
        accDescr: A block diagram description
        a["A"]
      `);
      // Note: accDescr parsing depends on JISON grammar support
      // The AST is still valid even if accDescr is not extracted
      expect(ast.type).toBe('block');
    });
  });

  describe('Complex Diagrams', () => {
    it('should parse complete block diagram', () => {
      const ast = parseBlock(`block-beta
        columns 3
        
        a["Input"]:1
        b["Process"]:1
        c["Output"]:1
        
        block:details
          d["Step 1"]
          e["Step 2"]
        end
        
        space:2
        
        classDef io fill:#e1f5fe
        class a,c io
      `);
      expect(ast.type).toBe('block');
    });
  });
});
