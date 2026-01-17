import { describe, expect, test } from 'bun:test';
import { ClassDiagramValidationError, classDiagram } from '../../src/builder/class-builder.js';
import { parseClassDiagram } from '../../src/parser/class-parser.js';
import { renderClassDiagram } from '../../src/renderer/class-renderer.js';

describe('ClassDiagramBuilder', () => {
  test('builds a simple class diagram', () => {
    const ast = classDiagram().class('Animal').class('Dog').extends('Dog', 'Animal').build();

    expect(ast.type).toBe('classDiagram');
    expect(ast.classes.size).toBe(2);
    expect(ast.relations.length).toBe(1);
  });

  test('builds classes with members', () => {
    const ast = classDiagram()
      .class('Person', (c) => {
        c.property('name: string', '+')
          .property('age: int', '-')
          .method('getName()', '+')
          .method('setAge(age)', '#');
      })
      .build();

    const person = ast.classes.get('Person');
    expect(person?.members.length).toBe(4);
    expect(person?.members[0].visibility).toBe('+');
    expect(person?.members[1].visibility).toBe('-');
  });

  test('builds inheritance relations', () => {
    const ast = classDiagram().class('Animal').class('Dog').extends('Dog', 'Animal').build();

    const relation = ast.relations[0];
    expect(relation.id1).toBe('Animal');
    expect(relation.id2).toBe('Dog');
    expect(relation.relation.type1).toBe('extension');
  });

  test('builds composition relations', () => {
    const ast = classDiagram().class('Car').class('Engine').composition('Car', 'Engine').build();

    const relation = ast.relations[0];
    expect(relation.relation.type1).toBe('composition');
  });

  test('builds aggregation relations', () => {
    const ast = classDiagram()
      .class('Department')
      .class('Employee')
      .aggregation('Department', 'Employee')
      .build();

    const relation = ast.relations[0];
    expect(relation.relation.type1).toBe('aggregation');
  });

  test('builds namespaces', () => {
    const ast = classDiagram()
      .namespace('MyNamespace', (b) => {
        b.class('ClassA').class('ClassB');
      })
      .build();

    const ns = ast.namespaces.get('MyNamespace');
    expect(ns?.classes).toContain('ClassA');
    expect(ns?.classes).toContain('ClassB');
  });

  test('builds notes', () => {
    const ast = classDiagram().class('MyClass').note('This is a note', 'MyClass').build();

    expect(ast.notes.length).toBe(1);
    expect(ast.notes[0].forClass).toBe('MyClass');
  });

  test('validates relation references', () => {
    expect(() => {
      classDiagram().class('A').extends('B', 'A').build();
    }).toThrow(ClassDiagramValidationError);
  });

  test('allows skipping validation', () => {
    const ast = classDiagram().class('A').extends('B', 'A').build({ validate: false });

    expect(ast.relations.length).toBe(1);
  });

  test('round-trips through render and parse', () => {
    const ast = classDiagram()
      .class('Animal', (c) => {
        c.property('name: string');
      })
      .class('Dog')
      .extends('Dog', 'Animal')
      .build();

    const rendered = renderClassDiagram(ast);
    const parsed = parseClassDiagram(rendered);

    expect(parsed.classes.size).toBe(ast.classes.size);
    expect(parsed.relations.length).toBe(ast.relations.length);
  });
});
