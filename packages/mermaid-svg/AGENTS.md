# mermaid-svg

Server-side SVG renderer for Mermaid diagrams using ELK layout engine. Renders `mermaid-ast` ASTs to SVG without a browser.

## Status

**Early stage** — currently only supports Flowchart diagrams. Not yet included in CI.

## Architecture

```
src/
├── render-flowchart.ts    # Main entry: FlowchartAST → SVG string
├── svg-context.ts         # SVG document setup via svgdom
├── types.ts               # Shared types (Theme, RenderOptions, etc.)
├── layout/
│   ├── elk-layout.ts      # ELK graph layout (positions nodes/edges)
│   └── elk-worker-loader.ts
├── shapes/                # SVG shape renderers (rect, diamond, circle, etc.)
├── edges/                 # Edge/arrow rendering with curve interpolation
├── text/                  # Text measurement and rendering
└── themes/                # Theme definitions (colors, fonts)
```

## Key dependencies

- `elkjs` — ELK layout algorithm
- `@svgdotjs/svg.js` + `svgdom` — Server-side SVG DOM
- `mermaid-ast` — Peer dependency for AST types

## Testing

```bash
just svg-test              # Run tests
```

Tests include unit tests, integration tests, and visual regression tests with SVG snapshots.

## Not in CI

This package is excluded from CI workflows. When adding it, update both `ci.yml` and `publish.yml`.