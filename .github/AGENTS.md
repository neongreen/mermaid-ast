# CI/CD Workflows

Two GitHub Actions workflows in `.github/workflows/`:

## ci.yml

Runs on every push/PR to `main`. Steps:
1. `bun install` (with frozen lockfile)
2. Lint (root + `packages/mermaid-ast`)
3. Type check
4. Tests with coverage (`tests/unit` + `tests/roundtrip`)
5. Verify examples compile and run
6. Build
7. JSR publish dry-run

## publish.yml

Triggered by GitHub release or `workflow_dispatch` (with target: npm/jsr/both). Three jobs:
1. **test** — same checks as CI
2. **publish-npm** — publishes `packages/mermaid-ast` to npm with OIDC provenance (uses `NPM_TOKEN` secret)
3. **publish-jsr** — publishes to JSR via OIDC

To trigger manually:
```bash
gh workflow run publish.yml -f target=both
```

## Notes

- `mermaid-svg` is excluded from CI (not yet set up as a workspace test target)
- CI and publish must run the same test commands to avoid publish-time failures
- `gh run rerun` uses the original workflow file — use `gh workflow run` instead after fixing a workflow
