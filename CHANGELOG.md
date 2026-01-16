# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.1] - 2025-01-17

### Fixed

- Fixed npm package missing vendored parsers - build now copies `src/vendored/` to `dist/vendored/`

### Issue Report

> The vendored parsers are missing from the package. This seems like the package wasn't published correctly - it's missing the dist/vendored directory. The package was just published and it seems like the vendored parsers weren't included in the dist folder. This is a packaging issue - the dist/vendored/ directory is missing from the published npm package.

### Prompts Used

```
how can you make sure that this is now ok?
did you update the changelog
but include an abridged msg i included with the error
```

## [0.1.0] - 2025-01-17

### Added

- Initial release
- **Flowchart diagram support**
  - Parse and render flowchart/graph diagrams
  - All directions: LR, RL, TB, TD, BT
  - All node shapes: square, round, stadium, subroutine, cylinder, circle, asymmetric, diamond, hexagon, parallelogram, trapezoid, double-circle, etc.
  - All link types: arrow, open, cross, circle with normal/thick/dotted strokes
  - Link labels
  - Subgraphs with titles and directions
  - Styling: `classDef`, `class`, `style`, `linkStyle`
  - Click handlers (callbacks and URLs)
- **Sequence diagram support**
  - Parse and render sequence diagrams
  - Participants and actors with aliases
  - All message types: solid/dashed lines, arrows/open ends, async
  - Activations: `activate`/`deactivate`
  - Control flow: `loop`, `alt`/`else`, `opt`, `par`, `critical`, `break`
  - Grouping: `rect` backgrounds
  - Notes: `note left of`, `note right of`, `note over`
  - Actor lifecycle: `create`, `destroy`
  - Autonumbering
  - Links
- **Core features**
  - `parse(text)` - Parse any supported diagram to AST
  - `render(ast)` - Render any AST back to Mermaid syntax
  - `detectDiagramType(text)` - Detect diagram type from text
  - Round-trip guarantee: `render(parse(text))` produces semantically equivalent diagrams
- **TypeScript support**
  - Full type definitions for all AST structures
  - Exported types: `FlowchartAST`, `SequenceAST`, `MermaidAST`, etc.
- **Cross-runtime support**
  - Works in Bun, Node.js, and Deno
  - Dagger pipeline for cross-runtime testing
- **Developer tooling**
  - Parser sync script to update vendored JISON parsers from mermaid.js
  - Comprehensive test suite (129 tests)
  - Mermaid.js SVG compatibility tests

### Technical Details

- Uses vendored JISON parsers from mermaid.js v11.4.2
- No regex-based parsing - all parsing uses grammar-based JISON parsers