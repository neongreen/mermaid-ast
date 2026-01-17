import { describe, it } from 'bun:test';
import { Sequence } from '../../src/sequence.js';
import { expectGolden } from '../golden/golden.js';

describe('Sequence Renderer', () => {
  describe('Control Flow Rendering', () => {
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
      const seq = Sequence.create().addOpt('If available', (s) => {
        s.addMessage('A', 'B', 'Optional');
      });

      expectGolden(seq.render(), 'sequence/opt.mmd');
    });

    it('should add par blocks', () => {
      const seq = Sequence.create().addPar([
        { text: 'Thread 1', build: (s) => s.addMessage('A', 'B', 'Work 1') },
        { text: 'Thread 2', build: (s) => s.addMessage('A', 'C', 'Work 2') },
      ]);

      expectGolden(seq.render(), 'sequence/par.mmd');
    });

    it('should add rect blocks', () => {
      const seq = Sequence.create().addRect('rgb(200, 200, 200)', (s) => {
        s.addMessage('A', 'B', 'Highlighted');
      });

      expectGolden(seq.render(), 'sequence/rect.mmd');
    });
  });

  describe('Autonumber Rendering', () => {
    it('should enable autonumbering', () => {
      const seq = Sequence.create()
        .autonumber()
        .addMessage('A', 'B', 'First')
        .addMessage('A', 'B', 'Second');

      expectGolden(seq.render(), 'sequence/autonumber.mmd');
    });
  });

  describe('Basic Rendering', () => {
    it('should render to Mermaid syntax', () => {
      const seq = Sequence.create()
        .addParticipant('A', 'Alice')
        .addParticipant('B', 'Bob')
        .addMessage('A', 'B', 'Hello!');

      expectGolden(seq.render(), 'sequence/render-basic.mmd');
    });
  });
});
