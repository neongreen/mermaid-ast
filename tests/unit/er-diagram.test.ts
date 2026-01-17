import { describe, expect, it } from 'bun:test';
import { ErDiagram } from '../../src/er-diagram.js';

describe('ErDiagram Wrapper', () => {
  describe('Factory Methods', () => {
    it('should create an empty ER diagram', () => {
      const diagram = ErDiagram.create();
      expect(diagram.entityCount).toBe(0);
      expect(diagram.relationshipCount).toBe(0);
      expect(diagram.direction).toBe('TB');
    });

    it('should create with custom direction', () => {
      const diagram = ErDiagram.create('LR');
      expect(diagram.direction).toBe('LR');
    });

    it('should parse Mermaid syntax', () => {
      const diagram = ErDiagram.parse(`erDiagram
        CUSTOMER ||--o{ ORDER : places`);

      expect(diagram.entityCount).toBe(2);
      expect(diagram.hasEntity('CUSTOMER')).toBe(true);
      expect(diagram.hasEntity('ORDER')).toBe(true);
      expect(diagram.relationshipCount).toBe(1);
    });

    it('should create from existing AST', () => {
      const original = ErDiagram.create().addEntity('A').addEntity('B');
      const copy = ErDiagram.from(original.toAST());
      expect(copy.entityCount).toBe(2);
    });
  });

  describe('Entity Operations', () => {
    it('should add entities', () => {
      const diagram = ErDiagram.create().addEntity('CUSTOMER').addEntity('ORDER');

      expect(diagram.entityCount).toBe(2);
      expect(diagram.entityNames).toContain('CUSTOMER');
      expect(diagram.entityNames).toContain('ORDER');
    });

    it('should add entity with alias', () => {
      const diagram = ErDiagram.create().addEntity('CUSTOMER', 'Customer Entity');

      const entity = diagram.getEntity('CUSTOMER');
      expect(entity?.alias).toBe('Customer Entity');
    });

    it('should set entity alias', () => {
      const diagram = ErDiagram.create()
        .addEntity('CUSTOMER')
        .setEntityAlias('CUSTOMER', 'My Customer');

      expect(diagram.getEntity('CUSTOMER')?.alias).toBe('My Customer');
    });

    it('should remove entities', () => {
      const diagram = ErDiagram.create()
        .addEntity('A')
        .addEntity('B')
        .addRelationship('A', 'B', 'relates')
        .removeEntity('A');

      expect(diagram.entityCount).toBe(1);
      expect(diagram.hasEntity('A')).toBe(false);
      expect(diagram.relationshipCount).toBe(0); // Relationship should be removed too
    });
  });

  describe('Attribute Operations', () => {
    it('should add attributes', () => {
      const diagram = ErDiagram.create()
        .addEntity('CUSTOMER')
        .addAttribute('CUSTOMER', 'string', 'name')
        .addAttribute('CUSTOMER', 'int', 'age');

      const attrs = diagram.getAttributes('CUSTOMER');
      expect(attrs.length).toBe(2);
      expect(attrs[0].type).toBe('string');
      expect(attrs[0].name).toBe('name');
    });

    it('should add attributes with keys', () => {
      const diagram = ErDiagram.create().addAttribute('CUSTOMER', 'int', 'id', { keys: ['PK'] });

      const attrs = diagram.getAttributes('CUSTOMER');
      expect(attrs[0].keys).toEqual(['PK']);
    });

    it('should add attributes with comments', () => {
      const diagram = ErDiagram.create().addAttribute('CUSTOMER', 'int', 'id', {
        keys: ['PK'],
        comment: 'Primary key',
      });

      const attrs = diagram.getAttributes('CUSTOMER');
      expect(attrs[0].comment).toBe('Primary key');
    });

    it('should remove attributes', () => {
      const diagram = ErDiagram.create()
        .addAttribute('CUSTOMER', 'string', 'name')
        .addAttribute('CUSTOMER', 'int', 'age')
        .removeAttribute('CUSTOMER', 'name');

      const attrs = diagram.getAttributes('CUSTOMER');
      expect(attrs.length).toBe(1);
      expect(attrs[0].name).toBe('age');
    });
  });

  describe('Relationship Operations', () => {
    it('should add relationships', () => {
      const diagram = ErDiagram.create().addRelationship('CUSTOMER', 'ORDER', 'places');

      expect(diagram.relationshipCount).toBe(1);
      expect(diagram.relationships[0].entityA).toBe('CUSTOMER');
      expect(diagram.relationships[0].entityB).toBe('ORDER');
      expect(diagram.relationships[0].role).toBe('places');
    });

    it('should add relationships with cardinality', () => {
      const diagram = ErDiagram.create().addRelationship('CUSTOMER', 'ORDER', 'places', {
        cardA: 'ONLY_ONE',
        cardB: 'ZERO_OR_MORE',
        relType: 'IDENTIFYING',
      });

      const rel = diagram.relationships[0];
      expect(rel.relSpec.cardA).toBe('ONLY_ONE');
      expect(rel.relSpec.cardB).toBe('ZERO_OR_MORE');
      expect(rel.relSpec.relType).toBe('IDENTIFYING');
    });

    it('should auto-create entities when adding relationships', () => {
      const diagram = ErDiagram.create().addRelationship('A', 'B', 'relates');

      expect(diagram.hasEntity('A')).toBe(true);
      expect(diagram.hasEntity('B')).toBe(true);
    });

    it('should remove relationships by index', () => {
      const diagram = ErDiagram.create()
        .addRelationship('A', 'B', 'rel1')
        .addRelationship('B', 'C', 'rel2')
        .removeRelationship(0);

      expect(diagram.relationshipCount).toBe(1);
      expect(diagram.relationships[0].role).toBe('rel2');
    });

    it('should remove relationships between entities', () => {
      const diagram = ErDiagram.create()
        .addRelationship('A', 'B', 'rel1')
        .addRelationship('A', 'B', 'rel2')
        .addRelationship('B', 'C', 'rel3')
        .removeRelationshipsBetween('A', 'B');

      expect(diagram.relationshipCount).toBe(1);
      expect(diagram.relationships[0].role).toBe('rel3');
    });

    it('should get relationships for an entity', () => {
      const diagram = ErDiagram.create()
        .addRelationship('A', 'B', 'rel1')
        .addRelationship('B', 'C', 'rel2')
        .addRelationship('A', 'C', 'rel3');

      const rels = diagram.getRelationshipsFor('A');
      expect(rels.length).toBe(2);
    });
  });

  describe('Class Operations', () => {
    it('should add classes to entities', () => {
      const diagram = ErDiagram.create().addEntity('CUSTOMER').addClass('CUSTOMER', 'highlight');

      expect(diagram.getClasses('CUSTOMER')).toContain('highlight');
    });

    it('should remove classes from entities', () => {
      const diagram = ErDiagram.create()
        .addEntity('CUSTOMER')
        .addClass('CUSTOMER', 'highlight')
        .addClass('CUSTOMER', 'important')
        .removeClass('CUSTOMER', 'highlight');

      const classes = diagram.getClasses('CUSTOMER');
      expect(classes).not.toContain('highlight');
      expect(classes).toContain('important');
    });
  });

  describe('Query Operations', () => {
    it('should find entities by class', () => {
      const diagram = ErDiagram.create()
        .addEntity('A')
        .addEntity('B')
        .addEntity('C')
        .addClass('A', 'important')
        .addClass('B', 'important');

      const found = diagram.findEntities({ class: 'important' });
      expect(found).toContain('A');
      expect(found).toContain('B');
      expect(found).not.toContain('C');
    });

    it('should find entities by name', () => {
      const diagram = ErDiagram.create()
        .addEntity('CUSTOMER')
        .addEntity('CUSTOMER_ORDER')
        .addEntity('PRODUCT');

      const found = diagram.findEntities({ nameContains: 'CUSTOMER' });
      expect(found.length).toBe(2);
      expect(found).toContain('CUSTOMER');
      expect(found).toContain('CUSTOMER_ORDER');
    });

    it('should find entities by attribute', () => {
      const diagram = ErDiagram.create()
        .addAttribute('CUSTOMER', 'string', 'email')
        .addAttribute('ORDER', 'int', 'total')
        .addEntity('PRODUCT');

      const found = diagram.findEntities({ hasAttribute: 'email' });
      expect(found).toContain('CUSTOMER');
      expect(found).not.toContain('ORDER');
    });

    it('should find entities by relationship', () => {
      const diagram = ErDiagram.create().addRelationship('A', 'B', 'rel').addEntity('C');

      const found = diagram.findEntities({ relatedTo: 'A' });
      expect(found).toContain('B');
      expect(found).not.toContain('C');
    });

    it('should get related entities', () => {
      const diagram = ErDiagram.create()
        .addRelationship('A', 'B', 'rel1')
        .addRelationship('A', 'C', 'rel2')
        .addEntity('D');

      const related = diagram.getRelatedEntities('A');
      expect(related).toContain('B');
      expect(related).toContain('C');
      expect(related).not.toContain('D');
    });
  });

  describe('Clone', () => {
    it('should clone the diagram', () => {
      const original = ErDiagram.create()
        .addEntity('CUSTOMER')
        .addAttribute('CUSTOMER', 'string', 'name')
        .addRelationship('CUSTOMER', 'ORDER', 'places');

      const clone = original.clone();
      clone.addEntity('PRODUCT');

      expect(original.entityCount).toBe(2);
      expect(clone.entityCount).toBe(3);
    });
  });

  describe('Round-trip', () => {
    it('should round-trip a simple diagram', () => {
      const input = `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains`;

      const diagram = ErDiagram.parse(input);
      const output = diagram.render();
      const reparsed = ErDiagram.parse(output);

      expect(reparsed.entityCount).toBe(diagram.entityCount);
      expect(reparsed.relationshipCount).toBe(diagram.relationshipCount);
    });

    it('should round-trip entities with attributes', () => {
      const input = `erDiagram
    CUSTOMER {
        int id PK
        string name
        string email UK
    }`;

      const diagram = ErDiagram.parse(input);
      const output = diagram.render();
      const reparsed = ErDiagram.parse(output);

      const attrs = reparsed.getAttributes('CUSTOMER');
      expect(attrs.length).toBe(3);
    });
  });
});
