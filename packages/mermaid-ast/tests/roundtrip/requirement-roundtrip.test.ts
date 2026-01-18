import { describe, expect, it } from 'bun:test';
import { parseRequirement } from '../../src/parser/requirement-parser.js';
import { renderRequirement } from '../../src/renderer/requirement-renderer.js';

describe('Requirement Round-trip', () => {
  const roundTrip = (input: string) => {
    const ast = parseRequirement(input);
    const rendered = renderRequirement(ast);
    const reparsed = parseRequirement(rendered);
    return { ast, rendered, reparsed };
  };

  describe('Simple Round-trips', () => {
    it('should round-trip single requirement', () => {
      const input = `requirementDiagram
    requirement test_req {
        id: 1
        text: the test text.
        risk: high
        verifymethod: test
    }
`;
      const { ast, reparsed } = roundTrip(input);

      expect(reparsed.requirements.size).toBe(1);
      const original = ast.requirements.get('test_req');
      const parsed = reparsed.requirements.get('test_req');

      expect(parsed?.id).toBe(original?.id);
      expect(parsed?.text).toBe(original?.text);
      expect(parsed?.risk).toBe(original?.risk);
      expect(parsed?.verifyMethod).toBe(original?.verifyMethod);
    });

    it('should round-trip single element', () => {
      const input = `requirementDiagram
    element test_entity {
        type: simulation
        docref: DOC001
    }
`;
      const { ast, reparsed } = roundTrip(input);

      expect(reparsed.elements.size).toBe(1);
      const original = ast.elements.get('test_entity');
      const parsed = reparsed.elements.get('test_entity');

      expect(parsed?.type).toBe(original?.type);
      expect(parsed?.docRef).toBe(original?.docRef);
    });

    it('should round-trip single relationship', () => {
      const input = `requirementDiagram
    requirement req1 {
        id: 1
    }
    element elem1 {
        type: simulation
    }
    elem1 - satisfies -> req1
`;
      const { ast, reparsed } = roundTrip(input);

      expect(reparsed.relationships.length).toBe(1);
      expect(reparsed.relationships[0].source).toBe(ast.relationships[0].source);
      expect(reparsed.relationships[0].target).toBe(ast.relationships[0].target);
      expect(reparsed.relationships[0].relationshipType).toBe(
        ast.relationships[0].relationshipType
      );
    });
  });

  describe('Requirement Type Round-trips', () => {
    it('should round-trip all requirement types', () => {
      const input = `requirementDiagram
    requirement r1 {
        id: 1
    }
    functionalRequirement r2 {
        id: 2
    }
    interfaceRequirement r3 {
        id: 3
    }
    performanceRequirement r4 {
        id: 4
    }
    physicalRequirement r5 {
        id: 5
    }
    designConstraint r6 {
        id: 6
    }
`;
      const { reparsed } = roundTrip(input);

      expect(reparsed.requirements.size).toBe(6);
      expect(reparsed.requirements.get('r1')?.requirementType).toBe('requirement');
      expect(reparsed.requirements.get('r2')?.requirementType).toBe('functionalRequirement');
      expect(reparsed.requirements.get('r3')?.requirementType).toBe('interfaceRequirement');
      expect(reparsed.requirements.get('r4')?.requirementType).toBe('performanceRequirement');
      expect(reparsed.requirements.get('r5')?.requirementType).toBe('physicalRequirement');
      expect(reparsed.requirements.get('r6')?.requirementType).toBe('designConstraint');
    });
  });

  describe('Risk Level Round-trips', () => {
    it('should round-trip all risk levels', () => {
      const input = `requirementDiagram
    requirement r1 {
        risk: low
    }
    requirement r2 {
        risk: medium
    }
    requirement r3 {
        risk: high
    }
`;
      const { reparsed } = roundTrip(input);

      expect(reparsed.requirements.get('r1')?.risk).toBe('low');
      expect(reparsed.requirements.get('r2')?.risk).toBe('medium');
      expect(reparsed.requirements.get('r3')?.risk).toBe('high');
    });
  });

  describe('Verify Method Round-trips', () => {
    it('should round-trip all verify methods', () => {
      const input = `requirementDiagram
    requirement r1 {
        verifymethod: analysis
    }
    requirement r2 {
        verifymethod: demonstration
    }
    requirement r3 {
        verifymethod: inspection
    }
    requirement r4 {
        verifymethod: test
    }
`;
      const { reparsed } = roundTrip(input);

      expect(reparsed.requirements.get('r1')?.verifyMethod).toBe('analysis');
      expect(reparsed.requirements.get('r2')?.verifyMethod).toBe('demonstration');
      expect(reparsed.requirements.get('r3')?.verifyMethod).toBe('inspection');
      expect(reparsed.requirements.get('r4')?.verifyMethod).toBe('test');
    });
  });

  describe('Relationship Type Round-trips', () => {
    it('should round-trip all relationship types', () => {
      const input = `requirementDiagram
    requirement r1 {
        id: 1
    }
    requirement r2 {
        id: 2
    }
    element e1 {
        type: simulation
    }
    r1 - contains -> r2
    r1 - copies -> r2
    r1 - derives -> r2
    e1 - satisfies -> r1
    e1 - verifies -> r1
    r1 - refines -> r2
    r1 - traces -> r2
`;
      const { reparsed } = roundTrip(input);

      expect(reparsed.relationships.length).toBe(7);

      const types = reparsed.relationships.map((r) => r.relationshipType);
      expect(types).toContain('contains');
      expect(types).toContain('copies');
      expect(types).toContain('derives');
      expect(types).toContain('satisfies');
      expect(types).toContain('verifies');
      expect(types).toContain('refines');
      expect(types).toContain('traces');
    });
  });

  describe('Complex Round-trips', () => {
    it('should round-trip complex diagram', () => {
      const input = `requirementDiagram
    requirement user_login {
        id: REQ001
        text: User must be able to login
        risk: high
        verifymethod: test
    }
    
    functionalRequirement password_validation {
        id: REQ002
        text: Password must be validated
        risk: medium
        verifymethod: demonstration
    }
    
    element auth_module {
        type: module
        docref: AUTH001
    }
    
    element login_verifier {
        type: verifier
    }
    
    user_login - contains -> password_validation
    auth_module - satisfies -> user_login
    login_verifier - verifies -> user_login
`;
      const { ast, reparsed } = roundTrip(input);

      expect(reparsed.requirements.size).toBe(ast.requirements.size);
      expect(reparsed.elements.size).toBe(ast.elements.size);
      expect(reparsed.relationships.length).toBe(ast.relationships.length);

      // Verify requirement details
      const userLogin = reparsed.requirements.get('user_login');
      expect(userLogin?.id).toBe('REQ001');
      expect(userLogin?.text).toBe('User must be able to login');
      expect(userLogin?.risk).toBe('high');
      expect(userLogin?.verifyMethod).toBe('test');

      // Verify element details
      const authModule = reparsed.elements.get('auth_module');
      expect(authModule?.type).toBe('module');
      expect(authModule?.docRef).toBe('AUTH001');
    });
  });

  describe('Idempotency', () => {
    it('should be idempotent - multiple round-trips produce same result', () => {
      const input = `requirementDiagram
    requirement test_req {
        id: 1
        text: the test text.
        risk: high
        verifymethod: test
    }
    element test_entity {
        type: simulation
    }
    test_entity - satisfies -> test_req
`;
      const { rendered: first } = roundTrip(input);
      const { rendered: second } = roundTrip(first);
      const { rendered: third } = roundTrip(second);

      expect(second).toBe(first);
      expect(third).toBe(second);
    });
  });
});
