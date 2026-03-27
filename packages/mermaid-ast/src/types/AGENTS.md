# AST Type Definitions

TypeScript interfaces for all 18 diagram ASTs, plus the unified `MermaidAST` union type.

## Files

One file per diagram type (e.g., `flowchart.ts`, `sequence.ts`), plus:
- `index.ts` — Re-exports all types, defines `MermaidAST` union, `DiagramType` union, and `is<Type>AST()` type guard functions
- `render-options.ts` — `RenderOptions` type and `resolveOptions()` helper

## Conventions

- Every AST interface has a `type` field for discriminated union (e.g., `type: 'flowchart'`)
- Every type file exports a `createEmpty<Diagram>AST()` factory function
- All types are pure interfaces/types with no runtime logic (except factories and type guards)

## Adding a new diagram type

1. Create `<diagram>.ts` with the AST interface and `createEmpty<Diagram>AST()`
2. Export from `index.ts`
3. Add to the `MermaidAST` union type
4. Add to the `DiagramType` union type
5. Add an `is<Diagram>AST()` type guard function

## Current diagram types (18)

flowchart, sequence, class, state, er, gantt, gitgraph, mindmap, journey, kanban, pie, quadrant, requirement, sankey, timeline, xychart, block, c4