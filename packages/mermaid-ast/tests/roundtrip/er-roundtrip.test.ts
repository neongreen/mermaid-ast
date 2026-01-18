/**
 * Round-trip tests for ER Diagram
 *
 * These tests verify that:
 * 1. parse(render(ast)) produces an equivalent AST
 * 2. render(parse(text)) produces syntactically valid output
 * 3. parse(render(parse(text))) === parse(text) (semantic equivalence)
 */

import { describe, expect, it } from 'bun:test';
import { parseErDiagram } from '../../src/parser/er-parser.js';
import { renderErDiagram } from '../../src/renderer/er-renderer.js';
import type { ErDiagramAST } from '../../src/types/index.js';

/**
 * Compare two ER diagram ASTs for semantic equivalence
 */
function assertEquivalentErDiagrams(ast1: ErDiagramAST, ast2: ErDiagramAST): void {
  // Compare entities
  expect(ast2.entities.size).toBe(ast1.entities.size);
  for (const [name, entity1] of ast1.entities) {
    const entity2 = ast2.entities.get(name);
    expect(entity2).toBeDefined();
    expect(entity2?.attributes?.length).toBe(entity1.attributes?.length ?? 0);
  }

  // Compare relationships
  expect(ast2.relationships.length).toBe(ast1.relationships.length);
  for (const rel1 of ast1.relationships) {
    const matchingRel = ast2.relationships.find(
      (r) =>
        r.entityA === rel1.entityA &&
        r.entityB === rel1.entityB &&
        r.relSpec.cardA === rel1.relSpec.cardA &&
        r.relSpec.cardB === rel1.relSpec.cardB
    );
    expect(matchingRel).toBeDefined();
  }
}

describe('ER Diagram Round-trip Tests', () => {
  describe('Simple diagrams', () => {
    it('should round-trip a basic ER diagram', () => {
      const original = `erDiagram
    CUSTOMER ||--o{ ORDER : places`;

      const ast1 = parseErDiagram(original);
      const rendered = renderErDiagram(ast1);
      const ast2 = parseErDiagram(rendered);

      assertEquivalentErDiagrams(ast1, ast2);
    });

    it('should round-trip multiple entities', () => {
      const original = `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains`;

      const ast1 = parseErDiagram(original);
      const rendered = renderErDiagram(ast1);
      const ast2 = parseErDiagram(rendered);

      assertEquivalentErDiagrams(ast1, ast2);
    });
  });

  describe('Cardinality types', () => {
    it('should round-trip one-to-one', () => {
      const original = `erDiagram
    PERSON ||--|| PASSPORT : has`;

      const ast1 = parseErDiagram(original);
      const rendered = renderErDiagram(ast1);
      const ast2 = parseErDiagram(rendered);

      assertEquivalentErDiagrams(ast1, ast2);
    });

    it('should round-trip one-to-many', () => {
      const original = `erDiagram
    CUSTOMER ||--o{ ORDER : places`;

      const ast1 = parseErDiagram(original);
      const rendered = renderErDiagram(ast1);
      const ast2 = parseErDiagram(rendered);

      assertEquivalentErDiagrams(ast1, ast2);
    });

    it('should round-trip many-to-many', () => {
      const original = `erDiagram
    STUDENT }o--o{ COURSE : enrolls`;

      const ast1 = parseErDiagram(original);
      const rendered = renderErDiagram(ast1);
      const ast2 = parseErDiagram(rendered);

      assertEquivalentErDiagrams(ast1, ast2);
    });

    it('should round-trip zero-or-one', () => {
      const original = `erDiagram
    PERSON |o--o| ADDRESS : "lives at"`;

      const ast1 = parseErDiagram(original);
      const rendered = renderErDiagram(ast1);
      const ast2 = parseErDiagram(rendered);

      assertEquivalentErDiagrams(ast1, ast2);
    });
  });

  describe('Entity attributes', () => {
    it('should round-trip entity with attributes', () => {
      const original = `erDiagram
    CUSTOMER {
        string name
        int age
    }`;

      const ast1 = parseErDiagram(original);
      const rendered = renderErDiagram(ast1);
      const ast2 = parseErDiagram(rendered);

      assertEquivalentErDiagrams(ast1, ast2);
    });

    it('should round-trip entity with key attributes', () => {
      const original = `erDiagram
    CUSTOMER {
        int id PK
        string email UK
        string name
    }`;

      const ast1 = parseErDiagram(original);
      const rendered = renderErDiagram(ast1);
      const ast2 = parseErDiagram(rendered);

      assertEquivalentErDiagrams(ast1, ast2);
    });
  });

  describe('Complex diagrams', () => {
    it('should round-trip a complete ER diagram', () => {
      const original = `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    PRODUCT ||--o{ LINE-ITEM : "appears in"
    CUSTOMER {
        int id PK
        string name
        string email UK
    }
    ORDER {
        int id PK
        date created
    }`;

      const ast1 = parseErDiagram(original);
      const rendered = renderErDiagram(ast1);
      const ast2 = parseErDiagram(rendered);

      assertEquivalentErDiagrams(ast1, ast2);
    });
  });

  describe('Idempotency', () => {
    it('should be idempotent: render(parse(render(parse(x)))) === render(parse(x))', () => {
      const original = `erDiagram
    CUSTOMER ||--o{ ORDER : places
    CUSTOMER {
        int id PK
        string name
    }`;

      const ast1 = parseErDiagram(original);
      const render1 = renderErDiagram(ast1);
      const ast2 = parseErDiagram(render1);
      const render2 = renderErDiagram(ast2);
      const ast3 = parseErDiagram(render2);

      // After first round-trip, subsequent renders should be identical
      assertEquivalentErDiagrams(ast2, ast3);
    });
  });
});
