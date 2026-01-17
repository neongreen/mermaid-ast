import { describe, expect, it } from 'bun:test';
import { StateDiagram } from '../../src/state-diagram.js';

describe('StateDiagram Wrapper', () => {
  describe('Factory Methods', () => {
    it('should create an empty state diagram', () => {
      const diagram = StateDiagram.create();
      expect(diagram.stateCount).toBe(0);
      expect(diagram.transitionCount).toBe(0);
    });

    it('should create with direction', () => {
      const diagram = StateDiagram.create('LR');
      expect(diagram.direction).toBe('LR');
    });

    it('should parse Mermaid syntax', () => {
      const diagram = StateDiagram.parse(`stateDiagram-v2
    [*] --> Idle
    Idle --> Running : start
    Running --> [*]`);

      expect(diagram.stateCount).toBeGreaterThan(0);
      expect(diagram.transitionCount).toBe(3);
    });

    it('should create from existing AST', () => {
      const original = StateDiagram.create().addState('A').addState('B').addTransition('A', 'B');

      const copy = StateDiagram.from(original.toAST());
      expect(copy.stateCount).toBe(2);
      expect(copy.transitionCount).toBe(1);
    });
  });

  describe('State Operations', () => {
    it('should add states', () => {
      const diagram = StateDiagram.create().addState('Idle').addState('Running');

      expect(diagram.stateCount).toBe(2);
    });

    it('should add states with description', () => {
      const diagram = StateDiagram.create().addState('Idle', { description: 'Waiting for input' });

      const state = diagram.getState('Idle');
      expect(state?.description).toBe('Waiting for input');
    });

    it('should remove states', () => {
      const diagram = StateDiagram.create().addState('A').addState('B').removeState('A');

      expect(diagram.stateCount).toBe(1);
      expect(diagram.hasState('A')).toBe(false);
    });

    it('should remove states and their transitions', () => {
      const diagram = StateDiagram.create()
        .addState('A')
        .addState('B')
        .addTransition('A', 'B')
        .removeState('A', { removeTransitions: true });

      expect(diagram.transitionCount).toBe(0);
    });

    it('should rename states', () => {
      const diagram = StateDiagram.create().addState('OldName').renameState('OldName', 'NewName');

      expect(diagram.hasState('OldName')).toBe(false);
      expect(diagram.hasState('NewName')).toBe(true);
    });

    it('should update transitions when renaming', () => {
      const diagram = StateDiagram.create()
        .addState('A')
        .addState('B')
        .addTransition('A', 'B')
        .renameState('A', 'Start');

      const transitions = diagram.getTransitionsFrom('Start');
      expect(transitions.length).toBe(1);
    });

    it('should set state description', () => {
      const diagram = StateDiagram.create()
        .addState('A')
        .setStateDescription('A', 'My description');

      expect(diagram.getState('A')?.description).toBe('My description');
    });

    it('should add fork state', () => {
      const diagram = StateDiagram.create().addFork('fork1');

      expect(diagram.getState('fork1')?.type).toBe('fork');
    });

    it('should add join state', () => {
      const diagram = StateDiagram.create().addJoin('join1');

      expect(diagram.getState('join1')?.type).toBe('join');
    });

    it('should add choice state', () => {
      const diagram = StateDiagram.create().addChoice('choice1');

      expect(diagram.getState('choice1')?.type).toBe('choice');
    });
  });

  describe('Transition Operations', () => {
    it('should add transitions', () => {
      const diagram = StateDiagram.create().addState('A').addState('B').addTransition('A', 'B');

      expect(diagram.transitionCount).toBe(1);
    });

    it('should auto-create states for transitions', () => {
      const diagram = StateDiagram.create().addTransition('A', 'B');

      expect(diagram.hasState('A')).toBe(true);
      expect(diagram.hasState('B')).toBe(true);
    });

    it('should add transitions with labels', () => {
      const diagram = StateDiagram.create().addTransition('A', 'B', { label: 'start' });

      const transitions = diagram.getTransitions();
      expect(transitions[0].label).toBe('start');
    });

    it('should add initial transition', () => {
      const diagram = StateDiagram.create().addInitial('Idle');

      const initials = diagram.getInitialStates();
      expect(initials).toContain('Idle');
    });

    it('should add final transition', () => {
      const diagram = StateDiagram.create().addFinal('Done');

      const finals = diagram.getFinalStates();
      expect(finals).toContain('Done');
    });

    it('should get transitions from state', () => {
      const diagram = StateDiagram.create()
        .addTransition('A', 'B')
        .addTransition('A', 'C')
        .addTransition('B', 'C');

      expect(diagram.getTransitionsFrom('A').length).toBe(2);
    });

    it('should get transitions to state', () => {
      const diagram = StateDiagram.create().addTransition('A', 'C').addTransition('B', 'C');

      expect(diagram.getTransitionsTo('C').length).toBe(2);
    });

    it('should remove transitions', () => {
      const diagram = StateDiagram.create().addTransition('A', 'B').removeTransition('A', 'B');

      expect(diagram.transitionCount).toBe(0);
    });

    it('should set transition label', () => {
      const diagram = StateDiagram.create()
        .addTransition('A', 'B')
        .setTransitionLabel('A', 'B', 'go');

      const transitions = diagram.getTransitions();
      expect(transitions[0].label).toBe('go');
    });
  });

  describe('Composite State Operations', () => {
    it('should add composite states', () => {
      const diagram = StateDiagram.create().addComposite('Running', (inner) => {
        inner.addState('Step1').addState('Step2').addTransition('Step1', 'Step2');
      });

      expect(diagram.isComposite('Running')).toBe(true);
    });

    it('should get nested states', () => {
      const diagram = StateDiagram.create().addComposite('Running', (inner) => {
        inner.addState('Step1').addState('Step2');
      });

      const nested = diagram.getNestedStates('Running');
      expect(nested).toContain('Step1');
      expect(nested).toContain('Step2');
    });
  });

  describe('Note Operations', () => {
    it('should add notes', () => {
      const diagram = StateDiagram.create().addState('A').addNote('A', 'Important!');

      const note = diagram.getNote('A');
      expect(note?.text).toBe('Important!');
    });

    it('should add notes with position', () => {
      const diagram = StateDiagram.create().addState('A').addNote('A', 'Left note', 'left of');

      const note = diagram.getNote('A');
      expect(note?.position).toBe('left of');
    });
  });

  describe('Style Operations', () => {
    it('should define and apply styles', () => {
      const diagram = StateDiagram.create()
        .addState('A')
        .defineStyle('highlight', 'fill:#f9f')
        .applyStyle('A', 'highlight');

      expect(diagram.getState('A')?.classes).toContain('highlight');
    });
  });

  describe('Query Operations', () => {
    it('should find states by type', () => {
      const diagram = StateDiagram.create().addState('A').addFork('fork1').addJoin('join1');

      const forks = diagram.findStates({ type: 'fork' });
      expect(forks.length).toBe(1);
    });

    it('should get reachable states', () => {
      const diagram = StateDiagram.create()
        .addTransition('A', 'B')
        .addTransition('B', 'C')
        .addTransition('C', 'D');

      const reachable = diagram.getReachable('A');
      expect(reachable).toContain('B');
      expect(reachable).toContain('C');
      expect(reachable).toContain('D');
    });

    it('should get ancestors', () => {
      const diagram = StateDiagram.create()
        .addTransition('A', 'B')
        .addTransition('B', 'C')
        .addTransition('C', 'D');

      const ancestors = diagram.getAncestors('D');
      expect(ancestors).toContain('A');
      expect(ancestors).toContain('B');
      expect(ancestors).toContain('C');
    });

    it('should check path existence', () => {
      const diagram = StateDiagram.create().addTransition('A', 'B').addTransition('B', 'C');

      expect(diagram.hasPath('A', 'C')).toBe(true);
      expect(diagram.hasPath('C', 'A')).toBe(false);
    });

    it('should get initial states', () => {
      const diagram = StateDiagram.create().addInitial('Idle').addInitial('Ready');

      const initials = diagram.getInitialStates();
      expect(initials.length).toBe(2);
    });

    it('should get final states', () => {
      const diagram = StateDiagram.create().addFinal('Done').addFinal('Error');

      const finals = diagram.getFinalStates();
      expect(finals.length).toBe(2);
    });
  });

  describe('Clone', () => {
    it('should clone the diagram', () => {
      const original = StateDiagram.create().addState('A').addState('B');

      const clone = original.clone();
      clone.addState('C');

      expect(original.stateCount).toBe(2);
      expect(clone.stateCount).toBe(3);
    });
  });
});
