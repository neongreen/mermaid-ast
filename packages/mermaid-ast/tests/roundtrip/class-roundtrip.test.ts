import { describe, expect, test } from 'bun:test';
import { parseClassDiagram } from '../../src/parser/class-parser.js';
import { renderClassDiagram } from '../../src/renderer/class-renderer.js';

/**
 * Normalize whitespace for comparison
 */
function _normalize(text: string): string {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join('\n');
}

/**
 * Test round-trip: parse -> render -> parse should produce equivalent AST
 */
function testRoundTrip(input: string, description: string) {
  test(description, () => {
    const ast1 = parseClassDiagram(input);
    const rendered = renderClassDiagram(ast1);
    const ast2 = parseClassDiagram(rendered);

    // Compare key properties
    expect(ast2.type).toBe(ast1.type);
    expect(ast2.direction).toBe(ast1.direction);
    expect(ast2.classes.size).toBe(ast1.classes.size);
    expect(ast2.relations.length).toBe(ast1.relations.length);
    expect(ast2.notes.length).toBe(ast1.notes.length);
    expect(ast2.namespaces.size).toBe(ast1.namespaces.size);

    // Compare classes
    for (const [id, cls1] of ast1.classes) {
      const cls2 = ast2.classes.get(id);
      expect(cls2).toBeDefined();
      expect(cls2?.members.length).toBe(cls1.members.length);
      expect(cls2?.annotations.length).toBe(cls1.annotations.length);
    }

    // Compare relations
    for (let i = 0; i < ast1.relations.length; i++) {
      const rel1 = ast1.relations[i];
      const rel2 = ast2.relations[i];
      expect(rel2.id1).toBe(rel1.id1);
      expect(rel2.id2).toBe(rel1.id2);
      expect(rel2.relation.type1).toBe(rel1.relation.type1);
      expect(rel2.relation.type2).toBe(rel1.relation.type2);
      expect(rel2.relation.lineType).toBe(rel1.relation.lineType);
    }
  });
}

describe('Class Diagram Round-trip', () => {
  describe('Basic Classes', () => {
    testRoundTrip(
      `classDiagram
    class Animal`,
      'simple class declaration'
    );

    testRoundTrip(
      `classDiagram
    class Animal["A cute animal"]`,
      'class with label'
    );

    testRoundTrip(
      `classDiagram
    class Animal {
        +String name
        +int age
        +eat()
        +sleep()
    }`,
      'class with members'
    );

    testRoundTrip(
      `classDiagram
    class Duck {
        +String publicField
        -String privateField
        #String protectedField
        ~String packageField
    }`,
      'class with visibility modifiers'
    );
  });

  describe('Relationships', () => {
    testRoundTrip(
      `classDiagram
    Animal <|-- Duck`,
      'inheritance relationship'
    );

    testRoundTrip(
      `classDiagram
    Company *-- Employee`,
      'composition relationship'
    );

    testRoundTrip(
      `classDiagram
    Pond o-- Duck`,
      'aggregation relationship'
    );

    testRoundTrip(
      `classDiagram
    Class01 <|.. Class02`,
      'dotted line relationship'
    );

    testRoundTrip(
      `classDiagram
    Animal <|-- Duck : extends`,
      'relationship with label'
    );

    testRoundTrip(
      `classDiagram
    Customer "1" --> "*" Order`,
      'relationship with cardinality'
    );
  });

  describe('Annotations', () => {
    testRoundTrip(
      `classDiagram
    class Shape
    <<interface>> Shape`,
      'interface annotation'
    );

    testRoundTrip(
      `classDiagram
    class Animal
    <<abstract>> Animal`,
      'abstract annotation'
    );
  });

  describe('Direction', () => {
    testRoundTrip(
      `classDiagram
    direction LR
    class Animal`,
      'LR direction'
    );

    testRoundTrip(
      `classDiagram
    direction RL
    class Animal`,
      'RL direction'
    );
  });

  describe('Complex Diagrams', () => {
    testRoundTrip(
      `classDiagram
    direction LR
    class Animal {
        +String name
        +int age
        +eat()
        +sleep()
    }
    class Duck {
        +String beakColor
        +swim()
        +quack()
    }
    class Fish {
        -int sizeInFeet
        -canEat()
    }
    Animal <|-- Duck
    Animal <|-- Fish`,
      'complete class diagram with multiple classes and relationships'
    );

    testRoundTrip(
      `classDiagram
    class BankAccount {
        +String owner
        +BigDecimal balance
        +deposit(amount)
        +withdraw(amount)
    }
    class SavingsAccount {
        +BigDecimal interestRate
        +calculateInterest()
    }
    class CheckingAccount {
        +BigDecimal overdraftLimit
        +orderCheckBook()
    }
    BankAccount <|-- SavingsAccount
    BankAccount <|-- CheckingAccount`,
      'banking class hierarchy'
    );
  });
});
