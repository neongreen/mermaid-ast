# Tests

All tests use `bun:test`. Run with `bun test` from `packages/mermaid-ast/` or `just ast-test` from repo root.

## Directory structure

```
tests/
├── unit/              # 59 test files — parser, renderer, wrapper tests
├── roundtrip/         # 20 files — render(parse(text)) equivalence tests
├── golden/            # Golden test infrastructure + fixture files
│   ├── golden.ts      # expectGolden() utility
│   ├── golden.test.ts # JSON AST snapshot tests
│   ├── idempotence.test.ts  # render(parse(output)) === output
│   └── <diagram>/     # .mmd, .json, .input.mmd, .output.mmd fixtures
├── compatibility/     # Mermaid SVG comparison (1 file)
├── cross-runtime/     # Cross-runtime verification (2 files)
└── fixtures/          # JSON fixtures for class, flowchart, sequence, state
```

## Test patterns

### Unit tests (`tests/unit/`)

Three files per diagram type:
- `<type>.test.ts` — Wrapper class tests (factory methods, operations, queries)
- `<type>-parser.test.ts` — Parser tests (detection, basic/advanced parsing)
- `<type>-renderer.test.ts` — Renderer tests (basic/advanced rendering, golden tests)

### Round-trip tests (`tests/roundtrip/`)

One file per diagram: parse → render → parse → compare ASTs.
Also verifies idempotency: `render(parse(render(parse(x)))) === render(parse(x))`

### Golden tests (`tests/golden/`)

- `golden.test.ts` — Parses .mmd files → compares to .json snapshots
- `idempotence.test.ts` — Verifies .input.mmd → render(parse()) matches .output.mmd, and output is idempotent
- Update fixtures: `UPDATE_GOLDEN=1 bun test tests/golden`

## Key utility

`tests/golden/golden.ts` exports `expectGolden(output, path)` — compares rendered string to a .mmd golden file.

## CI runs

Only `tests/unit` and `tests/roundtrip` run in CI. Golden tests run locally.

## See also

`TEST_STANDARDS.md` in `packages/mermaid-ast/` for detailed coverage requirements per diagram type.