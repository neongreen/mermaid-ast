/**
 * C4 Diagram Wrapper Tests
 */

import { describe, expect, it } from 'bun:test';
import { C4 } from '../../src/c4.js';
import type { C4AST } from '../../src/types/index.js';
import {
  isC4Boundary,
  isC4Person,
  isC4System,
  isC4Container,
  isC4Component,
  isC4DeploymentNode,
} from '../../src/types/c4.js';

describe('C4 Diagram', () => {
  describe('Factory Methods', () => {
    it('should create empty C4Context diagram', () => {
      const diagram = C4.create('C4Context');
      const ast = diagram.toAST();
      expect(ast.type).toBe('c4');
      expect(ast.diagramType).toBe('C4Context');
      expect(ast.elements.length).toBe(0);
      expect(ast.relationships.length).toBe(0);
    });

    it('should create empty C4Container diagram', () => {
      const diagram = C4.create('C4Container');
      expect(diagram.toAST().diagramType).toBe('C4Container');
    });

    it('should create empty C4Component diagram', () => {
      const diagram = C4.create('C4Component');
      expect(diagram.toAST().diagramType).toBe('C4Component');
    });

    it('should create empty C4Dynamic diagram', () => {
      const diagram = C4.create('C4Dynamic');
      expect(diagram.toAST().diagramType).toBe('C4Dynamic');
    });

    it('should create empty C4Deployment diagram', () => {
      const diagram = C4.create('C4Deployment');
      expect(diagram.toAST().diagramType).toBe('C4Deployment');
    });

    it('should create from existing AST', () => {
      const ast: C4AST = {
        type: 'c4',
        diagramType: 'C4Context',
        elements: [],
        relationships: [],
        elementStyles: [],
        relationshipStyles: [],
      };
      const diagram = C4.from(ast);
      expect(diagram.toAST().diagramType).toBe('C4Context');
    });

    it('should parse C4Context diagram', () => {
      const text = `C4Context
    Person(user, "User", "A user of the system")`;
      const diagram = C4.parse(text);
      expect(diagram.toAST().diagramType).toBe('C4Context');
    });

    it('should parse C4Container diagram', () => {
      const text = `C4Container
    Container(web, "Web App", "React")`;
      const diagram = C4.parse(text);
      expect(diagram.toAST().diagramType).toBe('C4Container');
    });
  });

  describe('Core Methods', () => {
    it('should return AST with toAST()', () => {
      const diagram = C4.create('C4Context');
      const ast = diagram.toAST();
      expect(ast.type).toBe('c4');
    });

    it('should clone diagram', () => {
      const original = C4.create('C4Context').addPerson('user', { label: 'User' });
      const cloned = original.clone();

      expect(cloned.toAST().elements.length).toBe(1);

      // Verify independence
      cloned.addPerson('admin', { label: 'Admin' });
      expect(original.toAST().elements.length).toBe(1);
      expect(cloned.toAST().elements.length).toBe(2);
    });

    it('should render diagram', () => {
      const diagram = C4.create('C4Context').addPerson('user', { label: 'User' });
      const output = diagram.render();
      expect(output).toContain('C4Context');
      expect(output).toContain('Person');
      expect(output).toContain('user');
    });
  });

  describe('Person Operations', () => {
    it('should add person', () => {
      const diagram = C4.create('C4Context').addPerson('user', { label: 'User' });
      const ast = diagram.toAST();
      expect(ast.elements.length).toBe(1);
      const person = ast.elements[0];
      expect(isC4Person(person)).toBe(true);
      expect(person.type).toBe('person');
      expect(person.alias).toBe('user');
      if (isC4Person(person)) {
        expect(person.label).toBe('User');
      }
    });

    it('should add person with description', () => {
      const diagram = C4.create('C4Context').addPerson('user', {
        label: 'User',
        description: 'A user of the system',
      });
      const ast = diagram.toAST();
      const person = ast.elements[0];
      if (isC4Person(person)) {
        expect(person.description).toBe('A user of the system');
      }
    });

    it('should add external person', () => {
      const diagram = C4.create('C4Context').addPerson('customer', {
        label: 'Customer',
        external: true,
      });
      const ast = diagram.toAST();
      expect(ast.elements[0].type).toBe('external_person');
    });

    it('should add person with sprite', () => {
      const diagram = C4.create('C4Context').addPerson('user', { label: 'User', sprite: 'user' });
      const ast = diagram.toAST();
      const person = ast.elements[0];
      if (isC4Person(person)) {
        expect(person.sprite).toBe('user');
      }
    });

    it('should add person with tags', () => {
      const diagram = C4.create('C4Context').addPerson('user', {
        label: 'User',
        tags: 'important',
      });
      const ast = diagram.toAST();
      const person = ast.elements[0];
      if (isC4Person(person)) {
        expect(person.tags).toBe('important');
      }
    });

    it('should add person with link', () => {
      const diagram = C4.create('C4Context').addPerson('user', {
        label: 'User',
        link: 'https://example.com',
      });
      const ast = diagram.toAST();
      const person = ast.elements[0];
      if (isC4Person(person)) {
        expect(person.link).toBe('https://example.com');
      }
    });
  });

  describe('System Operations', () => {
    it('should add system', () => {
      const diagram = C4.create('C4Context').addSystem('backend', { label: 'Backend System' });
      const ast = diagram.toAST();
      expect(ast.elements.length).toBe(1);
      expect(ast.elements[0].type).toBe('system');
      expect(ast.elements[0].alias).toBe('backend');
    });

    it('should add external system', () => {
      const diagram = C4.create('C4Context').addSystem('external', {
        label: 'External API',
        external: true,
      });
      const ast = diagram.toAST();
      expect(ast.elements[0].type).toBe('external_system');
    });

    it('should add system database', () => {
      const diagram = C4.create('C4Context').addSystem('db', { label: 'Database', variant: 'db' });
      const ast = diagram.toAST();
      expect(ast.elements[0].type).toBe('system_db');
    });

    it('should add external system database', () => {
      const diagram = C4.create('C4Context').addSystem('extDb', {
        label: 'External DB',
        external: true,
        variant: 'db',
      });
      const ast = diagram.toAST();
      expect(ast.elements[0].type).toBe('external_system_db');
    });

    it('should add system queue', () => {
      const diagram = C4.create('C4Context').addSystem('queue', {
        label: 'Message Queue',
        variant: 'queue',
      });
      const ast = diagram.toAST();
      expect(ast.elements[0].type).toBe('system_queue');
    });

    it('should add external system queue', () => {
      const diagram = C4.create('C4Context').addSystem('extQueue', {
        label: 'External Queue',
        external: true,
        variant: 'queue',
      });
      const ast = diagram.toAST();
      expect(ast.elements[0].type).toBe('external_system_queue');
    });
  });

  describe('Container Operations', () => {
    it('should add container', () => {
      const diagram = C4.create('C4Container').addContainer('web', { label: 'Web Application' });
      const ast = diagram.toAST();
      expect(ast.elements.length).toBe(1);
      expect(ast.elements[0].type).toBe('container');
      expect(ast.elements[0].alias).toBe('web');
    });

    it('should add container with technology', () => {
      const diagram = C4.create('C4Container').addContainer('web', {
        label: 'Web App',
        technology: 'React',
      });
      const ast = diagram.toAST();
      const container = ast.elements[0];
      if (isC4Container(container)) {
        expect(container.technology).toBe('React');
      }
    });

    it('should add external container', () => {
      const diagram = C4.create('C4Container').addContainer('ext', {
        label: 'External Service',
        external: true,
      });
      const ast = diagram.toAST();
      expect(ast.elements[0].type).toBe('external_container');
    });

    it('should add container database', () => {
      const diagram = C4.create('C4Container').addContainer('db', {
        label: 'Database',
        variant: 'db',
        technology: 'PostgreSQL',
      });
      const ast = diagram.toAST();
      expect(ast.elements[0].type).toBe('container_db');
    });

    it('should add container queue', () => {
      const diagram = C4.create('C4Container').addContainer('queue', {
        label: 'Message Queue',
        variant: 'queue',
        technology: 'RabbitMQ',
      });
      const ast = diagram.toAST();
      expect(ast.elements[0].type).toBe('container_queue');
    });
  });

  describe('Component Operations', () => {
    it('should add component', () => {
      const diagram = C4.create('C4Component').addComponent('auth', { label: 'Auth Service' });
      const ast = diagram.toAST();
      expect(ast.elements.length).toBe(1);
      expect(ast.elements[0].type).toBe('component');
      expect(ast.elements[0].alias).toBe('auth');
    });

    it('should add component with technology', () => {
      const diagram = C4.create('C4Component').addComponent('auth', {
        label: 'Auth Service',
        technology: 'Spring Security',
      });
      const ast = diagram.toAST();
      const component = ast.elements[0];
      if (isC4Component(component)) {
        expect(component.technology).toBe('Spring Security');
      }
    });

    it('should add external component', () => {
      const diagram = C4.create('C4Component').addComponent('ext', {
        label: 'External Component',
        external: true,
      });
      const ast = diagram.toAST();
      expect(ast.elements[0].type).toBe('external_component');
    });

    it('should add component database', () => {
      const diagram = C4.create('C4Component').addComponent('cache', {
        label: 'Cache',
        variant: 'db',
      });
      const ast = diagram.toAST();
      expect(ast.elements[0].type).toBe('component_db');
    });

    it('should add component queue', () => {
      const diagram = C4.create('C4Component').addComponent('events', {
        label: 'Event Bus',
        variant: 'queue',
      });
      const ast = diagram.toAST();
      expect(ast.elements[0].type).toBe('component_queue');
    });
  });

  describe('Boundary Operations', () => {
    it('should add boundary', () => {
      const diagram = C4.create('C4Context').addBoundary('enterprise', 'boundary', {
        label: 'Enterprise',
      });
      const ast = diagram.toAST();
      expect(ast.elements.length).toBe(1);
      const boundary = ast.elements[0];
      expect(isC4Boundary(boundary)).toBe(true);
      expect(boundary.alias).toBe('enterprise');
      if (isC4Boundary(boundary)) {
        expect(boundary.label).toBe('Enterprise');
        expect(boundary.type).toBe('boundary');
      }
    });

    it('should add enterprise boundary', () => {
      const diagram = C4.create('C4Context').addBoundary('enterprise', 'enterprise_boundary', {
        label: 'My Enterprise',
      });
      const ast = diagram.toAST();
      const boundary = ast.elements[0];
      if (isC4Boundary(boundary)) {
        expect(boundary.type).toBe('enterprise_boundary');
      }
    });

    it('should add system boundary', () => {
      const diagram = C4.create('C4Container').addBoundary('system', 'system_boundary', {
        label: 'My System',
      });
      const ast = diagram.toAST();
      const boundary = ast.elements[0];
      if (isC4Boundary(boundary)) {
        expect(boundary.type).toBe('system_boundary');
      }
    });

    it('should add container boundary', () => {
      const diagram = C4.create('C4Component').addBoundary('container', 'container_boundary', {
        label: 'My Container',
      });
      const ast = diagram.toAST();
      const boundary = ast.elements[0];
      if (isC4Boundary(boundary)) {
        expect(boundary.type).toBe('container_boundary');
      }
    });

    it('should add boundary with tags', () => {
      const diagram = C4.create('C4Context').addBoundary('b1', 'boundary', {
        label: 'Boundary',
        tags: 'important',
      });
      const ast = diagram.toAST();
      const boundary = ast.elements[0];
      if (isC4Boundary(boundary)) {
        expect(boundary.tags).toBe('important');
      }
    });
  });

  describe('Deployment Node Operations', () => {
    it('should add deployment node', () => {
      const diagram = C4.create('C4Deployment').addDeploymentNode('server', {
        label: 'Web Server',
      });
      const ast = diagram.toAST();
      expect(ast.elements.length).toBe(1);
      const node = ast.elements[0];
      expect(isC4DeploymentNode(node)).toBe(true);
      expect(node.type).toBe('node');
      expect(node.alias).toBe('server');
    });

    it('should add deployment node with technology', () => {
      const diagram = C4.create('C4Deployment').addDeploymentNode('server', {
        label: 'Web Server',
        technology: 'Ubuntu',
      });
      const ast = diagram.toAST();
      const node = ast.elements[0];
      if (isC4DeploymentNode(node)) {
        expect(node.technology).toBe('Ubuntu');
      }
    });

    it('should add left-aligned deployment node', () => {
      const diagram = C4.create('C4Deployment').addDeploymentNode('server', {
        label: 'Server',
        variant: 'left',
      });
      const ast = diagram.toAST();
      expect(ast.elements[0].type).toBe('nodeL');
    });

    it('should add right-aligned deployment node', () => {
      const diagram = C4.create('C4Deployment').addDeploymentNode('server', {
        label: 'Server',
        variant: 'right',
      });
      const ast = diagram.toAST();
      expect(ast.elements[0].type).toBe('nodeR');
    });
  });

  describe('Relationship Operations', () => {
    it('should add relationship', () => {
      const diagram = C4.create('C4Context')
        .addPerson('user', { label: 'User' })
        .addSystem('system', { label: 'System' })
        .addRelationship('user', 'system', { label: 'Uses' });
      const ast = diagram.toAST();
      expect(ast.relationships.length).toBe(1);
      expect(ast.relationships[0].from).toBe('user');
      expect(ast.relationships[0].to).toBe('system');
      expect(ast.relationships[0].label).toBe('Uses');
    });

    it('should add relationship with technology', () => {
      const diagram = C4.create('C4Context')
        .addPerson('user', { label: 'User' })
        .addSystem('system', { label: 'System' })
        .addRelationship('user', 'system', { label: 'Uses', technology: 'HTTPS' });
      const ast = diagram.toAST();
      expect(ast.relationships[0].technology).toBe('HTTPS');
    });

    it('should add bidirectional relationship', () => {
      const diagram = C4.create('C4Context')
        .addSystem('a', { label: 'System A' })
        .addSystem('b', { label: 'System B' })
        .addRelationship('a', 'b', { label: 'Syncs with', type: 'birel' });
      const ast = diagram.toAST();
      expect(ast.relationships[0].type).toBe('birel');
    });

    it('should add relationship with direction', () => {
      const diagram = C4.create('C4Context')
        .addSystem('a', { label: 'System A' })
        .addSystem('b', { label: 'System B' })
        .addRelationship('a', 'b', { label: 'Calls', type: 'rel_d' });
      const ast = diagram.toAST();
      expect(ast.relationships[0].type).toBe('rel_d');
    });

    it('should add relationship with tags', () => {
      const diagram = C4.create('C4Context')
        .addSystem('a', { label: 'A' })
        .addSystem('b', { label: 'B' })
        .addRelationship('a', 'b', { label: 'Uses', tags: 'async' });
      const ast = diagram.toAST();
      expect(ast.relationships[0].tags).toBe('async');
    });
  });

  describe('Style Operations', () => {
    it('should add element style', () => {
      const diagram = C4.create('C4Context').addElementStyle('person', { bgColor: '#blue' });
      const ast = diagram.toAST();
      expect(ast.elementStyles.length).toBe(1);
      expect(ast.elementStyles[0].elementName).toBe('person');
      expect(ast.elementStyles[0].bgColor).toBe('#blue');
    });

    it('should add relationship style', () => {
      const diagram = C4.create('C4Context').addRelationshipStyle('user', 'system', {
        lineColor: '#red',
      });
      const ast = diagram.toAST();
      expect(ast.relationshipStyles.length).toBe(1);
      expect(ast.relationshipStyles[0].from).toBe('user');
      expect(ast.relationshipStyles[0].to).toBe('system');
      expect(ast.relationshipStyles[0].lineColor).toBe('#red');
    });
  });

  describe('Query Operations', () => {
    it('should find elements by type', () => {
      const diagram = C4.create('C4Context')
        .addPerson('user1', { label: 'User 1' })
        .addPerson('user2', { label: 'User 2' })
        .addSystem('system', { label: 'System' });

      const persons = diagram.findElements({ type: 'person' });
      expect(persons.length).toBe(2);
    });

    it('should find elements by alias', () => {
      const diagram = C4.create('C4Context')
        .addPerson('user', { label: 'User' })
        .addSystem('system', { label: 'System' });

      const elements = diagram.findElements({ alias: 'user' });
      expect(elements.length).toBe(1);
      expect(elements[0].alias).toBe('user');
    });

    it('should find relationships', () => {
      const diagram = C4.create('C4Context')
        .addPerson('user', { label: 'User' })
        .addSystem('a', { label: 'System A' })
        .addSystem('b', { label: 'System B' })
        .addRelationship('user', 'a', { label: 'Uses A' })
        .addRelationship('user', 'b', { label: 'Uses B' });

      const rels = diagram.findRelationships({ from: 'user' });
      expect(rels.length).toBe(2);
    });

    it('should find relationships by to', () => {
      const diagram = C4.create('C4Context')
        .addPerson('user', { label: 'User' })
        .addSystem('system', { label: 'System' })
        .addRelationship('user', 'system', { label: 'Uses' });

      const rels = diagram.findRelationships({ to: 'system' });
      expect(rels.length).toBe(1);
    });

    it('should get element by alias', () => {
      const diagram = C4.create('C4Context').addPerson('user', { label: 'User' });

      const element = diagram.getElement('user');
      expect(element).toBeDefined();
      if (element && isC4Person(element)) {
        expect(element.label).toBe('User');
      }
    });

    it('should return undefined for non-existent element', () => {
      const diagram = C4.create('C4Context');
      const element = diagram.getElement('nonexistent');
      expect(element).toBeUndefined();
    });
  });

  describe('Complex Scenarios', () => {
    it('should build complete C4Context diagram', () => {
      const diagram = C4.create('C4Context')
        .setTitle('System Context Diagram')
        .addPerson('user', { label: 'User', description: 'A user of the system' })
        .addSystem('system', { label: 'My System', description: 'The main system' })
        .addSystem('external', { label: 'External API', external: true })
        .addRelationship('user', 'system', { label: 'Uses' })
        .addRelationship('system', 'external', { label: 'Calls', technology: 'REST' });

      const ast = diagram.toAST();
      expect(ast.elements.length).toBe(3);
      expect(ast.relationships.length).toBe(2);
      expect(ast.title).toBe('System Context Diagram');
    });

    it('should build C4Container diagram with boundaries', () => {
      const diagram = C4.create('C4Container')
        .addBoundary('system', 'system_boundary', { label: 'My System' })
        .addContainer('web', { label: 'Web App', technology: 'React' })
        .addContainer('api', { label: 'API', technology: 'Node.js' })
        .addContainer('db', { label: 'Database', variant: 'db', technology: 'PostgreSQL' })
        .addRelationship('web', 'api', { label: 'Calls', technology: 'REST' })
        .addRelationship('api', 'db', { label: 'Reads/Writes', technology: 'SQL' });

      const ast = diagram.toAST();
      // Boundary + 3 containers = 4 elements
      expect(ast.elements.length).toBe(4);
      expect(ast.relationships.length).toBe(2);
    });

    it('should build C4Dynamic diagram', () => {
      const diagram = C4.create('C4Dynamic')
        .addComponent('ui', { label: 'UI' })
        .addComponent('controller', { label: 'Controller' })
        .addComponent('service', { label: 'Service' })
        .addComponent('db', { label: 'Database' })
        .addRelationship('ui', 'controller', { label: 'Submit form' })
        .addRelationship('controller', 'service', { label: 'Process request' })
        .addRelationship('service', 'db', { label: 'Save data' })
        .addRelationship('service', 'controller', { label: 'Return result' })
        .addRelationship('controller', 'ui', { label: 'Display result' });

      const ast = diagram.toAST();
      expect(ast.relationships.length).toBe(5);
    });

    it('should build C4Deployment diagram', () => {
      const diagram = C4.create('C4Deployment')
        .addDeploymentNode('aws', { label: 'AWS', technology: 'Amazon Web Services' })
        .addDeploymentNode('ec2', { label: 'EC2 Instance', technology: 'Ubuntu' })
        .addContainer('web', { label: 'Web Application', technology: 'Docker' });

      const ast = diagram.toAST();
      expect(ast.elements.length).toBe(3);
    });
  });
});
