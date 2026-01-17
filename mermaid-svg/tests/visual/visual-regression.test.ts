/**
 * Visual regression tests for mermaid-svg
 *
 * These tests generate SVG snapshots and compare them against saved baselines.
 * Run with UPDATE_SNAPSHOTS=1 to update the baseline snapshots.
 */

import { describe, it, expect, beforeAll } from 'bun:test';
import { parseFlowchart } from 'mermaid-ast';
import { renderFlowchartToSVG } from '../../src/index.js';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { existsSync } from 'fs';

const SNAPSHOTS_DIR = join(dirname(import.meta.path), 'snapshots');
const UPDATE_SNAPSHOTS = process.env.UPDATE_SNAPSHOTS === '1';

/**
 * Compare SVG output against saved snapshot
 */
async function expectSnapshot(name: string, svg: string): Promise<void> {
  const snapshotPath = join(SNAPSHOTS_DIR, `${name}.svg`);

  if (UPDATE_SNAPSHOTS || !existsSync(snapshotPath)) {
    // Update or create snapshot
    await mkdir(dirname(snapshotPath), { recursive: true });
    await writeFile(snapshotPath, svg);
    console.log(`Updated snapshot: ${name}.svg`);
    return;
  }

  // Compare against existing snapshot
  const expected = await readFile(snapshotPath, 'utf-8');
  expect(svg).toBe(expected);
}

describe('Visual Regression Tests', () => {
  beforeAll(async () => {
    // Ensure snapshots directory exists
    await mkdir(SNAPSHOTS_DIR, { recursive: true });
  });

  describe('Flowchart Layouts', () => {
    it('simple-lr', async () => {
      const ast = parseFlowchart(`flowchart LR
        A[Start] --> B[End]
      `);
      const svg = await renderFlowchartToSVG(ast);
      await expectSnapshot('flowchart-simple-lr', svg);
    });

    it('simple-td', async () => {
      const ast = parseFlowchart(`flowchart TD
        A[Start] --> B[End]
      `);
      const svg = await renderFlowchartToSVG(ast);
      await expectSnapshot('flowchart-simple-td', svg);
    });

    it('decision-tree', async () => {
      const ast = parseFlowchart(`flowchart TD
        A[Start] --> B{Decision}
        B -->|Yes| C[Action 1]
        B -->|No| D[Action 2]
        C --> E[End]
        D --> E
      `);
      const svg = await renderFlowchartToSVG(ast);
      await expectSnapshot('flowchart-decision-tree', svg);
    });

    it('multiple-paths', async () => {
      const ast = parseFlowchart(`flowchart LR
        A --> B
        A --> C
        B --> D
        C --> D
        D --> E
      `);
      const svg = await renderFlowchartToSVG(ast);
      await expectSnapshot('flowchart-multiple-paths', svg);
    });
  });

  describe('Node Shapes', () => {
    it('all-shapes', async () => {
      const ast = parseFlowchart(`flowchart LR
        A[Rectangle]
        B(Rounded)
        C([Stadium])
        D{Diamond}
        E{{Hexagon}}
        F[(Cylinder)]
        G((Circle))
      `);
      const svg = await renderFlowchartToSVG(ast);
      await expectSnapshot('flowchart-all-shapes', svg);
    });

    it('shapes-connected', async () => {
      const ast = parseFlowchart(`flowchart TD
        A[Start] --> B{Decision}
        B --> C([Process])
        B --> D((End))
        C --> E[(Database)]
        E --> D
      `);
      const svg = await renderFlowchartToSVG(ast);
      await expectSnapshot('flowchart-shapes-connected', svg);
    });
  });

  describe('Edge Labels', () => {
    it('labeled-edges', async () => {
      const ast = parseFlowchart(`flowchart LR
        A -->|label 1| B
        B -->|label 2| C
        C -->|label 3| D
      `);
      const svg = await renderFlowchartToSVG(ast);
      await expectSnapshot('flowchart-labeled-edges', svg);
    });

    it('mixed-labels', async () => {
      const ast = parseFlowchart(`flowchart TD
        A --> B
        B -->|Yes| C
        B -->|No| D
        C --> E
        D --> E
      `);
      const svg = await renderFlowchartToSVG(ast);
      await expectSnapshot('flowchart-mixed-labels', svg);
    });
  });

  describe('Theming', () => {
    it('custom-theme', async () => {
      const ast = parseFlowchart(`flowchart LR
        A[Start] --> B{Decision}
        B --> C[End]
      `);
      const svg = await renderFlowchartToSVG(ast, {
        theme: {
          nodeFill: '#1a1a2e',
          nodeStroke: '#e94560',
          nodeTextColor: '#ffffff',
          edgeStroke: '#0f3460',
          background: '#0f0f0f',
        },
      });
      await expectSnapshot('flowchart-custom-theme', svg);
    });
  });

  describe('Complex Diagrams', () => {
    it('large-graph', async () => {
      const ast = parseFlowchart(`flowchart TD
        A[Entry] --> B[Step 1]
        B --> C[Step 2]
        C --> D{Check}
        D -->|Pass| E[Step 3]
        D -->|Fail| F[Retry]
        F --> B
        E --> G[Step 4]
        G --> H{Validate}
        H -->|OK| I[Complete]
        H -->|Error| J[Handle Error]
        J --> K[Log]
        K --> I
      `);
      const svg = await renderFlowchartToSVG(ast);
      await expectSnapshot('flowchart-large-graph', svg);
    });
  });
});