import { describe, expect, test } from 'bun:test';
import { isClassDiagram, parseClassDiagram } from '../../src/parser/class-parser.js';

describe('Class Diagram Parser', () => {
  describe('isClassDiagram', () => {
    test('detects classDiagram', () => {
      expect(isClassDiagram('classDiagram\n  class Animal')).toBe(true);
    });

    test('detects classDiagram-v2', () => {
      expect(isClassDiagram('classDiagram-v2\n  class Animal')).toBe(true);
    });

    test('rejects non-class diagrams', () => {
      expect(isClassDiagram('flowchart TD\n  A --> B')).toBe(false);
      expect(isClassDiagram('sequenceDiagram\n  Alice->>Bob: Hi')).toBe(false);
    });
  });

  describe('Basic Classes', () => {
    test('parses simple class declaration', () => {
      const input = `classDiagram
    class Animal`;
      const ast = parseClassDiagram(input);
      expect(ast.type).toBe('classDiagram');
      expect(ast.classes.has('Animal')).toBe(true);
    });

    test('parses class with label', () => {
      const input = `classDiagram
    class Animal["A cute animal"]`;
      const ast = parseClassDiagram(input);
      const animal = ast.classes.get('Animal');
      expect(animal?.label).toBe('A cute animal');
    });

    test('parses class with members', () => {
      const input = `classDiagram
    class Animal {
        +String name
        +int age
        +eat()
        +sleep()
    }`;
      const ast = parseClassDiagram(input);
      const animal = ast.classes.get('Animal');
      expect(animal?.members.length).toBe(4);
      expect(animal?.members[0].text).toBe('String name');
      expect(animal?.members[0].visibility).toBe('+');
      expect(animal?.members[0].type).toBe('attribute');
      expect(animal?.members[2].text).toBe('eat()');
      expect(animal?.members[2].type).toBe('method');
    });

    test('parses class with different visibility modifiers', () => {
      const input = `classDiagram
    class Duck {
        +String publicField
        -String privateField
        #String protectedField
        ~String packageField
    }`;
      const ast = parseClassDiagram(input);
      const duck = ast.classes.get('Duck');
      expect(duck?.members[0].visibility).toBe('+');
      expect(duck?.members[1].visibility).toBe('-');
      expect(duck?.members[2].visibility).toBe('#');
      expect(duck?.members[3].visibility).toBe('~');
    });
  });

  describe('Relationships', () => {
    test('parses inheritance relationship', () => {
      const input = `classDiagram
    Animal <|-- Duck`;
      const ast = parseClassDiagram(input);
      expect(ast.relations.length).toBe(1);
      expect(ast.relations[0].id1).toBe('Animal');
      expect(ast.relations[0].id2).toBe('Duck');
      expect(ast.relations[0].relation.type1).toBe('extension');
      expect(ast.relations[0].relation.lineType).toBe('solid');
    });

    test('parses composition relationship', () => {
      const input = `classDiagram
    Company *-- Employee`;
      const ast = parseClassDiagram(input);
      expect(ast.relations[0].relation.type1).toBe('composition');
    });

    test('parses aggregation relationship', () => {
      const input = `classDiagram
    Pond o-- Duck`;
      const ast = parseClassDiagram(input);
      expect(ast.relations[0].relation.type1).toBe('aggregation');
    });

    test('parses dependency relationship', () => {
      const input = `classDiagram
    Class01 <-- Class02`;
      const ast = parseClassDiagram(input);
      expect(ast.relations[0].relation.type1).toBe('dependency');
    });

    test('parses dotted line relationship', () => {
      const input = `classDiagram
    Class01 <|.. Class02`;
      const ast = parseClassDiagram(input);
      expect(ast.relations[0].relation.lineType).toBe('dotted');
    });

    test('parses relationship with label', () => {
      const input = `classDiagram
    Animal <|-- Duck : extends`;
      const ast = parseClassDiagram(input);
      expect(ast.relations[0].title).toBe('extends');
    });

    test('parses relationship with cardinality', () => {
      const input = `classDiagram
    Customer "1" --> "*" Order`;
      const ast = parseClassDiagram(input);
      expect(ast.relations[0].relationTitle1).toBe('1');
      expect(ast.relations[0].relationTitle2).toBe('*');
    });
  });

  describe('Annotations', () => {
    test('parses interface annotation', () => {
      const input = `classDiagram
    class Shape
    <<interface>> Shape`;
      const ast = parseClassDiagram(input);
      const shape = ast.classes.get('Shape');
      expect(shape?.annotations).toContain('interface');
    });

    test('parses abstract annotation', () => {
      const input = `classDiagram
    class Animal
    <<abstract>> Animal`;
      const ast = parseClassDiagram(input);
      const animal = ast.classes.get('Animal');
      expect(animal?.annotations).toContain('abstract');
    });

    test('parses service annotation', () => {
      const input = `classDiagram
    class UserService
    <<service>> UserService`;
      const ast = parseClassDiagram(input);
      const service = ast.classes.get('UserService');
      expect(service?.annotations).toContain('service');
    });
  });

  describe('Namespaces', () => {
    test('parses namespace with classes', () => {
      const input = `classDiagram
    namespace Animals {
        class Duck
        class Fish
    }`;
      const ast = parseClassDiagram(input);
      expect(ast.namespaces.has('Animals')).toBe(true);
      const ns = ast.namespaces.get('Animals');
      expect(ns?.classes).toContain('Duck');
      expect(ns?.classes).toContain('Fish');
    });
  });

  describe('Notes', () => {
    test('parses note for class', () => {
      const input = `classDiagram
    class Animal
    note for Animal "This is an animal"`;
      const ast = parseClassDiagram(input);
      expect(ast.notes.length).toBe(1);
      expect(ast.notes[0].text).toBe('This is an animal');
      expect(ast.notes[0].forClass).toBe('Animal');
    });

    test('parses standalone note', () => {
      const input = `classDiagram
    note "General note"`;
      const ast = parseClassDiagram(input);
      expect(ast.notes.length).toBe(1);
      expect(ast.notes[0].text).toBe('General note');
      expect(ast.notes[0].forClass).toBeUndefined();
    });
  });

  describe('Direction', () => {
    test('parses TB direction', () => {
      const input = `classDiagram
    direction TB
    class Animal`;
      const ast = parseClassDiagram(input);
      expect(ast.direction).toBe('TB');
    });

    test('parses LR direction', () => {
      const input = `classDiagram
    direction LR
    class Animal`;
      const ast = parseClassDiagram(input);
      expect(ast.direction).toBe('LR');
    });
  });

  describe('Styling', () => {
    test('parses cssClass assignment', () => {
      const input = `classDiagram
    class Animal
    cssClass "Animal" important`;
      const ast = parseClassDiagram(input);
      const animal = ast.classes.get('Animal');
      expect(animal?.cssClasses).toContain('important');
    });
  });

  describe('Click handlers', () => {
    test('parses callback', () => {
      const input = `classDiagram
    class Animal
    callback Animal "handleClick"`;
      const ast = parseClassDiagram(input);
      const animal = ast.classes.get('Animal');
      expect(animal?.callback).toBe('handleClick');
    });

    test('parses link', () => {
      const input = `classDiagram
    class Animal
    link Animal "https://example.com"`;
      const ast = parseClassDiagram(input);
      const animal = ast.classes.get('Animal');
      expect(animal?.link).toBe('https://example.com');
    });
  });

  describe('Generic types', () => {
    test('parses class with generic type', () => {
      const input = `classDiagram
    class List~T~`;
      const ast = parseClassDiagram(input);
      expect(ast.classes.has('List~T~')).toBe(true);
    });
  });

  describe('Complex diagrams', () => {
    test('parses complete class diagram', () => {
      const input = `classDiagram
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
    Animal <|-- Fish
    Animal : +mate()
    note for Duck "Can fly and swim"`;
      const ast = parseClassDiagram(input);

      expect(ast.direction).toBe('LR');
      expect(ast.classes.size).toBe(3);
      expect(ast.relations.length).toBe(2);
      expect(ast.notes.length).toBe(1);

      const duck = ast.classes.get('Duck');
      expect(duck?.members.length).toBe(3);
    });
  });
});
