/**
 * Idempotence Tests
 *
 * These tests verify two properties:
 * 1. Snapshot: render(parse(input.mmd)) matches output.mmd
 * 2. Idempotence: render(parse(output.mmd)) === output.mmd (exact match)
 *
 * The second property ensures our rendered output is stable/canonical.
 *
 * Usage:
 *   bun test tests/golden/idempotence    # Run tests
 *   UPDATE_GOLDEN=1 bun test tests/golden/idempotence   # Update .output.mmd files
 */

import { describe, expect, it } from 'bun:test';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { parse, render } from '../../src/index.js';

const GOLDEN_DIR = join(import.meta.dir);
const UPDATE_MODE = process.env.UPDATE_GOLDEN === '1';

// Get all diagram type directories
const diagramTypes = readdirSync(GOLDEN_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

for (const diagramType of diagramTypes) {
  const typeDir = join(GOLDEN_DIR, diagramType);

  // Find all .input.mmd files
  const inputFiles = readdirSync(typeDir).filter((f) => f.endsWith('.input.mmd'));

  if (inputFiles.length === 0) {
    continue; // Skip directories without idempotence test fixtures
  }

  describe(`Idempotence: ${diagramType}`, () => {
    for (const inputFile of inputFiles) {
      const testName = basename(inputFile, '.input.mmd');
      const inputPath = join(typeDir, inputFile);
      const outputPath = join(typeDir, `${testName}.output.mmd`);

      describe(testName, () => {
        it('snapshot: render(parse(input)) matches output', () => {
          const input = readFileSync(inputPath, 'utf-8');
          const ast = parse(input);
          const rendered = render(ast);

          if (UPDATE_MODE) {
            // Create directory if needed
            const dir = dirname(outputPath);
            if (!existsSync(dir)) {
              mkdirSync(dir, { recursive: true });
            }
            writeFileSync(outputPath, rendered);
            console.log(`Updated: ${diagramType}/${testName}.output.mmd`);
            return;
          }

          if (!existsSync(outputPath)) {
            throw new Error(
              `Missing output file: ${outputPath}\nRun with UPDATE_GOLDEN=1 to create it.\nActual output:\n${rendered}`
            );
          }

          const expected = readFileSync(outputPath, 'utf-8');
          expect(rendered).toBe(expected);
        });

        it('idempotence: render(parse(output)) === output', () => {
          if (!existsSync(outputPath)) {
            throw new Error(
              `Missing output file: ${outputPath}\nRun with UPDATE_GOLDEN=1 to create it first.`
            );
          }

          const output = readFileSync(outputPath, 'utf-8');
          const ast = parse(output);
          const rerendered = render(ast);

          // This must be an EXACT match - our output must be stable
          expect(rerendered).toBe(output);
        });
      });
    }
  });
}