# Release Checklist

## Pre-release Verification

- [ ] **All tests pass**: `bun test` (in `packages/mermaid-ast/`)
- [ ] **Lint passes**: `bun run lint` (in `packages/mermaid-ast/`)
- [ ] **Build works**: `bun run build` (in `packages/mermaid-ast/`)
- [ ] **CI passes**: Check GitHub Actions - `gh run list --limit 1`
- [ ] **Changelog updated**: All changes documented in `[Unreleased]` section of `CHANGELOG.md`

## Release Steps

### 1. Bump Version

Use the appropriate justfile command:

```bash
# For new features, new diagram types, API additions:
just ast-bump-minor

# For bug fixes, documentation improvements, test additions:
just ast-bump-patch
```

This automatically updates both `package.json` and `jsr.json`.

### 2. Update CHANGELOG.md

- Change `[Unreleased]` to `[X.Y.Z] - YYYY-MM-DD`
- Add a new empty `[Unreleased]` section at the top
- Add `### Prompts Used` section with user prompts that led to the changes

### 3. Commit the Release

```bash
jj commit -m "Release vX.Y.Z"
```

### 4. Push to GitHub

```bash
jj bookmark set main -r @-
jj git push --bookmark main
```

### 5. Wait for CI

- [ ] **CI must pass** before releasing: `gh run list --limit 1`
- If CI fails, fix the issue and go back to step 3

### 6. Create Release (Publishes to npm and JSR)

```bash
just ast-release
```

This command:
1. Creates a GitHub release with the version tag
2. Triggers the publish workflow which publishes to both npm and JSR

## Version Guidelines

- **Patch (0.0.X)**: Bug fixes, documentation improvements, test additions
- **Minor (0.X.0)**: New features, new diagram types, API additions
- **Major (X.0.0)**: Breaking changes to existing APIs

## Troubleshooting

### CI Failed After Push

Fix the issue, then:
```bash
jj commit -m "Fix CI issue"
jj bookmark set main -r @-
jj git push --bookmark main
# Wait for CI to pass, then continue with step 6
```

### Publish Failed

Check the GitHub Actions logs:
```bash
gh run list --limit 3 --json databaseId,status,conclusion,displayTitle
gh run view <run_id> --log-failed
```

### Manual Publish (if needed)

If the automated publish fails, you can publish manually:
```bash
# npm only
cd packages/mermaid-ast && npm publish

# JSR only
just ast-jsr-publish

# Both
just ast-publish-all
```