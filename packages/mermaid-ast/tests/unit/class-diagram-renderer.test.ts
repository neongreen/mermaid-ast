import { describe, expect, it } from 'bun:test';
import { ClassDiagram } from '../../src/class-diagram.js';
import { renderClassDiagram } from '../../src/renderer/class-renderer.js';
import type { ClassDiagramAST } from '../../src/types/class.js';
import { expectGolden } from '../golden/golden.js';

describe('ClassDiagram Renderer', () => {
  describe('Basic Rendering', () => {
    it('should render to Mermaid syntax', () => {
      const diagram = ClassDiagram.create()
        .addClass('Animal')
        .addMethod('Animal', 'eat()', '+')
        .addClass('Dog')
        .addInheritance('Dog', 'Animal');

      expectGolden(diagram.render(), 'class/render-basic.mmd');
    });
  });

  describe('Relation Types', () => {
    it('should render aggregation relation', () => {
      const diagram = ClassDiagram.create()
        .addClass('Car')
        .addClass('Engine')
        .addAggregation('Car', 'Engine');

      const output = diagram.render();
      expect(output).toContain('Car o-- Engine');
    });

    it('should render lollipop relation', () => {
      // Create AST directly to test lollipop relation type
      const ast: ClassDiagramAST = {
        type: 'classDiagram',
        classes: new Map([
          [
            'Class1',
            {
              id: 'Class1',
              label: 'Class1',
              members: [],
              annotations: [],
              cssClasses: [],
              styles: [],
            },
          ],
          [
            'Interface1',
            {
              id: 'Interface1',
              label: 'Interface1',
              members: [],
              annotations: [],
              cssClasses: [],
              styles: [],
            },
          ],
        ]),
        relations: [
          {
            id1: 'Class1',
            id2: 'Interface1',
            relation: {
              type1: 'lollipop',
              type2: 'none',
              lineType: 'solid',
            },
          },
        ],
        namespaces: new Map(),
        notes: [],
        classDefs: new Map(),
        direction: 'TB',
      };
      const output = renderClassDiagram(ast);
      expect(output).toContain('()--');
    });
  });

  describe('Click Handlers', () => {
    it('should render callback with args and tooltip', () => {
      // Create AST directly to test callback with args
      const ast: ClassDiagramAST = {
        type: 'classDiagram',
        classes: new Map([
          [
            'MyClass',
            {
              id: 'MyClass',
              label: 'MyClass',
              members: [],
              annotations: [],
              cssClasses: [],
              styles: [],
              callback: 'handleClick',
              callbackArgs: 'arg1, arg2',
              tooltip: 'Click me',
            },
          ],
        ]),
        relations: [],
        namespaces: new Map(),
        notes: [],
        classDefs: new Map(),
        direction: 'TB',
      };
      const output = renderClassDiagram(ast);
      expect(output).toContain('callback MyClass "handleClick"("arg1, arg2") "Click me"');
    });
  });

  describe('Style Definitions', () => {
    it('should render classDef style definitions', () => {
      // Create a diagram with classDef style definitions using the fluent API
      const diagram = ClassDiagram.create()
        .addClass('MyClass')
        .addMethod('MyClass', 'doSomething()', '+')
        .defineStyle('highlight', ['fill:#f9f', 'stroke:#333', 'stroke-width:2px'])
        .defineStyle('error', ['fill:#f00', 'color:#fff']);

      expectGolden(diagram.render(), 'class/render-classdef-styles.mmd');
    });
  });
});
