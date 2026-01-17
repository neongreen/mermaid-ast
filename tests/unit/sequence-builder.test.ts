import { describe, expect, test } from 'bun:test';
import { SequenceValidationError, sequence } from '../../src/builder/sequence-builder.js';
import { parseSequence } from '../../src/parser/sequence-parser.js';
import { renderSequence } from '../../src/renderer/sequence-renderer.js';

describe('SequenceBuilder', () => {
  test('builds a simple sequence diagram', () => {
    const ast = sequence()
      .participant('A', 'Alice')
      .participant('B', 'Bob')
      .message('A', 'B', 'Hello')
      .build();

    expect(ast.type).toBe('sequence');
    expect(ast.actors.size).toBe(2);
    expect(ast.statements.length).toBe(1);
  });

  test('builds actors vs participants', () => {
    const ast = sequence().participant('A', 'Alice').actor('B', 'Bob').build();

    expect(ast.actors.get('A')?.type).toBe('participant');
    expect(ast.actors.get('B')?.type).toBe('actor');
  });

  test('builds messages with arrow types', () => {
    const ast = sequence()
      .participant('A')
      .participant('B')
      .message('A', 'B', 'Solid', { arrow: 'solid' })
      .message('B', 'A', 'Dotted', { arrow: 'dotted' })
      .build();

    expect(ast.statements.length).toBe(2);
    const msg1 = ast.statements[0];
    const msg2 = ast.statements[1];
    if (msg1.type === 'message' && msg2.type === 'message') {
      expect(msg1.arrowType).toBe('solid');
      expect(msg2.arrowType).toBe('dotted');
    }
  });

  test('builds loop blocks', () => {
    const ast = sequence()
      .participant('A')
      .participant('B')
      .loop('Every minute', (l) => {
        l.message('A', 'B', 'Ping');
      })
      .build();

    const loop = ast.statements[0];
    expect(loop.type).toBe('loop');
    if (loop.type === 'loop') {
      expect(loop.text).toBe('Every minute');
      expect(loop.statements.length).toBe(1);
    }
  });

  test('builds alt blocks', () => {
    const ast = sequence()
      .participant('A')
      .participant('B')
      .alt([
        { condition: 'Success', build: (b) => b.message('A', 'B', 'OK') },
        { condition: 'Failure', build: (b) => b.message('A', 'B', 'Error') },
      ])
      .build();

    const alt = ast.statements[0];
    expect(alt.type).toBe('alt');
    if (alt.type === 'alt') {
      expect(alt.sections.length).toBe(2);
    }
  });

  test('builds notes', () => {
    const ast = sequence()
      .participant('A')
      .note('A', 'Important!', { placement: 'right_of' })
      .build();

    const note = ast.statements[0];
    expect(note.type).toBe('note');
    if (note.type === 'note') {
      expect(note.text).toBe('Important!');
      expect(note.placement).toBe('right_of');
    }
  });

  test('auto-creates actors from messages', () => {
    const ast = sequence().message('A', 'B', 'Hello').build();

    expect(ast.actors.has('A')).toBe(true);
    expect(ast.actors.has('B')).toBe(true);
  });

  test('validates actor references in notes', () => {
    expect(() => {
      sequence().participant('A').note('NonExistent', 'Note').build();
    }).toThrow(SequenceValidationError);
  });

  test('allows skipping validation', () => {
    const ast = sequence().participant('A').note('NonExistent', 'Note').build({ validate: false });

    expect(ast.statements.length).toBe(1);
  });

  test('round-trips through render and parse', () => {
    const ast = sequence()
      .participant('A', 'Alice')
      .participant('B', 'Bob')
      .message('A', 'B', 'Hello')
      .message('B', 'A', 'Hi')
      .build();

    const rendered = renderSequence(ast);
    const parsed = parseSequence(rendered);

    expect(parsed.actors.size).toBe(ast.actors.size);
    expect(parsed.statements.length).toBe(ast.statements.length);
  });
});
