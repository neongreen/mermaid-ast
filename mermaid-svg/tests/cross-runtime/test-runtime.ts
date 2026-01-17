/**
 * Cross-runtime compatibility test
 *
 * This script tests that mermaid-svg works correctly in Bun, Node.js, and Deno.
 * Run with: bun run tests/cross-runtime/test-runtime.ts
 *           node tests/cross-runtime/test-runtime.ts
 *           deno run --allow-read tests/cross-runtime/test-runtime.ts
 */

import { parseFlowchart } from 'mermaid-ast';
import { renderFlowchartToSVG } from '../../src/index.js';

async function runTests(): Promise<void> {
  console.log('Testing mermaid-svg cross-runtime compatibility...\n');

  // Detect runtime
  const runtime = detectRuntime();
  console.log(`Runtime: ${runtime}\n`);

  let passed = 0;
  let failed = 0;

  // Test 1: Basic rendering
  try {
    const ast = parseFlowchart(`flowchart LR
      A[Start] --> B[End]
    `);
    const svg = await renderFlowchartToSVG(ast);

    if (!svg.includes('<svg')) throw new Error('Missing <svg> tag');
    if (!svg.includes('Start')) throw new Error('Missing node label');
    if (!svg.includes('End')) throw new Error('Missing node label');

    console.log('✓ Test 1: Basic rendering');
    passed++;
  } catch (e) {
    console.log(`✗ Test 1: Basic rendering - ${e}`);
    failed++;
  }

  // Test 2: Multiple shapes
  try {
    const ast = parseFlowchart(`flowchart TD
      A[Rectangle]
      B(Rounded)
      C{Diamond}
      D((Circle))
    `);
    const svg = await renderFlowchartToSVG(ast);

    if (!svg.includes('<rect')) throw new Error('Missing rect shape');
    if (!svg.includes('<polygon')) throw new Error('Missing polygon shape');
    if (!svg.includes('<circle')) throw new Error('Missing circle shape');

    console.log('✓ Test 2: Multiple shapes');
    passed++;
  } catch (e) {
    console.log(`✗ Test 2: Multiple shapes - ${e}`);
    failed++;
  }

  // Test 3: Edge labels
  try {
    const ast = parseFlowchart(`flowchart LR
      A -->|Yes| B
      A -->|No| C
    `);
    const svg = await renderFlowchartToSVG(ast);

    if (!svg.includes('Yes')) throw new Error('Missing edge label "Yes"');
    if (!svg.includes('No')) throw new Error('Missing edge label "No"');

    console.log('✓ Test 3: Edge labels');
    passed++;
  } catch (e) {
    console.log(`✗ Test 3: Edge labels - ${e}`);
    failed++;
  }

  // Test 4: Custom theme
  try {
    const ast = parseFlowchart(`flowchart LR
      A --> B
    `);
    const svg = await renderFlowchartToSVG(ast, {
      theme: {
        nodeFill: '#ff0000',
      },
    });

    if (!svg.includes('#ff0000')) throw new Error('Custom theme not applied');

    console.log('✓ Test 4: Custom theme');
    passed++;
  } catch (e) {
    console.log(`✗ Test 4: Custom theme - ${e}`);
    failed++;
  }

  // Test 5: Layout directions
  try {
    for (const dir of ['LR', 'RL', 'TD', 'BT']) {
      const ast = parseFlowchart(`flowchart ${dir}
        A --> B
      `);
      const svg = await renderFlowchartToSVG(ast);
      if (!svg.includes('<svg')) throw new Error(`Direction ${dir} failed`);
    }

    console.log('✓ Test 5: Layout directions');
    passed++;
  } catch (e) {
    console.log(`✗ Test 5: Layout directions - ${e}`);
    failed++;
  }

  // Summary
  console.log(`\n${passed} passed, ${failed} failed`);

  if (failed > 0) {
    process.exit(1);
  }
}

function detectRuntime(): string {
  if (typeof Bun !== 'undefined') return 'Bun';
  if (typeof Deno !== 'undefined') return 'Deno';
  return 'Node.js';
}

// Run tests
runTests().catch((e) => {
  console.error('Test runner failed:', e);
  process.exit(1);
});