# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2025-01-XX

### Added

- **Server-side SVG rendering** - Render Mermaid flowcharts to SVG without a browser
- **ELK.js layout engine** - Professional graph layout with support for all directions (LR, RL, TD, BT)
- **svg.js + svgdom integration** - Pure server-side SVG generation
- **7 node shapes** - Rectangle, rounded, stadium, diamond, hexagon, cylinder, circle
- **Edge rendering** - Edges with arrows and optional labels
- **Theming support** - Customizable colors, fonts, and styling
- **Cross-runtime support** - Works in Bun, Node.js, and Deno

### Dependencies

- `elkjs` ^0.9.3 - Graph layout engine
- `@svgdotjs/svg.js` ^3.2.5 - SVG generation
- `svgdom` ^0.1.23 - Server-side DOM for svg.js
- `mermaid-ast` (peer dependency) - AST parsing

### Prompts Used

```
Well, I mean, you can use some SVG generator, like you don't have to literally generate SVG by hand, it just has to be something pure that doesn't depend on the browser. So, tell me which options do we have for generating SVG.
```

```
Well, for needsJSDOM, it doesn't matter, right? Because we already want to use JSDOM. So we are going to use JSDOM one way or the other. What's more important is the popularity of the library, how well maintained it is, how bug-free it is, and how principled it is. And whether it must work perfectly server-side. So review the libraries again with this in mind.
```

```
Yeah, let's go for SVG DOM and SVG.js. Are they supported by Ban and Dino? How can you find out?
```

```
perfect make a plan
```

```
this should be a separate package btw but still in the same repo
```

```
for now we can do (2) and later we'll think about (1)
```

```
i'll go to the shower now Give me the detailed plan with all the to-do's so I'll approve it, and then you can start.
```

```
yes looks great go ahead bye
```