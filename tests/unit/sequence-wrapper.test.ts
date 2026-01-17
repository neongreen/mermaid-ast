import { describe, expect, it } from 'bun:test';
import { Sequence } from '../../src/sequence.js';
import { expectGolden } from '../golden/golden.js';

describe('Sequence Wrapper', () => {
  describe('Factory Methods', () => {
    it('should create an empty sequence diagram', () => {
      const seq = Sequence.create();
      expect(seq.actorCount).toBe(0);
      expect(seq.statementCount).toBe(0);
    });

    it('should create with title', () => {
      const seq = Sequence.create('My Diagram');
      expect(seq.title).toBe('My Diagram');
    });

    it('should parse Mermaid syntax', () => {
      const seq = Sequence.parse(`sequenceDiagram
    participant A as Alice
    participant B as Bob
    A->>B: Hello`);
      
      expect(seq.actorCount).toBe(2);
      expect(seq.hasActor('A')).toBe(true);
      expect(seq.hasActor('B')).toBe(true);
    });

    it('should create from existing AST', () => {
      const original = Sequence.create()
        .addParticipant('A', 'Alice')
        .addMessage('A', 'B', 'Hello');
      
      const copy = Sequence.from(original.toAST());
      expect(copy.actorCount).toBe(2);
    });
  });

  describe('Actor Operations', () => {
    it('should add participants', () => {
      const seq = Sequence.create()
        .addParticipant('A', 'Alice')
        .addParticipant('B', 'Bob');
      
      expect(seq.actorCount).toBe(2);
      expect(seq.getActor('A')?.name).toBe('Alice');
    });

    it('should add actors', () => {
      const seq = Sequence.create()
        .addActor('U', 'User');
      
      expect(seq.getActor('U')?.type).toBe('actor');
    });

    it('should remove actors', () => {
      const seq = Sequence.create()
        .addParticipant('A')
        .addParticipant('B')
        .removeActor('A');
      
      expect(seq.actorCount).toBe(1);
      expect(seq.hasActor('A')).toBe(false);
    });

    it('should remove actors and their messages', () => {
      const seq = Sequence.create()
        .addParticipant('A')
        .addParticipant('B')
        .addMessage('A', 'B', 'Hello')
        .removeActor('A', { removeMessages: true });
      
      expect(seq.getMessages().length).toBe(0);
    });

    it('should rename actors', () => {
      const seq = Sequence.create()
        .addParticipant('A', 'Alice')
        .renameActor('A', 'Alicia');
      
      expect(seq.getActor('A')?.name).toBe('Alicia');
    });
  });

  describe('Message Operations', () => {
    it('should add messages', () => {
      const seq = Sequence.create()
        .addParticipant('A')
        .addParticipant('B')
        .addMessage('A', 'B', 'Hello');
      
      expect(seq.getMessages().length).toBe(1);
    });

    it('should auto-create actors for messages', () => {
      const seq = Sequence.create()
        .addMessage('A', 'B', 'Hello');
      
      expect(seq.hasActor('A')).toBe(true);
      expect(seq.hasActor('B')).toBe(true);
    });

    it('should add messages with options', () => {
      const seq = Sequence.create()
        .addMessage('A', 'B', 'Hello', { arrow: 'dotted', activate: true });
      
      const msg = seq.getMessages()[0];
      expect(msg.arrowType).toBe('dotted');
      expect(msg.activate).toBe(true);
    });

    it('should get messages from actor', () => {
      const seq = Sequence.create()
        .addMessage('A', 'B', 'Hello')
        .addMessage('B', 'A', 'Hi')
        .addMessage('A', 'C', 'Hey');
      
      expect(seq.getMessagesFrom('A').length).toBe(2);
    });

    it('should get messages to actor', () => {
      const seq = Sequence.create()
        .addMessage('A', 'B', 'Hello')
        .addMessage('C', 'B', 'Hi');
      
      expect(seq.getMessagesTo('B').length).toBe(2);
    });

    it('should get messages between actors', () => {
      const seq = Sequence.create()
        .addMessage('A', 'B', 'Hello')
        .addMessage('B', 'A', 'Hi')
        .addMessage('A', 'C', 'Hey');
      
      expect(seq.getMessagesBetween('A', 'B').length).toBe(2);
    });
  });

  describe('Note Operations', () => {
    it('should add notes', () => {
      const seq = Sequence.create()
        .addParticipant('A')
        .addNote('A', 'Important!');
      
      expect(seq.getNotes().length).toBe(1);
    });

    it('should add notes over multiple actors', () => {
      const seq = Sequence.create()
        .addParticipant('A')
        .addParticipant('B')
        .addNote(['A', 'B'], 'Shared note', { placement: 'over' });
      
      const note = seq.getNotes()[0];
      expect(note.actors.length).toBe(2);
      expect(note.placement).toBe('over');
    });
  });

  describe('Activation Operations', () => {
    it('should activate and deactivate', () => {
      const seq = Sequence.create()
        .addParticipant('A')
        .activate('A')
        .addMessage('A', 'B', 'Working...')
        .deactivate('A');
      
      expect(seq.statementCount).toBe(3);
    });
  });

  describe('Control Flow Operations', () => {
    it('should add loop blocks', () => {
      const seq = Sequence.create()
        .addParticipant('A')
        .addParticipant('B')
        .addLoop('Every minute', (s) => {
          s.addMessage('A', 'B', 'Ping');
        });
      
      expectGolden(seq.render(), 'sequence/loop.mmd');
    });

    it('should add alt blocks', () => {
      const seq = Sequence.create()
        .addParticipant('A')
        .addParticipant('B')
        .addAlt([
          { condition: 'Success', build: (s) => s.addMessage('A', 'B', 'OK') },
          { condition: 'Failure', build: (s) => s.addMessage('A', 'B', 'Error') },
        ]);
      
      expectGolden(seq.render(), 'sequence/alt.mmd');
    });

    it('should add opt blocks', () => {
      const seq = Sequence.create()
        .addOpt('If available', (s) => {
          s.addMessage('A', 'B', 'Optional');
        });
      
      expectGolden(seq.render(), 'sequence/opt.mmd');
    });

    it('should add par blocks', () => {
      const seq = Sequence.create()
        .addPar([
          { text: 'Thread 1', build: (s) => s.addMessage('A', 'B', 'Work 1') },
          { text: 'Thread 2', build: (s) => s.addMessage('A', 'C', 'Work 2') },
        ]);
      
      expectGolden(seq.render(), 'sequence/par.mmd');
    });

    it('should add rect blocks', () => {
      const seq = Sequence.create()
        .addRect('rgb(200, 200, 200)', (s) => {
          s.addMessage('A', 'B', 'Highlighted');
        });
      
      expectGolden(seq.render(), 'sequence/rect.mmd');
    });
  });

  describe('Box Operations', () => {
    it('should add boxes', () => {
      const seq = Sequence.create()
        .addParticipant('A')
        .addParticipant('B')
        .addBox('Group', ['A', 'B']);
      
      expect(seq.getBoxes().length).toBe(1);
    });
  });

  describe('Autonumber Operations', () => {
    it('should enable autonumbering', () => {
      const seq = Sequence.create()
        .autonumber()
        .addMessage('A', 'B', 'First')
        .addMessage('A', 'B', 'Second');
      
      expectGolden(seq.render(), 'sequence/autonumber.mmd');
    });
  });

  describe('Query Operations', () => {
    it('should find actors by type', () => {
      const seq = Sequence.create()
        .addParticipant('A')
        .addActor('U');
      
      const actors = seq.findActors({ type: 'actor' });
      expect(actors.length).toBe(1);
      expect(actors[0].id).toBe('U');
    });

    it('should find messages by criteria', () => {
      const seq = Sequence.create()
        .addMessage('A', 'B', 'Hello world')
        .addMessage('B', 'A', 'Hi there')
        .addMessage('A', 'C', 'Hello again');
      
      const found = seq.findMessages({ textContains: 'Hello' });
      expect(found.length).toBe(2);
    });

    it('should get communicating actors', () => {
      const seq = Sequence.create()
        .addMessage('A', 'B', 'Hi')
        .addMessage('A', 'C', 'Hello')
        .addMessage('D', 'A', 'Hey');
      
      const actors = seq.getCommunicatingActors('A');
      expect(actors).toContain('B');
      expect(actors).toContain('C');
      expect(actors).toContain('D');
    });
  });

  describe('Clone and Render', () => {
    it('should clone the diagram', () => {
      const original = Sequence.create('Test')
        .addMessage('A', 'B', 'Hello');
      
      const clone = original.clone();
      clone.setTitle('Clone');
      
      expect(original.title).toBe('Test');
      expect(clone.title).toBe('Clone');
    });

    it('should render to Mermaid syntax', () => {
      const seq = Sequence.create()
        .addParticipant('A', 'Alice')
        .addParticipant('B', 'Bob')
        .addMessage('A', 'B', 'Hello!');
      
      expectGolden(seq.render(), 'sequence/render-basic.mmd');
    });
  });
});