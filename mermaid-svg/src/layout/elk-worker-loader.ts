/**
 * ELK Worker Loader
 *
 * This module loads the elkjs FakeWorker class in a way that works in Bun.
 * The standard import/require doesn't work because Bun doesn't properly
 * handle the GWT-compiled elk-worker.js exports.
 *
 * We use Node's vm module to evaluate the script in a sandbox and capture
 * the exports.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as vm from 'vm';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

// Get the path to elk-worker.js using require.resolve for proper module resolution
const require = createRequire(import.meta.url);
const workerPath = require.resolve('elkjs/lib/elk-worker.js');

// Read the elk-worker.js content
const content = fs.readFileSync(workerPath, 'utf8');

// Create a sandbox with the necessary globals
const sandbox: Record<string, unknown> = {
  module: { exports: {} as Record<string, unknown> },
  exports: {} as Record<string, unknown>,
  require: (id: string) => {
    // The elk-worker.js doesn't require any external modules
    throw new Error(`Unexpected require: ${id}`);
  },
  console: console,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  setInterval: setInterval,
  clearInterval: clearInterval,
  self: undefined,
  document: undefined,
  window: undefined,
  global: globalThis,
};
sandbox.exports = sandbox.module.exports;

// Run the script in the sandbox
const script = new vm.Script(content);
script.runInNewContext(sandbox);

// Extract the FakeWorker class
const moduleExports = (sandbox.module as { exports: Record<string, unknown> }).exports;
export const FakeWorker = moduleExports.Worker as new () => {
  postMessage: (msg: unknown) => void;
  onmessage: ((event: { data: unknown }) => void) | null;
  terminate: () => void;
};

if (!FakeWorker) {
  throw new Error('Failed to load FakeWorker from elkjs');
}