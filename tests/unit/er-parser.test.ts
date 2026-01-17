import { describe, expect, it } from 'bun:test';
import { parseErDiagram } from '../../src/parser/er-parser.js';

describe('ER Diagram Parsing', () => {
  it('should parse a simple ER diagram', () => {
    const input = `erDiagram
    CUSTOMER ||--o{ ORDER : places`;

    const ast = parseErDiagram(input);

    expect(ast.type).toBe('erDiagram');
    expect(ast.entities.size).toBe(2);
    expect(ast.entities.has('CUSTOMER')).toBe(true);
    expect(ast.entities.has('ORDER')).toBe(true);
    expect(ast.relationships.length).toBe(1);
    expect(ast.relationships[0].entityA).toBe('CUSTOMER');
    expect(ast.relationships[0].entityB).toBe('ORDER');
    expect(ast.relationships[0].role).toBe('places');
  });

  it('should parse entity with attributes', () => {
    const input = `erDiagram
    CUSTOMER {
        string name
        int age
    }`;

    const ast = parseErDiagram(input);

    expect(ast.entities.size).toBe(1);
    const customer = ast.entities.get('CUSTOMER');
    expect(customer).toBeDefined();
    expect(customer!.attributes.length).toBe(2);
    expect(customer!.attributes[0].type).toBe('string');
    expect(customer!.attributes[0].name).toBe('name');
    expect(customer!.attributes[1].type).toBe('int');
    expect(customer!.attributes[1].name).toBe('age');
  });

  it('should parse attributes with keys', () => {
    const input = `erDiagram
    CUSTOMER {
        int id PK
        string email UK
        int order_id FK
    }`;

    const ast = parseErDiagram(input);

    const customer = ast.entities.get('CUSTOMER');
    expect(customer!.attributes[0].keys).toEqual(['PK']);
    expect(customer!.attributes[1].keys).toEqual(['UK']);
    expect(customer!.attributes[2].keys).toEqual(['FK']);
  });

  it('should parse attributes with comments', () => {
    const input = `erDiagram
    CUSTOMER {
        int id PK "Primary key"
        string name "Customer name"
    }`;

    const ast = parseErDiagram(input);

    const customer = ast.entities.get('CUSTOMER');
    expect(customer!.attributes[0].comment).toBe('Primary key');
    expect(customer!.attributes[1].comment).toBe('Customer name');
  });

  it('should parse different cardinalities', () => {
    const input = `erDiagram
    A ||--|| B : "one to one"
    C ||--o{ D : "one to many"
    E }o--o{ F : "many to many"
    G |o--o| H : "zero or one"`;

    const ast = parseErDiagram(input);

    expect(ast.relationships.length).toBe(4);

    // A ||--|| B (one to one)
    expect(ast.relationships[0].relSpec.cardA).toBe('ONLY_ONE');
    expect(ast.relationships[0].relSpec.cardB).toBe('ONLY_ONE');

    // C ||--o{ D (one to many)
    expect(ast.relationships[1].relSpec.cardB).toBe('ONLY_ONE');
    expect(ast.relationships[1].relSpec.cardA).toBe('ZERO_OR_MORE');

    // E }o--o{ F (many to many)
    expect(ast.relationships[2].relSpec.cardB).toBe('ZERO_OR_MORE');
    expect(ast.relationships[2].relSpec.cardA).toBe('ZERO_OR_MORE');

    // G |o--o| H (zero or one)
    expect(ast.relationships[3].relSpec.cardB).toBe('ZERO_OR_ONE');
    expect(ast.relationships[3].relSpec.cardA).toBe('ZERO_OR_ONE');
  });

  it('should parse identifying vs non-identifying relationships', () => {
    const input = `erDiagram
    A ||--|| B : "identifying"
    C ||..|| D : "non-identifying"`;

    const ast = parseErDiagram(input);

    expect(ast.relationships[0].relSpec.relType).toBe('IDENTIFYING');
    expect(ast.relationships[1].relSpec.relType).toBe('NON_IDENTIFYING');
  });

  it('should parse entity with alias', () => {
    const input = `erDiagram
    CUSTOMER["Customer Entity"] {
        string name
    }`;

    const ast = parseErDiagram(input);

    const customer = ast.entities.get('CUSTOMER');
    expect(customer!.alias).toBe('Customer Entity');
  });

  it('should parse direction', () => {
    const input = `erDiagram
    direction LR
    A ||--|| B : rel`;

    const ast = parseErDiagram(input);

    expect(ast.direction).toBe('LR');
  });

  it('should parse accessibility title and description', () => {
    const input = `erDiagram
    accTitle: My ER Diagram
    accDescr: A diagram showing relationships
    A ||--|| B : rel`;

    const ast = parseErDiagram(input);

    expect(ast.accTitle).toBe('My ER Diagram');
    expect(ast.accDescription).toBe('A diagram showing relationships');
  });
});
