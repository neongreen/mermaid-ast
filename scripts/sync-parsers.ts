#!/usr/bin/env bun
/**
 * sync-parsers.ts
 *
 * Syncs JISON parser grammars from the mermaid.js repository and compiles them.
 *
 * Usage:
 *   bun run scripts/sync-parsers.ts [version]
 *
 * Examples:
 *   bun run scripts/sync-parsers.ts           # Uses locked version
 *   bun run scripts/sync-parsers.ts --latest  # Uses latest release
 *   bun run scripts/sync-parsers.ts 11.12.2   # Uses specific version
 *   bun run scripts/sync-parsers.ts v11.12.2  # Also accepts v-prefixed versions
 */

/**
 * LOCKED MERMAID VERSION
 *
 * All parsers should be synced from this version for consistency.
 * Update this when upgrading to a new mermaid.js version.
 */
const LOCKED_MERMAID_VERSION = '11.12.2';

import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { $ } from 'bun';

// @ts-expect-error - jison doesn't have types
import jison from 'jison';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(__dirname, '..');
const VENDORED_DIR = join(ROOT_DIR, 'src', 'vendored');
const GRAMMARS_DIR = join(VENDORED_DIR, 'grammars');
const PARSERS_DIR = join(VENDORED_DIR, 'parsers');
const VERSION_FILE = join(VENDORED_DIR, 'VERSION');

// Diagram types that use JISON parsers
const JISON_DIAGRAMS: Record<string, string> = {
  flowchart: 'flowchart/parser/flow.jison',
  sequence: 'sequence/parser/sequenceDiagram.jison',
  class: 'class/parser/classDiagram.jison',
  state: 'state/parser/stateDiagram.jison',
  er: 'er/parser/erDiagram.jison',
  gantt: 'gantt/parser/gantt.jison',
  journey: 'user-journey/parser/journey.jison',
  mindmap: 'mindmap/parser/mindmap.jison',
  timeline: 'timeline/parser/timeline.jison',
  sankey: 'sankey/parser/sankey.jison',
  xychart: 'xychart/parser/xychart.jison',
  quadrant: 'quadrant-chart/parser/quadrant.jison',
  requirement: 'requirement/parser/requirementDiagram.jison',
  c4: 'c4/parser/c4Diagram.jison',
  block: 'block/parser/block.jison',
  kanban: 'kanban/parser/kanban.jison',
};

// For initial subset, only sync these
const INITIAL_SUBSET = ['flowchart', 'sequence'];

interface SyncOptions {
  version: string;
  subset?: string[];
  force?: boolean;
}

async function getLatestMermaidVersion(): Promise<string> {
  console.log('Fetching latest mermaid version from npm...');
  const result = await $`npm view mermaid version`.text();
  return result.trim();
}

async function cloneMermaidSource(version: string, targetDir: string): Promise<void> {
  // Mermaid uses tags like "mermaid@11.9.0" not "v11.9.0"
  const cleanVersion = version.replace(/^v/, '').replace(/^mermaid@/, '');
  const tag = `mermaid@${cleanVersion}`;

  console.log(`Cloning ${tag} source...`);

  if (existsSync(targetDir)) {
    rmSync(targetDir, { recursive: true, force: true });
  }

  // Clone with specific tag, depth 1 for speed
  try {
    await $`git clone --depth 1 --branch ${tag} https://github.com/mermaid-js/mermaid.git ${targetDir}`.quiet();
  } catch (_e) {
    // Try with v prefix as fallback
    const vTag = `v${cleanVersion}`;
    console.log(`Tag ${tag} not found, trying ${vTag}...`);
    await $`git clone --depth 1 --branch ${vTag} https://github.com/mermaid-js/mermaid.git ${targetDir}`.quiet();
  }
}

function compileJisonToJs(jisonSource: string): string {
  const parser = new jison.Generator(jisonSource, {
    moduleType: 'js',
    'token-stack': true,
  });

  const source = parser.generate({ moduleMain: '() => {}' });

  // Add ES module exports
  const exporter = `
parser.parser = parser;
export { parser };
export default parser;
`;

  return `${source}\n${exporter}`;
}

async function syncParsers(options: SyncOptions): Promise<void> {
  const { version, subset = INITIAL_SUBSET, force = false } = options;

  // Check if already synced
  if (!force && existsSync(VERSION_FILE)) {
    const currentVersion = readFileSync(VERSION_FILE, 'utf-8').trim();
    if (currentVersion === `mermaid@${version}`) {
      console.log(`Already synced to mermaid@${version}. Use --force to re-sync.`);
      return;
    }
  }

  // Ensure directories exist
  mkdirSync(GRAMMARS_DIR, { recursive: true });
  mkdirSync(PARSERS_DIR, { recursive: true });

  // Clone mermaid source
  const tempDir = join(ROOT_DIR, '.mermaid-temp');
  await cloneMermaidSource(version, tempDir);

  const diagramsDir = join(tempDir, 'packages', 'mermaid', 'src', 'diagrams');

  // Process each diagram type
  const results: { name: string; success: boolean; error?: string }[] = [];

  for (const diagramName of subset) {
    const jisonPath = JISON_DIAGRAMS[diagramName];
    if (!jisonPath) {
      results.push({
        name: diagramName,
        success: false,
        error: `Unknown diagram type: ${diagramName}`,
      });
      continue;
    }

    const sourcePath = join(diagramsDir, jisonPath);

    if (!existsSync(sourcePath)) {
      results.push({
        name: diagramName,
        success: false,
        error: `JISON file not found: ${sourcePath}`,
      });
      continue;
    }

    try {
      console.log(`Processing ${diagramName}...`);

      // Read JISON source
      const jisonSource = readFileSync(sourcePath, 'utf-8');

      // Copy grammar file
      const grammarDest = join(GRAMMARS_DIR, `${diagramName}.jison`);
      writeFileSync(grammarDest, jisonSource);
      console.log(`  Copied grammar to ${grammarDest}`);

      // Compile to JS
      const jsSource = compileJisonToJs(jisonSource);
      const parserDest = join(PARSERS_DIR, `${diagramName}.js`);
      writeFileSync(parserDest, jsSource);
      console.log(`  Compiled parser to ${parserDest}`);

      results.push({ name: diagramName, success: true });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      results.push({ name: diagramName, success: false, error: errorMessage });
      console.error(`  Error processing ${diagramName}: ${errorMessage}`);
    }
  }

  // Write VERSION file
  const versionInfo = {
    mermaidVersion: version,
    syncedAt: new Date().toISOString(),
    diagrams: subset,
    results,
  };

  writeFileSync(VERSION_FILE, `mermaid@${version}`);
  writeFileSync(join(VENDORED_DIR, 'sync-info.json'), JSON.stringify(versionInfo, null, 2));

  // Cleanup temp directory
  rmSync(tempDir, { recursive: true, force: true });

  // Summary
  console.log('\n--- Sync Summary ---');
  console.log(`Version: mermaid@${version}`);
  console.log(`Diagrams processed: ${results.length}`);

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  if (successful.length > 0) {
    console.log(`Successful: ${successful.map((r) => r.name).join(', ')}`);
  }

  if (failed.length > 0) {
    console.log(`Failed: ${failed.map((r) => `${r.name} (${r.error})`).join(', ')}`);
  }
}

// CLI
async function main(): Promise<void> {
  const args = process.argv.slice(2);

  let version: string | undefined;
  let subset = INITIAL_SUBSET;
  let force = false;
  let useLatest = false;

  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--force' || arg === '-f') {
      force = true;
    } else if (arg === '--latest' || arg === '-l') {
      useLatest = true;
    } else if (arg === '--all') {
      subset = Object.keys(JISON_DIAGRAMS);
    } else if (arg === '--subset' && args[i + 1]) {
      subset = args[++i].split(',');
    } else if (!arg.startsWith('-')) {
      version = arg.replace(/^v/, '');
    }
  }

  // Determine version to use
  if (version) {
    // Explicit version provided
    console.log(`Using specified version: ${version}`);
  } else if (useLatest) {
    // --latest flag: fetch latest from npm
    version = await getLatestMermaidVersion();
    console.log(`Using latest version from npm: ${version}`);
  } else {
    // Default: use locked version
    version = LOCKED_MERMAID_VERSION;
    console.log(`Using locked version: ${version}`);
  }

  console.log(`Syncing parsers from mermaid@${version}`);
  console.log(`Diagrams: ${subset.join(', ')}`);
  console.log('');

  await syncParsers({ version, subset, force });
}

main().catch((error) => {
  console.error('Sync failed:', error);
  process.exit(1);
});
