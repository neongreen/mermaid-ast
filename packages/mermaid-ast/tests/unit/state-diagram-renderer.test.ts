/**
 * State Diagram Renderer Tests
 */

import { describe, expect, it } from 'bun:test';
import { parseStateDiagram } from '../../src/parser/state-parser.js';
import { renderStateDiagram } from '../../src/renderer/state-renderer.js';
import { StateDiagram } from '../../src/state-diagram.js';
import { expectGolden } from '../golden/golden.js';

describe('StateDiagram Renderer', () => {
  describe('Basic Rendering', () => {
    it('should render minimal state diagram', () => {
      const diagram = StateDiagram.create();
      const rendered = diagram.render();
      expect(rendered).toContain('stateDiagram-v2');
    });

    it('should render state diagram with direction', () => {
      const diagram = StateDiagram.create('LR');
      const rendered = diagram.render();
      expect(rendered).toContain('stateDiagram-v2');
      expect(rendered).toContain('direction LR');
    });

    it('should render initial and final transitions', () => {
      const diagram = StateDiagram.create().addInitial('Idle').addFinal('Done');
      const rendered = diagram.render();
      expect(rendered).toContain('[*] --> Idle');
      expect(rendered).toContain('Done --> [*]');
    });
  });

  describe('State Rendering', () => {
    it('should render state with description', () => {
      const diagram = StateDiagram.create().addState('S1', { description: 'First State' });
      const rendered = diagram.render();
      expect(rendered).toContain('state "First State" as S1');
    });

    it('should render fork state', () => {
      const diagram = StateDiagram.create().addFork('fork1');
      const rendered = diagram.render();
      expect(rendered).toContain('state fork1 <<fork>>');
    });

    it('should render join state', () => {
      const diagram = StateDiagram.create().addJoin('join1');
      const rendered = diagram.render();
      expect(rendered).toContain('state join1 <<join>>');
    });

    it('should render choice state', () => {
      const diagram = StateDiagram.create().addChoice('choice1');
      const rendered = diagram.render();
      expect(rendered).toContain('state choice1 <<choice>>');
    });
  });

  describe('Transition Rendering', () => {
    it('should render simple transition', () => {
      const diagram = StateDiagram.create().addTransition('A', 'B');
      const rendered = diagram.render();
      expect(rendered).toContain('A --> B');
    });

    it('should render transition with label', () => {
      const diagram = StateDiagram.create().addTransition('Idle', 'Running', { label: 'start' });
      const rendered = diagram.render();
      expect(rendered).toContain('Idle --> Running : start');
    });

    it('should render multiple transitions', () => {
      const diagram = StateDiagram.create()
        .addTransition('A', 'B', { label: 'go' })
        .addTransition('B', 'C', { label: 'next' })
        .addTransition('C', 'A', { label: 'loop' });
      const rendered = diagram.render();
      expect(rendered).toContain('A --> B : go');
      expect(rendered).toContain('B --> C : next');
      expect(rendered).toContain('C --> A : loop');
    });

    it('should render self-transition', () => {
      const diagram = StateDiagram.create().addTransition('A', 'A', { label: 'retry' });
      const rendered = diagram.render();
      expect(rendered).toContain('A --> A : retry');
    });
  });

  describe('Note Rendering', () => {
    it('should render note on right', () => {
      const diagram = StateDiagram.create()
        .addState('S1')
        .addNote('S1', 'This is a note', 'right of');
      const rendered = diagram.render();
      expect(rendered).toContain('note right of S1 : This is a note');
    });

    it('should render note on left', () => {
      const diagram = StateDiagram.create().addState('S1').addNote('S1', 'Left note', 'left of');
      const rendered = diagram.render();
      expect(rendered).toContain('note left of S1 : Left note');
    });
  });

  describe('Style Rendering', () => {
    it('should render class definition', () => {
      const diagram = StateDiagram.create().defineStyle('highlight', 'fill:#f9f,stroke:#333');
      const rendered = diagram.render();
      expect(rendered).toContain('classDef highlight fill:#f9f,stroke:#333');
    });

    it('should render class application', () => {
      const diagram = StateDiagram.create()
        .addState('S1')
        .defineStyle('highlight', 'fill:#f9f')
        .applyStyle('S1', 'highlight');
      const rendered = diagram.render();
      expect(rendered).toContain('class S1 highlight');
    });
  });

  describe('Complex Diagrams', () => {
    it('should render complete state machine', () => {
      const diagram = StateDiagram.create('LR')
        .addInitial('Idle')
        .addState('Idle', { description: 'Waiting for input' })
        .addState('Processing', { description: 'Processing data' })
        .addState('Done', { description: 'Completed' })
        .addTransition('Idle', 'Processing', { label: 'start' })
        .addTransition('Processing', 'Done', { label: 'complete' })
        .addTransition('Processing', 'Idle', { label: 'cancel' })
        .addFinal('Done');

      const rendered = diagram.render();
      expect(rendered).toContain('stateDiagram-v2');
      expect(rendered).toContain('direction LR');
      expect(rendered).toContain('[*] --> Idle');
      expect(rendered).toContain('Idle --> Processing : start');
      expect(rendered).toContain('Processing --> Done : complete');
      expect(rendered).toContain('Done --> [*]');
    });

    it('should render fork/join pattern', () => {
      const diagram = StateDiagram.create()
        .addInitial('Start')
        .addFork('fork1')
        .addJoin('join1')
        .addTransition('Start', 'fork1')
        .addTransition('fork1', 'A')
        .addTransition('fork1', 'B')
        .addTransition('A', 'join1')
        .addTransition('B', 'join1')
        .addTransition('join1', 'End')
        .addFinal('End');

      const rendered = diagram.render();
      expect(rendered).toContain('state fork1 <<fork>>');
      expect(rendered).toContain('state join1 <<join>>');
      expect(rendered).toContain('fork1 --> A');
      expect(rendered).toContain('fork1 --> B');
    });

    it('should render choice pattern', () => {
      const diagram = StateDiagram.create()
        .addChoice('decision')
        .addTransition('Start', 'decision')
        .addTransition('decision', 'Yes', { label: 'condition true' })
        .addTransition('decision', 'No', { label: 'condition false' });

      const rendered = diagram.render();
      expect(rendered).toContain('state decision <<choice>>');
      expect(rendered).toContain('decision --> Yes : condition true');
      expect(rendered).toContain('decision --> No : condition false');
    });
  });

  describe('Golden Tests', () => {
    it('should render basic state diagram', () => {
      const diagram = StateDiagram.create()
        .addInitial('Idle')
        .addTransition('Idle', 'Running', { label: 'start' })
        .addFinal('Running');

      expectGolden(diagram.render(), 'state/render-basic.mmd');
    });

    it('should render complex state diagram', () => {
      const diagram = StateDiagram.create('LR')
        .addInitial('Idle')
        .addState('Idle', { description: 'System idle' })
        .addState('Active', { description: 'System active' })
        .addState('Paused', { description: 'System paused' })
        .addChoice('check')
        .addTransition('Idle', 'check', { label: 'trigger' })
        .addTransition('check', 'Active', { label: 'valid' })
        .addTransition('check', 'Idle', { label: 'invalid' })
        .addTransition('Active', 'Paused', { label: 'pause' })
        .addTransition('Paused', 'Active', { label: 'resume' })
        .addTransition('Active', 'Idle', { label: 'stop' })
        .addFinal('Idle')
        .addNote('Active', 'Main processing state', 'right of');

      expectGolden(diagram.render(), 'state/render-complex.mmd');
    });
  });

  describe('Render Options', () => {
    it('should respect custom indent', () => {
      const diagram = StateDiagram.create('LR');
      const rendered = diagram.render({ indent: 2 });
      const lines = rendered.split('\n');
      // Direction line should have 2-space indent
      expect(lines[1]).toMatch(/^\s{2}direction/);
    });

    it('should support tab indent', () => {
      const diagram = StateDiagram.create('LR');
      const rendered = diagram.render({ indent: 'tab' });
      expect(rendered).toContain('\tdirection');
    });
  });

  describe('Round-trip Rendering', () => {
    it('should preserve content through wrapper build and render', () => {
      const diagram = StateDiagram.create()
        .addInitial('A')
        .addTransition('A', 'B', { label: 'next' })
        .addTransition('B', 'C')
        .addFinal('C');

      const rendered = diagram.render();
      expect(rendered).toContain('stateDiagram-v2');
      expect(rendered).toContain('[*] --> A');
      expect(rendered).toContain('A --> B : next');
      expect(rendered).toContain('B --> C');
      expect(rendered).toContain('C --> [*]');
    });
  });
});
