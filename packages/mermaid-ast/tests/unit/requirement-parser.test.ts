import { describe, expect, it } from 'bun:test';
import { isRequirementDiagram, parseRequirement } from '../../src/parser/requirement-parser.js';

describe('Requirement Parser', () => {
  describe('isRequirementDiagram', () => {
    it('should detect requirement diagrams', () => {
      expect(isRequirementDiagram('requirementDiagram')).toBe(true);
      expect(isRequirementDiagram('  requirementDiagram\n')).toBe(true);
      expect(isRequirementDiagram('requirementDiagram\n  requirement test {}')).toBe(true);
    });

    it('should not detect non-requirement diagrams', () => {
      expect(isRequirementDiagram('flowchart LR')).toBe(false);
      expect(isRequirementDiagram('graph TD')).toBe(false);
      expect(isRequirementDiagram('sequenceDiagram')).toBe(false);
      expect(isRequirementDiagram('erDiagram')).toBe(false);
    });
  });

  describe('Basic Parsing', () => {
    it('should parse a simple requirement diagram', () => {
      const input = `requirementDiagram
    requirement test_req {
        id: 1
        text: the test text.
        risk: high
        verifymethod: test
    }
`;
      const ast = parseRequirement(input);
      expect(ast.type).toBe('requirement');
      expect(ast.requirements.size).toBe(1);

      const req = ast.requirements.get('test_req');
      expect(req).toBeDefined();
      expect(req?.id).toBe('1');
      expect(req?.text).toBe('the test text.');
      expect(req?.risk).toBe('high');
      expect(req?.verifyMethod).toBe('test');
    });

    it('should parse multiple requirements', () => {
      const input = `requirementDiagram
    requirement req1 {
        id: 1
    }
    requirement req2 {
        id: 2
    }
`;
      const ast = parseRequirement(input);
      expect(ast.requirements.size).toBe(2);
      expect(ast.requirements.has('req1')).toBe(true);
      expect(ast.requirements.has('req2')).toBe(true);
    });

    it('should parse elements', () => {
      const input = `requirementDiagram
    element test_entity {
        type: simulation
    }
`;
      const ast = parseRequirement(input);
      expect(ast.elements.size).toBe(1);

      const elem = ast.elements.get('test_entity');
      expect(elem).toBeDefined();
      expect(elem?.type).toBe('simulation');
    });

    it('should parse relationships', () => {
      const input = `requirementDiagram
    requirement test_req {
        id: 1
    }
    element test_entity {
        type: simulation
    }
    test_entity - satisfies -> test_req
`;
      const ast = parseRequirement(input);
      expect(ast.relationships.length).toBe(1);
      expect(ast.relationships[0]).toEqual({
        source: 'test_entity',
        target: 'test_req',
        relationshipType: 'satisfies',
      });
    });
  });

  describe('Requirement Types', () => {
    it('should parse requirement type', () => {
      const input = `requirementDiagram
    requirement req1 {
        id: 1
    }
`;
      const ast = parseRequirement(input);
      expect(ast.requirements.get('req1')?.requirementType).toBe('requirement');
    });

    it('should parse functionalRequirement type', () => {
      const input = `requirementDiagram
    functionalRequirement req1 {
        id: 1
    }
`;
      const ast = parseRequirement(input);
      expect(ast.requirements.get('req1')?.requirementType).toBe('functionalRequirement');
    });

    it('should parse interfaceRequirement type', () => {
      const input = `requirementDiagram
    interfaceRequirement req1 {
        id: 1
    }
`;
      const ast = parseRequirement(input);
      expect(ast.requirements.get('req1')?.requirementType).toBe('interfaceRequirement');
    });

    it('should parse performanceRequirement type', () => {
      const input = `requirementDiagram
    performanceRequirement req1 {
        id: 1
    }
`;
      const ast = parseRequirement(input);
      expect(ast.requirements.get('req1')?.requirementType).toBe('performanceRequirement');
    });

    it('should parse physicalRequirement type', () => {
      const input = `requirementDiagram
    physicalRequirement req1 {
        id: 1
    }
`;
      const ast = parseRequirement(input);
      expect(ast.requirements.get('req1')?.requirementType).toBe('physicalRequirement');
    });

    it('should parse designConstraint type', () => {
      const input = `requirementDiagram
    designConstraint req1 {
        id: 1
    }
`;
      const ast = parseRequirement(input);
      expect(ast.requirements.get('req1')?.requirementType).toBe('designConstraint');
    });
  });

  describe('Risk Levels', () => {
    it('should parse low risk', () => {
      const input = `requirementDiagram
    requirement req1 {
        risk: low
    }
`;
      const ast = parseRequirement(input);
      expect(ast.requirements.get('req1')?.risk).toBe('low');
    });

    it('should parse medium risk', () => {
      const input = `requirementDiagram
    requirement req1 {
        risk: medium
    }
`;
      const ast = parseRequirement(input);
      expect(ast.requirements.get('req1')?.risk).toBe('medium');
    });

    it('should parse high risk', () => {
      const input = `requirementDiagram
    requirement req1 {
        risk: high
    }
`;
      const ast = parseRequirement(input);
      expect(ast.requirements.get('req1')?.risk).toBe('high');
    });
  });

  describe('Verify Methods', () => {
    it('should parse analysis verify method', () => {
      const input = `requirementDiagram
    requirement req1 {
        verifymethod: analysis
    }
`;
      const ast = parseRequirement(input);
      expect(ast.requirements.get('req1')?.verifyMethod).toBe('analysis');
    });

    it('should parse demonstration verify method', () => {
      const input = `requirementDiagram
    requirement req1 {
        verifymethod: demonstration
    }
`;
      const ast = parseRequirement(input);
      expect(ast.requirements.get('req1')?.verifyMethod).toBe('demonstration');
    });

    it('should parse inspection verify method', () => {
      const input = `requirementDiagram
    requirement req1 {
        verifymethod: inspection
    }
`;
      const ast = parseRequirement(input);
      expect(ast.requirements.get('req1')?.verifyMethod).toBe('inspection');
    });

    it('should parse test verify method', () => {
      const input = `requirementDiagram
    requirement req1 {
        verifymethod: test
    }
`;
      const ast = parseRequirement(input);
      expect(ast.requirements.get('req1')?.verifyMethod).toBe('test');
    });
  });

  describe('Relationship Types', () => {
    it('should parse contains relationship', () => {
      const input = `requirementDiagram
    requirement req1 {
        id: 1
    }
    requirement req2 {
        id: 2
    }
    req1 - contains -> req2
`;
      const ast = parseRequirement(input);
      expect(ast.relationships[0].relationshipType).toBe('contains');
    });

    it('should parse copies relationship', () => {
      const input = `requirementDiagram
    requirement req1 {
        id: 1
    }
    requirement req2 {
        id: 2
    }
    req1 - copies -> req2
`;
      const ast = parseRequirement(input);
      expect(ast.relationships[0].relationshipType).toBe('copies');
    });

    it('should parse derives relationship', () => {
      const input = `requirementDiagram
    requirement req1 {
        id: 1
    }
    requirement req2 {
        id: 2
    }
    req1 - derives -> req2
`;
      const ast = parseRequirement(input);
      expect(ast.relationships[0].relationshipType).toBe('derives');
    });

    it('should parse satisfies relationship', () => {
      const input = `requirementDiagram
    requirement req1 {
        id: 1
    }
    element elem1 {
        type: simulation
    }
    elem1 - satisfies -> req1
`;
      const ast = parseRequirement(input);
      expect(ast.relationships[0].relationshipType).toBe('satisfies');
    });

    it('should parse verifies relationship', () => {
      const input = `requirementDiagram
    requirement req1 {
        id: 1
    }
    element elem1 {
        type: simulation
    }
    elem1 - verifies -> req1
`;
      const ast = parseRequirement(input);
      expect(ast.relationships[0].relationshipType).toBe('verifies');
    });

    it('should parse refines relationship', () => {
      const input = `requirementDiagram
    requirement req1 {
        id: 1
    }
    requirement req2 {
        id: 2
    }
    req1 - refines -> req2
`;
      const ast = parseRequirement(input);
      expect(ast.relationships[0].relationshipType).toBe('refines');
    });

    it('should parse traces relationship', () => {
      const input = `requirementDiagram
    requirement req1 {
        id: 1
    }
    requirement req2 {
        id: 2
    }
    req1 - traces -> req2
`;
      const ast = parseRequirement(input);
      expect(ast.relationships[0].relationshipType).toBe('traces');
    });
  });

  describe('Advanced Parsing', () => {
    it('should parse element with docref', () => {
      const input = `requirementDiagram
    element test_entity {
        type: simulation
        docref: DOC001
    }
`;
      const ast = parseRequirement(input);
      const elem = ast.elements.get('test_entity');
      expect(elem?.docRef).toBe('DOC001');
    });

    it('should parse complex diagram', () => {
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
      const ast = parseRequirement(input);

      expect(ast.requirements.size).toBe(2);
      expect(ast.elements.size).toBe(2);
      expect(ast.relationships.length).toBe(3);
    });

    it('should handle whitespace variations', () => {
      const input = `requirementDiagram
requirement req1 {
id: 1
text: some text
}
`;
      const ast = parseRequirement(input);
      expect(ast.requirements.size).toBe(1);
    });
  });
});
