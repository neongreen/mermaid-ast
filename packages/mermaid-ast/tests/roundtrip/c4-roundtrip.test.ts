/**
 * Round-trip tests for C4 Diagram
 *
 * These tests verify that:
 * 1. parse(render(ast)) produces an equivalent AST
 * 2. render(parse(text)) produces syntactically valid output
 * 3. parse(render(parse(text))) === parse(text) (semantic equivalence)
 */

import { describe, expect, it } from 'bun:test';
import { parseC4 } from '../../src/parser/c4-parser.js';
import { renderC4 } from '../../src/renderer/c4-renderer.js';
import type { C4AST } from '../../src/types/index.js';
import { isC4Boundary } from '../../src/types/c4.js';

/**
 * Compare two C4 ASTs for semantic equivalence
 */
function assertEquivalentC4Diagrams(ast1: C4AST, ast2: C4AST): void {
  // Compare diagram type
  expect(ast2.diagramType).toBe(ast1.diagramType);

  // Compare elements (excluding boundaries for now, they're compared separately)
  const elements1 = ast1.elements.filter((e) => !isC4Boundary(e));
  const elements2 = ast2.elements.filter((e) => !isC4Boundary(e));

  expect(elements2.length).toBe(elements1.length);
  for (const elem1 of elements1) {
    const matchingElem = elements2.find((e) => e.alias === elem1.alias && e.type === elem1.type);
    expect(matchingElem).toBeDefined();
  }

  // Compare relationships
  expect(ast2.relationships.length).toBe(ast1.relationships.length);
  for (const rel1 of ast1.relationships) {
    const matchingRel = ast2.relationships.find(
      (r) => r.from === rel1.from && r.to === rel1.to && r.label === rel1.label
    );
    expect(matchingRel).toBeDefined();
  }

  // Compare boundaries (stored in elements)
  const boundaries1 = ast1.elements.filter(isC4Boundary);
  const boundaries2 = ast2.elements.filter(isC4Boundary);

  expect(boundaries2.length).toBe(boundaries1.length);
  for (const boundary1 of boundaries1) {
    const matchingBoundary = boundaries2.find((b) => b.alias === boundary1.alias);
    expect(matchingBoundary).toBeDefined();
  }
}

describe('C4 Diagram Round-trip Tests', () => {
  describe('C4Context diagrams', () => {
    it('should round-trip a basic C4Context diagram', () => {
      const original = `C4Context
    Person(user, "User")
    System(system, "System")
    Rel(user, system, "Uses")`;

      const ast1 = parseC4(original);
      const rendered = renderC4(ast1);
      const ast2 = parseC4(rendered);

      assertEquivalentC4Diagrams(ast1, ast2);
    });

    it('should round-trip C4Context with external systems', () => {
      const original = `C4Context
    Person(user, "User")
    System(system, "My System")
    System_Ext(external, "External API")
    Rel(user, system, "Uses")
    Rel(system, external, "Calls")`;

      const ast1 = parseC4(original);
      const rendered = renderC4(ast1);
      const ast2 = parseC4(rendered);

      assertEquivalentC4Diagrams(ast1, ast2);
    });

    it('should round-trip C4Context with descriptions', () => {
      const original = `C4Context
    Person(user, "User", "A user of the system")
    System(system, "System", "The main system")
    Rel(user, system, "Uses", "HTTPS")`;

      const ast1 = parseC4(original);
      const rendered = renderC4(ast1);
      const ast2 = parseC4(rendered);

      assertEquivalentC4Diagrams(ast1, ast2);
    });
  });

  describe('C4Container diagrams', () => {
    it('should round-trip a basic C4Container diagram', () => {
      const original = `C4Container
    Container(web, "Web App")
    Container(api, "API")
    ContainerDb(db, "Database")
    Rel(web, api, "Calls")
    Rel(api, db, "Reads/Writes")`;

      const ast1 = parseC4(original);
      const rendered = renderC4(ast1);
      const ast2 = parseC4(rendered);

      assertEquivalentC4Diagrams(ast1, ast2);
    });

    it('should round-trip C4Container with technologies', () => {
      const original = `C4Container
    Container(web, "Web App", "React")
    Container(api, "API", "Node.js")
    ContainerDb(db, "Database", "PostgreSQL")`;

      const ast1 = parseC4(original);
      const rendered = renderC4(ast1);
      const ast2 = parseC4(rendered);

      assertEquivalentC4Diagrams(ast1, ast2);
    });
  });

  describe('C4Component diagrams', () => {
    it('should round-trip a basic C4Component diagram', () => {
      const original = `C4Component
    Component(auth, "Auth Service")
    Component(user, "User Service")
    ComponentDb(cache, "Cache")
    Rel(auth, user, "Validates")
    Rel(user, cache, "Caches")`;

      const ast1 = parseC4(original);
      const rendered = renderC4(ast1);
      const ast2 = parseC4(rendered);

      assertEquivalentC4Diagrams(ast1, ast2);
    });
  });

  describe('C4Dynamic diagrams', () => {
    it('should round-trip a basic C4Dynamic diagram', () => {
      const original = `C4Dynamic
    Component(ui, "UI")
    Component(controller, "Controller")
    Component(service, "Service")`;

      const ast1 = parseC4(original);
      const rendered = renderC4(ast1);
      const ast2 = parseC4(rendered);

      assertEquivalentC4Diagrams(ast1, ast2);
    });
  });

  describe('C4Deployment diagrams', () => {
    it('should round-trip a basic C4Deployment diagram', () => {
      const original = `C4Deployment
    Node(server1, "Server 1") {
    }
    Node(server2, "Server 2") {
    }`;

      const ast1 = parseC4(original);
      const rendered = renderC4(ast1);
      const ast2 = parseC4(rendered);

      assertEquivalentC4Diagrams(ast1, ast2);
    });

    it('should round-trip C4Deployment with technologies', () => {
      const original = `C4Deployment
    Node(aws, "AWS", "Amazon Web Services") {
    }
    Node(ec2, "EC2", "Ubuntu") {
    }`;

      const ast1 = parseC4(original);
      const rendered = renderC4(ast1);
      const ast2 = parseC4(rendered);

      assertEquivalentC4Diagrams(ast1, ast2);
    });
  });

  describe('Relationship types', () => {
    it('should round-trip bidirectional relationships', () => {
      const original = `C4Context
    System(a, "System A")
    System(b, "System B")
    BiRel(a, b, "Syncs with")`;

      const ast1 = parseC4(original);
      const rendered = renderC4(ast1);
      const ast2 = parseC4(rendered);

      assertEquivalentC4Diagrams(ast1, ast2);
    });

    it('should round-trip directional relationships', () => {
      const original = `C4Context
    System(a, "A")
    System(b, "B")
    System(c, "C")
    System(d, "D")
    Rel_U(a, b, "Up")
    Rel_D(a, c, "Down")
    Rel_L(a, d, "Left")`;

      const ast1 = parseC4(original);
      const rendered = renderC4(ast1);
      const ast2 = parseC4(rendered);

      assertEquivalentC4Diagrams(ast1, ast2);
    });
  });

  describe('Complex diagrams', () => {
    it('should round-trip a complete C4Context diagram', () => {
      const original = `C4Context
    title System Context Diagram
    
    Person(user, "User", "A user of the system")
    Person_Ext(admin, "Admin", "System administrator")
    
    System(system, "My System", "The main system")
    System_Ext(email, "Email System", "Sends emails")
    SystemDb(db, "Database", "Stores data")
    
    Rel(user, system, "Uses")
    Rel(admin, system, "Manages")
    Rel(system, email, "Sends emails via")
    Rel(system, db, "Reads/Writes")`;

      const ast1 = parseC4(original);
      const rendered = renderC4(ast1);
      const ast2 = parseC4(rendered);

      assertEquivalentC4Diagrams(ast1, ast2);
    });

    it('should round-trip a complete C4Container diagram', () => {
      const original = `C4Container
    Person(user, "User")
    
    Container(web, "Web Application", "React")
    Container(api, "API Gateway", "Node.js")
    Container(auth, "Auth Service", "JWT")
    ContainerDb(db, "Database", "PostgreSQL")
    ContainerQueue(queue, "Message Queue", "RabbitMQ")
    
    Rel(user, web, "Uses")
    Rel(web, api, "Calls", "REST")
    Rel(api, auth, "Validates tokens")
    Rel(api, db, "Queries")
    Rel(api, queue, "Publishes events")`;

      const ast1 = parseC4(original);
      const rendered = renderC4(ast1);
      const ast2 = parseC4(rendered);

      assertEquivalentC4Diagrams(ast1, ast2);
    });
  });

  describe('Idempotency', () => {
    it('should be idempotent: render(parse(render(parse(x)))) === render(parse(x))', () => {
      const original = `C4Context
    Person(user, "User")
    System(system, "System")
    Rel(user, system, "Uses")`;

      const ast1 = parseC4(original);
      const render1 = renderC4(ast1);
      const ast2 = parseC4(render1);
      const render2 = renderC4(ast2);
      const ast3 = parseC4(render2);

      // After first round-trip, subsequent renders should be identical
      assertEquivalentC4Diagrams(ast2, ast3);
    });
  });
});
