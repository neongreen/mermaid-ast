/**
 * C4 Diagram Renderer Tests
 */

import { describe, expect, it } from 'bun:test';
import { C4 } from '../../src/c4.js';
import { renderC4 } from '../../src/renderer/c4-renderer.js';
import { createEmptyC4AST } from '../../src/types/c4.js';

describe('C4 Renderer', () => {
  describe('Basic Rendering', () => {
    it('should render empty C4Context diagram', () => {
      const ast = createEmptyC4AST('C4Context');
      const output = renderC4(ast);
      expect(output).toContain('C4Context');
    });

    it('should render empty C4Container diagram', () => {
      const ast = createEmptyC4AST('C4Container');
      const output = renderC4(ast);
      expect(output).toContain('C4Container');
    });

    it('should render empty C4Component diagram', () => {
      const ast = createEmptyC4AST('C4Component');
      const output = renderC4(ast);
      expect(output).toContain('C4Component');
    });

    it('should render empty C4Dynamic diagram', () => {
      const ast = createEmptyC4AST('C4Dynamic');
      const output = renderC4(ast);
      expect(output).toContain('C4Dynamic');
    });

    it('should render empty C4Deployment diagram', () => {
      const ast = createEmptyC4AST('C4Deployment');
      const output = renderC4(ast);
      expect(output).toContain('C4Deployment');
    });

    it('should render diagram with title', () => {
      const diagram = C4.create('C4Context').setTitle('My Diagram');
      const output = diagram.render();
      expect(output).toContain('title My Diagram');
    });
  });

  describe('Person Rendering', () => {
    it('should render Person', () => {
      const diagram = C4.create('C4Context').addPerson('user', { label: 'User' });
      const output = diagram.render();
      expect(output).toContain('Person');
      expect(output).toContain('user');
      expect(output).toContain('User');
    });

    it('should render Person with description', () => {
      const diagram = C4.create('C4Context').addPerson('user', {
        label: 'User',
        description: 'A user',
      });
      const output = diagram.render();
      expect(output).toContain('Person');
      expect(output).toContain('A user');
    });

    it('should render Person_Ext', () => {
      const diagram = C4.create('C4Context').addPerson('customer', {
        label: 'Customer',
        external: true,
      });
      const output = diagram.render();
      expect(output).toContain('Person_Ext');
      expect(output).toContain('customer');
    });

    it('should render Person with sprite', () => {
      const diagram = C4.create('C4Context').addPerson('user', {
        label: 'User',
        sprite: 'user_icon',
      });
      const output = diagram.render();
      expect(output).toContain('user_icon');
    });

    it('should render Person with tags', () => {
      const diagram = C4.create('C4Context').addPerson('user', {
        label: 'User',
        tags: 'important',
      });
      const output = diagram.render();
      expect(output).toContain('important');
    });

    it('should render Person with link', () => {
      const diagram = C4.create('C4Context').addPerson('user', {
        label: 'User',
        link: 'https://example.com',
      });
      const output = diagram.render();
      expect(output).toContain('https://example.com');
    });
  });

  describe('System Rendering', () => {
    it('should render System', () => {
      const diagram = C4.create('C4Context').addSystem('backend', { label: 'Backend' });
      const output = diagram.render();
      expect(output).toContain('System');
      expect(output).toContain('backend');
      expect(output).toContain('Backend');
    });

    it('should render System_Ext', () => {
      const diagram = C4.create('C4Context').addSystem('external', {
        label: 'External',
        external: true,
      });
      const output = diagram.render();
      expect(output).toContain('System_Ext');
      expect(output).toContain('external');
    });

    it('should render SystemDb', () => {
      const diagram = C4.create('C4Context').addSystem('db', { label: 'Database', variant: 'db' });
      const output = diagram.render();
      expect(output).toContain('SystemDb');
      expect(output).toContain('db');
    });

    it('should render SystemDb_Ext', () => {
      const diagram = C4.create('C4Context').addSystem('extDb', {
        label: 'External DB',
        external: true,
        variant: 'db',
      });
      const output = diagram.render();
      expect(output).toContain('SystemDb_Ext');
    });

    it('should render SystemQueue', () => {
      const diagram = C4.create('C4Context').addSystem('queue', {
        label: 'Queue',
        variant: 'queue',
      });
      const output = diagram.render();
      expect(output).toContain('SystemQueue');
    });

    it('should render SystemQueue_Ext', () => {
      const diagram = C4.create('C4Context').addSystem('extQueue', {
        label: 'External Queue',
        external: true,
        variant: 'queue',
      });
      const output = diagram.render();
      expect(output).toContain('SystemQueue_Ext');
    });
  });

  describe('Container Rendering', () => {
    it('should render Container', () => {
      const diagram = C4.create('C4Container').addContainer('web', { label: 'Web App' });
      const output = diagram.render();
      expect(output).toContain('Container');
      expect(output).toContain('web');
      expect(output).toContain('Web App');
    });

    it('should render Container with technology', () => {
      const diagram = C4.create('C4Container').addContainer('web', {
        label: 'Web App',
        technology: 'React',
      });
      const output = diagram.render();
      expect(output).toContain('Container');
      expect(output).toContain('React');
    });

    it('should render Container_Ext', () => {
      const diagram = C4.create('C4Container').addContainer('ext', {
        label: 'External',
        external: true,
      });
      const output = diagram.render();
      expect(output).toContain('Container_Ext');
    });

    it('should render ContainerDb', () => {
      const diagram = C4.create('C4Container').addContainer('db', {
        label: 'Database',
        variant: 'db',
        technology: 'PostgreSQL',
      });
      const output = diagram.render();
      expect(output).toContain('ContainerDb');
      expect(output).toContain('PostgreSQL');
    });

    it('should render ContainerQueue', () => {
      const diagram = C4.create('C4Container').addContainer('queue', {
        label: 'Queue',
        variant: 'queue',
        technology: 'RabbitMQ',
      });
      const output = diagram.render();
      expect(output).toContain('ContainerQueue');
      expect(output).toContain('RabbitMQ');
    });
  });

  describe('Component Rendering', () => {
    it('should render Component', () => {
      const diagram = C4.create('C4Component').addComponent('auth', { label: 'Auth' });
      const output = diagram.render();
      expect(output).toContain('Component');
      expect(output).toContain('auth');
      expect(output).toContain('Auth');
    });

    it('should render Component with technology', () => {
      const diagram = C4.create('C4Component').addComponent('auth', {
        label: 'Auth',
        technology: 'Spring',
      });
      const output = diagram.render();
      expect(output).toContain('Component');
      expect(output).toContain('Spring');
    });

    it('should render Component_Ext', () => {
      const diagram = C4.create('C4Component').addComponent('ext', {
        label: 'External',
        external: true,
      });
      const output = diagram.render();
      expect(output).toContain('Component_Ext');
    });

    it('should render ComponentDb', () => {
      const diagram = C4.create('C4Component').addComponent('cache', {
        label: 'Cache',
        variant: 'db',
      });
      const output = diagram.render();
      expect(output).toContain('ComponentDb');
    });

    it('should render ComponentQueue', () => {
      const diagram = C4.create('C4Component').addComponent('events', {
        label: 'Events',
        variant: 'queue',
      });
      const output = diagram.render();
      expect(output).toContain('ComponentQueue');
    });
  });

  describe('Boundary Rendering', () => {
    it('should render Boundary', () => {
      const diagram = C4.create('C4Context').addBoundary('b1', 'boundary', { label: 'Boundary' });
      const output = diagram.render();
      expect(output).toContain('Boundary');
      expect(output).toContain('b1');
    });

    it('should render Enterprise_Boundary', () => {
      const diagram = C4.create('C4Context').addBoundary('enterprise', 'enterprise_boundary', {
        label: 'Enterprise',
      });
      const output = diagram.render();
      expect(output).toContain('Enterprise_Boundary');
    });

    it('should render System_Boundary', () => {
      const diagram = C4.create('C4Container').addBoundary('system', 'system_boundary', {
        label: 'System',
      });
      const output = diagram.render();
      expect(output).toContain('System_Boundary');
    });

    it('should render Container_Boundary', () => {
      const diagram = C4.create('C4Component').addBoundary('container', 'container_boundary', {
        label: 'Container',
      });
      const output = diagram.render();
      expect(output).toContain('Container_Boundary');
    });
  });

  describe('Deployment Node Rendering', () => {
    it('should render Node', () => {
      const diagram = C4.create('C4Deployment').addDeploymentNode('server', { label: 'Server' });
      const output = diagram.render();
      expect(output).toContain('Deployment_Node');
      expect(output).toContain('server');
      expect(output).toContain('Server');
    });

    it('should render Node with technology', () => {
      const diagram = C4.create('C4Deployment').addDeploymentNode('server', {
        label: 'Server',
        technology: 'Ubuntu',
      });
      const output = diagram.render();
      expect(output).toContain('Deployment_Node');
      expect(output).toContain('Ubuntu');
    });

    it('should render Node_L', () => {
      const diagram = C4.create('C4Deployment').addDeploymentNode('server', {
        label: 'Server',
        variant: 'left',
      });
      const output = diagram.render();
      expect(output).toContain('Node_L');
    });

    it('should render Node_R', () => {
      const diagram = C4.create('C4Deployment').addDeploymentNode('server', {
        label: 'Server',
        variant: 'right',
      });
      const output = diagram.render();
      expect(output).toContain('Node_R');
    });
  });

  describe('Relationship Rendering', () => {
    it('should render Rel', () => {
      const diagram = C4.create('C4Context')
        .addPerson('user', { label: 'User' })
        .addSystem('system', { label: 'System' })
        .addRelationship('user', 'system', { label: 'Uses' });
      const output = diagram.render();
      expect(output).toContain('Rel');
      expect(output).toContain('user');
      expect(output).toContain('system');
      expect(output).toContain('Uses');
    });

    it('should render Rel with technology', () => {
      const diagram = C4.create('C4Context')
        .addPerson('user', { label: 'User' })
        .addSystem('system', { label: 'System' })
        .addRelationship('user', 'system', { label: 'Uses', technology: 'HTTPS' });
      const output = diagram.render();
      expect(output).toContain('Rel');
      expect(output).toContain('HTTPS');
    });

    it('should render BiRel', () => {
      const diagram = C4.create('C4Context')
        .addSystem('a', { label: 'A' })
        .addSystem('b', { label: 'B' })
        .addRelationship('a', 'b', { label: 'Syncs', type: 'birel' });
      const output = diagram.render();
      expect(output).toContain('BiRel');
    });

    it('should render Rel_U', () => {
      const diagram = C4.create('C4Context')
        .addSystem('a', { label: 'A' })
        .addSystem('b', { label: 'B' })
        .addRelationship('a', 'b', { label: 'Calls', type: 'rel_u' });
      const output = diagram.render();
      expect(output).toContain('Rel_U');
    });

    it('should render Rel_D', () => {
      const diagram = C4.create('C4Context')
        .addSystem('a', { label: 'A' })
        .addSystem('b', { label: 'B' })
        .addRelationship('a', 'b', { label: 'Calls', type: 'rel_d' });
      const output = diagram.render();
      expect(output).toContain('Rel_D');
    });

    it('should render Rel_L', () => {
      const diagram = C4.create('C4Context')
        .addSystem('a', { label: 'A' })
        .addSystem('b', { label: 'B' })
        .addRelationship('a', 'b', { label: 'Calls', type: 'rel_l' });
      const output = diagram.render();
      expect(output).toContain('Rel_L');
    });

    it('should render Rel_R', () => {
      const diagram = C4.create('C4Context')
        .addSystem('a', { label: 'A' })
        .addSystem('b', { label: 'B' })
        .addRelationship('a', 'b', { label: 'Calls', type: 'rel_r' });
      const output = diagram.render();
      expect(output).toContain('Rel_R');
    });
  });

  describe('Style Rendering', () => {
    it('should render UpdateElementStyle', () => {
      const diagram = C4.create('C4Context').addElementStyle('person', { bgColor: '#blue' });
      const output = diagram.render();
      expect(output).toContain('UpdateElementStyle');
      expect(output).toContain('person');
    });

    it('should render UpdateRelStyle', () => {
      const diagram = C4.create('C4Context').addRelationshipStyle('user', 'system', {
        lineColor: '#red',
      });
      const output = diagram.render();
      expect(output).toContain('UpdateRelStyle');
      expect(output).toContain('user');
      expect(output).toContain('system');
    });
  });

  describe('Golden Tests', () => {
    it('should render and re-parse simple diagram', () => {
      const original = C4.create('C4Context')
        .addPerson('user', { label: 'User' })
        .addSystem('system', { label: 'System' })
        .addRelationship('user', 'system', { label: 'Uses' });

      const rendered = original.render();
      const reparsed = C4.parse(rendered);

      expect(reparsed.toAST().elements.length).toBe(2);
      expect(reparsed.toAST().relationships.length).toBe(1);
    });

    it('should render complete C4Context diagram', () => {
      const diagram = C4.create('C4Context')
        .setTitle('System Context')
        .addPerson('user', { label: 'User', description: 'A user' })
        .addSystem('system', { label: 'System', description: 'Main system' })
        .addSystem('external', { label: 'External', external: true })
        .addRelationship('user', 'system', { label: 'Uses' })
        .addRelationship('system', 'external', { label: 'Calls', technology: 'REST' });

      const output = diagram.render();
      expect(output).toContain('C4Context');
      expect(output).toContain('title System Context');
      expect(output).toContain('Person');
      expect(output).toContain('System');
      expect(output).toContain('System_Ext');
      expect(output).toContain('Rel');
    });

    it('should render C4Container with boundaries', () => {
      const diagram = C4.create('C4Container')
        .addBoundary('system', 'system_boundary', { label: 'My System' })
        .addContainer('web', { label: 'Web', technology: 'React' })
        .addContainer('api', { label: 'API', technology: 'Node.js' })
        .addContainer('db', { label: 'DB', variant: 'db', technology: 'PostgreSQL' })
        .addRelationship('web', 'api', { label: 'Calls' })
        .addRelationship('api', 'db', { label: 'Queries' });

      const output = diagram.render();
      expect(output).toContain('C4Container');
      expect(output).toContain('System_Boundary');
      expect(output).toContain('Container');
      expect(output).toContain('ContainerDb');
    });
  });
});
