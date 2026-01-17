/**
 * Dagger module for mermaid-ast cross-runtime testing
 * 
 * This module tests the mermaid-ast library across:
 * - Bun
 * - Node.js
 * - Deno
 */

import { dag, Container, Directory, object, func } from "@dagger.io/dagger";

@object()
export class MermaidAst {
  /**
   * Get the source directory with node_modules excluded
   */
  @func()
  source(src: Directory): Directory {
    return src
      .withoutDirectory("node_modules")
      .withoutDirectory("dagger/node_modules")
      .withoutDirectory("dagger/sdk")
      .withoutDirectory(".jj");
  }

  /**
   * Run tests in Bun
   */
  @func()
  async testBun(src: Directory): Promise<string> {
    const source = this.source(src);

    const container = dag
      .container()
      .from("oven/bun:1.1")
      .withMountedDirectory("/app", source)
      .withWorkdir("/app")
      .withExec(["bun", "install"])
      .withExec(["bun", "run", "tests/cross-runtime/mermaid-ast.test.ts"]);

    return container.stdout();
  }

  /**
   * Run tests in Node.js
   */
  @func()
  async testNode(src: Directory): Promise<string> {
    const source = this.source(src);

    // Node.js needs tsx or ts-node to run TypeScript
    const container = dag
      .container()
      .from("node:22-slim")
      .withMountedDirectory("/app", source)
      .withWorkdir("/app")
      .withExec(["npm", "install"])
      .withExec(["npx", "tsx", "tests/cross-runtime/mermaid-ast.test.ts"]);

    return container.stdout();
  }

  /**
   * Run tests in Deno
   */
  @func()
  async testDeno(src: Directory): Promise<string> {
    const source = this.source(src);

    const container = dag
      .container()
      .from("denoland/deno:2.1.4")
      .withMountedDirectory("/app", source)
      .withWorkdir("/app")
      // Deno needs to install npm dependencies for the vendored parsers
      .withExec(["deno", "install", "--allow-scripts"])
      .withExec([
        "deno",
        "run",
        "--unstable-sloppy-imports",
        "--allow-read",
        "--allow-env",
        "tests/cross-runtime/mermaid-ast.test.ts",
      ]);

    return container.stdout();
  }

  /**
   * Run tests in all runtimes
   */
  @func()
  async testAll(src: Directory): Promise<string> {
    const results: string[] = [];

    const bunResult = await this.testBun(src);
    results.push("=== BUN RESULTS ===\n" + bunResult);

    const nodeResult = await this.testNode(src);
    results.push("=== NODE.JS RESULTS ===\n" + nodeResult);

    const denoResult = await this.testDeno(src);
    results.push("=== DENO RESULTS ===\n" + denoResult);

    return results.join("\n\n");
  }
}