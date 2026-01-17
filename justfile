# mermaid-ast monorepo justfile
# Run `just` to see available commands

# Default recipe - show help
default:
    @just --list

# --- Workspace commands ---

# Install all dependencies (workspace root)
install:
    bun install

# Run all tests in workspace
test:
    cd packages/mermaid-ast && bun test tests/unit tests/roundtrip

# Lint all packages
lint:
    bun run lint

# Lint and fix issues
lint-fix:
    bun run lint:fix

# Clean all build artifacts
clean:
    rm -rf node_modules packages/*/node_modules packages/*/dist packages/*/dagger/node_modules packages/*/dagger/sdk

# --- mermaid-ast commands ---

# Run mermaid-ast unit tests
ast-test:
    cd packages/mermaid-ast && bun test tests/unit tests/roundtrip tests/cross-runtime

# Run JSON golden tests (AST parsing)
ast-test-golden:
    cd packages/mermaid-ast && bun test tests/golden

# Run tests with coverage report
ast-test-coverage:
    cd packages/mermaid-ast && bun test --coverage tests/unit tests/roundtrip

# Update golden test files (regenerate expected outputs for rendering)
ast-update-golden:
    cd packages/mermaid-ast && UPDATE_GOLDEN=1 bun test tests/unit

# Update JSON golden test files (regenerate expected AST outputs)
ast-update-golden-json:
    cd packages/mermaid-ast && UPDATE_GOLDEN=1 bun test tests/golden

# Run flowchart parser tests
ast-test-flowchart:
    cd packages/mermaid-ast && bun test tests/unit/flowchart-parser.test.ts

# Run sequence parser tests
ast-test-sequence:
    cd packages/mermaid-ast && bun test tests/unit/sequence-parser.test.ts

# Run all roundtrip tests
ast-test-roundtrip:
    cd packages/mermaid-ast && bun test tests/roundtrip/

# Run cross-runtime tests locally (bun)
ast-test-cross-runtime:
    cd packages/mermaid-ast && bun run tests/cross-runtime/mermaid-ast.test.ts

# Sync parsers from a specific mermaid version (uses Deno - no npm install needed)
ast-sync-parsers version:
    cd packages/mermaid-ast && deno run --allow-all scripts/sync-parsers.ts {{version}}

# Sync parsers from latest mermaid version (uses Deno - no npm install needed)
ast-sync-parsers-latest:
    cd packages/mermaid-ast && deno run --allow-all scripts/sync-parsers.ts

# Build mermaid-ast
ast-build:
    cd packages/mermaid-ast && bun run build

# Type check mermaid-ast
ast-typecheck:
    cd packages/mermaid-ast && bun run typecheck

# Watch and run tests on changes
ast-test-watch:
    cd packages/mermaid-ast && bun test --watch

# Show vendored parser version
ast-version:
    @cat packages/mermaid-ast/src/vendored/VERSION

# --- mermaid-ast Dagger commands ---

# Run tests in Bun via Dagger
ast-dagger-test-bun:
    cd packages/mermaid-ast/dagger && dagger call test-bun --src=..

# Run tests in Node.js via Dagger
ast-dagger-test-node:
    cd packages/mermaid-ast/dagger && dagger call test-node --src=..

# Run tests in Deno via Dagger
ast-dagger-test-deno:
    cd packages/mermaid-ast/dagger && dagger call test-deno --src=..

# Run tests in all runtimes via Dagger
ast-dagger-test-all:
    cd packages/mermaid-ast/dagger && dagger call test-all --src=..

# Initialize Dagger module (run after cloning)
ast-dagger-develop:
    cd packages/mermaid-ast/dagger && dagger develop

# --- mermaid-ast Publishing ---

# Preview what would be published to npm
ast-publish-dry-run:
    cd packages/mermaid-ast && bun run build && npm pack --dry-run

# Publish to npm (runs tests and build first)
ast-publish:
    cd packages/mermaid-ast && bun test tests/unit tests/roundtrip && bun run build && npm publish

# Publish to npm with public access (for scoped packages)
ast-publish-public:
    cd packages/mermaid-ast && bun test tests/unit tests/roundtrip && bun run build && npm publish --access public

# Bump patch version (0.1.0 -> 0.1.1)
ast-bump-patch:
    cd packages/mermaid-ast && npm version patch --no-git-tag-version

# Bump minor version (0.1.0 -> 0.2.0)
ast-bump-minor:
    cd packages/mermaid-ast && npm version minor --no-git-tag-version

# Bump major version (0.1.0 -> 1.0.0)
ast-bump-major:
    cd packages/mermaid-ast && npm version major --no-git-tag-version

# Preview what would be published to JSR
ast-jsr-dry-run:
    cd packages/mermaid-ast && bunx jsr publish --dry-run

# Publish to JSR
ast-jsr-publish:
    cd packages/mermaid-ast && bun test tests/unit tests/roundtrip && bunx jsr publish

# Publish to both npm and JSR
ast-publish-all:
    just ast-publish
    just ast-jsr-publish

# --- mermaid-ast GitHub Releases ---

# Create a GitHub release from CHANGELOG.md (dry run)
ast-release-dry-run:
    cd packages/mermaid-ast && bun run scripts/release.ts --dry-run

# Create a GitHub release from CHANGELOG.md
ast-release:
    cd packages/mermaid-ast && bun run scripts/release.ts

# --- mermaid-svg commands ---

# Run mermaid-svg tests
svg-test:
    cd packages/mermaid-svg && bun test

# Run mermaid-svg unit tests only
svg-test-unit:
    cd packages/mermaid-svg && bun test tests/unit

# Run mermaid-svg integration tests
svg-test-integration:
    cd packages/mermaid-svg && bun test tests/integration

# Run mermaid-svg visual regression tests
svg-test-visual:
    cd packages/mermaid-svg && bun test tests/visual

# Update mermaid-svg visual snapshots
svg-update-snapshots:
    cd packages/mermaid-svg && UPDATE_SNAPSHOTS=1 bun test tests/visual

# Run mermaid-svg cross-runtime test (bun)
svg-test-cross-runtime:
    cd packages/mermaid-svg && bun run tests/cross-runtime/test-runtime.ts

# Build mermaid-svg
svg-build:
    cd packages/mermaid-svg && bun run build

# Type check mermaid-svg
svg-typecheck:
    cd packages/mermaid-svg && bunx tsc --noEmit

# Preview mermaid-svg npm package
svg-publish-dry-run:
    cd packages/mermaid-svg && bun run build && npm pack --dry-run

# Publish mermaid-svg to npm
svg-publish:
    cd packages/mermaid-svg && bun test && bun run build && npm publish

# Publish mermaid-svg to npm with public access
svg-publish-public:
    cd packages/mermaid-svg && bun test && bun run build && npm publish --access public