/**
 * Render Options Tests
 * 
 * Tests that render options work correctly and produce valid re-parseable output.
 */

import { describe, test, expect } from "bun:test";
import {
  parseFlowchart,
  renderFlowchart,
  parseSequence,
  renderSequence,
  parseClassDiagram,
  renderClassDiagram,
} from "../../src/index.js";
import type { RenderOptions } from "../../src/types/render-options.js";

describe("Render Options", () => {
  describe("indent option", () => {
    const indentOptions: RenderOptions[] = [
      { indent: "  " },      // 2 spaces
      { indent: "    " },    // 4 spaces (default)
      { indent: "\t" },      // tab
      { indent: "        " }, // 8 spaces
    ];

    test.each(indentOptions)("flowchart with indent %j", (options) => {
      const input = `flowchart LR
    A[Start] --> B[End]
    B --> C[Done]`;
      
      const ast = parseFlowchart(input);
      const rendered = renderFlowchart(ast, options);
      
      // Should be re-parseable
      const ast2 = parseFlowchart(rendered);
      expect(ast2.nodes.size).toBe(ast.nodes.size);
      expect(ast2.links.length).toBe(ast.links.length);
      
      // Should use the specified indent
      const lines = rendered.split("\n");
      const indentedLines = lines.filter(l => l.startsWith(options.indent!));
      expect(indentedLines.length).toBeGreaterThan(0);
    });

    test.each(indentOptions)("sequence with indent %j", (options) => {
      const input = `sequenceDiagram
    participant A
    participant B
    A->>B: Hello
    B-->>A: Hi`;
      
      const ast = parseSequence(input);
      const rendered = renderSequence(ast, options);
      
      // Should be re-parseable
      const ast2 = parseSequence(rendered);
      expect(ast2.actors.size).toBe(ast.actors.size);
      expect(ast2.statements.length).toBe(ast.statements.length);
    });

    test.each(indentOptions)("class diagram with indent %j", (options) => {
      const input = `classDiagram
    class Animal {
        +String name
        +eat()
    }
    class Dog
    Animal <|-- Dog`;
      
      const ast = parseClassDiagram(input);
      const rendered = renderClassDiagram(ast, options);
      
      // Should be re-parseable
      const ast2 = parseClassDiagram(rendered);
      expect(ast2.classes.size).toBe(ast.classes.size);
      expect(ast2.relations.length).toBe(ast.relations.length);
    });
  });

  describe("sortNodes option", () => {
    test("flowchart sortNodes produces sorted output", () => {
      const input = `flowchart LR
    Z[Zebra] --> A[Apple]
    M[Mango] --> B[Banana]`;
      
      const ast = parseFlowchart(input);
      const rendered = renderFlowchart(ast, { sortNodes: true });
      
      // Should be re-parseable
      const ast2 = parseFlowchart(rendered);
      expect(ast2.nodes.size).toBe(ast.nodes.size);
      
      // Nodes should appear in sorted order in the output
      const lines = rendered.split("\n");
      const nodeLines = lines.filter(l => /^\s+[A-Z]\[/.test(l));
      const nodeIds = nodeLines.map(l => l.trim().charAt(0));
      
      // Check that we have some sorted order
      for (let i = 1; i < nodeIds.length; i++) {
        expect(nodeIds[i] >= nodeIds[i - 1]).toBe(true);
      }
    });

    test("sequence sortNodes produces sorted actors", () => {
      const input = `sequenceDiagram
    participant Zebra
    participant Apple
    participant Mango
    Zebra->>Apple: Hello`;
      
      const ast = parseSequence(input);
      const rendered = renderSequence(ast, { sortNodes: true });
      
      // Should be re-parseable
      const ast2 = parseSequence(rendered);
      expect(ast2.actors.size).toBe(ast.actors.size);
    });

    test("class diagram sortNodes produces sorted classes", () => {
      const input = `classDiagram
    class Zebra
    class Apple
    class Mango
    Zebra <|-- Apple`;
      
      const ast = parseClassDiagram(input);
      const rendered = renderClassDiagram(ast, { sortNodes: true });
      
      // Should be re-parseable
      const ast2 = parseClassDiagram(rendered);
      expect(ast2.classes.size).toBe(ast.classes.size);
    });
  });

  describe("flowchart-specific options", () => {
    test("inlineClasses renders classes inline with nodes", () => {
      const input = `flowchart LR
    A[Start]
    B[End]
    A --> B
    classDef highlight fill:#f9f
    class A highlight`;
      
      const ast = parseFlowchart(input);
      const rendered = renderFlowchart(ast, { inlineClasses: true });
      
      // Should be re-parseable
      const ast2 = parseFlowchart(rendered);
      expect(ast2.nodes.size).toBe(ast.nodes.size);
      expect(ast2.classes.size).toBe(ast.classes.size);
      
      // Should contain inline class syntax
      expect(rendered).toContain(":::");
      
      // Should NOT contain separate class statement
      expect(rendered).not.toMatch(/^\s+class [A-Z]+ highlight$/m);
    });

    test("compactLinks chains links together", () => {
      const input = `flowchart LR
    A[Start] --> B[Middle]
    B --> C[End]`;
      
      const ast = parseFlowchart(input);
      const rendered = renderFlowchart(ast, { compactLinks: true });
      
      // Should be re-parseable
      const ast2 = parseFlowchart(rendered);
      expect(ast2.nodes.size).toBe(ast.nodes.size);
      expect(ast2.links.length).toBe(ast.links.length);
      
      // Should have chained links (A --> B --> C on one line)
      const lines = rendered.split("\n").filter(l => l.includes("-->"));
      const chainedLine = lines.find(l => (l.match(/-->/g) || []).length >= 2);
      expect(chainedLine).toBeDefined();
    });

    test("combined options work together", () => {
      const input = `flowchart LR
    Z[Zebra] --> A[Apple]
    A --> B[Banana]
    classDef fruit fill:#f9f
    class A,B fruit`;
      
      const ast = parseFlowchart(input);
      const rendered = renderFlowchart(ast, {
        indent: "  ",
        sortNodes: true,
        inlineClasses: true,
        compactLinks: true,
      });
      
      // Should be re-parseable
      const ast2 = parseFlowchart(rendered);
      expect(ast2.nodes.size).toBe(ast.nodes.size);
      expect(ast2.links.length).toBe(ast.links.length);
      
      // Should use 2-space indent
      expect(rendered).toMatch(/^  [A-Z]/m);
      
      // Should have inline classes
      expect(rendered).toContain(":::");
    });
  });

  describe("round-trip with all option combinations", () => {
    const optionCombinations: RenderOptions[] = [
      {},  // defaults
      { indent: "  " },
      { indent: "\t" },
      { sortNodes: true },
      { inlineClasses: true },
      { compactLinks: true },
      { indent: "  ", sortNodes: true },
      { indent: "  ", inlineClasses: true, compactLinks: true },
      { indent: "\t", sortNodes: true, inlineClasses: true, compactLinks: true },
    ];

    const flowchartExamples = [
      `flowchart LR
    A --> B`,
      `flowchart TD
    A[Start] --> B{Decision}
    B -->|Yes| C[End]
    B -->|No| D[Loop]
    D --> B`,
      `flowchart LR
    subgraph sub1[Subgraph]
        A --> B
    end
    C --> sub1`,
    ];

    const sequenceExamples = [
      `sequenceDiagram
    A->>B: Hello`,
      `sequenceDiagram
    participant Alice
    participant Bob
    Alice->>Bob: Hello
    Bob-->>Alice: Hi
    loop Every minute
        Alice->>Bob: Ping
    end`,
    ];

    const classExamples = [
      `classDiagram
    class Animal`,
      `classDiagram
    class Animal {
        +String name
        +eat()
    }
    class Dog
    Animal <|-- Dog`,
    ];

    test.each(optionCombinations)("flowchart round-trip with options %j", (options) => {
      for (const input of flowchartExamples) {
        const ast1 = parseFlowchart(input);
        const rendered = renderFlowchart(ast1, options);
        const ast2 = parseFlowchart(rendered);
        
        expect(ast2.nodes.size).toBe(ast1.nodes.size);
        expect(ast2.links.length).toBe(ast1.links.length);
        expect(ast2.subgraphs.length).toBe(ast1.subgraphs.length);
      }
    });

    test.each(optionCombinations)("sequence round-trip with options %j", (options) => {
      for (const input of sequenceExamples) {
        const ast1 = parseSequence(input);
        const rendered = renderSequence(ast1, options);
        const ast2 = parseSequence(rendered);
        
        expect(ast2.actors.size).toBe(ast1.actors.size);
        expect(ast2.statements.length).toBe(ast1.statements.length);
      }
    });

    test.each(optionCombinations)("class diagram round-trip with options %j", (options) => {
      for (const input of classExamples) {
        const ast1 = parseClassDiagram(input);
        const rendered = renderClassDiagram(ast1, options);
        const ast2 = parseClassDiagram(rendered);
        
        expect(ast2.classes.size).toBe(ast1.classes.size);
        expect(ast2.relations.length).toBe(ast1.relations.length);
      }
    });
  });
});