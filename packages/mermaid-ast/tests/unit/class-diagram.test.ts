import { describe, expect, it } from 'bun:test';
import { ClassDiagram } from '../../src/class-diagram.js';

describe('ClassDiagram Wrapper', () => {
  describe('Factory Methods', () => {
    it('should create an empty class diagram', () => {
      const diagram = ClassDiagram.create();
      expect(diagram.classCount).toBe(0);
      expect(diagram.relationCount).toBe(0);
    });

    it('should create with direction', () => {
      const diagram = ClassDiagram.create('LR');
      expect(diagram.direction).toBe('LR');
    });

    it('should parse Mermaid syntax', () => {
      const diagram = ClassDiagram.parse(`classDiagram
    class Animal {
        +String name
        +eat()
    }
    class Dog
    Animal <|-- Dog`);

      expect(diagram.classCount).toBe(2);
      expect(diagram.hasClass('Animal')).toBe(true);
      expect(diagram.hasClass('Dog')).toBe(true);
    });

    it('should create from existing AST', () => {
      const original = ClassDiagram.create().addClass('A').addClass('B').addInheritance('B', 'A');

      const copy = ClassDiagram.from(original.toAST());
      expect(copy.classCount).toBe(2);
      expect(copy.relationCount).toBe(1);
    });
  });

  describe('Class Operations', () => {
    it('should add classes', () => {
      const diagram = ClassDiagram.create().addClass('Animal').addClass('Dog');

      expect(diagram.classCount).toBe(2);
    });

    it('should add classes with options', () => {
      const diagram = ClassDiagram.create().addClass('IAnimal', { annotation: 'interface' });

      const cls = diagram.getClass('IAnimal');
      expect(cls?.annotations).toContain('interface');
    });

    it('should remove classes', () => {
      const diagram = ClassDiagram.create().addClass('A').addClass('B').removeClass('A');

      expect(diagram.classCount).toBe(1);
      expect(diagram.hasClass('A')).toBe(false);
    });

    it('should remove classes and their relations', () => {
      const diagram = ClassDiagram.create()
        .addClass('A')
        .addClass('B')
        .addInheritance('B', 'A')
        .removeClass('A', { removeRelations: true });

      expect(diagram.relationCount).toBe(0);
    });

    it('should rename classes', () => {
      const diagram = ClassDiagram.create().addClass('OldName').renameClass('OldName', 'NewName');

      expect(diagram.hasClass('OldName')).toBe(false);
      expect(diagram.hasClass('NewName')).toBe(true);
    });

    it('should update relations when renaming', () => {
      const diagram = ClassDiagram.create()
        .addClass('Parent')
        .addClass('Child')
        .addInheritance('Child', 'Parent')
        .renameClass('Parent', 'Base');

      const relations = diagram.getRelationsFor('Base');
      expect(relations.length).toBe(1);
    });

    it('should set class label', () => {
      const diagram = ClassDiagram.create().addClass('A').setClassLabel('A', 'My Class A');

      expect(diagram.getClass('A')?.label).toBe('My Class A');
    });

    it('should add and remove annotations', () => {
      const diagram = ClassDiagram.create()
        .addClass('A')
        .addAnnotation('A', 'interface')
        .addAnnotation('A', 'abstract');

      expect(diagram.getClass('A')?.annotations).toContain('interface');

      diagram.removeAnnotation('A', 'interface');
      expect(diagram.getClass('A')?.annotations).not.toContain('interface');
    });
  });

  describe('Member Operations', () => {
    it('should add members', () => {
      const diagram = ClassDiagram.create().addClass('Animal').addMember('Animal', 'name: string');

      expect(diagram.getMembers('Animal').length).toBe(1);
    });

    it('should add attributes', () => {
      const diagram = ClassDiagram.create()
        .addClass('Animal')
        .addAttribute('Animal', 'name: string', '+');

      const members = diagram.getMembers('Animal');
      expect(members[0].visibility).toBe('+');
      expect(members[0].type).toBe('attribute');
    });

    it('should add methods', () => {
      const diagram = ClassDiagram.create().addClass('Animal').addMethod('Animal', 'eat()', '+');

      const members = diagram.getMembers('Animal');
      expect(members[0].type).toBe('method');
    });

    it('should auto-create class when adding member', () => {
      const diagram = ClassDiagram.create().addMember('NewClass', 'field: int');

      expect(diagram.hasClass('NewClass')).toBe(true);
    });

    it('should remove members', () => {
      const diagram = ClassDiagram.create()
        .addClass('A')
        .addMember('A', 'field1')
        .addMember('A', 'field2')
        .removeMember('A', 'field1');

      expect(diagram.getMembers('A').length).toBe(1);
    });
  });

  describe('Relation Operations', () => {
    it('should add inheritance', () => {
      const diagram = ClassDiagram.create()
        .addClass('Animal')
        .addClass('Dog')
        .addInheritance('Dog', 'Animal');

      expect(diagram.relationCount).toBe(1);
    });

    it('should add composition', () => {
      const diagram = ClassDiagram.create().addComposition('Car', 'Engine');

      expect(diagram.relationCount).toBe(1);
      expect(diagram.hasClass('Car')).toBe(true);
      expect(diagram.hasClass('Engine')).toBe(true);
    });

    it('should add aggregation', () => {
      const diagram = ClassDiagram.create().addAggregation('Department', 'Employee');

      expect(diagram.relationCount).toBe(1);
    });

    it('should add dependency', () => {
      const diagram = ClassDiagram.create().addDependency('Client', 'Service');

      expect(diagram.relationCount).toBe(1);
    });

    it('should add association', () => {
      const diagram = ClassDiagram.create().addAssociation('A', 'B', { label: 'uses' });

      const rel = diagram.getRelations()[0];
      expect(rel.title).toBe('uses');
    });

    it('should get relations for class', () => {
      const diagram = ClassDiagram.create()
        .addInheritance('B', 'A')
        .addInheritance('C', 'A')
        .addAssociation('B', 'D');

      expect(diagram.getRelationsFor('A').length).toBe(2);
      expect(diagram.getRelationsFor('B').length).toBe(2);
    });

    it('should remove relations', () => {
      const diagram = ClassDiagram.create().addInheritance('B', 'A').removeRelation('A', 'B');

      expect(diagram.relationCount).toBe(0);
    });
  });

  describe('Namespace Operations', () => {
    it('should add namespaces', () => {
      const diagram = ClassDiagram.create()
        .addClass('A')
        .addClass('B')
        .addNamespace('MyNamespace', ['A', 'B']);

      expect(diagram.getNamespaceFor('A')).toBe('MyNamespace');
    });

    it('should add class to namespace', () => {
      const diagram = ClassDiagram.create().addClass('A').addToNamespace('NS', 'A');

      expect(diagram.getNamespaceFor('A')).toBe('NS');
    });

    it('should remove class from namespace', () => {
      const diagram = ClassDiagram.create()
        .addClass('A')
        .addToNamespace('NS', 'A')
        .removeFromNamespace('NS', 'A');

      expect(diagram.getNamespaceFor('A')).toBeUndefined();
    });
  });

  describe('Note Operations', () => {
    it('should add notes', () => {
      const diagram = ClassDiagram.create().addClass('A').addNote('This is important', 'A');

      expect(diagram.getNotes().length).toBe(1);
      expect(diagram.getNotes()[0].forClass).toBe('A');
    });
  });

  describe('Style Operations', () => {
    it('should define and apply styles', () => {
      const diagram = ClassDiagram.create()
        .addClass('A')
        .defineStyle('highlight', ['fill:#f9f'])
        .applyStyle('A', 'highlight');

      expect(diagram.getClass('A')?.cssClasses).toContain('highlight');
    });
  });

  describe('Query Operations', () => {
    it('should find classes by annotation', () => {
      const diagram = ClassDiagram.create()
        .addClass('IAnimal', { annotation: 'interface' })
        .addClass('Animal')
        .addClass('IMovable', { annotation: 'interface' });

      const interfaces = diagram.findClasses({ hasAnnotation: 'interface' });
      expect(interfaces.length).toBe(2);
    });

    it('should get subclasses', () => {
      const diagram = ClassDiagram.create()
        .addClass('Animal')
        .addClass('Dog')
        .addClass('Cat')
        .addInheritance('Dog', 'Animal')
        .addInheritance('Cat', 'Animal');

      const subclasses = diagram.getSubclasses('Animal');
      expect(subclasses).toContain('Dog');
      expect(subclasses).toContain('Cat');
    });

    it('should get parent class', () => {
      const diagram = ClassDiagram.create().addInheritance('Dog', 'Animal');

      expect(diagram.getParentClass('Dog')).toBe('Animal');
    });

    it('should get ancestors', () => {
      const diagram = ClassDiagram.create()
        .addInheritance('B', 'A')
        .addInheritance('C', 'B')
        .addInheritance('D', 'C');

      const ancestors = diagram.getAncestors('D');
      expect(ancestors).toEqual(['C', 'B', 'A']);
    });

    it('should get descendants', () => {
      const diagram = ClassDiagram.create()
        .addInheritance('B', 'A')
        .addInheritance('C', 'A')
        .addInheritance('D', 'B');

      const descendants = diagram.getDescendants('A');
      expect(descendants).toContain('B');
      expect(descendants).toContain('C');
      expect(descendants).toContain('D');
    });
  });

  describe('Clone', () => {
    it('should clone the diagram', () => {
      const original = ClassDiagram.create().addClass('A').addClass('B');

      const clone = original.clone();
      clone.addClass('C');

      expect(original.classCount).toBe(2);
      expect(clone.classCount).toBe(3);
    });
  });
});
