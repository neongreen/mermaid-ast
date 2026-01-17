# mermaid-ast justfile
# Run `just` to see available commands

# Default recipe - show help
default:
    @just --list

# Install dependencies
install:
    bun install

# Run all unit tests (excludes vendored/node_modules)
test:
    bun test tests/unit tests/roundtrip tests/cross-runtime

# Run JSON golden tests (AST parsing)
test-golden:
    bun test tests/golden

# Update golden test files (regenerate expected outputs for rendering)
update-golden:
    UPDATE_GOLDEN=1 bun test tests/unit

# Update JSON golden test files (regenerate expected AST outputs)
update-golden-json:
    UPDATE_GOLDEN=1 bun test tests/golden

# Run flowchart parser tests
test-flowchart:
    bun test tests/unit/flowchart-parser.test.ts

# Run sequence parser tests
test-sequence:
    bun test tests/unit/sequence-parser.test.ts

# Run flowchart roundtrip tests
test-flowchart-roundtrip:
    bun test tests/roundtrip/flowchart-roundtrip.test.ts

# Run sequence roundtrip tests
test-sequence-roundtrip:
    bun test tests/roundtrip/sequence-roundtrip.test.ts

# Run all roundtrip tests
test-roundtrip:
    bun test tests/roundtrip/

# Run cross-runtime tests locally (bun)
test-cross-runtime:
    bun run tests/cross-runtime/mermaid-ast.test.ts

# Sync parsers from a specific mermaid version (uses Deno - no npm install needed)
sync-parsers version:
    deno run --allow-all scripts/sync-parsers.ts {{version}}

# Sync parsers from latest mermaid version (uses Deno - no npm install needed)
sync-parsers-latest:
    deno run --allow-all scripts/sync-parsers.ts

# Build the library
build:
    bun build src/index.ts --outdir dist --target node

# Type check
typecheck:
    bunx tsc --noEmit

# Lint code with Biome
lint:
    bun run lint

# Lint and fix issues
lint-fix:
    bun run lint:fix

# Format code with Biome
format:
    bun run format

# --- Dagger commands ---

# Run tests in Bun via Dagger
dagger-test-bun:
    cd dagger && dagger call test-bun --src=..

# Run tests in Node.js via Dagger
dagger-test-node:
    cd dagger && dagger call test-node --src=..

# Run tests in Deno via Dagger
dagger-test-deno:
    cd dagger && dagger call test-deno --src=..

# Run tests in all runtimes via Dagger
dagger-test-all:
    cd dagger && dagger call test-all --src=..

# Initialize Dagger module (run after cloning)
dagger-develop:
    cd dagger && dagger develop

# --- Development helpers ---

# Watch and run tests on changes
test-watch:
    bun test --watch

# Clean build artifacts and node_modules
clean:
    rm -rf dist node_modules dagger/node_modules dagger/sdk

# Show vendored parser version
version:
    @cat src/vendored/VERSION

# --- Publishing ---

# Preview what would be published to npm
publish-dry-run:
    bun run build
    npm pack --dry-run

# Publish to npm (runs tests and build first)
publish:
    bun test tests/unit tests/roundtrip
    bun run build
    npm publish

# Publish to npm with public access (for scoped packages)
publish-public:
    bun test tests/unit tests/roundtrip
    bun run build
    npm publish --access public

# Bump patch version (0.1.0 -> 0.1.1)
bump-patch:
    npm version patch --no-git-tag-version

# Bump minor version (0.1.0 -> 0.2.0)
bump-minor:
    npm version minor --no-git-tag-version

# Bump major version (0.1.0 -> 1.0.0)
bump-major:
    npm version major --no-git-tag-version

# --- JSR Publishing ---

# Preview what would be published to JSR
jsr-dry-run:
    bunx jsr publish --dry-run

# Publish to JSR (as @emily/mermaid-ast)
jsr-publish:
    bun test tests/unit tests/roundtrip
    bunx jsr publish

# Publish to both npm and JSR
publish-all:
    just publish
    just jsr-publish

# --- GitHub Releases ---

# Create a GitHub release from CHANGELOG.md (dry run)
release-dry-run:
    bun run scripts/release.ts --dry-run

# Create a GitHub release from CHANGELOG.md
release:
    bun run scripts/release.ts

# --- mermaid-svg commands ---

# Install mermaid-svg dependencies
svg-install:
    cd mermaid-svg && bun install

# Run mermaid-svg tests
svg-test:
    cd mermaid-svg && bun test

# Run mermaid-svg unit tests only
svg-test-unit:
    cd mermaid-svg && bun test tests/unit

# Run mermaid-svg integration tests
svg-test-integration:
    cd mermaid-svg && bun test tests/integration

# Run mermaid-svg visual regression tests
svg-test-visual:
    cd mermaid-svg && bun test tests/visual

# Update mermaid-svg visual snapshots
svg-update-snapshots:
    cd mermaid-svg && UPDATE_SNAPSHOTS=1 bun test tests/visual

# Run mermaid-svg cross-runtime test (bun)
svg-test-cross-runtime:
    cd mermaid-svg && bun run tests/cross-runtime/test-runtime.ts

# Build mermaid-svg
svg-build:
    cd mermaid-svg && bun run build

# Type check mermaid-svg
svg-typecheck:
    cd mermaid-svg && bunx tsc --noEmit

# Preview mermaid-svg npm package
svg-publish-dry-run:
    cd mermaid-svg && bun run build && npm pack --dry-run

# Publish mermaid-svg to npm
svg-publish:
    cd mermaid-svg && bun test && bun run build && npm publish

# Publish mermaid-svg to npm with public access
svg-publish-public:
    cd mermaid-svg && bun test && bun run build && npm publish --access public