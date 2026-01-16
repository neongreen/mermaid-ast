/**
 * Cross-runtime test runner
 *
 * This file provides a unified test interface that works across:
 * - Bun (bun test)
 * - Node.js (node --test)
 * - Deno (deno test)
 *
 * Usage:
 *   bun test tests/cross-runtime/
 *   node --test tests/cross-runtime/*.test.ts
 *   deno test tests/cross-runtime/
 */

// Runtime detection
export const runtime = (() => {
  if (typeof Bun !== 'undefined') return 'bun' as const;
  if (typeof Deno !== 'undefined') return 'deno' as const;
  return 'node' as const;
})();

// Test abstraction that works across runtimes
export interface TestContext {
  name: string;
  fn: () => void | Promise<void>;
}

export interface TestSuite {
  name: string;
  tests: TestContext[];
}

// Simple assertion helpers that work everywhere
export function assertEqual<T>(actual: T, expected: T, message?: string): void {
  if (actual !== expected) {
    throw new Error(
      message || `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`
    );
  }
}

export function assertDeepEqual<T>(actual: T, expected: T, message?: string): void {
  const actualStr = JSON.stringify(actual, null, 2);
  const expectedStr = JSON.stringify(expected, null, 2);
  if (actualStr !== expectedStr) {
    throw new Error(
      message || `Deep equality failed:\nExpected: ${expectedStr}\nActual: ${actualStr}`
    );
  }
}

export function assertTrue(condition: boolean, message?: string): void {
  if (!condition) {
    throw new Error(message || 'Expected condition to be true');
  }
}

export function assertFalse(condition: boolean, message?: string): void {
  if (condition) {
    throw new Error(message || 'Expected condition to be false');
  }
}

export function assertDefined<T>(
  value: T | undefined | null,
  message?: string
): asserts value is T {
  if (value === undefined || value === null) {
    throw new Error(message || 'Expected value to be defined');
  }
}

export function assertThrows(fn: () => void, message?: string): void {
  let threw = false;
  try {
    fn();
  } catch {
    threw = true;
  }
  if (!threw) {
    throw new Error(message || 'Expected function to throw');
  }
}

// Log test results
export function logResult(name: string, passed: boolean, error?: Error): void {
  if (passed) {
    console.log(`✓ ${name}`);
  } else {
    console.log(`✗ ${name}`);
    if (error) {
      console.log(`  Error: ${error.message}`);
    }
  }
}

// Run a test suite
export async function runSuite(suite: TestSuite): Promise<{ passed: number; failed: number }> {
  console.log(`\n${suite.name}`);
  console.log('='.repeat(suite.name.length));

  let passed = 0;
  let failed = 0;

  for (const test of suite.tests) {
    try {
      await test.fn();
      logResult(test.name, true);
      passed++;
    } catch (error) {
      logResult(test.name, false, error as Error);
      failed++;
    }
  }

  return { passed, failed };
}

// Run multiple suites
export async function runAllSuites(suites: TestSuite[]): Promise<void> {
  console.log(`Running tests on ${runtime}...\n`);

  let totalPassed = 0;
  let totalFailed = 0;

  for (const suite of suites) {
    const { passed, failed } = await runSuite(suite);
    totalPassed += passed;
    totalFailed += failed;
  }

  console.log(`\n${'='.repeat(40)}`);
  console.log(`Total: ${totalPassed} passed, ${totalFailed} failed`);

  if (totalFailed > 0) {
    if (runtime === 'deno') {
      Deno.exit(1);
    } else {
      process.exit(1);
    }
  }
}
