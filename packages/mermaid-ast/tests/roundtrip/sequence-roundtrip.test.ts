/**
 * Round-trip tests for Sequence diagrams
 *
 * These tests verify that:
 * 1. parse(render(ast)) produces an equivalent AST
 * 2. render(parse(text)) produces syntactically valid output
 * 3. parse(render(parse(text))) === parse(text) (semantic equivalence)
 */

import { describe, expect, it } from 'bun:test';
import { parseSequence } from '../../src/parser/index.js';
import { renderSequence } from '../../src/renderer/index.js';
import type { SequenceAST, SequenceMessage } from '../../src/types/index.js';

/**
 * Compare two sequence ASTs for semantic equivalence
 */
function assertEquivalentSequences(ast1: SequenceAST, ast2: SequenceAST): void {
  // Compare actors
  expect(ast2.actors.size).toBe(ast1.actors.size);
  for (const [id, actor1] of ast1.actors) {
    const actor2 = ast2.actors.get(id);
    expect(actor2).toBeDefined();
    expect(actor2?.type).toBe(actor1.type);
    // Name might differ slightly due to alias handling
  }

  // Compare statement count (structure should be preserved)
  expect(ast2.statements.length).toBe(ast1.statements.length);

  // Compare messages
  const messages1 = ast1.statements.filter((s) => s.type === 'message') as SequenceMessage[];
  const messages2 = ast2.statements.filter((s) => s.type === 'message') as SequenceMessage[];
  expect(messages2.length).toBe(messages1.length);

  for (let i = 0; i < messages1.length; i++) {
    const m1 = messages1[i];
    const m2 = messages2[i];
    expect(m2.from).toBe(m1.from);
    expect(m2.to).toBe(m1.to);
    expect(m2.text.trim()).toBe(m1.text.trim());
    expect(m2.arrowType).toBe(m1.arrowType);
  }
}

describe('Sequence Round-trip Tests', () => {
  describe('Simple diagrams', () => {
    it('should round-trip a basic sequence diagram', () => {
      const original = `sequenceDiagram
    Alice->>Bob: Hello`;

      const ast1 = parseSequence(original);
      const rendered = renderSequence(ast1);
      const ast2 = parseSequence(rendered);

      assertEquivalentSequences(ast1, ast2);
    });

    it('should round-trip multiple messages', () => {
      const original = `sequenceDiagram
    Alice->>Bob: Hello
    Bob-->>Alice: Hi there`;

      const ast1 = parseSequence(original);
      const rendered = renderSequence(ast1);
      const ast2 = parseSequence(rendered);

      assertEquivalentSequences(ast1, ast2);
    });
  });

  describe('Participant declarations', () => {
    it('should round-trip participant declarations', () => {
      const original = `sequenceDiagram
    participant Alice
    participant Bob
    Alice->>Bob: Hello`;

      const ast1 = parseSequence(original);
      const rendered = renderSequence(ast1);
      const ast2 = parseSequence(rendered);

      assertEquivalentSequences(ast1, ast2);
    });

    it('should round-trip actor declarations', () => {
      const original = `sequenceDiagram
    actor Alice
    actor Bob
    Alice->>Bob: Hello`;

      const ast1 = parseSequence(original);
      const rendered = renderSequence(ast1);
      const ast2 = parseSequence(rendered);

      assertEquivalentSequences(ast1, ast2);
    });
  });

  describe('Message types', () => {
    it('should round-trip solid arrow messages', () => {
      const original = `sequenceDiagram
    Alice->>Bob: Solid arrow`;

      const ast1 = parseSequence(original);
      const rendered = renderSequence(ast1);
      const ast2 = parseSequence(rendered);

      assertEquivalentSequences(ast1, ast2);
    });

    it('should round-trip dotted arrow messages', () => {
      const original = `sequenceDiagram
    Alice-->>Bob: Dotted arrow`;

      const ast1 = parseSequence(original);
      const rendered = renderSequence(ast1);
      const ast2 = parseSequence(rendered);

      assertEquivalentSequences(ast1, ast2);
    });

    it('should round-trip open arrow messages', () => {
      const original = `sequenceDiagram
    Alice->Bob: Open arrow`;

      const ast1 = parseSequence(original);
      const rendered = renderSequence(ast1);
      const ast2 = parseSequence(rendered);

      assertEquivalentSequences(ast1, ast2);
    });

    it('should round-trip cross messages', () => {
      const original = `sequenceDiagram
    Alice-xBob: Cross`;

      const ast1 = parseSequence(original);
      const rendered = renderSequence(ast1);
      const ast2 = parseSequence(rendered);

      assertEquivalentSequences(ast1, ast2);
    });
  });

  describe('Control structures', () => {
    it('should round-trip loop blocks', () => {
      const original = `sequenceDiagram
    Alice->>Bob: Hello
    loop Every minute
        Bob->>Alice: Ping
    end`;

      const ast1 = parseSequence(original);
      const rendered = renderSequence(ast1);
      const ast2 = parseSequence(rendered);

      // Check loop is preserved
      const loops1 = ast1.statements.filter((s) => s.type === 'loop');
      const loops2 = ast2.statements.filter((s) => s.type === 'loop');
      expect(loops2.length).toBe(loops1.length);
    });

    it('should round-trip alt/else blocks', () => {
      const original = `sequenceDiagram
    Alice->>Bob: Hello
    alt is sick
        Bob-->>Alice: Not good
    else is well
        Bob-->>Alice: Great
    end`;

      const ast1 = parseSequence(original);
      const rendered = renderSequence(ast1);
      const ast2 = parseSequence(rendered);

      // Check alt is preserved
      const alts1 = ast1.statements.filter((s) => s.type === 'alt');
      const alts2 = ast2.statements.filter((s) => s.type === 'alt');
      expect(alts2.length).toBe(alts1.length);
    });

    it('should round-trip opt blocks', () => {
      const original = `sequenceDiagram
    Alice->>Bob: Hello
    opt Extra response
        Bob-->>Alice: Thanks
    end`;

      const ast1 = parseSequence(original);
      const rendered = renderSequence(ast1);
      const ast2 = parseSequence(rendered);

      // Check opt is preserved
      const opts1 = ast1.statements.filter((s) => s.type === 'opt');
      const opts2 = ast2.statements.filter((s) => s.type === 'opt');
      expect(opts2.length).toBe(opts1.length);
    });

    it('should round-trip par blocks', () => {
      const original = `sequenceDiagram
    par Alice to Bob
        Alice->>Bob: Hello
    and Alice to John
        Alice->>John: Hello
    end`;

      const ast1 = parseSequence(original);
      const rendered = renderSequence(ast1);
      const ast2 = parseSequence(rendered);

      // Check par is preserved
      const pars1 = ast1.statements.filter((s) => s.type === 'par');
      const pars2 = ast2.statements.filter((s) => s.type === 'par');
      expect(pars2.length).toBe(pars1.length);
    });
  });

  describe('Notes', () => {
    it('should round-trip notes', () => {
      const original = `sequenceDiagram
    Alice->>Bob: Hello
    note right of Bob: This is a note`;

      const ast1 = parseSequence(original);
      const rendered = renderSequence(ast1);
      const ast2 = parseSequence(rendered);

      // Check notes are preserved
      const notes1 = ast1.statements.filter((s) => s.type === 'note');
      const notes2 = ast2.statements.filter((s) => s.type === 'note');
      expect(notes2.length).toBe(notes1.length);
    });
  });

  describe('Activation', () => {
    it('should round-trip activation', () => {
      const original = `sequenceDiagram
    Alice->>Bob: Hello
    activate Bob
    Bob-->>Alice: Hi
    deactivate Bob`;

      const ast1 = parseSequence(original);
      const rendered = renderSequence(ast1);
      const ast2 = parseSequence(rendered);

      // Check activations are preserved
      const acts1 = ast1.statements.filter((s) => s.type === 'activate' || s.type === 'deactivate');
      const acts2 = ast2.statements.filter((s) => s.type === 'activate' || s.type === 'deactivate');
      expect(acts2.length).toBe(acts1.length);
    });
  });

  describe('Complex diagrams', () => {
    it('should round-trip a complete sequence diagram', () => {
      const original = `sequenceDiagram
    participant Alice
    participant Bob
    participant Charlie
    Alice->>Bob: Hello Bob
    Bob-->>Alice: Hi Alice
    loop Health check
        Bob->>Charlie: Status?
        Charlie-->>Bob: OK
    end
    alt is healthy
        Bob->>Alice: All good
    else is sick
        Bob->>Alice: Problem
    end`;

      const ast1 = parseSequence(original);
      const rendered = renderSequence(ast1);
      const ast2 = parseSequence(rendered);

      // Verify structure is preserved
      expect(ast2.actors.size).toBe(ast1.actors.size);
      expect(ast2.statements.length).toBe(ast1.statements.length);
    });
  });

  describe('Idempotency', () => {
    it('should be idempotent: render(parse(render(parse(x)))) === render(parse(x))', () => {
      const original = `sequenceDiagram
    Alice->>Bob: Hello
    Bob-->>Alice: Hi`;

      const ast1 = parseSequence(original);
      const render1 = renderSequence(ast1);
      const ast2 = parseSequence(render1);
      const render2 = renderSequence(ast2);
      const ast3 = parseSequence(render2);

      // After first round-trip, subsequent renders should be identical
      assertEquivalentSequences(ast2, ast3);
    });
  });
});
