#!/usr/bin/env bun

/**
 * Release script that creates a GitHub release from CHANGELOG.md
 *
 * Usage: bun run scripts/release.ts [--dry-run]
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { $ } from 'bun';

const dryRun = process.argv.includes('--dry-run');

// Read CHANGELOG.md
const changelogPath = join(import.meta.dir, '..', 'CHANGELOG.md');
const changelog = readFileSync(changelogPath, 'utf-8');

// Find the first versioned release (skip [Unreleased])
const versionRegex = /^## \[(\d+\.\d+\.\d+)\] - (\d{4}-\d{2}-\d{2})/gm;
const match = versionRegex.exec(changelog);

if (!match) {
  console.error('No versioned release found in CHANGELOG.md');
  process.exit(1);
}

const version = match[1];
const date = match[2];
const versionTag = `v${version}`;

console.log(`Found version: ${version} (${date})`);

if (dryRun) {
  console.log(`[DRY RUN] Would create release ${versionTag}`);
  process.exit(0);
}

// Check if release already exists
try {
  await $`gh release view ${versionTag}`.quiet();
  console.log(`Release ${versionTag} already exists!`);
  console.log(`View it at: https://github.com/neongreen/mermaid-ast/releases/tag/${versionTag}`);
  process.exit(0);
} catch {
  // Release doesn't exist, continue
}

// Create the release with just a link to changelog
console.log(`Creating release ${versionTag}...`);

const releaseNotes = `See [CHANGELOG.md](https://github.com/neongreen/mermaid-ast/blob/main/CHANGELOG.md) for details.`;

await $`gh release create ${versionTag} --title ${versionTag} --notes ${releaseNotes}`;

console.log(`Release created successfully!`);
console.log(`View it at: https://github.com/neongreen/mermaid-ast/releases/tag/${versionTag}`);
