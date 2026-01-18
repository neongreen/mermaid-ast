# Mermaid Tools Monorepo

This repository contains tools for working with Mermaid diagrams.

## Packages

| Package | Description | npm | JSR |
|---------|-------------|-----|-----|
| [mermaid-ast](./packages/mermaid-ast/) | Parse and render Mermaid diagrams to/from AST | [![npm](https://img.shields.io/npm/v/mermaid-ast)](https://www.npmjs.com/package/mermaid-ast) | [![JSR](https://jsr.io/badges/@emily/mermaid-ast)](https://jsr.io/@emily/mermaid-ast) |
| [mermaid-svg](./packages/mermaid-svg/) | Render Mermaid diagrams to SVG | - | - |

## mermaid-ast

**Parses all 18 diagram types supported by mermaid.js and renders them back to text.**

Features:
- Full round-trip fidelity: `render(parse(text))` produces semantically equivalent diagrams
- Wrapper classes for programmatic diagram manipulation
- Works in Bun, Node.js, and Deno

See the [mermaid-ast README](./packages/mermaid-ast/README.md) for full documentation, API reference, and examples.

## Development

```bash
# Install dependencies
bun install

# Run all tests
just test

# See all available commands
just
```

## Releasing

> **IMPORTANT:** Follow the release procedure exactly. Do not release manually.
>
> See [.agents/procedures/release.md](.agents/procedures/release.md) for the complete release procedure.

## License

MIT