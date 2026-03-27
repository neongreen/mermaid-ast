# Parsers

Each file implements parsing for one diagram type: Mermaid syntax → AST.

## How parsing works

1. Import the vendored JISON parser (or `@mermaid-js/parser` for pie/gitgraph)
2. Create a custom `yy` object that intercepts parser callbacks to build our AST
3. Feed input text to the parser — it calls `yy.addVertex()`, `yy.addLink()`, etc.
4. Return the populated AST

```typescript
// Example: flowchart-parser.ts
flowchartParser.yy = createFlowchartYY(ast);
flowchartParser.parse(input);
// ast is now populated via yy callbacks
```

## Files

- `index.ts` — Unified `parse()`, `parseAsync()`, `detectDiagramType()`, and re-exports all individual parsers
- `<diagram>-parser.ts` — One per diagram type, exports `parse<Diagram>()` and `is<Diagram>Diagram()`

## Sync vs async

- **16 JISON-based parsers** (sync): flowchart, sequence, class, state, er, gantt, journey, mindmap, timeline, sankey, quadrant, kanban, xychart, block, c4, requirement
- **2 Langium-based parsers** (async): pie, gitgraph — require `parseAsync()` or the wrapper class

## Adding a new parser

1. Create `<diagram>-parser.ts`
2. Import vendored parser with `@ts-expect-error`
3. Implement `create<Diagram>YY(ast)` — check the .jison grammar for required `yy` methods
4. Export `parse<Diagram>()` and `is<Diagram>Diagram()`
5. Add to `index.ts`: export, add to `detectDiagramType()`, add case to `parse()`/`parseAsync()`

## Key reference

- `flowchart-parser.ts` is the best example of the yy-object pattern
- Check `src/vendored/grammars/<diagram>.jison` to see what methods the parser calls on `yy`