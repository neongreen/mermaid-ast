/**
 * Advanced Sequence Diagram Parser Tests
 *
 * Tests for: critical, break, rect, links, create/destroy
 */

import { describe, expect, it } from 'bun:test';
import { parseSequence } from '../../src/parser/index.js';
import { renderSequence } from '../../src/renderer/index.js';

describe('parseSequence - Critical Sections', () => {
  it('should parse critical section', () => {
    const ast = parseSequence(`sequenceDiagram
    Alice->>Bob: Request
    critical Establish connection
        Bob->>Alice: Connected
    end`);

    expect(ast.statements.length).toBeGreaterThan(1);
    const critical = ast.statements.find((s) => s.type === 'critical');
    expect(critical).toBeDefined();
    if (critical && critical.type === 'critical') {
      expect(critical.text).toBe('Establish connection');
    }
  });

  it('should parse critical section with option', () => {
    const ast = parseSequence(`sequenceDiagram
    Alice->>Bob: Request
    critical Establish connection
        Bob->>Alice: Connected
    option Connection failed
        Bob->>Alice: Error
    end`);

    const critical = ast.statements.find((s) => s.type === 'critical');
    expect(critical).toBeDefined();
    if (critical && critical.type === 'critical') {
      expect(critical.options.length).toBe(1);
      expect(critical.options[0].text).toBe('Connection failed');
    }
  });
});

describe('parseSequence - Break Sections', () => {
  it('should parse break section', () => {
    const ast = parseSequence(`sequenceDiagram
    Alice->>Bob: Request
    break when condition is met
        Bob->>Alice: Abort
    end`);

    const brk = ast.statements.find((s) => s.type === 'break');
    expect(brk).toBeDefined();
    if (brk && brk.type === 'break') {
      expect(brk.text).toBe('when condition is met');
    }
  });
});

describe('parseSequence - Rect (Highlight) Sections', () => {
  it('should parse rect section with color', () => {
    const ast = parseSequence(`sequenceDiagram
    rect rgb(200, 150, 255)
        Alice->>Bob: Request
        Bob->>Alice: Response
    end`);

    const rect = ast.statements.find((s) => s.type === 'rect');
    expect(rect).toBeDefined();
    if (rect && rect.type === 'rect') {
      expect(rect.color).toContain('rgb');
    }
  });

  it('should parse rect section with rgba color', () => {
    const ast = parseSequence(`sequenceDiagram
    rect rgba(200, 150, 255, 0.5)
        Alice->>Bob: Request
    end`);

    const rect = ast.statements.find((s) => s.type === 'rect');
    expect(rect).toBeDefined();
    if (rect && rect.type === 'rect') {
      expect(rect.color).toContain('rgba');
    }
  });
});

describe('parseSequence - Create/Destroy', () => {
  it('should parse create participant', () => {
    const ast = parseSequence(`sequenceDiagram
    Alice->>Bob: Request
    create participant Charlie
    Bob->>Charlie: Forward`);

    expect(ast.actors.has('Charlie')).toBe(true);
    const charlie = ast.actors.get('Charlie');
    expect(charlie?.created).toBe(true);
  });

  it('should parse destroy participant', () => {
    const ast = parseSequence(`sequenceDiagram
    participant Alice
    participant Bob
    Alice->>Bob: Request
    destroy Bob
    Bob->>Alice: Goodbye`);

    const bob = ast.actors.get('Bob');
    expect(bob?.destroyed).toBe(true);
  });
});

describe('renderSequence - Advanced Features', () => {
  it('should render critical section', () => {
    const ast = parseSequence(`sequenceDiagram
    Alice->>Bob: Request
    critical Establish connection
        Bob->>Alice: Connected
    end`);

    const rendered = renderSequence(ast);
    expect(rendered).toContain('critical Establish connection');
  });

  it('should render break section', () => {
    const ast = parseSequence(`sequenceDiagram
    Alice->>Bob: Request
    break when condition is met
        Bob->>Alice: Abort
    end`);

    const rendered = renderSequence(ast);
    expect(rendered).toContain('break when condition is met');
  });

  it('should render rect section', () => {
    const ast = parseSequence(`sequenceDiagram
    rect rgb(200, 150, 255)
        Alice->>Bob: Request
    end`);

    const rendered = renderSequence(ast);
    expect(rendered).toContain('rect rgb(200, 150, 255)');
  });
});
