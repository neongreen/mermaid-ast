/**
 * C4 Diagram Parser Tests
 */

import { describe, expect, it } from 'bun:test';
import { isC4Diagram, parseC4 } from '../../src/parser/c4-parser.js';
import {
  isC4Boundary,
  isC4Person,
  isC4System,
  isC4Container,
  isC4Component,
  isC4DeploymentNode,
} from '../../src/types/c4.js';

describe('C4 Parser', () => {
  describe('isC4Diagram', () => {
    it('should detect C4Context diagram', () => {
      expect(isC4Diagram('C4Context')).toBe(true);
      expect(isC4Diagram('C4Context\n    Person(user, "User")')).toBe(true);
    });

    it('should detect C4Container diagram', () => {
      expect(isC4Diagram('C4Container')).toBe(true);
      expect(isC4Diagram('C4Container\n    Container(web, "Web")')).toBe(true);
    });

    it('should detect C4Component diagram', () => {
      expect(isC4Diagram('C4Component')).toBe(true);
    });

    it('should detect C4Dynamic diagram', () => {
      expect(isC4Diagram('C4Dynamic')).toBe(true);
    });

    it('should detect C4Deployment diagram', () => {
      expect(isC4Diagram('C4Deployment')).toBe(true);
    });

    it('should handle whitespace', () => {
      expect(isC4Diagram('  C4Context')).toBe(true);
      expect(isC4Diagram('\nC4Container')).toBe(true);
    });

    it('should reject non-C4 diagrams', () => {
      expect(isC4Diagram('flowchart LR')).toBe(false);
      expect(isC4Diagram('sequenceDiagram')).toBe(false);
      expect(isC4Diagram('classDiagram')).toBe(false);
      expect(isC4Diagram('')).toBe(false);
    });
  });

  describe('Basic Parsing', () => {
    it('should parse empty C4Context', () => {
      const ast = parseC4('C4Context');
      expect(ast.type).toBe('c4');
      expect(ast.diagramType).toBe('C4Context');
    });

    it('should parse empty C4Container', () => {
      const ast = parseC4('C4Container');
      expect(ast.diagramType).toBe('C4Container');
    });

    it('should parse empty C4Component', () => {
      const ast = parseC4('C4Component');
      expect(ast.diagramType).toBe('C4Component');
    });

    it('should parse empty C4Dynamic', () => {
      const ast = parseC4('C4Dynamic');
      expect(ast.diagramType).toBe('C4Dynamic');
    });

    it('should parse empty C4Deployment', () => {
      const ast = parseC4('C4Deployment');
      expect(ast.diagramType).toBe('C4Deployment');
    });
  });

  describe('Person Parsing', () => {
    it('should parse Person', () => {
      const ast = parseC4(`C4Context
    Person(user, "User")`);
      expect(ast.elements.length).toBe(1);
      const person = ast.elements[0];
      expect(isC4Person(person)).toBe(true);
      expect(person.type).toBe('person');
      expect(person.alias).toBe('user');
      if (isC4Person(person)) {
        expect(person.label).toBe('User');
      }
    });

    it('should parse Person with description', () => {
      const ast = parseC4(`C4Context
    Person(user, "User", "A user of the system")`);
      const person = ast.elements[0];
      if (isC4Person(person)) {
        expect(person.description).toBe('A user of the system');
      }
    });

    it('should parse Person_Ext', () => {
      const ast = parseC4(`C4Context
    Person_Ext(customer, "Customer")`);
      expect(ast.elements[0].type).toBe('external_person');
    });
  });

  describe('System Parsing', () => {
    it('should parse System', () => {
      const ast = parseC4(`C4Context
    System(backend, "Backend System")`);
      expect(ast.elements.length).toBe(1);
      expect(ast.elements[0].type).toBe('system');
      expect(ast.elements[0].alias).toBe('backend');
    });

    it('should parse System_Ext', () => {
      const ast = parseC4(`C4Context
    System_Ext(external, "External API")`);
      expect(ast.elements[0].type).toBe('external_system');
    });

    it('should parse SystemDb', () => {
      const ast = parseC4(`C4Context
    SystemDb(db, "Database")`);
      expect(ast.elements[0].type).toBe('system_db');
    });

    it('should parse SystemDb_Ext', () => {
      const ast = parseC4(`C4Context
    SystemDb_Ext(extDb, "External DB")`);
      expect(ast.elements[0].type).toBe('external_system_db');
    });

    it('should parse SystemQueue', () => {
      const ast = parseC4(`C4Context
    SystemQueue(queue, "Message Queue")`);
      expect(ast.elements[0].type).toBe('system_queue');
    });

    it('should parse SystemQueue_Ext', () => {
      const ast = parseC4(`C4Context
    SystemQueue_Ext(extQueue, "External Queue")`);
      expect(ast.elements[0].type).toBe('external_system_queue');
    });
  });

  describe('Container Parsing', () => {
    it('should parse Container', () => {
      const ast = parseC4(`C4Container
    Container(web, "Web Application")`);
      expect(ast.elements[0].type).toBe('container');
      expect(ast.elements[0].alias).toBe('web');
    });

    it('should parse Container with technology', () => {
      const ast = parseC4(`C4Container
    Container(web, "Web App", "React")`);
      const container = ast.elements[0];
      if (isC4Container(container)) {
        expect(container.technology).toBe('React');
      }
    });

    it('should parse Container_Ext', () => {
      const ast = parseC4(`C4Container
    Container_Ext(ext, "External Service")`);
      expect(ast.elements[0].type).toBe('external_container');
    });

    it('should parse ContainerDb', () => {
      const ast = parseC4(`C4Container
    ContainerDb(db, "Database", "PostgreSQL")`);
      expect(ast.elements[0].type).toBe('container_db');
      const container = ast.elements[0];
      if (isC4Container(container)) {
        expect(container.technology).toBe('PostgreSQL');
      }
    });

    it('should parse ContainerQueue', () => {
      const ast = parseC4(`C4Container
    ContainerQueue(queue, "Message Queue", "RabbitMQ")`);
      expect(ast.elements[0].type).toBe('container_queue');
    });
  });

  describe('Component Parsing', () => {
    it('should parse Component', () => {
      const ast = parseC4(`C4Component
    Component(auth, "Auth Service")`);
      expect(ast.elements[0].type).toBe('component');
      expect(ast.elements[0].alias).toBe('auth');
    });

    it('should parse Component with technology', () => {
      const ast = parseC4(`C4Component
    Component(auth, "Auth Service", "Spring Security")`);
      const component = ast.elements[0];
      if (isC4Component(component)) {
        expect(component.technology).toBe('Spring Security');
      }
    });

    it('should parse Component_Ext', () => {
      const ast = parseC4(`C4Component
    Component_Ext(ext, "External Component")`);
      expect(ast.elements[0].type).toBe('external_component');
    });

    it('should parse ComponentDb', () => {
      const ast = parseC4(`C4Component
    ComponentDb(cache, "Cache")`);
      expect(ast.elements[0].type).toBe('component_db');
    });

    it('should parse ComponentQueue', () => {
      const ast = parseC4(`C4Component
    ComponentQueue(events, "Event Bus")`);
      expect(ast.elements[0].type).toBe('component_queue');
    });
  });

  describe('Boundary Parsing', () => {
    it('should parse Boundary', () => {
      const ast = parseC4(`C4Context
    Boundary(b1, "Boundary") {
    }`);
      expect(ast.elements.length).toBe(1);
      const boundary = ast.elements[0];
      expect(isC4Boundary(boundary)).toBe(true);
      expect(boundary.alias).toBe('b1');
      if (isC4Boundary(boundary)) {
        expect(boundary.label).toBe('Boundary');
        expect(boundary.type).toBe('boundary');
      }
    });

    it('should parse Enterprise_Boundary', () => {
      const ast = parseC4(`C4Context
    Enterprise_Boundary(enterprise, "My Enterprise") {
    }`);
      const boundary = ast.elements[0];
      if (isC4Boundary(boundary)) {
        expect(boundary.type).toBe('enterprise_boundary');
      }
    });

    it('should parse System_Boundary', () => {
      const ast = parseC4(`C4Container
    System_Boundary(system, "My System") {
    }`);
      const boundary = ast.elements[0];
      if (isC4Boundary(boundary)) {
        expect(boundary.type).toBe('system_boundary');
      }
    });

    it('should parse Container_Boundary', () => {
      const ast = parseC4(`C4Component
    Container_Boundary(container, "My Container") {
    }`);
      const boundary = ast.elements[0];
      if (isC4Boundary(boundary)) {
        expect(boundary.type).toBe('container_boundary');
      }
    });
  });

  describe('Deployment Node Parsing', () => {
    it('should parse Node', () => {
      const ast = parseC4(`C4Deployment
    Node(server, "Web Server") {
    }`);
      expect(ast.elements.length).toBe(1);
      const node = ast.elements[0];
      expect(isC4DeploymentNode(node)).toBe(true);
      expect(node.type).toBe('node');
      expect(node.alias).toBe('server');
    });

    it('should parse Node with technology', () => {
      const ast = parseC4(`C4Deployment
    Node(server, "Web Server", "Ubuntu") {
    }`);
      const node = ast.elements[0];
      if (isC4DeploymentNode(node)) {
        expect(node.technology).toBe('Ubuntu');
      }
    });

    it('should parse Node_L', () => {
      const ast = parseC4(`C4Deployment
    Node_L(server, "Server") {
    }`);
      expect(ast.elements[0].type).toBe('nodeL');
    });

    it('should parse Node_R', () => {
      const ast = parseC4(`C4Deployment
    Node_R(server, "Server") {
    }`);
      expect(ast.elements[0].type).toBe('nodeR');
    });
  });

  describe('Relationship Parsing', () => {
    it('should parse Rel', () => {
      const ast = parseC4(`C4Context
    Person(user, "User")
    System(system, "System")
    Rel(user, system, "Uses")`);
      expect(ast.relationships.length).toBe(1);
      expect(ast.relationships[0].from).toBe('user');
      expect(ast.relationships[0].to).toBe('system');
      expect(ast.relationships[0].label).toBe('Uses');
      expect(ast.relationships[0].type).toBe('rel');
    });

    it('should parse Rel with technology', () => {
      const ast = parseC4(`C4Context
    Person(user, "User")
    System(system, "System")
    Rel(user, system, "Uses", "HTTPS")`);
      expect(ast.relationships[0].technology).toBe('HTTPS');
    });

    it('should parse BiRel', () => {
      const ast = parseC4(`C4Context
    System(a, "A")
    System(b, "B")
    BiRel(a, b, "Syncs")`);
      expect(ast.relationships[0].type).toBe('birel');
    });

    it('should parse Rel_U', () => {
      const ast = parseC4(`C4Context
    System(a, "A")
    System(b, "B")
    Rel_U(a, b, "Calls")`);
      expect(ast.relationships[0].type).toBe('rel_u');
    });

    it('should parse Rel_D', () => {
      const ast = parseC4(`C4Context
    System(a, "A")
    System(b, "B")
    Rel_D(a, b, "Calls")`);
      expect(ast.relationships[0].type).toBe('rel_d');
    });

    it('should parse Rel_L', () => {
      const ast = parseC4(`C4Context
    System(a, "A")
    System(b, "B")
    Rel_L(a, b, "Calls")`);
      expect(ast.relationships[0].type).toBe('rel_l');
    });

    it('should parse Rel_R', () => {
      const ast = parseC4(`C4Context
    System(a, "A")
    System(b, "B")
    Rel_R(a, b, "Calls")`);
      expect(ast.relationships[0].type).toBe('rel_r');
    });

    it('should parse Rel_B', () => {
      const ast = parseC4(`C4Context
    System(a, "A")
    System(b, "B")
    Rel_Back(a, b, "Calls")`);
      expect(ast.relationships[0].type).toBe('rel_b');
    });
  });

  describe('Style Parsing', () => {
    it('should parse UpdateElementStyle', () => {
      const ast = parseC4(`C4Context
    Person(user, "User")
    UpdateElementStyle(user, $bgColor="blue")`);
      expect(ast.elementStyles.length).toBe(1);
      expect(ast.elementStyles[0].elementName).toBe('user');
    });

    it('should parse UpdateRelStyle', () => {
      const ast = parseC4(`C4Context
    Person(user, "User")
    System(system, "System")
    Rel(user, system, "Uses")
    UpdateRelStyle(user, system, $lineColor="red")`);
      expect(ast.relationshipStyles.length).toBe(1);
      expect(ast.relationshipStyles[0].from).toBe('user');
      expect(ast.relationshipStyles[0].to).toBe('system');
    });

    it('should parse UpdateLayoutConfig', () => {
      const ast = parseC4(`C4Context
    Person(user, "User")
    UpdateLayoutConfig($c4ShapeInRow="3")`);
      expect(ast.layoutConfig).toBeDefined();
      expect(ast.layoutConfig?.c4ShapeInRow).toBe(3);
    });
  });

  describe('Complex Diagrams', () => {
    it('should parse complete C4Context diagram', () => {
      const ast = parseC4(`C4Context
    title System Context Diagram
    
    Person(user, "User", "A user of the system")
    System(system, "My System", "The main system")
    System_Ext(external, "External API", "Third-party API")
    
    Rel(user, system, "Uses")
    Rel(system, external, "Calls", "REST")`);

      expect(ast.elements.length).toBe(3);
      expect(ast.relationships.length).toBe(2);
    });

    it('should parse C4Container with boundaries', () => {
      const ast = parseC4(`C4Container
    System_Boundary(system, "My System") {
        Container(web, "Web App", "React")
        Container(api, "API", "Node.js")
        ContainerDb(db, "Database", "PostgreSQL")
    }
    
    Rel(web, api, "Calls", "REST")
    Rel(api, db, "Reads/Writes", "SQL")`);

      // The boundary is an element, and its children are inside it
      expect(ast.elements.length).toBe(1);
      const boundary = ast.elements[0];
      if (isC4Boundary(boundary)) {
        expect(boundary.children.length).toBe(3);
      }
      expect(ast.relationships.length).toBe(2);
    });
  });
});
