/**
 * Golden test utilities
 *
 * Golden tests compare rendered output against expected .mmd files.
 * When UPDATE_GOLDEN=1 is set, the expected files are updated instead of compared.
 */

import { expect } from 'bun:test';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const GOLDEN_DIR = join(import.meta.dir);

/**
 * Compare output against a golden file, or update it if UPDATE_GOLDEN=1
 *
 * @param output - The actual rendered output
 * @param goldenPath - Path relative to tests/golden/ (e.g., "flowchart/create-basic.mmd")
 */
export function expectGolden(output: string, goldenPath: string): void {
  const fullPath = join(GOLDEN_DIR, goldenPath);
  const updateMode = process.env.UPDATE_GOLDEN === '1';

  if (updateMode) {
    // Create directory if needed
    const dir = dirname(fullPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    // Write the output as the new expected value
    writeFileSync(fullPath, output);
    console.log(`Updated golden file: ${goldenPath}`);
    return;
  }

  // Read expected and compare
  if (!existsSync(fullPath)) {
    throw new Error(
      `Golden file not found: ${goldenPath}\nRun with UPDATE_GOLDEN=1 to create it.\nActual output:\n${output}`
    );
  }

  const expected = readFileSync(fullPath, 'utf-8');
  expect(output).toBe(expected);
}

/**
 * Get the path to a golden file (for manual reading if needed)
 */
export function goldenPath(relativePath: string): string {
  return join(GOLDEN_DIR, relativePath);
}
