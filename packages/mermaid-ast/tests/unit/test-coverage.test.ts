/**
 * Meta-test: Verifies that all diagram types have required test files
 *
 * This test ensures that when a new diagram type is added, the developer
 * doesn't forget to add the corresponding test files.
 *
 * Required test files for each diagram type:
 * - tests/unit/<type>.test.ts (wrapper tests)
 * - tests/unit/<type>-parser.test.ts (parser tests)
 * - tests/unit/<type>-renderer.test.ts (renderer tests)
 * - tests/roundtrip/<type>-roundtrip.test.ts (roundtrip tests)
 */

import { describe, expect, it } from 'bun:test';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Configuration for each diagram type's test file naming
 *
 * Some diagram types have different naming conventions:
 * - class -> class-diagram.test.ts, class-parser.test.ts
 * - state -> state-diagram.test.ts, state-parser.test.ts
 * - erDiagram -> er-diagram.test.ts, er-parser.test.ts
 */
interface DiagramTestConfig {
  /** The diagram type as defined in DiagramType union */
  type: string;
  /** Base name for wrapper test file (e.g., 'flowchart' -> flowchart.test.ts) */
  wrapperName: string;
  /** Base name for parser test file (e.g., 'flowchart' -> flowchart-parser.test.ts) */
  parserName: string;
  /** Base name for renderer test file (e.g., 'flowchart' -> flowchart-renderer.test.ts) */
  rendererName: string;
  /** Base name for roundtrip test file (e.g., 'flowchart' -> flowchart-roundtrip.test.ts) */
  roundtripName: string;
}

/**
 * All diagram types that must have test coverage
 *
 * When adding a new diagram type:
 * 1. Add it to the DiagramType union in src/types/index.ts
 * 2. Add an entry here with the correct file naming convention
 * 3. Create all required test files
 */
const DIAGRAM_TYPES: DiagramTestConfig[] = [
  {
    type: 'block',
    wrapperName: 'block',
    parserName: 'block',
    rendererName: 'block',
    roundtripName: 'block',
  },
  {
    type: 'flowchart',
    wrapperName: 'flowchart',
    parserName: 'flowchart',
    rendererName: 'flowchart',
    roundtripName: 'flowchart',
  },
  {
    type: 'sequence',
    wrapperName: 'sequence',
    parserName: 'sequence',
    rendererName: 'sequence',
    roundtripName: 'sequence',
  },
  {
    type: 'class',
    wrapperName: 'class-diagram',
    parserName: 'class',
    rendererName: 'class-diagram',
    roundtripName: 'class',
  },
  {
    type: 'state',
    wrapperName: 'state-diagram',
    parserName: 'state',
    rendererName: 'state-diagram',
    roundtripName: 'state',
  },
  {
    type: 'erDiagram',
    wrapperName: 'er-diagram',
    parserName: 'er',
    rendererName: 'er-diagram',
    roundtripName: 'er',
  },
  {
    type: 'gantt',
    wrapperName: 'gantt',
    parserName: 'gantt',
    rendererName: 'gantt',
    roundtripName: 'gantt',
  },
  {
    type: 'mindmap',
    wrapperName: 'mindmap',
    parserName: 'mindmap',
    rendererName: 'mindmap',
    roundtripName: 'mindmap',
  },
  {
    type: 'journey',
    wrapperName: 'journey',
    parserName: 'journey',
    rendererName: 'journey',
    roundtripName: 'journey',
  },
  {
    type: 'kanban',
    wrapperName: 'kanban',
    parserName: 'kanban',
    rendererName: 'kanban',
    roundtripName: 'kanban',
  },
  {
    type: 'quadrant',
    wrapperName: 'quadrant',
    parserName: 'quadrant',
    rendererName: 'quadrant',
    roundtripName: 'quadrant',
  },
  {
    type: 'sankey',
    wrapperName: 'sankey',
    parserName: 'sankey',
    rendererName: 'sankey',
    roundtripName: 'sankey',
  },
  {
    type: 'timeline',
    wrapperName: 'timeline',
    parserName: 'timeline',
    rendererName: 'timeline',
    roundtripName: 'timeline',
  },
  {
    type: 'xychart',
    wrapperName: 'xychart',
    parserName: 'xychart',
    rendererName: 'xychart',
    roundtripName: 'xychart',
  },
  {
    type: 'requirement',
    wrapperName: 'requirement',
    parserName: 'requirement',
    rendererName: 'requirement',
    roundtripName: 'requirement',
  },
  {
    type: 'c4',
    wrapperName: 'c4',
    parserName: 'c4',
    rendererName: 'c4',
    roundtripName: 'c4',
  },
  {
    type: 'pie',
    wrapperName: 'pie',
    parserName: 'pie',
    rendererName: 'pie',
    roundtripName: 'pie',
  },
  {
    type: 'gitGraph',
    wrapperName: 'gitgraph',
    parserName: 'gitgraph',
    rendererName: 'gitgraph',
    roundtripName: 'gitgraph',
  },
];

// Get the tests directory path
const TESTS_DIR = join(import.meta.dir, '..');
const UNIT_DIR = join(TESTS_DIR, 'unit');
const ROUNDTRIP_DIR = join(TESTS_DIR, 'roundtrip');

describe('Test Coverage Completeness', () => {
  describe('All diagram types have required test files', () => {
    for (const config of DIAGRAM_TYPES) {
      describe(`${config.type} diagram`, () => {
        it(`should have wrapper tests (${config.wrapperName}.test.ts)`, () => {
          const path = join(UNIT_DIR, `${config.wrapperName}.test.ts`);
          expect(existsSync(path)).toBe(true);
        });

        it(`should have parser tests (${config.parserName}-parser.test.ts)`, () => {
          const path = join(UNIT_DIR, `${config.parserName}-parser.test.ts`);
          expect(existsSync(path)).toBe(true);
        });

        it(`should have renderer tests (${config.rendererName}-renderer.test.ts)`, () => {
          const path = join(UNIT_DIR, `${config.rendererName}-renderer.test.ts`);
          expect(existsSync(path)).toBe(true);
        });

        it(`should have roundtrip tests (${config.roundtripName}-roundtrip.test.ts)`, () => {
          const path = join(ROUNDTRIP_DIR, `${config.roundtripName}-roundtrip.test.ts`);
          expect(existsSync(path)).toBe(true);
        });
      });
    }
  });

  describe('DIAGRAM_TYPES matches DiagramType union', () => {
    it('should have all types from DiagramType union', () => {
      // This is a compile-time check - if DiagramType changes, update DIAGRAM_TYPES
      // The types defined in src/types/index.ts
      const expectedTypes = [
        'block',
        'flowchart',
        'sequence',
        'class',
        'state',
        'erDiagram',
        'gantt',
        'mindmap',
        'journey',
        'kanban',
        'quadrant',
        'sankey',
        'timeline',
        'xychart',
        'requirement',
        'c4',
        'pie',
        'gitGraph',
      ];

      const configuredTypes = DIAGRAM_TYPES.map((c) => c.type).sort();
      const expected = [...expectedTypes].sort();

      expect(configuredTypes).toEqual(expected);
    });
  });
});
