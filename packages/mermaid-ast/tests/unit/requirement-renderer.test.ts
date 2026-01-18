import { describe, expect, it } from 'bun:test';
import { parseRequirement } from '../../src/parser/requirement-parser.js';
import { renderRequirement } from '../../src/renderer/requirement-renderer.js';
import { Requirement } from '../../src/requirement.js';

describe('Requirement Renderer', () => {
  describe('Basic Rendering', () => {
    it('should render empty requirement diagram', () => {
      const req = Requirement.create();
      const output = req.render();
      expect(output).toBe('requirementDiagram');
    });

    it('should render requirement with all properties', () => {
      const req = Requirement.create().addRequirement('test_req', 'requirement', {
        id: '1',
        text: 'the test text.',
        risk: 'high',
        verifyMethod: 'test',
      });

      const output = req.render();
      expect(output).toContain('requirementDiagram');
      expect(output).toContain('requirement test_req {');
      expect(output).toContain('id: 1');
      expect(output).toContain('text: the test text.');
      expect(output).toContain('risk: high');
      expect(output).toContain('verifymethod: test');
    });

    it('should render element with all properties', () => {
      const req = Requirement.create().addElement('test_entity', {
        type: 'simulation',
        docRef: 'DOC001',
      });

      const output = req.render();
      expect(output).toContain('element test_entity {');
      expect(output).toContain('type: simulation');
      expect(output).toContain('docref: DOC001');
    });
  });

  describe('Requirement Type Rendering', () => {
    it('should render requirement type', () => {
      const req = Requirement.create().addRequirement('r1', 'requirement');
      expect(req.render()).toContain('requirement r1');
    });

    it('should render functionalRequirement type', () => {
      const req = Requirement.create().addRequirement('r1', 'functionalRequirement');
      expect(req.render()).toContain('functionalRequirement r1');
    });

    it('should render interfaceRequirement type', () => {
      const req = Requirement.create().addRequirement('r1', 'interfaceRequirement');
      expect(req.render()).toContain('interfaceRequirement r1');
    });

    it('should render performanceRequirement type', () => {
      const req = Requirement.create().addRequirement('r1', 'performanceRequirement');
      expect(req.render()).toContain('performanceRequirement r1');
    });

    it('should render physicalRequirement type', () => {
      const req = Requirement.create().addRequirement('r1', 'physicalRequirement');
      expect(req.render()).toContain('physicalRequirement r1');
    });

    it('should render designConstraint type', () => {
      const req = Requirement.create().addRequirement('r1', 'designConstraint');
      expect(req.render()).toContain('designConstraint r1');
    });
  });

  describe('Relationship Rendering', () => {
    it('should render contains relationship', () => {
      const req = Requirement.create()
        .addRequirement('r1', 'requirement')
        .addRequirement('r2', 'requirement')
        .addRelationship('r1', 'r2', 'contains');
      expect(req.render()).toContain('r1 - contains -> r2');
    });

    it('should render copies relationship', () => {
      const req = Requirement.create()
        .addRequirement('r1', 'requirement')
        .addRequirement('r2', 'requirement')
        .addRelationship('r1', 'r2', 'copies');
      expect(req.render()).toContain('r1 - copies -> r2');
    });

    it('should render derives relationship', () => {
      const req = Requirement.create()
        .addRequirement('r1', 'requirement')
        .addRequirement('r2', 'requirement')
        .addRelationship('r1', 'r2', 'derives');
      expect(req.render()).toContain('r1 - derives -> r2');
    });

    it('should render satisfies relationship', () => {
      const req = Requirement.create()
        .addRequirement('r1', 'requirement')
        .addElement('e1', { type: 'simulation' })
        .addRelationship('e1', 'r1', 'satisfies');
      expect(req.render()).toContain('e1 - satisfies -> r1');
    });

    it('should render verifies relationship', () => {
      const req = Requirement.create()
        .addRequirement('r1', 'requirement')
        .addElement('e1', { type: 'simulation' })
        .addRelationship('e1', 'r1', 'verifies');
      expect(req.render()).toContain('e1 - verifies -> r1');
    });

    it('should render refines relationship', () => {
      const req = Requirement.create()
        .addRequirement('r1', 'requirement')
        .addRequirement('r2', 'requirement')
        .addRelationship('r1', 'r2', 'refines');
      expect(req.render()).toContain('r1 - refines -> r2');
    });

    it('should render traces relationship', () => {
      const req = Requirement.create()
        .addRequirement('r1', 'requirement')
        .addRequirement('r2', 'requirement')
        .addRelationship('r1', 'r2', 'traces');
      expect(req.render()).toContain('r1 - traces -> r2');
    });
  });

  describe('Accessibility Rendering', () => {
    it('should render accessibility title', () => {
      const req = Requirement.create().setAccTitle('Requirement Diagram');
      expect(req.render()).toContain('accTitle: Requirement Diagram');
    });

    it('should render accessibility description', () => {
      const req = Requirement.create().setAccDescription('This diagram shows requirements');
      expect(req.render()).toContain('accDescr: This diagram shows requirements');
    });
  });

  describe('Styling Rendering', () => {
    it('should render class definitions', () => {
      const req = Requirement.create().defineClass('highlight', ['fill:#f9f', 'stroke:#333']);
      expect(req.render()).toContain('classDef highlight fill:#f9f,stroke:#333');
    });

    it('should render inline styles', () => {
      const req = Requirement.create()
        .addRequirement('r1', 'requirement')
        .setStyle('r1', ['fill:#f9f', 'stroke:#333']);
      expect(req.render()).toContain('style r1 fill:#f9f,stroke:#333');
    });
  });

  describe('Complex Diagrams', () => {
    it('should render complex diagram with multiple requirements and elements', () => {
      const req = Requirement.create()
        .setAccTitle('System Requirements')
        .addRequirement('user_login', 'requirement', {
          id: 'REQ001',
          text: 'User must be able to login',
          risk: 'high',
          verifyMethod: 'test',
        })
        .addRequirement('password_validation', 'functionalRequirement', {
          id: 'REQ002',
          text: 'Password must be validated',
          risk: 'medium',
          verifyMethod: 'demonstration',
        })
        .addElement('auth_module', { type: 'module', docRef: 'AUTH001' })
        .addElement('login_test', { type: 'test' })
        .addRelationship('user_login', 'password_validation', 'contains')
        .addRelationship('auth_module', 'user_login', 'satisfies')
        .addRelationship('login_test', 'user_login', 'verifies');

      const output = req.render();

      expect(output).toContain('requirementDiagram');
      expect(output).toContain('accTitle: System Requirements');
      expect(output).toContain('requirement user_login');
      expect(output).toContain('functionalRequirement password_validation');
      expect(output).toContain('element auth_module');
      expect(output).toContain('element login_test');
      expect(output).toContain('user_login - contains -> password_validation');
      expect(output).toContain('auth_module - satisfies -> user_login');
      expect(output).toContain('login_test - verifies -> user_login');
    });
  });

  describe('Render Options', () => {
    it('should render with default indent', () => {
      const req = Requirement.create().addRequirement('r1', 'requirement', { id: '1' });

      const output = req.render();
      // Default indent is 4 spaces
      expect(output).toContain('    requirement r1');
      expect(output).toContain('        id: 1');
    });

    it('should produce valid parseable output', () => {
      const req = Requirement.create().addRequirement('r1', 'requirement', { id: '1' });

      const output = req.render();
      // Verify it can be parsed back
      const reparsed = parseRequirement(output);
      expect(reparsed.requirements.size).toBe(1);
      expect(reparsed.requirements.get('r1')?.id).toBe('1');
    });
  });

  describe('Golden Tests', () => {
    it('should round-trip simple requirement diagram', () => {
      const diagram = Requirement.create().addRequirement('test_req', 'requirement', {
        id: '1',
        text: 'the test text.',
        risk: 'high',
        verifyMethod: 'test',
      });

      const rendered = diagram.render();
      const reparsed = parseRequirement(rendered);
      const rerendered = renderRequirement(reparsed);
      expect(rerendered).toBe(rendered);
    });

    it('should round-trip complex requirement diagram', () => {
      const diagram = Requirement.create()
        .addRequirement('user_login', 'requirement', {
          id: 'REQ001',
          text: 'User must be able to login',
          risk: 'high',
          verifyMethod: 'test',
        })
        .addRequirement('password_validation', 'functionalRequirement', {
          id: 'REQ002',
          text: 'Password must be validated',
          risk: 'medium',
        })
        .addElement('auth_module', { type: 'module' })
        .addRelationship('user_login', 'password_validation', 'contains')
        .addRelationship('auth_module', 'user_login', 'satisfies');

      const rendered = diagram.render();
      const reparsed = parseRequirement(rendered);
      const rerendered = renderRequirement(reparsed);
      expect(rerendered).toBe(rendered);
    });

    it('should round-trip diagram with all requirement types', () => {
      const diagram = Requirement.create()
        .addRequirement('r1', 'requirement', { id: '1' })
        .addRequirement('r2', 'functionalRequirement', { id: '2' })
        .addRequirement('r3', 'interfaceRequirement', { id: '3' })
        .addRequirement('r4', 'performanceRequirement', { id: '4' })
        .addRequirement('r5', 'physicalRequirement', { id: '5' })
        .addRequirement('r6', 'designConstraint', { id: '6' });

      const rendered = diagram.render();
      const reparsed = parseRequirement(rendered);
      const rerendered = renderRequirement(reparsed);
      expect(rerendered).toBe(rendered);
    });
  });

  describe('Round-trip Rendering', () => {
    it('should parse and render back to equivalent diagram', () => {
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
      const ast = parseRequirement(input);
      const output = renderRequirement(ast);
      const reparsed = parseRequirement(output);

      expect(reparsed.requirements.size).toBe(ast.requirements.size);
      expect(reparsed.elements.size).toBe(ast.elements.size);
      expect(reparsed.relationships.length).toBe(ast.relationships.length);
    });
  });
});
