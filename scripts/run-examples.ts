#!/usr/bin/env bun
/**
 * Run all examples to verify they compile and execute correctly.
 * Used by CI to ensure README code examples stay in sync.
 */

import { readdir } from "fs/promises";
import { join } from "path";
import { $ } from "bun";

const examplesDir = join(import.meta.dir, "..", "examples");

async function main() {
  const files = await readdir(examplesDir);
  const tsFiles = files.filter(f => f.endsWith(".ts"));
  
  console.log(`Running ${tsFiles.length} examples...\n`);
  
  let passed = 0;
  let failed = 0;
  
  for (const file of tsFiles) {
    const filePath = join(examplesDir, file);
    console.log(`--- ${file} ---`);
    
    try {
      const result = await $`bun run ${filePath}`.quiet();
      console.log(result.stdout.toString());
      passed++;
    } catch (error) {
      console.error(`FAILED: ${file}`);
      if (error instanceof Error) {
        console.error(error.message);
      }
      failed++;
    }
  }
  
  console.log(`\n=== Results ===`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  
  if (failed > 0) {
    process.exit(1);
  }
}

main();