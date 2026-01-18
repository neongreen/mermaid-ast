# Release Procedure

This document describes the complete release process for mermaid-ast.

## Quick Reference

```bash
# 1. Set version (updates package.json, jsr.json, bun.lock)
just ast-set-version 0.8.1

# 2. Update CHANGELOG.md (move [Unreleased] to new version)

# 3. Commit and push
jj commit -m "Release v0.8.1"
jj bookmark set main -r @-
jj git push --bookmark main

# 4. Wait for CI to pass
gh run list --limit 1

# 5. Create release (publishes to npm and JSR)
just ast-release
```

## Pre-release Checklist

- [ ] All tests pass: `bun test` (in `packages/mermaid-ast/`)
- [ ] Lint passes: `bun run lint`
- [ ] Build works: `bun run build`
- [ ] CI passes on main branch
- [ ] Changelog updated with all changes in `[Unreleased]` section

## Detailed Steps

### Step 1: Set Version

Use the `ast-set-version` command to update all version files at once:

```bash
just ast-set-version X.Y.Z
```

This updates:
- `packages/mermaid-ast/package.json`
- `packages/mermaid-ast/jsr.json`
- `bun.lock` (via `bun install`)

**Version guidelines:**
- **Patch (0.0.X)**: Bug fixes, documentation improvements, test additions
- **Minor (0.X.0)**: New features, new diagram types, API additions
- **Major (X.0.0)**: Breaking changes to existing APIs

### Step 2: Update CHANGELOG.md

1. Change `[Unreleased]` to `[X.Y.Z] - YYYY-MM-DD`
2. Add a new empty `[Unreleased]` section at the top
3. Optionally add `### Prompts Used` section with user prompts

Example:
```markdown
## [Unreleased]

## [0.8.1] - 2025-01-18

### Added
- **Feature name** - Description

### Fixed
- **Bug fix** - Description
```

### Step 3: Commit and Push

```bash
jj commit -m "Release vX.Y.Z"
jj bookmark set main -r @-
jj git push --bookmark main
```

### Step 4: Wait for CI

CI must pass before creating the release:

```bash
# Check CI status
gh run list --limit 1

# If failed, view logs
gh run view <run_id> --log-failed
```

**Common CI failures:**
- `bun.lock is out of date` - Run `bun install` and commit
- Lint errors - Run `bun run lint:fix` and commit
- Test failures - Fix tests and commit

### Step 5: Create Release

```bash
just ast-release
```

This command:
1. Reads the version from `package.json`
2. Extracts release notes from `CHANGELOG.md`
3. Creates a GitHub release with the version tag
4. Triggers the publish workflow (publishes to npm and JSR)

## Troubleshooting

### CI Failed After Push

```bash
# Fix the issue, then:
jj commit -m "Fix: <description>"
jj bookmark set main -r @-
jj git push --bookmark main
# Wait for CI to pass, then continue with step 5
```

### Publish Failed

Check GitHub Actions logs:
```bash
gh run list --limit 3 --json databaseId,status,conclusion,displayTitle
gh run view <run_id> --log-failed
```

Common issues:
- JSR publish needs `bun install` in the workflow (already fixed)
- npm publish needs `NPM_TOKEN` secret

### Manual Publish (if needed)

```bash
# npm only
cd packages/mermaid-ast && npm publish

# JSR only
just ast-jsr-publish

# Both
just ast-publish-all
```

### Version Mismatch

If `package.json` and `jsr.json` have different versions:
```bash
just ast-set-version X.Y.Z  # Sets both to the same version
```

## Files Modified During Release

| File | What Changes |
|------|--------------|
| `packages/mermaid-ast/package.json` | `version` field |
| `packages/mermaid-ast/jsr.json` | `version` field |
| `bun.lock` | Version reference in lockfile |
| `packages/mermaid-ast/CHANGELOG.md` | New version section |