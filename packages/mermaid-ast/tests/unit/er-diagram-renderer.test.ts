import { describe, expect, it } from 'bun:test';
import { ErDiagram } from '../../src/er-diagram.js';
import { renderErDiagram } from '../../src/renderer/er-renderer.js';
import { createEmptyErDiagramAST } from '../../src/types/er.js';
import { expectGolden } from '../golden/golden.js';

describe('ErDiagram Renderer', () => {
  describe('Basic Rendering', () => {
    it('should render to Mermaid syntax', () => {
      const diagram = ErDiagram.create()
        .addEntity('CUSTOMER')
        .addAttribute('CUSTOMER', 'string', 'name')
        .addRelationship('CUSTOMER', 'ORDER', 'places', {
          cardA: 'ONLY_ONE',
          cardB: 'ZERO_OR_MORE',
        });

      expectGolden(diagram.render(), 'er/render-basic.mmd');
    });
  });

  describe('Direct Renderer Tests', () => {
    it('should render a simple ER diagram', () => {
      const ast = createEmptyErDiagramAST();
      ast.entities.set('CUSTOMER', { name: 'CUSTOMER', attributes: [] });
      ast.entities.set('ORDER', { name: 'ORDER', attributes: [] });
      ast.relationships.push({
        entityA: 'CUSTOMER',
        entityB: 'ORDER',
        role: 'places',
        relSpec: {
          cardA: 'ZERO_OR_MORE',
          cardB: 'ONLY_ONE',
          relType: 'IDENTIFYING',
        },
      });

      const result = renderErDiagram(ast);

      expect(result).toContain('erDiagram');
      expect(result).toContain('CUSTOMER');
      expect(result).toContain('ORDER');
      expect(result).toContain('places');
    });

    it('should render entity with attributes', () => {
      const ast = createEmptyErDiagramAST();
      ast.entities.set('CUSTOMER', {
        name: 'CUSTOMER',
        attributes: [
          { type: 'string', name: 'name' },
          { type: 'int', name: 'age' },
        ],
      });

      const result = renderErDiagram(ast);

      expect(result).toContain('CUSTOMER {');
      expect(result).toContain('string name');
      expect(result).toContain('int age');
      expect(result).toContain('}');
    });

    it('should render attributes with keys', () => {
      const ast = createEmptyErDiagramAST();
      ast.entities.set('CUSTOMER', {
        name: 'CUSTOMER',
        attributes: [
          { type: 'int', name: 'id', keys: ['PK'] },
          { type: 'string', name: 'email', keys: ['UK'] },
        ],
      });

      const result = renderErDiagram(ast);

      expect(result).toContain('int id PK');
      expect(result).toContain('string email UK');
    });

    it('should render attributes with comments', () => {
      const ast = createEmptyErDiagramAST();
      ast.entities.set('CUSTOMER', {
        name: 'CUSTOMER',
        attributes: [{ type: 'int', name: 'id', keys: ['PK'], comment: 'Primary key' }],
      });

      const result = renderErDiagram(ast);

      expect(result).toContain('int id PK "Primary key"');
    });

    it('should render different cardinalities', () => {
      const ast = createEmptyErDiagramAST();
      ast.entities.set('A', { name: 'A', attributes: [] });
      ast.entities.set('B', { name: 'B', attributes: [] });
      ast.relationships.push({
        entityA: 'A',
        entityB: 'B',
        role: 'rel',
        relSpec: {
          cardA: 'ZERO_OR_MORE',
          cardB: 'ONLY_ONE',
          relType: 'IDENTIFYING',
        },
      });

      const result = renderErDiagram(ast);

      // ||--o{ means: left is ONLY_ONE, right is ZERO_OR_MORE
      expect(result).toContain('||--o{');
    });

    it('should render non-identifying relationships', () => {
      const ast = createEmptyErDiagramAST();
      ast.entities.set('A', { name: 'A', attributes: [] });
      ast.entities.set('B', { name: 'B', attributes: [] });
      ast.relationships.push({
        entityA: 'A',
        entityB: 'B',
        role: 'rel',
        relSpec: {
          cardA: 'ONLY_ONE',
          cardB: 'ONLY_ONE',
          relType: 'NON_IDENTIFYING',
        },
      });

      const result = renderErDiagram(ast);

      expect(result).toContain('..');
    });

    it('should render entity with alias', () => {
      const ast = createEmptyErDiagramAST();
      ast.entities.set('CUSTOMER', {
        name: 'CUSTOMER',
        alias: 'Customer Entity',
        attributes: [],
      });

      const result = renderErDiagram(ast);

      expect(result).toContain('CUSTOMER["Customer Entity"]');
    });

    it('should render direction', () => {
      const ast = createEmptyErDiagramAST();
      ast.direction = 'LR';
      ast.entities.set('A', { name: 'A', attributes: [] });

      const result = renderErDiagram(ast);

      expect(result).toContain('direction LR');
    });

    it('should render accessibility title and description', () => {
      const ast = createEmptyErDiagramAST();
      ast.accTitle = 'My ER Diagram';
      ast.accDescription = 'A diagram showing relationships';
      ast.entities.set('A', { name: 'A', attributes: [] });

      const result = renderErDiagram(ast);

      expect(result).toContain('accTitle: My ER Diagram');
      expect(result).toContain('accDescr: A diagram showing relationships');
    });

    it('should render class assignments', () => {
      const ast = createEmptyErDiagramAST();
      ast.entities.set('CUSTOMER', { name: 'CUSTOMER', attributes: [] });
      ast.classes.set('CUSTOMER', ['highlight']);

      const result = renderErDiagram(ast);

      expect(result).toContain('CUSTOMER:::highlight');
    });
  });
});
