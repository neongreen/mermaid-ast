import { describe, expect, it } from 'bun:test';
import { Requirement } from '../../src/requirement.js';

describe('Requirement Wrapper', () => {
  describe('Factory Methods', () => {
    it('should create an empty requirement diagram', () => {
      const req = Requirement.create();
      expect(req.requirementCount).toBe(0);
      expect(req.elementCount).toBe(0);
      expect(req.relationshipCount).toBe(0);
    });

    it('should parse Mermaid syntax', () => {
      const req = Requirement.parse(`requirementDiagram
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
`);
      expect(req.requirementCount).toBe(1);
      expect(req.elementCount).toBe(1);
      expect(req.relationshipCount).toBe(1);
    });

    it('should create from existing AST', () => {
      const original = Requirement.create().addRequirement('req1', 'requirement', {
        id: '1',
        text: 'Test',
      });
      const copy = Requirement.from(original.toAST());
      expect(copy.requirementCount).toBe(1);
    });
  });

  describe('Core Methods', () => {
    it('should render to Mermaid syntax', () => {
      const req = Requirement.create()
        .addRequirement('test_req', 'requirement', {
          id: '1',
          text: 'the test text.',
          risk: 'high',
          verifyMethod: 'test',
        })
        .addElement('test_entity', { type: 'simulation' })
        .addRelationship('test_entity', 'test_req', 'satisfies');

      const output = req.render();
      expect(output).toContain('requirementDiagram');
      expect(output).toContain('requirement test_req');
      expect(output).toContain('id: 1');
      expect(output).toContain('text: the test text.');
      expect(output).toContain('risk: high');
      expect(output).toContain('verifymethod: test');
      expect(output).toContain('element test_entity');
      expect(output).toContain('type: simulation');
      expect(output).toContain('test_entity - satisfies -> test_req');
    });

    it('should clone the diagram', () => {
      const original = Requirement.create().addRequirement('req1', 'requirement', { id: '1' });
      const cloned = original.clone();
      cloned.addRequirement('req2', 'requirement', { id: '2' });

      expect(original.requirementCount).toBe(1);
      expect(cloned.requirementCount).toBe(2);
    });

    it('should get AST', () => {
      const req = Requirement.create().addRequirement('req1', 'requirement', { id: '1' });
      const ast = req.toAST();
      expect(ast.type).toBe('requirement');
      expect(ast.requirements.size).toBe(1);
    });
  });

  describe('Requirement Operations', () => {
    it('should add requirements', () => {
      const req = Requirement.create()
        .addRequirement('req1', 'requirement', { id: '1', text: 'First requirement' })
        .addRequirement('req2', 'functionalRequirement', { id: '2', text: 'Second requirement' });

      expect(req.requirementCount).toBe(2);
      expect(req.getRequirement('req1')?.text).toBe('First requirement');
      expect(req.getRequirement('req2')?.requirementType).toBe('functionalRequirement');
    });

    it('should add all requirement types', () => {
      const req = Requirement.create()
        .addRequirement('r1', 'requirement')
        .addRequirement('r2', 'functionalRequirement')
        .addRequirement('r3', 'interfaceRequirement')
        .addRequirement('r4', 'performanceRequirement')
        .addRequirement('r5', 'physicalRequirement')
        .addRequirement('r6', 'designConstraint');

      expect(req.requirementCount).toBe(6);
    });

    it('should get requirements', () => {
      const req = Requirement.create().addRequirement('req1', 'requirement', {
        id: '1',
        risk: 'high',
      });

      const r = req.getRequirement('req1');
      expect(r).toBeDefined();
      expect(r?.id).toBe('1');
      expect(r?.risk).toBe('high');
    });

    it('should check if requirement exists', () => {
      const req = Requirement.create().addRequirement('req1', 'requirement');

      expect(req.hasRequirement('req1')).toBe(true);
      expect(req.hasRequirement('req2')).toBe(false);
    });

    it('should remove requirements', () => {
      const req = Requirement.create()
        .addRequirement('req1', 'requirement')
        .addRequirement('req2', 'requirement')
        .removeRequirement('req1');

      expect(req.requirementCount).toBe(1);
      expect(req.hasRequirement('req1')).toBe(false);
    });

    it('should update requirements', () => {
      const req = Requirement.create()
        .addRequirement('req1', 'requirement', { id: '1', risk: 'low' })
        .updateRequirement('req1', { risk: 'high', text: 'Updated text' });

      const r = req.getRequirement('req1');
      expect(r?.risk).toBe('high');
      expect(r?.text).toBe('Updated text');
    });

    it('should list all requirement names', () => {
      const req = Requirement.create()
        .addRequirement('req1', 'requirement')
        .addRequirement('req2', 'requirement');

      expect(req.requirementNames.sort()).toEqual(['req1', 'req2']);
    });
  });

  describe('Element Operations', () => {
    it('should add elements', () => {
      const req = Requirement.create()
        .addElement('elem1', { type: 'simulation' })
        .addElement('elem2', { type: 'module', docRef: 'DOC001' });

      expect(req.elementCount).toBe(2);
      expect(req.getElement('elem1')?.type).toBe('simulation');
      expect(req.getElement('elem2')?.docRef).toBe('DOC001');
    });

    it('should check if element exists', () => {
      const req = Requirement.create().addElement('elem1', { type: 'simulation' });

      expect(req.hasElement('elem1')).toBe(true);
      expect(req.hasElement('elem2')).toBe(false);
    });

    it('should remove elements', () => {
      const req = Requirement.create()
        .addElement('elem1', { type: 'simulation' })
        .addElement('elem2', { type: 'module' })
        .removeElement('elem1');

      expect(req.elementCount).toBe(1);
      expect(req.hasElement('elem1')).toBe(false);
    });

    it('should update elements', () => {
      const req = Requirement.create()
        .addElement('elem1', { type: 'simulation' })
        .updateElement('elem1', { type: 'module', docRef: 'DOC001' });

      const e = req.getElement('elem1');
      expect(e?.type).toBe('module');
      expect(e?.docRef).toBe('DOC001');
    });

    it('should list all element names', () => {
      const req = Requirement.create()
        .addElement('elem1', { type: 'simulation' })
        .addElement('elem2', { type: 'module' });

      expect(req.elementNames.sort()).toEqual(['elem1', 'elem2']);
    });
  });

  describe('Relationship Operations', () => {
    it('should add relationships', () => {
      const req = Requirement.create()
        .addRequirement('req1', 'requirement')
        .addElement('elem1', { type: 'simulation' })
        .addRelationship('elem1', 'req1', 'satisfies');

      expect(req.relationshipCount).toBe(1);
    });

    it('should add all relationship types', () => {
      const req = Requirement.create()
        .addRequirement('req1', 'requirement')
        .addRequirement('req2', 'requirement')
        .addElement('elem1', { type: 'simulation' })
        .addRelationship('req1', 'req2', 'contains')
        .addRelationship('req1', 'req2', 'copies')
        .addRelationship('req1', 'req2', 'derives')
        .addRelationship('elem1', 'req1', 'satisfies')
        .addRelationship('elem1', 'req1', 'verifies')
        .addRelationship('req1', 'req2', 'refines')
        .addRelationship('req1', 'req2', 'traces');

      expect(req.relationshipCount).toBe(7);
    });

    it('should get all relationships', () => {
      const req = Requirement.create()
        .addRequirement('req1', 'requirement')
        .addElement('elem1', { type: 'simulation' })
        .addRelationship('elem1', 'req1', 'satisfies')
        .addRelationship('elem1', 'req1', 'verifies');

      const rels = req.getRelationships();
      expect(rels.length).toBe(2);
    });

    it('should get relationships from source', () => {
      const req = Requirement.create()
        .addRequirement('req1', 'requirement')
        .addRequirement('req2', 'requirement')
        .addElement('elem1', { type: 'simulation' })
        .addRelationship('elem1', 'req1', 'satisfies')
        .addRelationship('elem1', 'req2', 'verifies');

      const rels = req.getRelationshipsFrom('elem1');
      expect(rels.length).toBe(2);
    });

    it('should get relationships to target', () => {
      const req = Requirement.create()
        .addRequirement('req1', 'requirement')
        .addElement('elem1', { type: 'simulation' })
        .addElement('elem2', { type: 'module' })
        .addRelationship('elem1', 'req1', 'satisfies')
        .addRelationship('elem2', 'req1', 'verifies');

      const rels = req.getRelationshipsTo('req1');
      expect(rels.length).toBe(2);
    });

    it('should remove relationships', () => {
      const req = Requirement.create()
        .addRequirement('req1', 'requirement')
        .addElement('elem1', { type: 'simulation' })
        .addRelationship('elem1', 'req1', 'satisfies')
        .addRelationship('elem1', 'req1', 'verifies')
        .removeRelationship('elem1', 'req1', 'satisfies');

      expect(req.relationshipCount).toBe(1);
    });

    it('should remove requirement and its relationships', () => {
      const req = Requirement.create()
        .addRequirement('req1', 'requirement')
        .addElement('elem1', { type: 'simulation' })
        .addRelationship('elem1', 'req1', 'satisfies')
        .removeRequirement('req1');

      expect(req.relationshipCount).toBe(0);
    });

    it('should remove element and its relationships', () => {
      const req = Requirement.create()
        .addRequirement('req1', 'requirement')
        .addElement('elem1', { type: 'simulation' })
        .addRelationship('elem1', 'req1', 'satisfies')
        .removeElement('elem1');

      expect(req.relationshipCount).toBe(0);
    });
  });

  describe('Query Operations', () => {
    it('should find requirements by type', () => {
      const req = Requirement.create()
        .addRequirement('r1', 'requirement')
        .addRequirement('r2', 'functionalRequirement')
        .addRequirement('r3', 'functionalRequirement');

      const found = req.findRequirements({ requirementType: 'functionalRequirement' });
      expect(found.length).toBe(2);
    });

    it('should find requirements by risk', () => {
      const req = Requirement.create()
        .addRequirement('r1', 'requirement', { risk: 'high' })
        .addRequirement('r2', 'requirement', { risk: 'low' })
        .addRequirement('r3', 'requirement', { risk: 'high' });

      const found = req.findRequirements({ risk: 'high' });
      expect(found.length).toBe(2);
    });

    it('should find requirements by verify method', () => {
      const req = Requirement.create()
        .addRequirement('r1', 'requirement', { verifyMethod: 'test' })
        .addRequirement('r2', 'requirement', { verifyMethod: 'analysis' })
        .addRequirement('r3', 'requirement', { verifyMethod: 'test' });

      const found = req.findRequirements({ verifyMethod: 'test' });
      expect(found.length).toBe(2);
    });

    it('should find requirements by name contains', () => {
      const req = Requirement.create()
        .addRequirement('user_req_1', 'requirement')
        .addRequirement('system_req_1', 'requirement')
        .addRequirement('user_req_2', 'requirement');

      const found = req.findRequirements({ nameContains: 'user' });
      expect(found.length).toBe(2);
    });

    it('should find requirements by text contains', () => {
      const req = Requirement.create()
        .addRequirement('r1', 'requirement', { text: 'User must login' })
        .addRequirement('r2', 'requirement', { text: 'System must respond' })
        .addRequirement('r3', 'requirement', { text: 'User must logout' });

      const found = req.findRequirements({ textContains: 'User' });
      expect(found.length).toBe(2);
    });

    it('should find elements by type', () => {
      const req = Requirement.create()
        .addElement('e1', { type: 'simulation' })
        .addElement('e2', { type: 'module' })
        .addElement('e3', { type: 'simulation' });

      const found = req.findElements({ type: 'simulation' });
      expect(found.length).toBe(2);
    });

    it('should find elements by name contains', () => {
      const req = Requirement.create()
        .addElement('auth_module', { type: 'module' })
        .addElement('user_service', { type: 'service' })
        .addElement('auth_service', { type: 'service' });

      const found = req.findElements({ nameContains: 'auth' });
      expect(found.length).toBe(2);
    });

    it('should find relationships by type', () => {
      const req = Requirement.create()
        .addRequirement('r1', 'requirement')
        .addElement('e1', { type: 'simulation' })
        .addRelationship('e1', 'r1', 'satisfies')
        .addRelationship('e1', 'r1', 'verifies');

      const found = req.findRelationships({ relationshipType: 'satisfies' });
      expect(found.length).toBe(1);
    });

    it('should find relationships by source', () => {
      const req = Requirement.create()
        .addRequirement('r1', 'requirement')
        .addElement('e1', { type: 'simulation' })
        .addElement('e2', { type: 'module' })
        .addRelationship('e1', 'r1', 'satisfies')
        .addRelationship('e2', 'r1', 'verifies');

      const found = req.findRelationships({ source: 'e1' });
      expect(found.length).toBe(1);
    });

    it('should find relationships by target', () => {
      const req = Requirement.create()
        .addRequirement('r1', 'requirement')
        .addRequirement('r2', 'requirement')
        .addElement('e1', { type: 'simulation' })
        .addRelationship('e1', 'r1', 'satisfies')
        .addRelationship('e1', 'r2', 'verifies');

      const found = req.findRelationships({ target: 'r1' });
      expect(found.length).toBe(1);
    });
  });

  describe('Styling Operations', () => {
    it('should define classes', () => {
      const req = Requirement.create().defineClass('highlight', ['fill:#f9f', 'stroke:#333']);

      const output = req.render();
      expect(output).toContain('classDef highlight fill:#f9f,stroke:#333');
    });

    it('should apply classes to entities', () => {
      const req = Requirement.create()
        .addRequirement('req1', 'requirement')
        .defineClass('highlight', ['fill:#f9f'])
        .addClass('req1', 'highlight');

      // The class should be applied in rendering
      const ast = req.toAST();
      expect(ast.classes.get('req1')).toContain('highlight');
    });

    it('should remove classes from entities', () => {
      const req = Requirement.create()
        .addRequirement('req1', 'requirement')
        .addClass('req1', 'highlight')
        .removeClass('req1', 'highlight');

      const ast = req.toAST();
      expect(ast.classes.get('req1')).toEqual([]);
    });

    it('should set inline styles', () => {
      const req = Requirement.create()
        .addRequirement('req1', 'requirement')
        .setStyle('req1', ['fill:#f9f', 'stroke:#333']);

      const output = req.render();
      expect(output).toContain('style req1 fill:#f9f,stroke:#333');
    });
  });

  describe('Accessibility', () => {
    it('should set accessibility title', () => {
      const req = Requirement.create().setAccTitle('Requirement Diagram');

      const output = req.render();
      expect(output).toContain('accTitle: Requirement Diagram');
    });

    it('should set accessibility description', () => {
      const req = Requirement.create().setAccDescription('This diagram shows requirements');

      const output = req.render();
      expect(output).toContain('accDescr: This diagram shows requirements');
    });
  });

  describe('Direction', () => {
    it('should set direction', () => {
      const req = Requirement.create('LR');
      expect(req.direction).toBe('LR');
    });

    it('should change direction', () => {
      const req = Requirement.create().setDirection('BT');
      expect(req.direction).toBe('BT');
    });
  });
});
