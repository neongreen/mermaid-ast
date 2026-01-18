/**
 * JSON Golden Tests for AST Parsing
 *
 * These tests verify the complete structure of parsed ASTs by comparing against
 * canonical JSON snapshots. This catches structural bugs that property-based tests
 * might miss (e.g., storing strings as objects).
 *
 * Usage:
 *   bun test tests/golden                    # Run tests
 *   UPDATE_GOLDEN=1 bun test tests/golden   # Update golden files
 */

import { describe, expect, it } from 'bun:test';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { parse } from '../../src/index.js';

const GOLDEN_DIR = join(import.meta.dir);
const UPDATE_MODE = process.env.UPDATE_GOLDEN === '1';

/**
 * Convert object to canonical JSON format:
 * - Keys sorted alphabetically (recursively)
 * - 2-space indentation
 * - Trailing newline
 */
function canonicalJson(obj: unknown): string {
  return `${JSON.stringify(obj, sortKeys, 2)}\n`;
}

/**
 * Replacer function for JSON.stringify that sorts object keys and handles Maps
 */
function sortKeys(_key: string, value: unknown): unknown {
  // Convert Map to plain object first
  let processedValue = value;
  if (value instanceof Map) {
    const obj: Record<string, unknown> = {};
    for (const [k, v] of value.entries()) {
      obj[String(k)] = v;
    }
    processedValue = obj;
  }

  if (processedValue && typeof processedValue === 'object' && !Array.isArray(processedValue)) {
    return Object.keys(processedValue)
      .sort()
      .reduce(
        (sorted, k) => {
          sorted[k] = (processedValue as Record<string, unknown>)[k];
          return sorted;
        },
        {} as Record<string, unknown>
      );
  }
  return processedValue;
}

// Get all diagram type directories (exclude files like golden.ts)
const diagramTypes = readdirSync(GOLDEN_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

for (const diagramType of diagramTypes) {
  const typeDir = join(GOLDEN_DIR, diagramType);

  // Find all .mmd files (exclude .input.mmd and .output.mmd which are for idempotence tests)
  const mmdFiles = readdirSync(typeDir).filter(
    (f) => f.endsWith('.mmd') && !f.endsWith('.input.mmd') && !f.endsWith('.output.mmd')
  );

  describe(`Golden: ${diagramType}`, () => {
    for (const mmdFile of mmdFiles) {
      const testName = basename(mmdFile, '.mmd');
      const mmdPath = join(typeDir, mmdFile);
      const jsonPath = join(typeDir, `${testName}.json`);

      it(testName, () => {
        const input = readFileSync(mmdPath, 'utf-8');
        const ast = parse(input);

        // Generate canonical JSON
        const actualJson = canonicalJson(ast);

        if (UPDATE_MODE) {
          // Update mode: write actual output as new expected
          writeFileSync(jsonPath, actualJson);
          console.log(`Updated golden file: ${diagramType}/${testName}.json`);
          return;
        }

        if (!existsSync(jsonPath)) {
          throw new Error(
            `Missing golden file: ${jsonPath}\nRun with UPDATE_GOLDEN=1 to create it.\nActual output:\n${actualJson}`
          );
        }

        const expectedJson = readFileSync(jsonPath, 'utf-8');
        expect(actualJson).toBe(expectedJson);
      });
    }
  });
}
