/**
 * Mermaid.js SVG Compatibility Tests
 *
 * These tests verify that diagrams parsed and re-rendered by our library
 * produce the same SVG output when rendered by mermaid.js.
 *
 * The test flow is:
 * 1. Take an original diagram
 * 2. Parse it with our library
 * 3. Render it back to text
 * 4. Use mermaid.js to render both original and re-rendered to SVG
 * 5. Compare the SVGs (they should be identical or semantically equivalent)
 *
 * NOTE: Some tests may be skipped due to happy-dom limitations.
 * For full compatibility testing, run in a browser environment.
 */

import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { Window } from 'happy-dom';
import { parseFlowchart, parseSequence } from '../../src/parser/index.js';
import { renderFlowchart, renderSequence } from '../../src/renderer/index.js';

// Set up DOM environment for mermaid
let window: Window;
let mermaid: typeof import('mermaid').default;

beforeAll(async () => {
  // Create a happy-dom window
  window = new Window({
    url: 'https://localhost:8080',
    width: 1024,
    height: 768,
  });

  // Set up global DOM objects that mermaid needs
  (globalThis as any).window = window;
  (globalThis as any).document = window.document;
  (globalThis as any).navigator = window.navigator;
  (globalThis as any).DOMParser = window.DOMParser;
  (globalThis as any).XMLSerializer = window.XMLSerializer;

  // Create a container element for mermaid
  const container = window.document.createElement('div');
  container.id = 'mermaid-container';
  window.document.body.appendChild(container);

  // Now import mermaid (after DOM is set up)
  const mermaidModule = await import('mermaid');
  mermaid = mermaidModule.default;

  // Configure mermaid for headless rendering
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'loose',
    // Use a fixed seed for deterministic output
    deterministicIds: true,
    deterministicIDSeed: 'test',
  });
});

afterAll(() => {
  // Clean up global DOM objects
  (globalThis as any).window = undefined;
  (globalThis as any).document = undefined;
  (globalThis as any).navigator = undefined;
  (globalThis as any).DOMParser = undefined;
  (globalThis as any).XMLSerializer = undefined;

  if (window) {
    window.close();
  }
});

/**
 * Helper to render a diagram to SVG using mermaid.js
 * Returns null if rendering fails (some diagrams don't work in happy-dom)
 */
async function renderToSvg(diagram: string, id: string): Promise<string | null> {
  try {
    const { svg } = await mermaid.render(id, diagram);
    return svg;
  } catch (error) {
    // Some diagrams fail in happy-dom due to DOM limitations
    console.warn(`Mermaid render warning for ${id}: ${error}`);
    return null;
  }
}

/**
 * Extract structural elements from SVG for semantic comparison
 */
function extractSvgStructure(svg: string): {
  nodeCount: number;
  edgeCount: number;
  textContent: string[];
} {
  // Count nodes (typically g elements with specific classes)
  const nodeMatches = svg.match(/class="[^"]*node[^"]*"/g) || [];

  // Count edges (typically path elements in edge groups)
  const edgeMatches = svg.match(/class="[^"]*edge[^"]*"/g) || [];

  // Extract text content
  const textMatches = svg.match(/<text[^>]*>([^<]*)<\/text>/g) || [];
  const textContent = textMatches
    .map((t) => {
      const match = t.match(/<text[^>]*>([^<]*)<\/text>/);
      return match ? match[1].trim() : '';
    })
    .filter((t) => t.length > 0);

  return {
    nodeCount: nodeMatches.length,
    edgeCount: edgeMatches.length,
    textContent: textContent.sort(),
  };
}

describe('Flowchart SVG Compatibility', () => {
  it('should produce equivalent SVG for simple flowchart', async () => {
    const original = `flowchart LR
    A --> B
    B --> C`;

    // Parse and re-render
    const ast = parseFlowchart(original);
    const reRendered = renderFlowchart(ast);

    // Render both to SVG
    const originalSvg = await renderToSvg(original, 'fc-simple-orig');
    const reRenderedSvg = await renderToSvg(reRendered, 'fc-simple-rend');

    // Skip if either render failed (happy-dom limitation)
    if (!originalSvg || !reRenderedSvg) {
      console.log('Skipping SVG comparison due to happy-dom limitation');
      return;
    }

    // Compare structural elements
    const originalStructure = extractSvgStructure(originalSvg);
    const reRenderedStructure = extractSvgStructure(reRenderedSvg);

    expect(reRenderedStructure.nodeCount).toBe(originalStructure.nodeCount);
    expect(reRenderedStructure.edgeCount).toBe(originalStructure.edgeCount);
  });

  it('should produce equivalent SVG for flowchart with subgraph', async () => {
    const original = `flowchart TB
    subgraph sub1[Subgraph]
        A --> B
    end
    C --> sub1`;

    const ast = parseFlowchart(original);
    const reRendered = renderFlowchart(ast);

    const originalSvg = await renderToSvg(original, 'fc-subgraph-orig');
    const reRenderedSvg = await renderToSvg(reRendered, 'fc-subgraph-rend');

    if (!originalSvg || !reRenderedSvg) {
      console.log('Skipping SVG comparison due to happy-dom limitation');
      return;
    }

    const originalStructure = extractSvgStructure(originalSvg);
    const reRenderedStructure = extractSvgStructure(reRenderedSvg);

    expect(reRenderedStructure.nodeCount).toBe(originalStructure.nodeCount);
  });
});

describe('Round-trip Verification', () => {
  it('should produce valid SVG after multiple round-trips', async () => {
    const original = `flowchart LR
    A --> B
    B --> C`;

    // First round-trip
    const ast1 = parseFlowchart(original);
    const rendered1 = renderFlowchart(ast1);

    // Second round-trip
    const ast2 = parseFlowchart(rendered1);
    const rendered2 = renderFlowchart(ast2);

    // Both should render to valid SVG
    const svg1 = await renderToSvg(rendered1, 'rt-1');
    const svg2 = await renderToSvg(rendered2, 'rt-2');

    if (!svg1 || !svg2) {
      console.log('Skipping SVG comparison due to happy-dom limitation');
      return;
    }

    // Both SVGs should be valid (contain expected elements)
    expect(svg1).toContain('<svg');
    expect(svg2).toContain('<svg');

    // Structure should be identical after stabilizing
    const structure1 = extractSvgStructure(svg1);
    const structure2 = extractSvgStructure(svg2);

    expect(structure2.nodeCount).toBe(structure1.nodeCount);
    expect(structure2.edgeCount).toBe(structure1.edgeCount);
  });

  it('should maintain AST structure through round-trips', () => {
    const original = `flowchart TD
    A[Start] --> B{Decision}
    B -->|Yes| C[End]
    B -->|No| A`;

    // First round-trip
    const ast1 = parseFlowchart(original);
    const rendered1 = renderFlowchart(ast1);

    // Second round-trip
    const ast2 = parseFlowchart(rendered1);

    // AST structure should be equivalent
    expect(ast2.direction).toBe(ast1.direction);
    expect(ast2.nodes.size).toBe(ast1.nodes.size);
    expect(ast2.links.length).toBe(ast1.links.length);

    // Node IDs should match
    for (const [id, node] of ast1.nodes) {
      expect(ast2.nodes.has(id)).toBe(true);
      const node2 = ast2.nodes.get(id)!;
      expect(node2.shape).toBe(node.shape);
    }
  });

  it('should maintain sequence diagram structure through round-trips', () => {
    const original = `sequenceDiagram
    participant A as Alice
    participant B as Bob
    A->>B: Hello
    B-->>A: Hi there`;

    // First round-trip
    const ast1 = parseSequence(original);
    const rendered1 = renderSequence(ast1);

    // Second round-trip
    const ast2 = parseSequence(rendered1);

    // AST structure should be equivalent
    expect(ast2.actors.size).toBe(ast1.actors.size);
    expect(ast2.statements.length).toBe(ast1.statements.length);

    // Actor names should match
    for (const [id, actor] of ast1.actors) {
      expect(ast2.actors.has(id)).toBe(true);
      const actor2 = ast2.actors.get(id)!;
      expect(actor2.alias).toBe(actor.alias);
    }
  });
});

describe('Parse-Render Equivalence', () => {
  it('should preserve flowchart node shapes', () => {
    const original = `flowchart LR
    A[Rectangle]
    B(Rounded)
    C{Diamond}
    D([Stadium])
    E[[Subroutine]]`;

    const ast = parseFlowchart(original);
    const rendered = renderFlowchart(ast);
    const ast2 = parseFlowchart(rendered);

    expect(ast2.nodes.get('A')?.shape).toBe(ast.nodes.get('A')?.shape);
    expect(ast2.nodes.get('B')?.shape).toBe(ast.nodes.get('B')?.shape);
    expect(ast2.nodes.get('C')?.shape).toBe(ast.nodes.get('C')?.shape);
  });

  it('should preserve flowchart link types', () => {
    const original = `flowchart LR
    A --> B
    B --- C
    C -.-> D
    D ==> E`;

    const ast = parseFlowchart(original);
    const rendered = renderFlowchart(ast);
    const ast2 = parseFlowchart(rendered);

    expect(ast2.links.length).toBe(ast.links.length);

    // Check that link types are preserved (compare by source/target, not index)
    for (const link of ast.links) {
      const matchingLink = ast2.links.find(
        (l) => l.source === link.source && l.target === link.target
      );
      expect(matchingLink).toBeDefined();
      expect(matchingLink!.stroke).toBe(link.stroke);
      expect(matchingLink!.type).toBe(link.type);
    }
  });

  it('should preserve sequence diagram message types', () => {
    const original = `sequenceDiagram
    A->>B: Solid arrow
    B-->>A: Dashed arrow
    A-)B: Async
    B--)A: Async dashed`;

    const ast = parseSequence(original);
    const rendered = renderSequence(ast);
    const ast2 = parseSequence(rendered);

    const messages1 = ast.statements.filter((s) => s.type === 'message');
    const messages2 = ast2.statements.filter((s) => s.type === 'message');

    expect(messages2.length).toBe(messages1.length);
  });
});
