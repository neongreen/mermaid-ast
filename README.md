# Mermaid Tools Monorepo

This repository contains tools for working with Mermaid diagrams.

## Packages

| Package | Description | npm | JSR |
|---------|-------------|-----|-----|
| [mermaid-ast](./packages/mermaid-ast/) | Parse and render Mermaid diagrams to/from AST | [![npm](https://img.shields.io/npm/v/mermaid-ast)](https://www.npmjs.com/package/mermaid-ast) | [![JSR](https://jsr.io/badges/@emily/mermaid-ast)](https://jsr.io/@emily/mermaid-ast) |
| [mermaid-svg](./packages/mermaid-svg/) | Render Mermaid diagrams to SVG | - | - |

## Development

```bash
# Install dependencies
bun install

# Run all tests
just test

# See all available commands
just
```

## License

MIT